import { supabase } from "./supabase";

/**
 * User Profile Operations
 * Functions for managing user profile data in the database
 */

// Fetch the current user's profile data
export const getUserProfile = async () => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .single();

  if (error) throw error;
  return data;
};

// Update the current user's profile with new data
export const updateUserProfile = async (updates) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", (await supabase.auth.getUser()).data.user.id);

  if (error) throw error;
  return data;
};

/**
 * Progress Tracking Operations
 * Functions for managing user's progress tracking data
 */

// Fetch user's progress history, sorted by date
export const getProgressHistory = async () => {
  const { data, error } = await supabase
    .from("progress_tracking")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
};

// Add a new progress entry for the current user
export const addProgressEntry = async (entry) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("No authenticated user");

  const { data, error } = await supabase.from("progress_tracking").insert([
    {
      ...entry,
      user_id: user.id,
      date: new Date().toISOString(),
    },
  ]);

  if (error) throw error;
  return data;
};

/**
 * Recommendations Operations
 * Functions for managing user's recommendations
 */

// Fetch recommendations for the current user
export const getRecommendations = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("user_id", user.id) // ✅ quan trọng
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
export const saveRecommendations = async (recipes, exercises) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("No authenticated user");

    const insertData = [];

    // recipes
    recipes.forEach((r) => {
      insertData.push({
        user_id: user.id,
        type: "diet",
        title: r.recipeName,
        description: r.recipeDescription,
      });
    });

    // exercises
    exercises.forEach((e) => {
      insertData.push({
        user_id: user.id,
        type: "exercise",
        title: e.exerciseName,
        description: e.exerciseDescription,
      });
    });

    const { data, error } = await supabase
      .from("recommendations")
      .insert(insertData);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error saving recommendations:", error);
    throw error;
  }
};
/**
 * Authentication Operations
 * Helper functions for user authentication
 */

// Get the currently authenticated user
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Sign out the current user
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Bookmarks Operations
 * Functions for managing user's bookmarked items (recipes and exercises)
 */

// Add a new bookmark for the user
export const addBookmark = async (userId, itemId, item, type) => {
  try {
    const { data, error } = await supabase.from("bookmarks").insert([
      {
        user_id: userId,
        item_id: itemId,
        item_data: item,
        type: type, // 'recipe' or 'exercise'
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding bookmark:", error);
    throw error;
  }
};

// Remove a bookmark for the user
export const removeBookmark = async (userId, itemId, type) => {
  try {
    const { data, error } = await supabase.from("bookmarks").delete().match({
      user_id: userId,
      item_id: itemId,
      type: type,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error removing bookmark:", error);
    throw error;
  }
};

// Fetch all bookmarks for a user
export const getBookmarks = async (userId) => {
  try {
    const { data: bookmarks, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return bookmarks;
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    throw error;
  }
};

// Check if an item is bookmarked by the user
export const isBookmarked = async (userId, itemId, type) => {
  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("item_id", itemId)
      .eq("type", type)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  } catch (error) {
    console.error("Error checking bookmark:", error);
    throw error;
  }
};

/**
 * Meals Operations
 * Functions for managing user's meal and calorie tracking data
 */

// Fetch all meals for a specific date
export const getMealsForDate = async (date) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) throw new Error("No authenticated user");

    const dateString = date.toLocaleDateString("en-CA");
    // format: YYYY-MM-DD theo local time

    const { data, error } = await supabase
      .from("calories")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", dateString)
      .order("created_at", { ascending: false });

    console.log("GET MEALS DATE:", dateString);
    console.log("GET MEALS DATA:", data);
    console.log("GET MEALS ERROR:", error);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching meals:", error);
    throw error;
  }
};
// Add a new meal entry for the current user
export const addMeal = async (mealData) => {
  try {
    const { data, error } = await supabase.from("calories").insert([
      {
        ...mealData,
        user_id: (await supabase.auth.getUser()).data.user.id,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding meal:", error);
    throw error;
  }
};
