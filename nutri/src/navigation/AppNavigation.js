import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screen/LoginScreen';
import SignupScreen from '../screen/SignupScreen';
import IntroScreen from '../screen/IntroScreen';
import NameScreen from '../screen/NameScreen';
import ScreenFirst from '../screen/ScreenFirst';
import ProgressScreen from '../screen/ProgressScreen';
import BMIResultScreen from '../screen/BMIResultScreen';
import EditProfileScreen from '../screen/EditProfileScreen';
import RecipeDetailScreen from '../screen/RecipeDetailScreen';
import ExerciseDetailScreen from '../screen/ExerciseDetailScreen';
import BookmarksScreen from '../screen/BookmarksScreen';
import EstimateCaloriesScreen from '../screen/EstimateCaloriesScreen';
import TabNavigator from './TabNavigator';
import SaveCaloriesResultScreen from '../screen/SaveCaloriesResultScreen';
import CaloriesDetailsScreen from '../screen/CaloriesDetailsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="IntroScreen" component={IntroScreen} />
            <Stack.Screen name="NameScreen" component={NameScreen} />
            <Stack.Screen name="ScreenFirst" component={ScreenFirst} />
            <Stack.Screen name="ProgressScreen" component={ProgressScreen} />
            <Stack.Screen name="BMIResultScreen" component={BMIResultScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Home" component={TabNavigator} />
            <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
            <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="EstimateCalories" component={EstimateCaloriesScreen} />
            <Stack.Screen name="SaveCaloriesResult" component={SaveCaloriesResultScreen} />
            <Stack.Screen name="CaloriesDetails" component={CaloriesDetailsScreen} />
        </Stack.Navigator>
    </NavigationContainer>
  );
}