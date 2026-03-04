import { getGemini } from "../utils/geminiClient.js";

/**
 * Summarize structured medical data using Gemini 2.5 Flash.
 */
export const generateGeminiSummary = async (medicalData) => {
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

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      ...payload
    });

    // Normalize extraction of generated text from various SDK response shapes
    let textResult;
    try {
      if (result?.response && typeof result.response.text === 'function') {
        textResult = result.response.text();
      } else if (result?.response && typeof result.response.text === 'string') {
        textResult = result.response.text;
      } else if (typeof result?.text === 'string') {
        textResult = result.text;
      } else if (Array.isArray(result?.candidates) && result.candidates.length > 0) {
        textResult = result.candidates[0]?.content?.map(c => c.text).join('\n') || undefined;
      }
    } catch (e) {
      console.error('Failed to extract text from Gemini response:', e.message);
    }

    return textResult;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw new Error(`Gemini API Error: ${error.message}`);
  }
};


/**
 * Format medical data into a readable prompt
 */
const formatMedicalDataForPrompt = (medicalData) => {
  let text = "";

  if (medicalData.patientBasicInfo) {
    text += "=== PATIENT DEMOGRAPHICS ===\n";
    if (medicalData.patientBasicInfo.age)
      text += `Age: ${medicalData.patientBasicInfo.age} years\n`;
    if (medicalData.patientBasicInfo.gender)
      text += `Gender: ${medicalData.patientBasicInfo.gender}\n`;
    text += "\n";
  }

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

  if (medicalData.allergies && medicalData.allergies.length > 0) {
    text += "=== ALLERGIES ===\n";
    medicalData.allergies.forEach((allergy) => {
      text += `- ${allergy.substance}: ${allergy.criticality} severity`;
      if (allergy.reaction) text += ` (Reaction: ${allergy.reaction})`;
      text += "\n";
    });
    text += "\n";
  }

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
