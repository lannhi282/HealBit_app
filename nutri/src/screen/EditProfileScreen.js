import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { responsiveFontSize as rf } from "react-native-responsive-dimensions";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { getUserProfile } from "../lib/supabaseUtils";
import * as ImagePicker from "expo-image-picker";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [goal, setGoal] = useState("maintain_weight");
  const [allergy, setAllergy] = useState("");
  const [foodPreference, setFoodPreference] = useState("");

  const goals = [
    { label: "Giảm cân", value: "lose_weight" },
    { label: "Duy trì cân nặng", value: "maintain_weight" },
    { label: "Tăng cơ", value: "gain_muscle" },
  ];
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setFullname(profile?.full_name || "");
      setPhone(user?.user_metadata?.phone || "");
      setUsername(user?.user_metadata?.username || "");

      setGoal(profile?.goal || "maintain_weight");
      setAllergy(profile?.allergy || "");
      setFoodPreference(profile?.food_preference || "");

      if (profile?.profile_image_url) {
        setProfileImage(profile.profile_image_url);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileExt = uri.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!fullname.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    setSaving(true);
    try {
      let profileImageUrl = profileImage;

      // If profile image is a local URI, upload it
      if (profileImage && profileImage.startsWith("file://")) {
        profileImageUrl = await uploadImage(profileImage);
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          full_name: fullname.trim(),
          profile_image_url: profileImageUrl,
          goal: goal,
          allergy: allergy.trim(),
          food_preference: foodPreference.trim(),
        })
        .eq("id", (await supabase.auth.getUser()).data.user.id);

      if (profileError) throw profileError;

      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          username: username.trim(),
          phone: phone.trim(),
        },
      });

      if (metadataError) throw metadataError;

      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <TouchableOpacity onPress={pickImage}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImage}>
                <Ionicons name="person" size={50} color="#666" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={pickImage}
          >
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullname}
              onChangeText={setFullname}
              placeholder="Enter your full name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mục tiêu sức khỏe</Text>

          <View style={styles.goalContainer}>
            {goals.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.goalButton,
                  goal === item.value && styles.goalButtonActive,
                ]}
                onPress={() => setGoal(item.value)}
              >
                <Text
                  style={[
                    styles.goalButtonText,
                    goal === item.value && styles.goalButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Dị ứng / món cần tránh</Text>
          <TextInput
            style={styles.input}
            value={allergy}
            onChangeText={setAllergy}
            placeholder="Ví dụ: hải sản, đậu phộng..."
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sở thích ăn uống</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={foodPreference}
            onChangeText={setFoodPreference}
            placeholder="Ví dụ: thịt gà, rau xanh, trứng..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
  backButton: {
    marginRight: 15,
  },
  headerText: {
    fontSize: rf(2.5),
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changePhotoButton: {
    padding: 10,
  },
  changePhotoText: {
    color: "#29c439",
    fontSize: rf(1.8),
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: rf(1.8),
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    fontSize: rf(1.8),
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#29c439",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  saveButtonText: {
    color: "white",
    fontSize: rf(1.8),
    fontWeight: "bold",
  },
  textArea: {
    minHeight: 90,
  },

  goalContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  goalButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  goalButtonActive: {
    backgroundColor: "#29c439",
    borderColor: "#29c439",
  },

  goalButtonText: {
    color: "#666",
    fontSize: rf(1.6),
    fontWeight: "600",
  },

  goalButtonTextActive: {
    color: "white",
  },
});
