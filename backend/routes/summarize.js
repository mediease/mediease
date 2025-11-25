// routes/summarize.js
import express from "express";
import { getGemini } from "../utils/openaiClient.js";

const router = express.Router();

router.post("/summarize", async (req, res) => {
  try {
    const { medicalText } = req.body;

    if (!medicalText) {
      return res.status(400).json({
        success: false,
        message: "medicalText is required",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is not set in environment variables");
      return res.status(500).json({ success: false, message: "GEMINI_API_KEY not configured" });
    }

    console.log("🔄 Initializing Gemini client (lazy)");
    const ai = getGemini();

    const prompt = `Summarize this medical record clearly and clinically:\n\n${medicalText}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    console.log('Gemini request - model: gemini-2.5-flash');
    console.log('Gemini request payload:', JSON.stringify(payload, null, 2));

    const result = await ai.models.generateContent({ model: "gemini-2.5-flash", ...payload });

    // Extract text robustly
    let summary;
    if (result?.response && typeof result.response.text === 'function') {
      summary = result.response.text();
    } else if (result?.text) {
      summary = result.text;
    } else if (Array.isArray(result?.candidates) && result.candidates.length > 0) {
      summary = result.candidates[0]?.content?.map(c => c.text).join('\n');
    }

    return res.json({ success: true, summary });
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message || error);
    if (error?.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return res.status(500).json({
      success: false,
      message: "Gemini summarization failed",
      error: error.message
    });
  }
});

export default router;
