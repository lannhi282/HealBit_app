import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { responsiveFontSize as rf } from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useRoute } from "@react-navigation/native";
import { fetchAISuggestion } from "../api/AISuggest";
import ChatbotFAB from "../components/ChatbotFAB";
import { getUserProfile } from "../lib/supabaseUtils";

/**
 * RecommendScreen Component
 * Displays personalized AI-generated recommendations for recipes and exercises
 * based on user's BMI and obesity risk level.
 *
 * Features:
 * - Tab-based navigation between recipes and exercises
 * - AI-powered personalized recommendations
 * - Regeneratable suggestions
 * - Interactive list items with detailed views
 * - Loading states and error handling
 */
export default function RecommendScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // State management for UI and data
  const [selectedTab, setSelectedTab] = useState("recipes"); // Current active tab
  const [recipes, setRecipes] = useState([]); // List of recommended recipes
  const [exercises, setExercises] = useState([]); // List of recommended exercises
  const [loading, setLoading] = useState(true); // Loading state indicator
  const [userProfile, setUserProfile] = useState(null); // User profile data

  /**
   * Fetches user profile and AI-generated recommendations
   * Combines user health data with AI suggestions for personalized content
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile();
      if (!profile) {
        console.error("No user profile found");
        setLoading(false);
        return;
      }
      // Get AI suggestions based on user's health metrics
      const aiSuggestion = await fetchAISuggestion(profile);

      setRecipes(aiSuggestion.recipes || []);
      setExercises(aiSuggestion.exercises || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Regenerates recommendations by refetching data
   * Triggered by user interaction with refresh button
   */
  const handleRegenerate = () => {
    fetchData();
  };

  /**
   * Renders individual recipe item in the list
   * @param {Object} item - Recipe data object
   * @param {number} index - Item index in the list
   */
  const renderRecipeItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
    >
      <View style={styles.itemContent}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name={item.iconClass} size={24} color="#29c439" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{item.recipeName}</Text>
          <Text style={styles.itemSubtitle}>
            {item.recipeCalories} calories
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  /**
   * Renders individual exercise item in the list
   * @param {Object} item - Exercise data object
   * @param {number} index - Item index in the list
   */
  const renderExerciseItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate("ExerciseDetail", { exercise: item })}
    >
      <View style={styles.itemContent}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name={item.iconClass} size={24} color="#29c439" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{item.exerciseName}</Text>
          <Text style={styles.itemSubtitle}>
            {item.duration} • {item.intensity}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  // Loading state UI
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#29c439" />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* Header Section*/}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>AI Recommendations</Text>
          <TouchableOpacity
            style={styles.regenerateButton}
            onPress={handleRegenerate}
            disabled={loading}
          >
            <Ionicons
              name="refresh"
              size={24}
              color={loading ? "#999" : "#29c439"}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Personalized for your health goals
        </Text>
      </View>

      {/* Tab Navigations */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "recipes" && styles.activeTab,
          ]}
          onPress={() => setSelectedTab("recipes")}
        >
          <Ionicons
            name="restaurant-outline"
            size={24}
            color={selectedTab === "recipes" ? "white" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === "recipes" && styles.activeTabText,
            ]}
          >
            Recipes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "exercises" && styles.activeTab,
          ]}
          onPress={() => setSelectedTab("exercises")}
        >
          <Ionicons
            name="fitness-outline"
            size={24}
            color={selectedTab === "exercises" ? "white" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === "exercises" && styles.activeTabText,
            ]}
          >
            Exercises
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Section - Dynamic List Based on Selected Tab */}
      <View style={styles.contentContainer}>
        {selectedTab === "recipes" ? (
          <FlatList
            data={recipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={exercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <ChatbotFAB />
    </View>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#edffdd",
  },
  header: {
    paddingTop: 70,
    padding: 20,
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: rf(2.5),
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: rf(1.8),
    color: "#666",
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: rf(2),
    color: "#666",
  },
  tabContainer: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#29c439",
  },
  tabText: {
    fontSize: rf(1.8),
    color: "#666",
    fontWeight: "bold",
    marginLeft: 5,
  },
  activeTabText: {
    color: "white",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  listItem: {
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f9f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: rf(1.8),
    fontWeight: "bold",
    color: "#333",
  },
  itemSubtitle: {
    fontSize: rf(1.6),
    color: "#666",
    marginTop: 5,
  },
  regenerateButton: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
