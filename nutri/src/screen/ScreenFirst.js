import React, { useState, useEffect } from 'react';
import { 
  View, Text, Image, StatusBar, ScrollView, StyleSheet, TouchableOpacity
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';
import { useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons
import { supabase } from '../lib/supabase';


export default function ScreenFirst() {
  const route = useRoute();
  const { name, isFirstTimeUser } = route.params || {};
  const [selectedGender, setSelectedGender] = useState(null);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(78);
  const [age, setAge] = useState(25);
  const [fullName, setFullName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    if (!isFirstTimeUser) {
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        if (data) {
          setFullName(data.full_name);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
    }
  };  

  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />

      <View style={styles.headingContainer}>
        {isFirstTimeUser && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
        )}
        <Text style={[styles.welcomeText, { marginLeft: isFirstTimeUser ? 20 : 0 }]}>
          {isFirstTimeUser ? `👋 Welcome, ${name} !` : `👋 Welcome back, ${fullName} !`}
        </Text>
      </View>

      {/* Get Gender From User (Male & Female) */}
      <View style={styles.genderContainer}>
        <TouchableOpacity 
          style={[styles.genderBox, selectedGender === 'male' && styles.selectedGender]} 
          onPress={() => setSelectedGender('male')}
        >
          <Image source={require('../assets/male.png')} style={styles.icon} />
          <Text style={styles.genderText}>Male</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.genderBox, selectedGender === 'female' && styles.selectedGender]} 
          onPress={() => setSelectedGender('female')}
        >
          <Image source={require('../assets/female.png')} style={styles.icon} />
          <Text style={styles.genderText}>Female</Text>
        </TouchableOpacity>
      </View>

      {/* Get Height From User */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Height</Text>
        <Text style={styles.valueText}>{height} cm</Text>
        <Slider 
          style={styles.slider} 
          minimumValue={100} 
          maximumValue={220} 
          step={1} 
          value={height} 
          onValueChange={setHeight} 
          minimumTrackTintColor="#66cd7e"
        />
      </View>
      {/* Get Weight From User */}
      <View style={styles.rowContainer}>
        <View style={styles.valueBox}>
          <Text style={styles.sectionTitle}>Weight</Text>
          <Text style={styles.valueText}>{weight} kg</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => setWeight(weight - 1)} style={styles.button}><Text style={styles.buttonText}>-</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setWeight(weight + 1)} style={styles.button}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
          </View>
        </View>
        {/* Get Age From User */}
        <View style={styles.valueBox}>
          <Text style={styles.sectionTitle}>Age</Text>
          <Text style={styles.valueText}>{age}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => setAge(age - 1)} style={styles.button}><Text style={styles.buttonText}>-</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setAge(age + 1)} style={styles.button}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Calculate BMI value(Height & Weight), Pass BMI value, selectedGender and age to ProgressScreen */}
      <TouchableOpacity
        style={styles.calculateButton}
        onPress={() => {
          const bmi = (weight / ((height / 100) ** 2)).toFixed(2);
          navigation.navigate('ProgressScreen', {
            name, 
            bmi, 
            selectedGender, 
            age, 
            weight, 
            height,
            isFirstTimeUser
          });
        }}
      >
        <Text style={styles.calculateText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#edffdd'
  },
  headingContainer: {
    flexDirection: 'row',  
    alignItems: 'center',  
    justifyContent: 'flex-start',  
    padding: 30,
    backgroundColor: '#edffdd',
    marginTop: 40,
  },
  welcomeText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: rf(2.5),
  },
  genderContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  genderBox: {
    backgroundColor: 'white',
    width: '40%',
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 8,
  },
  selectedGender: {
    backgroundColor: '#66cd7e',
  },
  genderText: {
    color: 'black',
    marginTop: 15,
    fontSize:20,
  },
  sectionContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  sectionTitle: {
    color: 'black',
    fontSize: rf(2.2),
  },
  valueText: {
    color: 'black',
    fontSize: rf(3),
    fontWeight: 'bold',
  },
  slider: {
    width: '80%',
    marginTop: 15,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
  },
  valueBox: {
    backgroundColor: 'white',
    width: '40%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop:20,

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Shadow for Android
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#66cd7e',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 18,
  },
  buttonText: {
    color: 'white',
    fontSize: rf(2.5),
  },
  calculateButton: {
    backgroundColor: '#66cd7e',
    padding: 15,
    margin: 50,
    borderRadius: 25,
    marginTop:70,
    alignItems: 'center',
  },
  calculateText: {
    color: 'white',
    fontSize: rf(2.5),
    fontWeight: 'bold',
  }
});