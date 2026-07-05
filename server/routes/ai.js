/* global require, process, module */
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_TEXT_MODEL || 'gemini-flash-latest',
  });
};

const stripCodeFence = (text) => text.replace(/```json/g, '').replace(/```/g, '').trim();

const parseJsonFromText = (text) => {
  const cleaned = stripCodeFence(text);
  const objectIndex = cleaned.indexOf('{');
  const arrayIndex = cleaned.indexOf('[');
  const startsWithArray = arrayIndex !== -1 && (objectIndex === -1 || arrayIndex < objectIndex);
  const jsonMatch = startsWithArray
    ? cleaned.match(/\[[\s\S]*\]/)
    : cleaned.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch?.[0];
  if (!jsonText) throw new Error('AI returned unexpected format.');
  return JSON.parse(jsonText);
};

const generateText = async (prompt) => {
  const model = getModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const sendAiError = (res, err, label) => {
  console.error(`[${label}] Error:`, err?.message || err);
  res.status(500).json({ error: err?.message || 'AI request failed.' });
};

router.post('/tutor', async (req, res) => {
  const { input, userClass } = req.body;
  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'input is required.' });
  }

  const prompt = `You are a friendly, encouraging AI tutor for a student in Class ${userClass || 'elementary/middle'}.
IMPORTANT FORMATTING RULES:
1. Use markdown formatting freely.
2. IMPORTANT: You MUST use LaTeX for math equations. Wrap inline math with a single dollar sign (e.g. $F = ma$) and block math with double dollar signs.
3. Keep answers simple, easy to understand, and perfectly suited for their grade level.

MOOD DETECTION:
At the very beginning of your response, start with a mood tag in brackets. Choose ONE from: [MOOD: excited], [MOOD: happy], [MOOD: sad], [MOOD: serious], [MOOD: friendly], [MOOD: neutral], [MOOD: encouraging].
Example: "[MOOD: encouraging] That's a great question! Let's solve it together..."

Student: ${input}`;

  try {
    const text = await generateText(prompt);
    res.json({ text });
  } catch (err) {
    sendAiError(res, err, 'Tutor');
  }
});

router.post('/speaking/target-analysis', async (req, res) => {
  const { targetText, userClass } = req.body;
  if (!targetText || typeof targetText !== 'string') {
    return res.status(400).json({ error: 'targetText is required.' });
  }

  const prompt = `Analyze this sentence for a Class ${userClass || 'elementary'} student: "${targetText}".
Provide:
1. Simple meaning.
2. Grammar points explained simply.
3. Key vocabulary words and meanings.

Return ONLY a raw JSON object:
{
  "meaning": "string",
  "grammar": ["string"],
  "vocabulary": [{"word": "string", "meaning": "string"}]
}
Strictly JSON. No extra text.`;

  try {
    const text = await generateText(prompt);
    res.json(parseJsonFromText(text));
  } catch (err) {
    sendAiError(res, err, 'TargetAnalysis');
  }
});

router.post('/speaking/sentence', async (req, res) => {
  const { targetLanguage, userClass } = req.body;
  const prompt = `Generate a single short sentence in ${targetLanguage || 'English'} for a Class ${userClass || 'elementary/middle'} student to practice speaking and pronunciation. Keep it simple and age-appropriate. Just the text, no quotes. If Hindi, use Devanagari script.`;

  try {
    const text = await generateText(prompt);
    res.json({ text: text.trim() });
  } catch (err) {
    sendAiError(res, err, 'SpeakingSentence');
  }
});

router.post('/flashcards', async (req, res) => {
  const { topic, count, difficulty, userClass } = req.body;
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'topic is required.' });
  }

  const prompt = `Generate ${Number(count) || 5} educational flashcards about "${topic}" for a student in Class ${userClass || 'elementary/middle'}. The difficulty level should be ${difficulty || 'Medium'}. Return ONLY a raw JSON array of objects, each with a 'q' (question) and 'a' (answer) field. Do not wrap it in markdown code blocks. Just the raw JSON.`;

  try {
    const text = await generateText(prompt);
    res.json(parseJsonFromText(text));
  } catch (err) {
    sendAiError(res, err, 'Flashcards');
  }
});

router.post('/exam', async (req, res) => {
  const { topic, userClass } = req.body;
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'topic is required.' });
  }

  const chapters = topic.split(',').map(c => c.trim()).filter(Boolean);
  let numQuestions = 20;
  if (chapters.length === 2) numQuestions = 30;
  else if (chapters.length === 3) numQuestions = 45;
  else if (chapters.length > 3) numQuestions = 45 + ((chapters.length - 3) * 5);

  const prompt = `Generate a ${numQuestions}-question multiple choice exam based on the following chapters/topics: "${topic}". The student is in Class ${userClass || 'elementary/middle'}. Return ONLY a raw JSON array of objects. Each object must have: 'q' (the question), 'options' (an array of 4 string choices), and 'a' (the exact string of the correct option). Do not wrap in markdown. Just the JSON.`;

  try {
    const text = await generateText(prompt);
    res.json(parseJsonFromText(text));
  } catch (err) {
    sendAiError(res, err, 'Exam');
  }
});

router.post('/math-solver', async (req, res) => {
  const { problem, userClass } = req.body;
  if (!problem || typeof problem !== 'string') {
    return res.status(400).json({ error: 'problem is required.' });
  }

  const prompt = `You are an expert Math AI Solver helping a Class ${userClass || 'elementary'} student. 
Solve the following math problem step-by-step. 
Format your response nicely using Markdown. Use LaTeX for math equations where appropriate.
Problem: "${problem}"`;

  try {
    const text = await generateText(prompt);
    res.json({ solution: text });
  } catch (err) {
    sendAiError(res, err, 'MathSolver');
  }
});

module.exports = router;
