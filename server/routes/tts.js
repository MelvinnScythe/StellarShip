const express = require('express');
const router = express.Router();
const https = require('https');

const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent`;

// Voice map: friendly names → Gemini voice IDs
const VOICE_MAP = {
  'en-US': 'Aoede',
  'en-GB': 'Fenrir',
  'hi-IN': 'Kore',
  'default': 'Aoede',
};

/**
 * Converts raw Linear PCM (16-bit, little-endian, mono, 24kHz) to a WAV buffer.
 */
function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmBuffer.length;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);            // PCM chunk size
  buffer.writeUInt16LE(1, 20);             // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmBuffer.copy(buffer, 44);

  return buffer;
}

// @route   POST /api/tts
// @desc    Generate speech using Gemini 2.5 Flash TTS Preview
// @access  Public
router.post('/', async (req, res) => {
  const { text, language = 'en-US' } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  const voiceName = VOICE_MAP[language] || VOICE_MAP['default'];

  const requestBody = JSON.stringify({
    contents: [
      {
        parts: [{ text: text.trim().slice(0, 5000) }]  // 5000 char safety limit
      }
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName
          }
        }
      }
    }
  });

  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  try {
    const geminiResponse = await new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      };

      const gemReq = https.request(options, (gemRes) => {
        let data = '';
        gemRes.on('data', chunk => { data += chunk; });
        gemRes.on('end', () => resolve({ status: gemRes.statusCode, body: data }));
      });

      gemReq.on('error', reject);
      gemReq.write(requestBody);
      gemReq.end();
    });

    if (geminiResponse.status !== 200) {
      console.error('Gemini TTS error:', geminiResponse.body);
      return res.status(geminiResponse.status).json({
        error: 'Gemini TTS API error',
        details: JSON.parse(geminiResponse.body)
      });
    }

    const parsed = JSON.parse(geminiResponse.body);

    // Extract base64-encoded audio from the response
    const audioPart = parsed?.candidates?.[0]?.content?.parts?.find(
      p => p.inlineData && p.inlineData.mimeType && p.inlineData.mimeType.startsWith('audio/')
    );

    if (!audioPart) {
      console.error('No audio in Gemini response:', JSON.stringify(parsed, null, 2));
      return res.status(500).json({ error: 'No audio data returned from Gemini' });
    }

    const audioBase64 = audioPart.inlineData.data;
    const mimeType = audioPart.inlineData.mimeType; // e.g. "audio/L16;rate=24000"

    const rawPcm = Buffer.from(audioBase64, 'base64');

    // Parse sample rate from mime type if available (audio/L16;rate=24000)
    let sampleRate = 24000;
    const rateMatch = mimeType.match(/rate=(\d+)/);
    if (rateMatch) sampleRate = parseInt(rateMatch[1], 10);

    const wavBuffer = pcmToWav(rawPcm, sampleRate);

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': wavBuffer.length,
      'Cache-Control': 'no-cache'
    });
    res.send(wavBuffer);

  } catch (err) {
    console.error('TTS route error:', err);
    res.status(500).json({ error: 'Internal server error during TTS generation' });
  }
});

module.exports = router;
