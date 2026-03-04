// controllers/ai.controller.js
import asyncHandler from "express-async-handler";
import { generateMedicalSummary } from "../services/aiSummary.service.js";
import { generateGeminiSummary } from "../services/geminiSummary.service.js";

export const getPatientSummary = asyncHandler(async (req, res) => {
  const { phn } = req.params;

  // Validate PHN format
  if (!phn || !/^PH\d{5}$/.test(phn)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid patient health number format. Expected PH##### format."
    });
  }

  const { prompt, medicalData } = await generateMedicalSummary(phn);

  if (!prompt || !medicalData) {
    return res.status(404).json({
      success: false,
      message: "No medical data available to summarize"
    });
  }

  try {
    const summary = await generateGeminiSummary(medicalData);

    return res.status(200).json({
      success: true,
      message: "Medical summary generated successfully",
      data: {
        patientPhn: phn,
        summary,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({
      success: false,
      message: "AI service error",
      error: error.message
    });
  }
});
