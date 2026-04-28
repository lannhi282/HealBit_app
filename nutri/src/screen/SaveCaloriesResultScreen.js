import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { estimateCalories } from '../api/EstimateCalories';
import { supabase } from '../lib/supabase';

export default function SaveCaloriesResultScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { imageUri, mealType } = route.params;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        getCurrentUser();
    }, []);

    const getCurrentUser = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            if (user) {
                setUserId(user.id);
            } else {
                throw new Error('No user found');
            }
        } catch (error) {
            console.error('Error getting user:', error);
            setError('Failed to get user information. Please try again.');
        }
    };

    useEffect(() => {
        if (userId) {
            analyzeImage();
        }
    }, [userId]);

    const analyzeImage = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Convert image to base64
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const base64data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64String = reader.result;
                    resolve(base64String);
                };
            });

            // Call the API to estimate calories
            const result = await estimateCalories(base64data);
            
            if (result.success && result.data) {
                // Ensure the data is properly structured
                const analysis = {
                    foodItems: result.data.foodItems || [],
                    totalCalories: result.data.totalCalories || 0,
                    notes: result.data.notes || [],
                    dishName: result.data.dishName || 'Unnamed Dish'
                };
                setAnalysis(analysis);
                await saveToSupabase(analysis);
            } else {
                setError(result.error || "Could not analyze the image. Please try again.");
            }
        } catch (error) {
            console.error('Error analyzing image:', error);
            setError("Failed to analyze the image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const saveToSupabase = async (analysis) => {
        try {
            if (!userId) {
                throw new Error('User ID not available');
            }

            setSaving(true);
            
            const { data, error } = await supabase
                .from('calories')
                .insert([
                    {
                        user_id: userId,
                        meal_type: mealType,
                        calories_amount: analysis.totalCalories,
                        dish_name: analysis.dishName,
                        image_url: imageUri,
                        date: new Date().toISOString().split('T')[0]
                    }
                ]);

            if (error) {
                throw error;
            }

            Alert.alert(
                "Success",
                "Calorie data saved successfully!",
                [
                    {
                        text: "OK"
                    }
                ]
            );
        } catch (error) {
            console.error('Error saving to Supabase:', error);
            Alert.alert(
                "Error",
                "Failed to save calorie data. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const renderFoodItem = (item, index) => (
        <View key={index} style={styles.foodItem}>
            <View style={styles.foodItemHeader}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodCalories}>{item.calories} kcal</Text>
            </View>
            <Text style={styles.foodPortion}>{item.portion}</Text>
        </View>
    );

    const renderNotes = (notes) => (
        <View style={styles.notesContainer}>
            <Text style={styles.notesTitle}>Notes</Text>
            {notes.map((note, index) => (
                <View key={index} style={styles.noteItem}>
                    <Ionicons name="information-circle-outline" size={16} color="#666" />
                    <Text style={styles.noteText}>{note}</Text>
                </View>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Calorie Estimation</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Image Preview */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>

                {/* Results */}
                <View style={styles.resultsContainer}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#29c439" />
                            <Text style={styles.loadingText}>Analyzing image...</Text>
                        </View>
                    ) : saving ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#29c439" />
                            <Text style={styles.loadingText}>Saving results...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={40} color="#ff4444" />
                            <Text style={styles.errorText}>{error}</Text>
                            <TouchableOpacity
                                style={styles.retryButton}
                                onPress={analyzeImage}
                            >
                                <Text style={styles.retryButtonText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    ) : analysis ? (
                        <>
                            <View style={styles.dishNameContainer}>
                                <Text style={styles.dishNameLabel}>Dish Name</Text>
                                <Text style={styles.dishName}>{analysis.dishName}</Text>
                            </View>

                            <View style={styles.totalCaloriesContainer}>
                                <Text style={styles.totalCaloriesLabel}>Total Calories</Text>
                                <Text style={styles.totalCaloriesValue}>{analysis.totalCalories} kcal</Text>
                            </View>

                            <View style={styles.foodItemsContainer}>
                                <Text style={styles.foodItemsTitle}>Food Items</Text>
                                {analysis.foodItems.map(renderFoodItem)}
                            </View>

                            {analysis.notes && analysis.notes.length > 0 && renderNotes(analysis.notes)}
                        </>
                    ) : null}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 45,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: rf(2.5),
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flexGrow: 1,
        padding: 16,
    },
    imageContainer: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    resultsContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: rf(2),
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: rf(2),
        color: '#ff4444',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        padding: 12,
        backgroundColor: '#29c439',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: rf(1.8),
        fontWeight: 'bold',
    },
    dishNameContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 10,
    },
    dishNameLabel: {
        fontSize: rf(2),
        color: '#666',
        marginBottom: 8,
    },
    dishName: {
        fontSize: rf(2.5),
        fontWeight: 'bold',
        color: '#333',
    },
    totalCaloriesContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 20,
    },
    totalCaloriesLabel: {
        fontSize: rf(2),
        color: '#666',
        marginBottom: 8,
    },
    totalCaloriesValue: {
        fontSize: rf(3.5),
        fontWeight: 'bold',
        color: '#29c439',
    },
    foodItemsContainer: {
        marginBottom: 20,
    },
    foodItemsTitle: {
        fontSize: rf(2.2),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    foodItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    foodItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    foodName: {
        fontSize: rf(1.8),
        fontWeight: 'bold',
        color: '#333',
    },
    foodCalories: {
        fontSize: rf(1.8),
        color: '#29c439',
        fontWeight: 'bold',
    },
    foodPortion: {
        fontSize: rf(1.6),
        color: '#666',
    },
    notesContainer: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
    },
    notesTitle: {
        fontSize: rf(1.8),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    noteItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    noteText: {
        flex: 1,
        fontSize: rf(1.6),
        color: '#666',
        marginLeft: 8,
    },
}); 