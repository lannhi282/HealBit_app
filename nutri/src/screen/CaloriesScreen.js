import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ScrollView,
  ActionSheetIOS,
  Platform,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { responsiveFontSize as rf } from "react-native-responsive-dimensions";
import { getMealsForDate, addMeal, getUserProfile } from "../lib/supabaseUtils";
import { supabase } from "../lib/supabase";
import { estimateCalories } from "../api/EstimateCalories"; // Import your API service
import { LineChart } from "react-native-chart-kit";
import {
  calculateDailyCalorieGoal,
  getRemainingCalories,
} from "../utils/calorieCalculator";

// Constants for the app
const TOTAL_CALORIES = 2500;
// Meal type options with their respective configurations
const MEAL_OPTIONS = [
  {
    type: "breakfast",
    title: "Add Breakfast",
    subtitle: "Recommended 450-650 cal",
    icon: require("../assets/breakfast.png"),
  },
  {
    type: "lunch",
    title: "Add Lunch",
    subtitle: "Recommended 450-650 cal",
    icon: require("../assets/lunch.png"),
  },
  {
    type: "dinner",
    title: "Add Dinner",
    subtitle: "Recommended 450-650 cal",
    icon: require("../assets/dinner.png"),
  },
];

export default function CaloriesScreen({ navigation }) {
  // Initialize date to today at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // State management for the component
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(TOTAL_CALORIES);
  const [remainingCalories, setRemainingCalories] = useState(TOTAL_CALORIES);
  const [selectedDate, setSelectedDate] = useState(today);
  const [recentMeals, setRecentMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isGraphModalVisible, setIsGraphModalVisible] = useState(false);
  const [weeklyCaloriesData, setWeeklyCaloriesData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  useEffect(() => {
    getCurrentUser();
    loadDailyCalorieGoal();
  }, []);

  useEffect(() => {
    fetchMealsForDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setRemainingCalories(
      getRemainingCalories(dailyCalorieGoal, consumedCalories),
    );
  }, [dailyCalorieGoal, consumedCalories]);
  const getCurrentUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      if (user) {
        setUserId(user.id);
      } else {
        throw new Error("No user found");
      }
    } catch (error) {
      console.error("Error getting user:", error);
      Alert.alert("Error", "Failed to get user information. Please try again.");
    }
  };
  const loadDailyCalorieGoal = async () => {
    try {
      const profile = await getUserProfile();

      const goal = calculateDailyCalorieGoal(profile);

      if (goal) {
        setDailyCalorieGoal(goal);
        setRemainingCalories(getRemainingCalories(goal, consumedCalories));
      } else {
        setDailyCalorieGoal(TOTAL_CALORIES);
        setRemainingCalories(
          getRemainingCalories(TOTAL_CALORIES, consumedCalories),
        );
      }
    } catch (error) {
      console.error("Error calculating daily calorie goal:", error);
      setDailyCalorieGoal(TOTAL_CALORIES);
      setRemainingCalories(
        getRemainingCalories(TOTAL_CALORIES, consumedCalories),
      );
    }
  };
  // Function to analyze food image and save meal data
  const analyzeAndSaveImage = async (imageUri, mealType) => {
    setIsAnalyzing(true);
    try {
      if (!userId) {
        throw new Error("User ID not available");
      }

      // Convert image to base64 for API processing
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const base64data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = reader.result;
          resolve(base64String);
        };
      });

      // Call the API to estimate calories from the image
      const result = await estimateCalories(base64data);

      if (result.success && result.data) {
        const analysis = {
          foodItems: result.data.foodItems || [],
          totalCalories: result.data.totalCalories || 0,
          notes: result.data.notes || [],
          dishName: result.data.dishName || "Unnamed Dish",
        };

        // Save meal data to Supabase database
        const { data, error } = await supabase.from("calories").insert([
          {
            user_id: userId,
            meal_type: mealType,
            calories_amount: analysis.totalCalories,
            dish_name: analysis.dishName,
            image_url: imageUri,
            date: selectedDate.toLocaleDateString("en-CA"),
            created_at: new Date().toISOString(),
            food_items: analysis.foodItems.map((item) => ({
              name: item.name || "Unknown Item",
              calories: item.calories || 0,
              portion: item.portion || "Unknown",
            })),
            notes: analysis.notes || [],
          },
        ]);

        if (error) throw error;

        // Refresh the meals list after adding new meal
        await fetchMealsForDate(selectedDate);

        Alert.alert("Success", "Meal added successfully!", [{ text: "OK" }]);
      } else {
        throw new Error(result.error || "Could not analyze the image");
      }
    } catch (error) {
      console.error("Error processing meal:", error);
      Alert.alert(
        "Error",
        "Failed to process and save meal. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to fetch meals for a specific date
  const fetchMealsForDate = async (date) => {
    setIsLoading(true);
    try {
      const meals = await getMealsForDate(date);
      // Sort meals by creation time (newest first)
      const sortedMeals = meals.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
      setRecentMeals(sortedMeals);

      // Update total calories consumed for the day
      const totalCalories = sortedMeals.reduce(
        (sum, meal) => sum + (meal.calories_amount || 0),
        0,
      );
      setConsumedCalories(totalCalories);
    } catch (error) {
      console.error("Error fetching meals:", error);
      Alert.alert("Error", "Failed to load meals for this date");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle image selection and calorie estimation
  const handleEstimateCalories = async (mealType) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to select images.",
          [{ text: "OK" }],
        );
        return;
      }

      // Show options to take photo or choose from gallery
      Alert.alert("Select Image", "Choose how you want to select the image", [
        {
          text: "Take Photo",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled) {
              await analyzeAndSaveImage(result.assets[0].uri, mealType);
            }
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled) {
              await analyzeAndSaveImage(result.assets[0].uri, mealType);
            }
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.", [
        { text: "OK" },
      ]);
    }
  };

  // Helper function for formatting time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const renderMealItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recentMealItem}
      onPress={() => navigation.navigate("CaloriesDetails", { meal: item })}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.recentMealImage}
        />
      ) : (
        <Image
          source={
            item.meal_type === "breakfast"
              ? require("../assets/breakfast.png")
              : item.meal_type === "lunch"
                ? require("../assets/lunch.png")
                : require("../assets/dinner.png")
          }
          style={styles.recentMealImage}
        />
      )}
      <View style={styles.recentMealInfo}>
        <Text style={styles.recentMealName}>
          {item.dish_name ||
            (item.meal_type
              ? `${item.meal_type.charAt(0).toUpperCase()}${item.meal_type.slice(1)}`
              : "Unknown Meal")}
        </Text>
        <Text style={styles.recentMealTime}>{item.meal_type}</Text>
        <Text style={styles.recentMealTime}>{formatTime(item.created_at)}</Text>
      </View>
      <View style={styles.recentMealCalories}>
        <Ionicons name="flame" size={16} color="#FF6B6B" />
        <Text style={styles.recentMealCaloriesText}>
          {item.calories_amount || 0} kcal
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 3);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const isFutureDate = (date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
  };

  const formatDayNumber = (date) => {
    return date.getDate().toString();
  };

  const formatDayName = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
    });
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const handleDateSelect = (date) => {
    if (!isFutureDate(date)) {
      setSelectedDate(date);
    }
  };

  const handleAddMeal = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...MEAL_OPTIONS.map((meal) => meal.title), "Cancel"],
          cancelButtonIndex: MEAL_OPTIONS.length,
        },
        (buttonIndex) => {
          if (buttonIndex < MEAL_OPTIONS.length) {
            handleEstimateCalories(MEAL_OPTIONS[buttonIndex].type);
          }
        },
      );
    } else {
      Alert.alert(
        "Add Meal",
        "Select meal type",
        [
          ...MEAL_OPTIONS.map((meal) => ({
            text: meal.title,
            onPress: () => handleEstimateCalories(meal.type),
          })),
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {},
          },
        ],
        { cancelable: true },
      );
    }
  };

  // Function to fetch and prepare weekly calories data for the graph
  const getWeeklyCaloriesData = async () => {
    try {
      const weekDates = getWeekDates();
      const caloriesData = [];
      const dateLabels = [];
      const pointColors = [];
      let weeklyTotal = 0;

      // Collect calories data for each day of the week
      for (const date of weekDates) {
        const meals = await getMealsForDate(date);
        const totalCalories = meals.reduce(
          (sum, meal) => sum + (meal.calories_amount || 0),
          0,
        );
        caloriesData.push(totalCalories);
        weeklyTotal += totalCalories;
        dateLabels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
        // Color points red if over daily limit, green if under
        pointColors.push(
          totalCalories > dailyCalorieGoal
            ? "rgba(255, 0, 0, 1)"
            : "rgba(41, 196, 57, 1)",
        );
      }

      setWeeklyCaloriesData({
        labels: dateLabels,
        datasets: [
          {
            data: caloriesData,
            color: (opacity = 1) => `rgba(41, 196, 57, ${opacity})`,
            strokeWidth: 2,
            pointColors: pointColors,
          },
          {
            data: weekDates.map(() => dailyCalorieGoal),
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        weeklyTotal: weeklyTotal,
      });
    } catch (error) {
      console.error("Error fetching weekly calories:", error);
      Alert.alert("Error", "Failed to load weekly calories data");
    }
  };

  return (
    <View style={styles.container}>
      {isAnalyzing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#29c439" />
            <Text style={styles.loadingText}>Analyzing your meal...</Text>
          </View>
        </View>
      )}
      <View style={styles.dateSelectorContainer}>
        <View style={styles.monthHeaderRow}>
          <Text style={styles.monthText}>{formatMonth(selectedDate)}</Text>
          <TouchableOpacity
            style={styles.graphButton}
            onPress={() => {
              getWeeklyCaloriesData();
              setIsGraphModalVisible(true);
            }}
          >
            <Ionicons name="stats-chart" size={24} color="#29c439" />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScrollContent}
        >
          {getWeekDates().map((date, index) => {
            const isDisabled = isFutureDate(date);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateButtonContainer,
                  isDisabled && styles.disabledDateButton,
                ]}
                onPress={() => handleDateSelect(date)}
                disabled={isDisabled}
              >
                <Text
                  style={[
                    styles.dayNameText,
                    isSameDay(date, selectedDate) && styles.selectedDayNameText,
                    isDisabled && styles.disabledText,
                  ]}
                >
                  {formatDayName(date)}
                </Text>
                <View
                  style={[
                    styles.dateButton,
                    isSameDay(date, selectedDate) && styles.selectedDateButton,
                    isDisabled && styles.disabledDateButtonCircle,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      isSameDay(date, selectedDate) && styles.selectedDateText,
                      isDisabled && styles.disabledText,
                    ]}
                  >
                    {formatDayNumber(date)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.caloriesSection}>
        <TouchableOpacity
          style={styles.progressButton}
          onPress={() => navigation.getParent()?.navigate("ProgressHistory")}
        >
          <Ionicons name="trending-up" size={22} color="#29c439" />
          <Text style={styles.progressButtonText}>Health Progress</Text>
        </TouchableOpacity>
        <View style={styles.calorieDisplay}>
          <View style={styles.headerRow}>
            <View style={styles.calorieIconContainer}>
              <Ionicons name="flame" size={24} color="#FF6B6B" />
            </View>
            <Text style={styles.headerText}>Today Calories</Text>
          </View>
          <View style={styles.calorieInfo}>
            <Text style={styles.calorieCount}>{consumedCalories} Kcal</Text>

            <Text style={styles.calorieTotal}>of {dailyCalorieGoal} kcal</Text>

            <Text style={styles.remainingCaloriesText}>
              Còn lại: {remainingCalories} kcal
            </Text>

            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: dailyCalorieGoal
                      ? `${Math.min((consumedCalories / dailyCalorieGoal) * 100, 100)}%`
                      : "0%",
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.addMealContainer}>
        <TouchableOpacity style={styles.addMealButton} onPress={handleAddMeal}>
          <View style={styles.addMealContent}>
            <View style={styles.addMealTextContainer}>
              <Text style={styles.addMealTitle}>Add Meal</Text>
              <Text style={styles.addMealSubtitle}>
                Track your daily intake
              </Text>
            </View>
            <View style={styles.addIconContainer}>
              <Ionicons name="add-circle" size={50} color="#29c439" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.recentlyAddedContainer}>
        <Text style={styles.sectionTitle}>Recently Added</Text>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading meals...</Text>
          </View>
        ) : recentMeals.length > 0 ? (
          <FlatList
            data={recentMeals}
            renderItem={renderMealItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.recentMealsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No meals added for this date</Text>
          </View>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isGraphModalVisible}
        onRequestClose={() => setIsGraphModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Weekly Calories</Text>
              <TouchableOpacity
                onPress={() => setIsGraphModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {weeklyCaloriesData.datasets[0].data.length > 0 ? (
              <View style={styles.chartContainer}>
                <LineChart
                  data={weeklyCaloriesData}
                  width={Dimensions.get("window").width - 60}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=" cal"
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(41, 196, 57, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: "6",
                      strokeWidth: "2",
                      stroke: "#fff",
                    },
                    propsForBackgroundLines: {
                      strokeWidth: 1,
                      stroke: "rgba(0, 0, 0, 0.1)",
                    },
                    propsForLabels: {
                      fontSize: 12,
                    },
                  }}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  bezier
                  withDots={true}
                  withInnerLines={true}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  fromZero={true}
                  segments={5}
                  renderDotContent={({ x, y, index, indexData }) => {
                    if (!indexData || indexData === 0) {
                      return null;
                    }

                    if (indexData === dailyCalorieGoal) {
                      return null;
                    }

                    return (
                      <View
                        key={`actual-calorie-label-${index}-${indexData}-${Math.round(x)}-${Math.round(y)}`}
                        style={{
                          position: "absolute",
                          top: y - 34,
                          left: x - 26,
                          backgroundColor:
                            weeklyCaloriesData.datasets[0].pointColors?.[
                              index
                            ] || "rgba(41, 196, 57, 1)",
                          paddingHorizontal: 7,
                          paddingVertical: 3,
                          borderRadius: 6,
                          zIndex: 10,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 10,
                            fontWeight: "600",
                          }}
                        >
                          {indexData} cal
                        </Text>
                      </View>
                    );
                  }}
                />
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#29c439" />
                <Text style={styles.loadingText}>Loading data...</Text>
              </View>
            )}
            <Text style={styles.chartLegend}>
              Daily goal: {dailyCalorieGoal} kcal • Green = under goal • Red =
              over goal
            </Text>
            <View style={styles.weeklyTotalContainer}>
              <Text style={styles.weeklyTotalLabel}>Weekly Total:</Text>
              <Text style={styles.weeklyTotalValue}>
                {weeklyCaloriesData.weeklyTotal?.toLocaleString()} cal
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#edffdd",
  },
  dateSelectorContainer: {
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  monthHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  monthText: {
    fontSize: rf(2.2),
    fontWeight: "600",
    color: "#333",
  },
  caloriesSection: {
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  calorieDisplay: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  calorieIconContainer: {
    backgroundColor: "#FFF0F0",
    padding: 12,
    borderRadius: 50,
    marginRight: 10,
  },
  headerText: {
    fontSize: rf(2.5),
    fontWeight: "bold",
    color: "#333",
  },
  calorieInfo: {
    alignItems: "center",
  },
  calorieCount: {
    fontSize: rf(3.5),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  calorieTotal: {
    fontSize: rf(2),
    color: "#999",
  },
  addMealContainer: {
    padding: 16,
  },
  addMealButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  addMealContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  addMealTextContainer: {
    flex: 1,
  },
  addMealTitle: {
    fontSize: rf(1.8),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  addMealSubtitle: {
    fontSize: rf(1.6),
    color: "#666",
  },
  addIconContainer: {
    marginLeft: 12,
  },
  dateScrollContent: {
    paddingVertical: 10,
  },
  dateButtonContainer: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  dayNameText: {
    fontSize: rf(1.6),
    color: "#666",
    marginBottom: 8,
  },
  selectedDayNameText: {
    color: "#29c439",
    fontWeight: "500",
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
  },
  selectedDateButton: {
    backgroundColor: "#29c439",
  },
  dateText: {
    fontSize: rf(1.8),
    color: "#333",
    fontWeight: "500",
  },
  selectedDateText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledDateButton: {
    opacity: 0.5,
  },
  disabledDateButtonCircle: {
    backgroundColor: "#e0e0e0",
  },
  disabledText: {
    color: "#999",
  },
  recentlyAddedContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: rf(2),
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  recentMealsList: {
    paddingBottom: 16,
  },
  recentMealItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentMealImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  recentMealInfo: {
    flex: 1,
  },
  recentMealName: {
    fontSize: rf(1.7),
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  recentMealTime: {
    fontSize: rf(1.5),
    color: "#666",
  },
  recentMealCalories: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recentMealCaloriesText: {
    fontSize: rf(1.5),
    color: "#FF6B6B",
    marginLeft: 4,
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: rf(1.8),
    color: "#333",
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: rf(1.6),
    color: "#666",
    textAlign: "center",
  },
  graphButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: Dimensions.get("window").width - 40,
    maxHeight: Dimensions.get("window").height - 100,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: rf(2.2),
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  chartContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  chartLegend: {
    textAlign: "center",
    color: "#666",
    fontSize: rf(1.6),
    marginTop: 10,
  },
  weeklyTotalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  weeklyTotalLabel: {
    fontSize: rf(1.8),
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  weeklyTotalValue: {
    fontSize: rf(2),
    fontWeight: "bold",
    color: "#29c439",
  },
  remainingCaloriesText: {
    fontSize: rf(1.7),
    color: "#666",
    marginTop: 6,
    marginBottom: 12,
  },

  progressBarBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#e6e6e6",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
  },

  progressBarFill: {
    height: "100%",
    backgroundColor: "#29c439",
    borderRadius: 10,
  },
  progressButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  progressButtonText: {
    marginLeft: 8,
    fontSize: rf(1.8),
    fontWeight: "600",
    color: "#333",
  },
});
