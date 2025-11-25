// services/aiOpenAI.service.js
import { getGemini } from "../utils/openaiClient.js";

/**
 * Summarize structured medical data using Gemini 2.5 Flash.
 * Replaces the old OpenAI-style function but keeps same name for compatibility.
 */
export const generateOpenAISummary = async (medicalData) => {
  const inputText = formatMedicalDataForPrompt(medicalData);

  const prompt = `
You are a medical summarization assistant.

Summarize the following structured medical record in 3–5 sentences:
- Extract clinically relevant findings
- Use standard medical terminology
- Do NOT include personal identifiers
- Focus on diagnosis, medications, allergies, vitals, and doctor notes

Medical Record:
${inputText}
`;

  try {
    const ai = getGemini();

    console.log("🔄 Calling Gemini 2.5 Flash…");

    // Build v1 payload (array of content objects)
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    // Log model + payload (do not log API keys)
    console.log('Gemini request - model: gemini-2.5-flash');
    console.log('Gemini request payload:', JSON.stringify(payload, null, 2));

    // New Gemini API call using v1-style contents
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      ...payload
    });

    console.log("✅ Gemini API call successful");

    // Normalize extraction of generated text from various SDK response shapes
    // Try common properties: result.response.text(), result.response.text, result.text
    let textResult;
    try {
      if (result?.response && typeof result.response.text === 'function') {
        textResult = result.response.text();
      } else if (result?.response && typeof result.response.text === 'string') {
        textResult = result.response.text;
      } else if (typeof result?.text === 'string') {
        textResult = result.text;
      } else if (Array.isArray(result?.candidates) && result.candidates.length > 0) {
        // Some SDK variants provide candidates
        textResult = result.candidates[0]?.content?.map(c => c.text).join('\n') || undefined;
      }
    } catch (e) {
      console.error('Failed to extract text from Gemini response:', e.message);
    }

    return textResult;
  } catch (error) {
    console.error("❌ Error calling Gemini:", error);

    throw new Error(`Gemini API Error: ${error.message}`);
  }
};


/**
 * Format medical data into a readable prompt
 */
const formatMedicalDataForPrompt = (medicalData) => {
  let text = "";

  // Patient demographics
  if (medicalData.patientBasicInfo) {
    text += "=== PATIENT DEMOGRAPHICS ===\n";
    if (medicalData.patientBasicInfo.age)
      text += `Age: ${medicalData.patientBasicInfo.age} years\n`;
    if (medicalData.patientBasicInfo.gender)
      text += `Gender: ${medicalData.patientBasicInfo.gender}\n`;
    text += "\n";
  }

  // Recent encounters
  if (medicalData.encounters && medicalData.encounters.length > 0) {
    text += "=== RECENT ENCOUNTERS ===\n";
    medicalData.encounters.slice(0, 3).forEach((enc, idx) => {
      text += `\nEncounter ${idx + 1}:\n`;
      if (enc.diagnosis) text += `Diagnosis: ${enc.diagnosis}\n`;
      if (enc.vitals) text += `Vitals: ${JSON.stringify(enc.vitals)}\n`;
      if (enc.doctorNotes) text += `Notes: ${enc.doctorNotes}\n`;
      if (enc.status) text += `Status: ${enc.status}\n`;
      if (enc.createdAt)
        text += `Date: ${new Date(enc.createdAt).toLocaleDateString()}\n`;
    });
    text += "\n";
  }

  // Allergies
  if (medicalData.allergies && medicalData.allergies.length > 0) {
    text += "=== ALLERGIES ===\n";
    medicalData.allergies.forEach((allergy) => {
      text += `- ${allergy.substance}: ${allergy.criticality} severity`;
      if (allergy.reaction) text += ` (Reaction: ${allergy.reaction})`;
      text += "\n";
    });
    text += "\n";
  }

  // Current medications
  if (medicalData.prescriptions && medicalData.prescriptions.length > 0) {
    text += "=== CURRENT MEDICATIONS ===\n";
    medicalData.prescriptions.slice(0, 5).forEach((med) => {
      text += `- ${med.medicationName}`;
      if (med.dosage) text += ` ${med.dosage}`;
      if (med.frequency) text += ` ${med.frequency}`;
      if (med.indication) text += ` (Indication: ${med.indication})`;
      text += "\n";
    });
  }

  return text;
};
