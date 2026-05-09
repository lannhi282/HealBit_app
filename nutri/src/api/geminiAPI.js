import { API_CONFIG } from "../config/apiConfig";
// API endpoint for the nutrition-focused chatbot
const API_URL = `${API_CONFIG.AI_BASE_URL}/ai-chatbot`; /**
 * Sends a message to the Gemini AI chatbot and gets a nutrition-focused response
 * @param {string} message - The user's question or message
 * @returns {Promise<string>} The AI's response about nutrition
 * @throws {Error} If the API request fails or server returns an error
 */
export const sendMessage = async (message) => {
  try {
    // Send message to Gemini AI server
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    // Handle server errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get response from server");
    }

    // Parse and return the AI's response
    const data = await response.json();
    return data.response;
  } catch (error) {
    // Log and propagate any errors that occur during the API call
    console.error("Error in Gemini API:", error);
    throw error;
  }
};
