import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import { getUserProfile } from '../lib/supabaseUtils';

export default function IntroScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error checking user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#29c439" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      
      {/* Logo */}
      <Text style={styles.logoText}>NutriAI</Text>

      {/* Welcome Image */}
      <Image 
        source={require('../assets/welcome.png')} 
        style={styles.welcomeImage} 
        resizeMode="contain"
      />

      {/* Introduction Text */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Welcome to NutriAI</Text>
        <Text style={styles.description}>
          Your personal AI-powered nutrition and fitness companion. Get personalized recommendations for healthy recipes and exercises based on your BMI and health profile.
        </Text>
      </View>

      {/* Start Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => {
          if (userProfile?.fullname) {
            navigation.navigate('Home');
          } else {
            navigation.navigate('NameScreen', { isFirstTimeUser: true });
          }
        }}
      >
        <Text style={styles.startButtonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#edffdd",
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: rf(2.5),
    color: "black",
  },
  logoText: {
    fontSize: rf(4),
    fontWeight: 'bold',
    color: '#29c439',
    marginTop: 70,
    marginBottom: 30,
  },
  welcomeImage: {
    width: '100%',
    height: 250,
    marginBottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: rf(3),
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: rf(2),
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#29c439',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 'auto',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: 'white',
    fontSize: rf(2.2),
    fontWeight: 'bold',
  },
});
