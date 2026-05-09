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
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
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
export default function RecommendScreen({ navigation, route }) {
  const [selectedTab, setSelectedTab] = useState(
    route?.params?.defaultTab || "recipes",
  );
  const [recipes, setRecipes] = useState([]); // List of recommended recipes
  const [exercises, setExercises] = useState([]); // List of recommended exercises
  const [loading, setLoading] = useState(true); // Loading state indicator
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null); // User profile data
  /**
   * Fetches user profile and AI-generated recommendations
   * Combines user health data with AI suggestions for personalized content
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const profile = await getUserProfile();

      if (!profile) {
        setRecipes([]);
        setExercises([]);
        setError("Không tìm thấy hồ sơ người dùng. Vui lòng cập nhật hồ sơ.");
        return;
      }

      setUserProfile(profile);

      const aiSuggestion = await fetchAISuggestion(profile);

      const newRecipes = aiSuggestion.recipes || [];
      const newExercises = aiSuggestion.exercises || [];

      setRecipes(newRecipes);
      setExercises(newExercises);

      if (newRecipes.length === 0 && newExercises.length === 0) {
        setError("");
      }
    } catch (error) {
      console.log("Error fetching data:", error);
      setRecipes([]);
      setExercises([]);
      setError("Không thể tải gợi ý, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (route?.params?.defaultTab) {
      setSelectedTab(route.params.defaultTab);
    }
  }, [route?.params?.defaultTab]);

  /**
   * Regenerates recommendations by refetching data
   * Triggered by user interaction with refresh button
   */
  const handleRegenerate = () => {
    fetchData();
  };
  const currentData = selectedTab === "recipes" ? recipes : exercises;
  const isEmpty = currentData.length === 0;
  /**
   * Renders individual recipe item in the list
   * @param {Object} item - Recipe data object
   * @param {number} index - Item index in the list
   */

  const getRecipeIcon = (iconClass) => {
    const validIcons = [
      "utensils",
      "drumstick-bite",
      "carrot",
      "apple-alt",
      "fish",
      "leaf",
      "mug-hot",
      "seedling",
      "egg",
      "bread-slice",
    ];

    if (validIcons.includes(iconClass)) {
      return iconClass;
    }

    return "utensils";
  };

  const getExerciseIcon = (iconClass) => {
    const validIcons = [
      "walking",
      "running",
      "heartbeat",
      "dumbbell",
      "biking",
      "swimmer",
      "pray",
      "music",
      "hiking",
      "spa",
      "child",
    ];

    if (validIcons.includes(iconClass)) {
      return iconClass;
    }

    return "heartbeat";
  };
  const renderRecipeItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate("RecipeDetail", { recipe: item })}
    >
      <View style={styles.itemContent}>
        <View style={styles.iconContainer}>
          <FontAwesome5
            name={getRecipeIcon(item.iconClass)}
            size={24}
            color="#29c439"
          />
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
          <FontAwesome5
            name={getExerciseIcon(item.iconClass)}
            size={24}
            color="#29c439"
          />
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
          <Text style={styles.loadingText}>Đang tạo gợi ý cho bạn...</Text>
          <Text style={styles.loadingSubText}>
            AI đang phân tích BMI, mục tiêu và sở thích của bạn.
          </Text>
        </View>
        <ChatbotFAB />
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
        {error ? (
          <View style={styles.stateContainer}>
            <Ionicons name="alert-circle-outline" size={50} color="#ff8c00" />
            <Text style={styles.stateTitle}>{error}</Text>
            <Text style={styles.stateSubtitle}>
              Kiểm tra kết nối mạng, backend AI hoặc thử tạo lại gợi ý.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRegenerate}
            >
              <Ionicons name="refresh" size={18} color="white" />
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : isEmpty ? (
          <View style={styles.stateContainer}>
            <Ionicons
              name={
                selectedTab === "recipes"
                  ? "restaurant-outline"
                  : "fitness-outline"
              }
              size={50}
              color="#999"
            />
            <Text style={styles.stateTitle}>
              {selectedTab === "recipes"
                ? "Chưa có dữ liệu món ăn"
                : "Chưa có dữ liệu bài tập"}
            </Text>
            <Text style={styles.stateSubtitle}>
              Hãy cập nhật hồ sơ sức khỏe hoặc tạo lại gợi ý.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRegenerate}
            >
              <Ionicons name="sparkles-outline" size={18} color="white" />
              <Text style={styles.retryButtonText}>Tạo gợi ý</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={currentData}
            renderItem={
              selectedTab === "recipes" ? renderRecipeItem : renderExerciseItem
            }
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
  loadingSubText: {
    marginTop: 8,
    fontSize: rf(1.6),
    color: "#777",
    textAlign: "center",
    paddingHorizontal: 30,
  },

  stateContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  stateTitle: {
    marginTop: 12,
    fontSize: rf(2),
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },

  stateSubtitle: {
    marginTop: 8,
    fontSize: rf(1.6),
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: "#29c439",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  retryButtonText: {
    color: "white",
    fontSize: rf(1.7),
    fontWeight: "bold",
    marginLeft: 8,
  },
});
