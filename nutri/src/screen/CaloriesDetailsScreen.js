import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';

// Screen component to display detailed information about a specific meal
export default function CaloriesDetailsScreen({ route, navigation }) {
    // Extract meal data from route params
    const { meal } = route.params;

    return (
        <View style={styles.container}>
            {/* Header with back button and title */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Meal Details</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Meal image section - shows actual image or default based on meal type */}
                <View style={styles.imageContainer}>
                    {meal.image_url ? (
                        <Image 
                            source={{ uri: meal.image_url }} 
                            style={styles.mealImage}
                        />
                    ) : (
                        <Image 
                            source={
                                meal.meal_type === 'breakfast' ? require('../assets/breakfast.png') :
                                meal.meal_type === 'lunch' ? require('../assets/lunch.png') :
                                require('../assets/dinner.png')
                            } 
                            style={styles.mealImage} 
                        />
                    )}
                </View>

                <View style={styles.detailsContainer}>
                    {/* Meal name display with fallback to meal type if name not available */}
                    <Text style={styles.mealName}>
                        {meal.dish_name || 
                         (meal.meal_type ? 
                            `${meal.meal_type.charAt(0).toUpperCase()}${meal.meal_type.slice(1)}` : 
                            'Unknown Meal')}
                    </Text>

                    {/* Calories display with icon */}
                    <View style={styles.caloriesContainer}>
                        <Ionicons name="flame" size={24} color="#FF6B6B" />
                        <Text style={styles.caloriesText}>
                            {meal.calories_amount || 0} kcal
                        </Text>
                    </View>

                    {/* Food items section - displays individual food items with calories and portions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Food Items</Text>
                        {meal.food_items && meal.food_items.map((item, index) => (
                            <View key={index} style={styles.foodItem}>
                                <Text style={styles.foodItemName}>{item.name}</Text>
                                <View style={styles.foodItemDetails}>
                                    <Text style={styles.foodItemCalories}>{item.calories} kcal</Text>
                                    <Text style={styles.foodItemPortion}>{item.portion}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Notes section - displays additional notes if available */}
                    {meal.notes && meal.notes.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Notes</Text>
                            {meal.notes.map((note, index) => (
                                <Text key={index} style={styles.noteText}>• {note}</Text>
                            ))}
                        </View>
                    )}

                    {/* Meal information section - displays type, date, and time */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Meal Information</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Type:</Text>
                            <Text style={styles.infoValue}>
                                {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Date:</Text>
                            <Text style={styles.infoValue}>
                                {new Date(meal.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Time:</Text>
                            <Text style={styles.infoValue}>
                                {new Date(meal.created_at).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#edffdd',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: rf(2.2),
        fontWeight: '600',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#f5f5f5',
    },
    mealImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    detailsContainer: {
        padding: 20,
    },
    mealName: {
        fontSize: rf(2.5),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    caloriesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF0F0',
        padding: 12,
        borderRadius: 12,
        marginBottom: 24,
    },
    caloriesText: {
        fontSize: rf(2),
        color: '#FF6B6B',
        marginLeft: 8,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: rf(1.8),
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    foodItem: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    foodItemName: {
        fontSize: rf(1.7),
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    foodItemDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    foodItemCalories: {
        fontSize: rf(1.5),
        color: '#FF6B6B',
    },
    foodItemPortion: {
        fontSize: rf(1.5),
        color: '#666',
    },
    noteText: {
        fontSize: rf(1.6),
        color: '#666',
        marginBottom: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoLabel: {
        fontSize: rf(1.6),
        color: '#666',
    },
    infoValue: {
        fontSize: rf(1.6),
        color: '#333',
        fontWeight: '500',
    },
}); 
