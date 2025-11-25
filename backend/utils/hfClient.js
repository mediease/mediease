import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Get from environment variables
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_API_URL = process.env.HUGGINGFACE_MODEL_URL;

// Verify configuration on module load
if (!HF_API_KEY) {
  console.warn("⚠️  WARNING: HUGGINGFACE_API_KEY is not set in .env file");
}

if (!HF_API_URL) {
  console.warn("⚠️  WARNING: HUGGINGFACE_MODEL_URL is not set in .env file");
}

if (HF_API_KEY && HF_API_URL) {
  console.log("✅ HuggingFace API Key loaded successfully");
  console.log("📍 Using Model URL:", HF_API_URL);
}

export const callHuggingFaceSummarizer = async (prompt) => {
  if (!HF_API_KEY) {
    throw new Error("HUGGINGFACE_API_KEY is missing. Please set it in your .env file");
  }

  if (!HF_API_URL) {
    throw new Error("HUGGINGFACE_MODEL_URL is missing. Please set it in your .env file");
  }

  if (!prompt || prompt.trim().length === 0) {
    throw new Error("Prompt cannot be empty");
  }

  // Summarization models require minimum text length
  if (prompt.trim().length < 50) {
    throw new Error("Text must be at least 50 characters for summarization");
  }

  console.log("🔄 Sending request to HuggingFace API...");
  console.log("📝 Prompt length:", prompt.length);
  console.log("🎯 Model URL:", HF_API_URL);

  try {
    const response = await axios.post(
      HF_API_URL,
      {
        inputs: prompt,
        parameters: {
          max_length: 150,
          min_length: 30,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("✅ HuggingFace Response Status:", response.status);
    console.log("📦 Response Data:", JSON.stringify(response.data, null, 2));

    const data = response.data;

    // Handle array response (most common for summarization models)
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error("Empty response from HuggingFace API");
      }

      const firstItem = data[0];

      // Check for summary_text
      if (firstItem.summary_text) {
        console.log("✅ Successfully extracted summary_text");
        return firstItem.summary_text.trim();
      }

      // Check for generated_text (fallback)
      if (firstItem.generated_text) {
        console.log("✅ Successfully extracted generated_text");
        return firstItem.generated_text.trim();
      }

      // Check for error in response
      if (firstItem.error) {
        throw new Error(firstItem.error);
      }
    }

    // Handle single object response
    if (typeof data === "object" && data !== null) {
      if (data.summary_text) return data.summary_text.trim();
      if (data.generated_text) return data.generated_text.trim();
      if (data.error) throw new Error(data.error);
    }

    throw new Error(`Unexpected response format: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error("❌ HuggingFace API Error:");
    console.error("Message:", error.message);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Status Text:", error.response.statusText);
      console.error("Response Data:", JSON.stringify(error.response.data, null, 2));

      // Handle specific status codes
      if (error.response.status === 410) {
        throw new Error(
          "Model endpoint is no longer available (410 Gone). Update HUGGINGFACE_MODEL_URL in .env file"
        );
      }
      if (error.response.status === 503) {
        throw new Error(
          "HuggingFace model is loading. Please try again in 1-2 minutes (503 Service Unavailable)"
        );
      }
      if (error.response.status === 401) {
        throw new Error("Invalid HuggingFace API key in .env file (401 Unauthorized)");
      }
    }

    if (error.message.includes("429")) {
      throw new Error("HuggingFace API rate limit exceeded. Please try again later");
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. HuggingFace API took too long to respond");
    }

    throw new Error(`HuggingFace API Error: ${error.message}`);
  }
};

export const validateHFConnection = async () => {
  if (!HF_API_KEY || !HF_API_URL) {
    console.warn("⚠️  HuggingFace API not properly configured in .env file");
    return false;
  }

  try {
    console.log("🔍 Testing HuggingFace API connection...");
    const testText =
      "This is a test. This model should work correctly with the HuggingFace API. Testing the connection to ensure everything is functioning properly.";

    const response = await axios.post(
      HF_API_URL,
      {
        inputs: testText,
        parameters: {
          max_length: 150,
          min_length: 30,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("✅ HuggingFace API connection successful");
    console.log("✅ Model is ready to summarize");
    return true;
  } catch (error) {
    console.error("❌ HuggingFace API connection failed");

    if (error.response?.status === 503) {
      console.error("⏳ Model is still loading. This is normal for first request.");
      console.error("   Try again in 1-2 minutes.");
    } else if (error.response?.status === 410) {
      console.error("🚫 Model endpoint is gone (410).");
      console.error("   Update HUGGINGFACE_MODEL_URL in your .env file");
    } else if (error.response?.status === 401) {
      console.error("🔑 Invalid API key (401).");
      console.error("   Check HUGGINGFACE_API_KEY in your .env file");
    } else {
      console.error("Error:", error.message);
    }

    return false;
  }
};