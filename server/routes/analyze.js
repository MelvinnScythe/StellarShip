const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Main sentence analysis ─────────────────────────────────────────────────
router.post('/', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file uploaded.' });

  const targetText = req.body.targetText || '';
  const mode = req.body.mode || 'regular'; // 'regular' | 'harsh'
  const audioBase64 = req.file.buffer.toString('base64');

  const harshBlock = mode === 'harsh' ? `
CRITICAL RULE — HARSH MODE ACTIVE:
- You are a STRICT phonetics examiner. Do NOT be encouraging. Be brutally precise.
- NEVER auto-correct what you hear. If they said "seruly", write "seruly" — do NOT fix it to "surely".
- Flag EVERY phonetic deviation, even small ones: wrong vowels, dropped consonants, accent shifts, stress on wrong syllable.
- For each mistake, explicitly say what sound you heard vs what was expected: "You said 'suh-RUH-lee', correct is 'SHUR-lee'."
- If the attempt is mostly wrong, your score should reflect it (below 50).
- Do not give positive feedback unless the pronunciation is genuinely excellent.` : `
RULE — REGULAR MODE:
- Be encouraging but honest.
- NEVER auto-correct what you hear. Write the heardTranscript phonetically as it sounded.
- Flag clear mispronunciations but focus on the 1-2 most important errors.
- Keep feedback constructive.`;

  const prompt = `You are an expert Language Coach specializing in English and Hindi phonetics.
${harshBlock}

TARGET SENTENCE: "${targetText}"

Listen to the audio. Complete these steps:

STEP 1 — TRANSCRIBE: Write down EXACTLY what you heard, as it sounded. Use phonetic spelling. NEVER correct what you heard to what they should have said.
  Examples: If they said "seruly" instead of "surely" → write "seruly"
            If they said "fawks" instead of "fox" → write "fawks"
            If they said "ze kwik" instead of "the quick" → write "ze kwik"

STEP 2 — COMPARE: Go word by word. Mark every deviation from the target.

STEP 3 — FEEDBACK: For each mispronounced word give:
  - Exact error: "You said 'X', correct is 'Y'"
  - Mouth Position tip
  - Drill phrase to practice that specific sound

Return ONLY this JSON (no markdown, no code block):
{
  "score": <number 0-100>,
  "heardTranscript": "<phonetic transcription of exactly what you heard>",
  "feedback": "<overall comment — honest, not overly positive>",
  "mistakes": [
    {
      "word": "<target word>",
      "heard": "<what you heard for this word>",
      "error": "<e.g. You said 'seruly', correct is 'surely' — the 'sh' sound was replaced with 's'>",
      "tip": "<physical mouth position tip>",
      "drill": "<short drill phrase for this specific sound>"
    }
  ],
  "newSentence": "<harder sentence if score >= 80, else a simpler drill sentence targeting their weakest sound>"
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: 'audio/webm', data: audioBase64 } },
    ]);

    const text = result.response.text();
    console.log('[Analyze] Raw response:', text.slice(0, 400));

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'AI returned unexpected format.' });

    const feedback = JSON.parse(jsonMatch[0]);
    console.log('[Analyze] Score:', feedback.score, '| Heard:', feedback.heardTranscript);
    res.json(feedback);
  } catch (err) {
    console.error('[Analyze] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Drill attempt analysis ─────────────────────────────────────────────────
router.post('/drill', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file uploaded.' });

  const drillText = req.body.drillText || '';
  const audioBase64 = req.file.buffer.toString('base64');

  const prompt = `You are a strict phonetics examiner.

DRILL TARGET: "${drillText}"

The user is attempting this specific drill phrase. Listen carefully.

STEP 1 — Write down EXACTLY what you heard phonetically. Never auto-correct.
STEP 2 — Compare it to the drill target.
STEP 3 — Score it 0-100 (80+ = passed this drill).

Return ONLY this JSON:
{
  "score": <number 0-100>,
  "heardTranscript": "<exactly what you heard>",
  "passed": <true if score >= 80>,
  "feedback": "<short specific feedback on what was right/wrong>",
  "tip": "<one mouth position tip if they failed>"
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: 'audio/webm', data: audioBase64 } },
    ]);

    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'AI returned unexpected format.' });

    const drillResult = JSON.parse(jsonMatch[0]);
    drillResult.passed = (drillResult.score ?? 0) >= 80;
    console.log('[Drill] Score:', drillResult.score, '| Passed:', drillResult.passed);
    res.json(drillResult);
  } catch (err) {
    console.error('[Drill] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
