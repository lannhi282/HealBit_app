import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import { useNavigation } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons"; // Import Ionicons
import { useRoute } from '@react-navigation/native';

export default function ProgressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { name, bmi, selectedGender,age, weight, height } = route.params || {};

  const [eatingHabits, setEatingHabits] = useState({
    veggies: -1,
    waterIntake: -1,
    mainMeals: -1,
  });
  const [lifestyle, setLifestyle] = useState({
    exercise: -1,
    technologicalDevices: -1,
  });

  const [errors, setErrors] = useState({});

  // Validation function before moving to next step
  const validateStep = (step) => {
    let newErrors = {};

    if (step === 1) {
      if (eatingHabits.veggies === -1) newErrors.veggies = "Required";
      if (eatingHabits.waterIntake === -1) newErrors.waterIntake = "Required";
      if (eatingHabits.mainMeals === -1) newErrors.mainMeals = "Required";
    } else if (step === 2) {
      if (lifestyle.exercise === -1) newErrors.exercise = "Required";
      if (lifestyle.technologicalDevices === -1) newErrors.technologicalDevices = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headingContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <ProgressSteps
        activeStepIconBorderColor="#4CAF50"
        completedProgressBarColor="#4CAF50"
        completedStepIconColor="#4CAF50"
        topOffset={0}
      >
        {/* Eating Habits */}
        <ProgressStep
          label="Eating Habits"
          buttonBottomOffset={70}
          onNext={() => {
            if (validateStep(1)) return true;
            return false;
          }}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Eating Habits</Text>

            {renderLikertQuestion(
              "How often do you consume vegetables?",
              "veggies",
              eatingHabits,
              setEatingHabits,
              errors,
              [
                { value: 1, label: "Rarely" },
                { value: 2, label: "Sometimes" },
                { value: 3, label: "Frequently" },
              ]
            )}
            {renderLikertQuestion(
              "What is your daily water intake?",
              "waterIntake",
              eatingHabits,
              setEatingHabits,
              errors,
              [
                { value: 1, label: "Rarely" },
                { value: 2, label: "Sometimes" },
                { value: 3, label: "Frequently" },
              ]
            )}
            {renderLikertQuestion(
              "What is your number of main meals in a day?",
              "mainMeals",
              eatingHabits,
              setEatingHabits,
              errors,
              [
                { value: 1, label: "1" },
                { value: 2, label: "2" },
                { value: 3, label: "3" },
                { value: 4, label: "4" },
              ]
            )}
          </View>
        </ProgressStep>

        {/* Activities Questions */}
        <ProgressStep
          label="Physical Activities Habits"
          buttonBottomOffset={70}
          onSubmit={() => navigation.navigate('BMIResultScreen', { name, bmi, selectedGender, age, eatingHabits,lifestyle, weight, height })}
          onNext={() => {
            if (validateStep(2)) return true;
            return false;
          }}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Physical Activities Habits</Text>

            {renderLikertQuestion(
              "How often do you exercise?",
              "exercise",
              lifestyle,
              setLifestyle,
              errors,
              [
                { value: 0, label: "Never" },
                { value: 1, label: "Rarely" },
                { value: 2, label: "Sometimes" },
                { value: 3, label: "Often" },
              ]
            )}
            {renderLikertQuestion(
              "How often do you use technological devices?",
              "technologicalDevices",
              lifestyle,
              setLifestyle,
              errors,
              [
                { value: 0, label: "Never" },
                { value: 1, label: "Sometimes" },
                { value: 2, label: "Always" },
              ]
            )}
          </View>
        </ProgressStep>
      </ProgressSteps>
    </View>
  );
}

// 🛠 Reusable Likert Scale Component (1-5)
const renderLikertQuestion = (label, field, state, setState, errors, options) => (
  <View style={styles.questionContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.buttonContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[styles.button2, state[field] === option.value && styles.selectedButton]}
          onPress={() => setState({ ...state, [field]: option.value })}
        >
          <Text style={styles.buttonText}>{option.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
    {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#edffdd",
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 30,
    paddingBottom: 15,
    backgroundColor: '#edffdd',
    marginTop: 40,
  },
  formContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  questionContainer: { marginBottom: 20, width: "100%" },
  buttonContainer: { flexDirection: "row", justifyContent: "center" },
  button1: {
    padding: 12,
    paddingLeft: 40,
    paddingRight: 40,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    backgroundColor: "white",
  },
  button2: {
    padding: 12,
    margin: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    backgroundColor: "white",
  },
  selectedButton: { backgroundColor: "#4CAF50" },
  buttonText: { fontSize: 16, fontWeight: "bold" },
  errorText: { color: "red", fontSize: 14, marginTop: 5 },
  picker: {
    width: "100%",
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
  },
});
