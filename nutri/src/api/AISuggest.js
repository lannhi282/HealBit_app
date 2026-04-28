/**
 * Fetches personalized nutrition and exercise recommendations from Gemini AI
 * @param {number} bmi - User's Body Mass Index
 * @param {string} obesityRisk - User's obesity risk level
 * @returns {Promise<Object>} JSON response containing recipes and exercises
 */
export const fetchAISuggestion = async (profile) => {
  try {
    const response = await fetch("http://192.168.1.2:3000/generate-ai-tips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bmi: profile.bmi,
        obesityRisk: profile.obesity_risk,

        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,

        exerciseFrequency: profile.exercise || profile.exercise_frequency,
        waterIntake: profile.water_intake || profile.waterIntake,
        mainMeals: profile.main_meals || profile.mainMeals,

        foodPreference: profile.food_preference || "No specific preference",
        allergy: profile.allergy || "None",
        goal: profile.goal || "maintain_weight",
      }),
    });

    const result = await response.json();

    console.log("AI suggestion raw result:", result);

    if (!response.ok) {
      throw new Error(result?.error || "Failed to fetch AI suggestion");
    }

    const data = result?.data || result;

    return {
      recipes: data?.recipes || [],
      exercises: data?.exercises || [],
    };
  } catch (error) {
    console.error("Error fetching recipes:", error);

    return {
      recipes: [],
      exercises: [],
    };
  }
};
