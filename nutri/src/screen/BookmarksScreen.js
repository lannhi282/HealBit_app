import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getBookmarks, getUserProfile } from '../lib/supabaseUtils';

export default function BookmarksScreen() {
    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('recipes');

    useEffect(() => {
        const fetchUserAndBookmarks = async () => {
            try {
                setLoading(true);
                // First get the user profile
                const userProfile = await getUserProfile();
                if (!userProfile) {
                    throw new Error('User profile not found');
                }
                setUser(userProfile);

                // Then fetch bookmarks
                const bookmarksData = await getBookmarks(userProfile.id);
                setBookmarks(bookmarksData);
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
                Alert.alert(
                    'Error',
                    'Failed to load bookmarks. Please try again later.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUserAndBookmarks();
    }, []);

    const handleItemPress = (item) => {
        if (item.type === 'recipe') {
            navigation.navigate('RecipeDetail', { 
                recipe: item.item_data,
                isBookmarked: true 
            });
        } else {
            navigation.navigate('ExerciseDetail', { 
                exercise: item.item_data,
                isBookmarked: true 
            });
        }
    };

    const filteredBookmarks = bookmarks.filter(item => 
        selectedTab === 'recipes' ? item.type === 'recipe' : item.type === 'exercise'
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.itemContainer}
            onPress={() => handleItemPress(item)}
        >
            <View style={styles.itemContent}>
                <View style={styles.iconContainer}>
                    <FontAwesome5 
                        name={item.item_data.iconClass} 
                        size={24} 
                        color="#29c439" 
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        {item.type === 'recipe' ? item.item_data.recipeName : item.item_data.exerciseName}
                    </Text>
                    <Text style={styles.subtitle}>
                        {item.type === 'recipe' 
                            ? `${item.item_data.recipeCalories} calories`
                            : `${item.item_data.duration} • ${item.item_data.intensity}`
                        }
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#29c439" />
                <Text style={styles.loadingText}>Loading bookmarks...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={50} color="#ff4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.retryButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            
            {/* Back Button */}
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Bookmarks</Text>
            </View>

            {/* Tab Buttons */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tabButton, selectedTab === 'recipes' && styles.activeTab]} 
                    onPress={() => setSelectedTab('recipes')}
                >
                    <Ionicons 
                        name="restaurant-outline" 
                        size={24} 
                        color={selectedTab === 'recipes' ? "white" : "#666"} 
                    />
                    <Text style={[styles.tabText, selectedTab === 'recipes' && styles.activeTabText]}>Recipes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabButton, selectedTab === 'exercises' && styles.activeTab]} 
                    onPress={() => setSelectedTab('exercises')}
                >
                    <Ionicons 
                        name="fitness-outline" 
                        size={24} 
                        color={selectedTab === 'exercises' ? "white" : "#666"} 
                    />
                    <Text style={[styles.tabText, selectedTab === 'exercises' && styles.activeTabText]}>Exercises</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {filteredBookmarks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons 
                        name={selectedTab === 'recipes' ? "restaurant-outline" : "fitness-outline"} 
                        size={50} 
                        color="#666" 
                    />
                    <Text style={styles.emptyText}>
                        {selectedTab === 'recipes' ? 'No Bookmarked Recipes' : 'No Bookmarked Exercises'}
                    </Text>
                    <Text style={styles.emptySubtext}>
                        {selectedTab === 'recipes' 
                            ? 'Your saved recipes will appear here'
                            : 'Your saved exercises will appear here'
                        }
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredBookmarks}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#edffdd",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#edffdd",
    },
    loadingText: {
        marginTop: 10,
        fontSize: rf(1.8),
        color: "#666",
    },
    header: {
        paddingTop: 70,
        padding: 20,
        backgroundColor: 'white',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: rf(2.5),
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 60,
    },
    listContainer: {
        padding: 20,
    },
    itemContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f9f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: rf(1.8),
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: rf(1.6),
        color: '#666',
        marginTop: 5,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#edffdd",
        padding: 20,
    },
    errorText: {
        fontSize: rf(1.8),
        color: "#666",
        textAlign: 'center',
        marginTop: 10,
    },
    retryButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#29c439',
        borderRadius: 10,
    },
    retryButtonText: {
        color: 'white',
        fontSize: rf(1.8),
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: rf(2),
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    emptySubtext: {
        fontSize: rf(1.6),
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
    },
    tabContainer: {
        flexDirection: "row",
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: "#29c439",
    },
    tabText: {
        fontSize: rf(1.8),
        color: "#666",
        fontWeight: "bold",
        marginLeft: 5,
    },
    activeTabText: {
        color: "white",
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
}); 