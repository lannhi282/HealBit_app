export const calculateBMR = ({ weight, height, age, gender }) => {
  const numericWeight = Number(weight);
  const numericHeight = Number(height);
  const numericAge = Number(age);

  if (!numericWeight || !numericHeight || !numericAge) {
    return null;
  }

  const normalizedGender = String(gender || "").toLowerCase();

  if (normalizedGender === "male" || normalizedGender === "nam") {
    return 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge + 5;
  }

  return 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge - 161;
};

export const getActivityMultiplier = (exerciseFrequency) => {
  const value = String(exerciseFrequency || "").toLowerCase();

  if (
    value.includes("high") ||
    value.includes("nhiều") ||
    value.includes("active")
  ) {
    return 1.725;
  }

  if (
    value.includes("moderate") ||
    value.includes("medium") ||
    value.includes("vừa")
  ) {
    return 1.55;
  }

  if (value.includes("light") || value.includes("nhẹ")) {
    return 1.375;
  }

  return 1.2;
};

export const calculateDailyCalorieGoal = (profile) => {
  const bmr = calculateBMR({
    weight: profile?.weight,
    height: profile?.height,
    age: profile?.age,
    gender: profile?.gender,
  });

  if (!bmr) {
    return null;
  }

  const activityMultiplier = getActivityMultiplier(
    profile?.exercise_frequency || profile?.exercise,
  );

  const tdee = bmr * activityMultiplier;

  const goal = profile?.goal || "maintain_weight";

  let dailyGoal = tdee;

  if (goal === "lose_weight") {
    dailyGoal = tdee - 400;
  }

  if (goal === "gain_muscle") {
    dailyGoal = tdee + 300;
  }

  // Không để mục tiêu quá thấp
  dailyGoal = Math.max(dailyGoal, 1200);

  return Math.round(dailyGoal);
};

export const getRemainingCalories = (dailyGoal, consumedCalories) => {
  const goal = Number(dailyGoal || 0);
  const consumed = Number(consumedCalories || 0);

  return Math.max(goal - consumed, 0);
};
