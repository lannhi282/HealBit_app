import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StatusBar,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { responsiveFontSize as rf } from "react-native-responsive-dimensions";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { updateUserProfile, addProgressEntry } from "../lib/supabaseUtils";

export default function BMIResultScreen({ navigation }) {
  const route = useRoute();
  const {
    name,
    bmi,
    selectedGender,
    age,
    eatingHabits,
    lifestyle,
    isFirstTimeUser,
    weight,
    height,
    gender,
  } = route.params || {};

  const [obesityRisk, setObesityRisk] = useState("");

  const getBMIStatus = (bmiValue) => {
    if (bmiValue < 18.5) {
      return { color: "yellow" };
    } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
      return { color: "lightgreen" };
    } else if (bmiValue >= 25 && bmiValue <= 29.9) {
      return { color: "orange" };
    } else {
      return { color: "red" };
    }
  };

  const getBMIDescription = (bmiValue) => {
    if (bmiValue < 18.5) {
      return "Your BMI is below normal. Consider increasing your calorie intake with a balanced diet.";
    } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
      return "Great! Keep maintaining a balanced diet and regular exercise.";
    } else if (bmiValue >= 25 && bmiValue <= 29.9) {
      return "Your BMI is slightly above normal. Consider incorporating more exercise and mindful eating.";
    } else {
      return "Your BMI is in the overweight range. It's recommended to consult with a healthcare professional for a personalized plan.";
    }
  };

  const sendDataToBackend = async () => {
    try {
      const genderValue = selectedGender || gender;

      if (!genderValue) {
        console.error("Gender missing in route params:", route.params);
        Alert.alert(
          "Error",
          "Gender is missing. Please go back and select gender.",
        );
        return;
      }

      if (!eatingHabits || !lifestyle) {
        console.error("Missing eatingHabits or lifestyle:", route.params);
        Alert.alert("Error", "Some required profile data is missing.");
        return;
      }

      const payload = {
        age: age,
        selectedGender: genderValue,
        bmi: bmi,
        veggies: eatingHabits?.veggies,
        waterIntake: eatingHabits?.waterIntake,
        mainMeals: eatingHabits?.mainMeals,
        exercise: lifestyle?.exercise,
        technologicalDevices: lifestyle?.technologicalDevices,
      };

      console.log("Sending payload:", {
        age: age,
        gender: genderValue,
        veggies: eatingHabits?.veggies,
        waterIntake: eatingHabits?.waterIntake,
        mainMeals: eatingHabits?.mainMeals,
        exercise: lifestyle?.exercise,
        technologicalDevices: lifestyle?.technologicalDevices,
        bmi: bmi,
      });

      const response = await axios.post(
        "http://192.168.1.2:8000/predict_obesity_risk/",
        payload,
      );

      console.log("Response from backend:", response.data);

      const riskLevel = response.data.obesity_level;
      setObesityRisk(riskLevel);

      try {
        await updateUserProfile({
          bmi: bmi,
          obesity_risk: riskLevel,
          weight: weight,
          height: height,
          age: age,
          gender: genderValue,
        });
      } catch (profileError) {
        console.error("Error saving profile:", profileError);
      }

      try {
        await addProgressEntry({
          bmi: bmi,
          obesity_risk: riskLevel,
          weight: weight,
          height: height,
          date: new Date().toISOString(),
        });
      } catch (progressError) {
        console.error("Error saving progress entry:", progressError);
      }
    } catch (error) {
      console.error("Error sending data to backend:", error);
      console.error("Status:", error?.response?.status);
      console.error("Response data:", error?.response?.data);
      console.error("Request payload:", {
        age,
        selectedGender: selectedGender || gender,
        bmi,
        veggies: eatingHabits?.veggies,
        waterIntake: eatingHabits?.waterIntake,
        mainMeals: eatingHabits?.mainMeals,
        exercise: lifestyle?.exercise,
        technologicalDevices: lifestyle?.technologicalDevices,
      });
    }
  };

  useEffect(() => {
    if (!bmi || !age || !eatingHabits || !lifestyle) {
      console.error("Missing required params:", route.params);
      return;
    }

    sendDataToBackend();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      <View style={styles.headingContainer}>
        {isFirstTimeUser && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
        )}

        <Text
          style={[styles.headingText, { marginLeft: isFirstTimeUser ? 80 : 0 }]}
        >
          BMI RESULTS
        </Text>
      </View>

      <View style={styles.resultCard}>
        <Image source={require("../assets/fatIcon.png")} style={styles.image} />
        <Text
          style={[
            styles.statusText,
            { color: getBMIStatus(Number(bmi)).color },
          ]}
        >
          {obesityRisk}
        </Text>
        <Text style={styles.bmiValue}>{bmi}</Text>
        <Text style={styles.rangeText}>Normal BMI range: 18.5 - 24.9</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>{name}</Text>
        <Text style={styles.adviceText}>{getBMIDescription(Number(bmi))}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.startButtonText}>Start Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#edffdd",
  },
  headingContainer: {
    marginTop: 70,
    width: "100%",
    padding: 20,
    backgroundColor: "#edffdd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  backButton: {
    marginRight: 10,
  },
  headingText: {
    color: "black",
    fontWeight: "700",
    fontSize: rf(3),
  },
  resultCard: {
    backgroundColor: "#edffdd",
    width: "90%",
    padding: 20,
    margin: 20,
    marginBottom: 10,
    marginTop: 38,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 10,
    marginLeft: 15,
  },
  statusText: {
    color: "limegreen",
    fontSize: rf(2.5),
    fontWeight: "bold",
  },
  bmiValue: {
    color: "black",
    fontSize: rf(5),
    fontWeight: "bold",
    marginVertical: 5,
  },
  rangeText: {
    color: "gray",
    fontSize: rf(2),
  },
  card: {
    backgroundColor: "white",
    width: "90%",
    padding: 5,
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cardText: {
    color: "black",
    fontSize: rf(3),
    fontWeight: "bold",
    marginVertical: 5,
  },
  adviceText: {
    color: "black",
    fontSize: rf(1.8),
    textAlign: "center",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "90%",
    marginTop: 30,
    margin: 20,
    justifyContent: "center",
  },
  startButton: {
    backgroundColor: "#66cd7e",
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  startButtonText: {
    color: "white",
    fontSize: rf(1.8),
    fontWeight: "bold",
  },
});
