import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { updateUserProfile } from '../lib/supabaseUtils';

export default function NameScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { isFirstTimeUser } = route.params || {};
    const [fullname, setFullname] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleContinue = async () => {
        if (!fullname.trim()) {
            setError('Please enter your name');
            return;
        }

        setLoading(true);
        try {
            // Update user profile with fullname
            await updateUserProfile({ full_name: fullname.trim() });
            // Navigate to ScreenFirst
            navigation.navigate('ScreenFirst', { 
                name: fullname.trim(),
                isFirstTimeUser 
            });
        } catch (error) {
            console.error('Error saving name:', error);
            setError('Failed to save your name. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            
            {/* Header */}
            <View style={styles.headingContainer}>
                {isFirstTimeUser && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="black" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headingText}>WHAT'S YOUR NAME?</Text>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
                <Text style={styles.subtitleText}>Please enter your name to continue</Text>
                
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={fullname}
                    onChangeText={setFullname}
                    autoCapitalize="words"
                    autoFocus={true}
                />

                <TouchableOpacity 
                    style={[styles.continueButton, (!fullname.trim() || loading) && styles.disabledButton]}
                    onPress={handleContinue}
                    disabled={!fullname.trim() || loading}
                >
                    <Text style={styles.continueButtonText}>
                        {loading ? 'Saving...' : 'Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#edffdd",
    },
    headingContainer: {
        marginTop: 70,
        width: '100%',
        padding: 20,
        backgroundColor: '#edffdd',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    headingText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: rf(2),
        marginLeft: 74,
    },
    contentContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    subtitleText: {
        fontSize: rf(2),
        color: 'black',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        fontSize: rf(2),
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    continueButton: {
        backgroundColor: '#29c439',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
    continueButtonText: {
        color: 'white',
        fontSize: rf(2),
        fontWeight: 'bold',
    },
});
