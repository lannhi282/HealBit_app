import { API_CONFIG } from "../config/apiConfig";

const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const fetchWithTimeout = async (resource, options = {}) => {
  const { timeout = 15000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
};

const calculateBMI = (profile) => {
  const weight = parseNumber(profile.weight || profile?.weight_kg);
  const heightCm = parseNumber(profile.height || profile?.height_cm);
  if (!weight || !heightCm) return null;
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
};

const normalizeObesityRisk = (profile, bmi) => {
  const rawRisk =
    profile.obesity_risk || profile.obesityRisk || profile?.risk || "";
  if (rawRisk) return rawRisk;
  if (!bmi) return "Normal";

  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obesity Type I";
  if (bmi < 40) return "Obesity Type II";
  return "Obesity Type III";
};

/**
 * Fetches personalized nutrition and exercise recommendations from Gemini AI
 * @param {Object} profile - User profile data
 * @returns {Promise<Object>} JSON response containing recipes and exercises
 */
export const fetchAISuggestion = async (profile) => {
  try {
    const bmiValue =
      parseNumber(profile.bmi) || calculateBMI(profile) || "Not provided";
    const obesityRiskValue = normalizeObesityRisk(profile, bmiValue);

    const payload = {
      bmi: bmiValue,
      obesityRisk: obesityRiskValue,

      age: profile.age,
      gender: profile.gender,
      weight: profile.weight,
      height: profile.height,

      exerciseFrequency: profile.exercise || profile.exercise_frequency,
      waterIntake: profile.water_intake || profile.waterIntake,
      mainMeals: profile.main_meals || profile.mainMeals,

      foodPreference:
        profile.food_preference ||
        profile.foodPreference ||
        "No specific preference",
      allergy: profile.allergy || profile.allergy || "None",
      goal: profile.goal || "maintain_weight",
    };

    console.log(
      "Sending AI suggestion payload to:",
      `${API_CONFIG.AI_BASE_URL}/generate-ai-tips`,
    );
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const response = await fetchWithTimeout(
      `${API_CONFIG.AI_BASE_URL}/generate-ai-tips`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        timeout: 15000,
      },
    );

    console.log("Response status:", response.status, response.statusText);

    const text = await response.text();
    console.log("Response body:", text);

    let result;
    try {
      result = text ? JSON.parse(text) : null;
    } catch (parseError) {
      throw new Error(`Invalid JSON response from AI: ${text}`);
    }

    if (!response.ok) {
      throw new Error(
        result?.error || `Failed to fetch AI suggestion (${response.status})`,
      );
    }

    const data = result?.data || result;

    return {
      recipes: data?.recipes || [],
      exercises: data?.exercises || [],
    };
  } catch (error) {
    console.log("Error fetching recipes:", error);
    throw error;
  }
};
