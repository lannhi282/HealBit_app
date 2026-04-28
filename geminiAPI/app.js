require("dotenv").config();
const express = require("express");

const app = express();
const port = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const API_KEY = process.env.API_KEY;

console.log("OpenRouter key loaded =", !!API_KEY);

async function callOpenRouter(messages, extra = {}) {
  // const { model = "google/gemini-2.0-flash-001", ...restExtra } = extra;
  const { model = "openai/gpt-4o-mini", ...restExtra } = extra;
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Nutri Recommendation System",
      },
      body: JSON.stringify({
        model,
        messages,
        ...restExtra,
      }),
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`OpenRouter error ${response.status}: ${text}`);
  }

  const data = JSON.parse(text);
  return data.choices?.[0]?.message?.content ?? "";
}
const SYSTEM_PROMPT = `You are a helpful nutrition assistant. Only respond to questions related to:
- BMI
- Obesity levels
- Nutrition
- Healthy foods
- Diet and exercise

IMPORTANT INSTRUCTIONS:
1. Keep responses very short and concise (maximum 2-3 sentences)
2. Focus on direct answers without lengthy explanations
3. If the user asks something outside these topics, simply say: "I can only help with nutrition-related questions."
4. Use simple, clear language
5. No need for greetings or formalities
6. Get straight to the point

Example responses:
User: "What's a healthy breakfast?"
Assistant: "Try oatmeal with fruits and nuts. It's high in fiber and protein, keeping you full longer."

User: "How to lose weight?"
Assistant: "Focus on a balanced diet and regular exercise. Aim for a 500-calorie daily deficit through diet and activity."

User: "What's the weather today?"
Assistant: "I can only help with nutrition-related questions."`;

function cleanJsonResponse(text) {
  try {
    let cleanedText = text;

    cleanedText = cleanedText.replace(/```json\s*|\s*```/g, "");
    cleanedText = cleanedText.trim();

    const startIndex = cleanedText.indexOf("{");
    const endIndex = cleanedText.lastIndexOf("}");

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No valid JSON object found in the response");
    }

    cleanedText = cleanedText.slice(startIndex, endIndex + 1);

    cleanedText = cleanedText
      .replace(/,(\s*[}\]])/g, "$1")
      .replace(/\n+/g, "\n")
      .replace(/\\\*/g, "")
      .replace(/[""]/g, '"')
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"');

    const parsedJson = JSON.parse(cleanedText);

    if (!parsedJson.recipes || !parsedJson.exercises) {
      throw new Error("Missing required recipes or exercises arrays");
    }

    parsedJson.recipes.forEach((recipe, index) => {
      const requiredFields = [
        "recipeName",
        "recipeDescription",
        "recipeItems",
        "cookingInstructions",
        "recipeCalories",
        "recipeBenefits",
        "personalizedReason",
        "iconClass",
        "estimatedCookingTime",
      ];
      const missingFields = requiredFields.filter((field) => !recipe[field]);
      if (missingFields.length > 0) {
        throw new Error(
          `Recipe at index ${index} is missing required fields: ${missingFields.join(", ")}`,
        );
      }
    });

    parsedJson.exercises.forEach((exercise, index) => {
      const requiredFields = [
        "exerciseName",
        "exerciseDescription",
        "exercisePerform",
        "duration",
        "intensity",
        "exerciseBenefits",
        "personalizedReason",
        "iconClass",
        "location",
      ];
      const missingFields = requiredFields.filter((field) => !exercise[field]);
      if (missingFields.length > 0) {
        throw new Error(
          `Exercise at index ${index} is missing required fields: ${missingFields.join(", ")}`,
        );
      }
    });

    return parsedJson;
  } catch (error) {
    console.error("Error cleaning JSON:", error);
    throw new Error(`Failed to process JSON response: ${error.message}`);
  }
}

app.post("/generate-ai-tips", async (req, res) => {
  try {
    const {
      bmi,
      obesityRisk,
      age,
      gender,
      weight,
      height,
      exerciseFrequency,
      waterIntake,
      mainMeals,
      foodPreference,
      allergy,
      goal,
    } = req.body;

    console.log("Personalized recommendation input:", {
      bmi,
      obesityRisk,
      age,
      gender,
      weight,
      height,
      exerciseFrequency,
      waterIntake,
      mainMeals,
      foodPreference,
      allergy,
      goal,
    });
    if (!bmi || !obesityRisk) {
      return res.status(400).json({
        error: "BMI value or Obesity Risk Level is required",
      });
    }
    const prompt = `
Generate 5 healthy recipes and 5 suitable exercises in JSON format for this user profile:

User Profile:
- BMI: ${bmi}
- Obesity Risk Level: ${obesityRisk}
- Age: ${age || "Not provided"}
- Gender: ${gender || "Not provided"}
- Weight: ${weight || "Not provided"} kg
- Height: ${height || "Not provided"} cm
- Exercise frequency: ${exerciseFrequency || "Not provided"}
- Water intake: ${waterIntake || "Not provided"}
- Main meals per day: ${mainMeals || "Not provided"}
- Food preference: ${foodPreference || "No specific preference"}
- Allergy or restricted foods: ${allergy || "None"}
- Health goal: ${goal || "Maintain a healthy lifestyle"}

Personalization rules:
- If goal is "lose_weight", recommend lower-calorie meals and fat-burning exercises.
- If goal is "maintain_weight", recommend balanced meals and moderate exercises.
- If goal is "gain_muscle", recommend high-protein meals and strength exercises.
- Avoid ingredients listed in allergy or restricted foods.
- Match exercise intensity to the user's current exercise frequency.
- Consider water intake and main meals when suggesting habits.
- Recipes should be healthy, practical, and easy to cook.
- Exercises should be safe and suitable for the user's BMI and obesity risk level.

The response should follow this JSON schema:
{
  "recipes": [
    {
      "recipeName": "string",
      "recipeDescription": "string",
      "recipeItems": ["string"],
      "cookingInstructions": ["string"],
      "recipeCalories": "number",
      "recipeBenefits": "string",
      "personalizedReason": "string",
      "iconClass": "string",
      "estimatedCookingTime": "string"
    }
  ],
  "exercises": [
    {
      "exerciseName": "string",
      "exerciseDescription": "string",
      "exercisePerform": ["string"],
      "duration": "string",
      "intensity": "string",
      "exerciseBenefits": "string",
      "personalizedReason": "string",
      "iconClass": "string",
      "location": "string"
    }
  ]
}

IMPORTANT:
- Return valid JSON only.
- No markdown fences.
- No explanation outside JSON.
- Use simple English.
`;

    const rawText = await callOpenRouter([{ role: "user", content: prompt }], {
      model: "openai/gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 2200,
    });
    console.log("AI tips raw response:", rawText);

    const aiTipsJSON = cleanJsonResponse(rawText);

    res.json({
      bmi,
      data: aiTipsJSON,
    });
  } catch (error) {
    console.error("Error generating AI tips:", error);
    res.status(500).json({
      error: "Failed to generate recipes and exercises",
      details: error.message,
    });
  }
});

app.post("/ai-chatbot", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const text = await callOpenRouter(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      {
        temperature: 0.7,
        max_tokens: 120,
      },
    );

    const conciseResponse =
      text.split(".")[0] + (text.includes(".") ? "." : "");

    res.json({ response: conciseResponse });
  } catch (error) {
    console.error("Error in OpenRouter chatbot:", error);
    res.status(500).json({
      error: "Failed to process message",
      details: error.message,
    });
  }
});

app.post("/estimate-calories", async (req, res) => {
  try {
    const { base64Image } = req.body;

    console.log("Has base64Image =", !!base64Image);
    console.log("base64Image type =", typeof base64Image);
    console.log("base64Image preview =", base64Image?.slice?.(0, 50));

    if (!base64Image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const imageUrl = base64Image.startsWith("data:")
      ? base64Image
      : `data:image/jpeg;base64,${base64Image}`;

    console.log("Image data length =", imageUrl?.length);

    const text = await callOpenRouter(
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Analyze this food image and provide the following information in JSON only:\n" +
                "{\n" +
                '  "dishName": "name of the main dish",\n' +
                '  "foodItems": [\n' +
                "    {\n" +
                '      "name": "food name",\n' +
                '      "calories": number,\n' +
                '      "portion": "description of portion"\n' +
                "    }\n" +
                "  ],\n" +
                '  "totalCalories": number,\n' +
                '  "notes": ["any important notes or disclaimers"]\n' +
                "}\n" +
                "Return ONLY valid JSON. No markdown. No explanation.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      {
        // model: "google/gemini-2.0-flash-001",
        model: "openai/gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 800,
      },
    );

    console.log("Estimate calories raw response:", text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      data: parsedResponse,
    });
  } catch (error) {
    console.error("Error in OpenRouter image analysis:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze image",
      details: error.message,
    });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running...");
});
