/**
 * Analyzes food images using Gemini AI to estimate calories
 * @param {string} base64Image - Base64 encoded image string of the food
 * @returns {Promise<Object>} JSON response containing food analysis and calorie estimates
 * @throws {Error} If the API request fails or image analysis fails
 */
export const estimateCalories = async (base64Image) => {
  try {
    // Send image to Gemini AI server for analysis
    const response = await fetch("http://192.168.1.2:3000/estimate-calories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Image }),
    });

    // Check if the API request was successful
    if (!response.ok) {
      const text = await response.text();
      console.log("estimate-calories backend error =", text);
      throw new Error(`Failed to analyze image: ${text}`);
    }

    // Parse and return the analysis results
    const result = await response.json();
    console.log("Calorie estimation result:", result);
    return result;
  } catch (error) {
    console.error("Error estimating calories:", error);
    throw error;
  }
};
