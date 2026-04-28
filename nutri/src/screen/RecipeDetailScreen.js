import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Image } from 'react-native';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';
import { useRoute, useNavigation } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getUserProfile, addBookmark, removeBookmark, isBookmarked } from '../lib/supabaseUtils';

/**
 * RecipeDetailScreen Component
 * Displays detailed information about a specific recipe including:
 * - Recipe name and icon
 * - Calorie information
 * - Description and health benefits
 * - Ingredients list
 * - Step-by-step cooking instructions
 * - Estimated cooking time
 * - Bookmark functionality
 */
export default function RecipeDetailScreen() {
    // Navigation and route hooks
    const route = useRoute();
    const navigation = useNavigation();
    const { recipe, isBookmarked: initialBookmarked } = route.params;
    // State management
    const [user, setUser] = useState(null);
    const [isBookmarkedState, setIsBookmarkedState] = useState(initialBookmarked || false);

    // Fetch user profile on component mount
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const profile = await getUserProfile();
                setUser(profile);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);
    
    // Check bookmark status if not provided initially
    useEffect(() => {
        if (!initialBookmarked) {
            checkBookmarkStatus();
        }
    }, []);

    /**
     * Check if the current recipe is bookmarked by the user
     */
    const checkBookmarkStatus = async () => {
        if (user) {
            const bookmarked = await isBookmarked(user.id, recipe.recipeName, 'recipe');
            setIsBookmarkedState(bookmarked);
        }
    };
    
    // Navigation handlers
    const handleBack = () => {
        navigation.goBack();
    };

    /**
     * Toggle bookmark status for the recipe
     * Adds or removes the recipe from user's bookmarks
     */
    const handleBookmark = async () => {
        if (!user) {
            // Handle case when user is not logged in
            return;
        }

        try {
            if (isBookmarkedState) {
                await removeBookmark(user.id, recipe.recipeName, 'recipe');
            } else {
                await addBookmark(user.id, recipe.recipeName, recipe, 'recipe');
            }
            setIsBookmarkedState(!isBookmarkedState);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            
            {/* Back Button */}
            <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
            >
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            {/* Bookmark Toggle Button */}
            <TouchableOpacity 
                style={styles.bookmarkButton}
                onPress={handleBookmark}
                activeOpacity={0.7}
            >
                <Ionicons 
                    name={isBookmarkedState ? "bookmark" : "bookmark-outline"} 
                    size={24} 
                    color={isBookmarkedState ? "#29c439" : "#333"} 
                />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Recipe Header Section */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <FontAwesome5 name={recipe.iconClass} size={40} color="#29c439" />
                    </View>
                    <Text style={styles.title}>{recipe.recipeName}</Text>
                    <Text style={styles.calories}>{recipe.recipeCalories} calories</Text>
                </View>

                {/* Recipe Description Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{recipe.recipeDescription}</Text>
                </View>

                {/* Health Benefits Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Health Benefits</Text>
                    <View style={styles.benefitsContainer}>
                        <Ionicons name="leaf-outline" size={20} color="#29c439" />
                        <Text style={styles.benefitsText}>{recipe.recipeBenefits}</Text>
                    </View>
                </View>

                {/* Ingredients List Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingredients</Text>
                    {recipe.recipeItems.map((item, index) => (
                        <View key={index} style={styles.ingredientItem}>
                            <Ionicons name="checkmark-circle-outline" size={16} color="#29c439" />
                            <Text style={styles.ingredientText}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Cooking Instructions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cooking Instructions</Text>
                    {recipe.cookingInstructions.map((instruction, index) => (
                        <View key={index} style={styles.instructionItem}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.instructionText}>{instruction}</Text>
                        </View>
                    ))}
                </View>

                {/* Cooking Time Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Estimated Time</Text>
                    <Text style={styles.timeText}>{recipe.estimatedCookingTime}</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#edffdd",
        paddingTop: 25,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f9f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: rf(2.5),
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    calories: {
        fontSize: rf(1.8),
        color: '#666',
        marginTop: 5,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: rf(2),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    description: {
        fontSize: rf(1.8),
        color: '#666',
        lineHeight: 24,
    },
    benefitsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    benefitsText: {
        fontSize: rf(1.8),
        color: '#666',
        marginLeft: 10,
        flex: 1,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ingredientText: {
        fontSize: rf(1.8),
        color: '#666',
        marginLeft: 10,
    },
    instructionItem: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    stepNumber: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#29c439',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    stepText: {
        color: 'white',
        fontWeight: 'bold',
    },
    instructionText: {
        flex: 1,
        fontSize: rf(1.8),
        color: '#666',
        lineHeight: 24,
    },
    timeText: {
        fontSize: rf(1.8),
        color: '#666',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1,
    },
    bookmarkButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1,
    },
}); 
