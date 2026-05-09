import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { responsiveFontSize as rf } from "react-native-responsive-dimensions";
import { getUserProfile } from "../lib/supabaseUtils";
import { Ionicons } from "@expo/vector-icons";
import ProgressChart from "../components/ProgressChart";
import * as ImagePicker from "expo-image-picker";
import ChatbotFAB from "../components/ChatbotFAB";

export default function HomeScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEstimateCalories = async () => {
    try {
      // Request camera roll permissions
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

      // Show action sheet for image selection
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
              navigation.navigate("EstimateCalories", {
                imageUri: result.assets[0].uri,
              });
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
              navigation.navigate("EstimateCalories", {
                imageUri: result.assets[0].uri,
              });
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

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#29c439" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>
            {userProfile?.full_name || "User"}
          </Text>
        </View>
        <View style={styles.bmiContainer}>
          <Text style={styles.bmiLabel}>Your BMI</Text>
          <Text style={styles.bmiValue}>{userProfile?.bmi || "--"}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("Calories")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#FFE4E1" }]}>
                <Ionicons name="nutrition-outline" size={24} color="#FF6B6B" />
              </View>
              <Text style={styles.actionText}>Today's Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() =>
                navigation.navigate("Recommend", {
                  defaultTab: "exercises",
                })
              }
            >
              <View style={[styles.actionIcon, { backgroundColor: "#E0F7FA" }]}>
                <Ionicons name="fitness-outline" size={24} color="#00BCD4" />
              </View>
              <Text style={styles.actionText}>Workout Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleEstimateCalories}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="barcode-outline" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.actionText}>Estimate Calories</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Stats */}
        {/* <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Health Stats</Text>
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{userProfile?.weight || '--'} kg</Text>
                            <Text style={styles.statLabel}>Weight</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{userProfile?.height || '--'} cm</Text>
                            <Text style={styles.statLabel}>Height</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{userProfile?.obesity_risk || '--'}</Text>
                            <Text style={styles.statLabel}>Risk Level</Text>
                        </View>
                    </View>
                </View> */}

        {/* Recent Activity */}
        {/* <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.activityCard}>
                        <View style={styles.activityHeader}>
                            <Ionicons name="time-outline" size={20} color="#666" />
                            <Text style={styles.activityTime}>Today, 10:30 AM</Text>
                        </View>
                        <Text style={styles.activityText}>Completed morning workout routine</Text>
                    </View>
                    <View style={styles.activityCard}>
                        <View style={styles.activityHeader}>
                            <Ionicons name="time-outline" size={20} color="#666" />
                            <Text style={styles.activityTime}>Yesterday, 8:00 PM</Text>
                        </View>
                        <Text style={styles.activityText}>Logged dinner: Grilled chicken with vegetables</Text>
                    </View>
                </View> */}
        <ProgressChart />
      </ScrollView>

      {/* Add the Chatbot FAB */}
      <ChatbotFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#edffdd",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 70,
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: rf(2),
    color: "#666",
  },
  nameText: {
    fontSize: rf(2.5),
    fontWeight: "bold",
    color: "#333",
  },
  bmiContainer: {
    alignItems: "center",
  },
  bmiLabel: {
    fontSize: rf(1.8),
    color: "#666",
  },
  bmiValue: {
    fontSize: rf(2.5),
    fontWeight: "bold",
    color: "#29c439",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: rf(2.2),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    width: "30%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    fontSize: rf(1.8),
    color: "#333",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    width: "30%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: rf(2.2),
    fontWeight: "bold",
    color: "#29c439",
  },
  statLabel: {
    fontSize: rf(1.8),
    color: "#666",
    marginTop: 5,
  },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  activityTime: {
    fontSize: rf(1.6),
    color: "#666",
    marginLeft: 5,
  },
  activityText: {
    fontSize: rf(1.8),
    color: "#333",
  },
  progressButton: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "center",
  },
  progressButtonText: {
    fontSize: rf(1.8),
    color: "#29c439",
    fontWeight: "bold",
    marginLeft: 10,
  },
});
