import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';

// Import screens
import HomeScreen from '../screen/HomeScreen';
import ChatbotScreen from '../screen/ChatbotScreen';
import UserScreen from '../screen/UserScreen';
import RecommendScreen from '../screen/RecommendScreen';
import ScreenFirst from '../screen/ScreenFirst';
import CaloriesScreen from '../screen/CaloriesScreen';

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
    <TouchableOpacity
        style={styles.centerButton}
        onPress={onPress}
    >
        <View style={styles.centerButtonView}>
            {children}
        </View>
    </TouchableOpacity>
);

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#29c439',
                tabBarInactiveTintColor: 'gray',
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Recommend"
                component={RecommendScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="nutrition-outline" size={size} color={color} />
                    ),
                }}
            />
            {/* <Tab.Screen
                name="Chatbot"
                component={ChatbotScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-ellipses-outline" size={size + 10} color={color} />
                    ),
                    tabBarButton: (props) => <CustomTabBarButton {...props} />,
                }}
            /> */}
            <Tab.Screen
                name="Predict"
                component={ScreenFirst}
                options={{
                    tabBarIcon: ({ focused, size }) => (
                        <Ionicons 
                            name="search-outline" 
                            size={size + 10} 
                            color={focused ? '#CCCCCC' : '#FFFFFF'} 
                        />
                    ),
                    tabBarLabel: ({ focused }) => (
                        <Text style={{ 
                            color: focused ? '#CCCCCC' : '#FFFFFF',
                            fontSize: rf(1.2),
                            marginBottom: 5
                        }}>
                            Predict
                        </Text>
                    ),
                    tabBarButton: (props) => <CustomTabBarButton {...props} />,
                }}
            />
            <Tab.Screen
                name="Calories"
                component={CaloriesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-ellipses-outline" size={size + 10} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="User"
                component={UserScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'relative',
        bottom: 0,
        left: 20,
        right: 20,
        elevation: 0,
        backgroundColor: 'white',
        borderRadius: 15,
        height: 70,
        paddingBottom: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    centerButton: {
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerButtonView: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#29c439',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
}); 