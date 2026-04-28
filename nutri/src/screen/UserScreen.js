import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getUserProfile } from '../lib/supabaseUtils';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export default function UserScreen() {
    const [userProfile, setUserProfile] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get user profile
                const profile = await getUserProfile();
                setUserProfile(profile);

                // Get user email from auth session
                const { data: { user } } = await supabase.auth.getUser();
                setUserEmail(user?.email || '');
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleBookmarksPress = () => {
        navigation.navigate('Bookmarks');
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Error logging out:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
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
                <Text style={styles.headerText}>Profile</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        <View style={styles.profileImage}>
                            <Ionicons name="person" size={50} color="#666" />
                        </View>
                    </View>
                    <Text style={styles.nameText}>{userProfile?.full_name || 'User'}</Text>
                    <Text style={styles.emailText}>{userEmail || 'No email provided'}</Text>
                </View>

                {/* Health Stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Health Information</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{userProfile?.bmi || '--'}</Text>
                            <Text style={styles.statLabel}>BMI</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{userProfile?.weight || '--'} kg</Text>
                            <Text style={styles.statLabel}>Weight</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{userProfile?.height || '--'} cm</Text>
                            <Text style={styles.statLabel}>Height</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{userProfile?.age || '--'}</Text>
                            <Text style={styles.statLabel}>Age</Text>
                        </View>
                    </View>
                </View>

                {/* Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.settingsList}>
                        <TouchableOpacity 
                            style={styles.settingItem}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <View style={styles.settingIcon}>
                                <Ionicons name="person-outline" size={24} color="#666" />
                            </View>
                            <Text style={styles.settingText}>Edit Profile</Text>
                            <Ionicons name="chevron-forward" size={24} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.settingItem}
                            onPress={handleBookmarksPress}
                        >
                            <View style={styles.settingIcon}>
                                <Ionicons name="bookmark-outline" size={24} color="#333" />
                            </View>
                            <Text style={styles.settingText}>My Bookmarks</Text>
                            <Ionicons name="chevron-forward" size={24} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingIcon}>
                                <Ionicons name="lock-closed-outline" size={24} color="#666" />
                            </View>
                            <Text style={styles.settingText}>Privacy</Text>
                            <Ionicons name="chevron-forward" size={24} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.settingItem}>
                            <View style={styles.settingIcon}>
                                <Ionicons name="help-circle-outline" size={24} color="#666" />
                            </View>
                            <Text style={styles.settingText}>Help & Support</Text>
                            <Ionicons name="chevron-forward" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#edffdd',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    headerText: {
        fontSize: rf(2.5),
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImageContainer: {
        marginBottom: 15,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    nameText: {
        fontSize: rf(2.5),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    emailText: {
        fontSize: rf(1.8),
        color: '#666',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: rf(2.2),
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statItem: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        width: '48%',
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: rf(2.2),
        fontWeight: 'bold',
        color: '#29c439',
    },
    statLabel: {
        fontSize: rf(1.8),
        color: '#666',
        marginTop: 5,
    },
    settingsList: {
        backgroundColor: 'white',
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingText: {
        flex: 1,
        fontSize: rf(1.8),
        color: '#333',
    },
    logoutButton: {
        backgroundColor: '#ff4444',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    logoutText: {
        color: 'white',
        fontSize: rf(1.8),
        fontWeight: 'bold',
    },
}); 