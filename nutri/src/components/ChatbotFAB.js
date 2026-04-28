import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';
import { sendMessage } from '../api/geminiAPI';
import { getUserProfile } from '../lib/supabaseUtils';

/**
 * ChatbotFAB Component
 * A floating action button that opens a nutrition-focused chatbot interface
 * Features:
 * - Personalized greeting with user's name
 * - Real-time message handling
 * - Loading states and error handling
 * - Auto-scrolling chat
 * - Keyboard-aware input
 */
export default function ChatbotFAB() {
    // State management for chat functionality
    const [isVisible, setIsVisible] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [error, setError] = useState(null);
    const scrollViewRef = useRef();

    // Fetch user profile and initialize chat when modal opens
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const profile = await getUserProfile();
                setUser(profile);

                // Set initial assistant message with user's full name
                setMessages([
                    {
                        role: 'assistant',
                        content: `Hello, ${profile.full_name}! I'm Nutri, your nutrition assistant. How can I help you with nutrition, BMI, or healthy living today?`,
                    },
                ]);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isVisible) {
            fetchUserProfile();
        }
    }, [isVisible]);

    // Handle sending messages to the AI
    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);
        setError(null);

        try {
            const response = await sendMessage(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to get response. Please try again.');
            Alert.alert(
                'Error',
                'Failed to get response. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };
    
    // Handle Enter key press for sending messages
    const handleKeyPress = ({ nativeEvent: { key } }) => {
        if (key === 'Enter' && !loading) {
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => setIsVisible(true)}
            >
                <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Chat Modal */}
            <Modal
                visible={isVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {/* Header with title and close button */}
                        <View style={styles.header}>
                            <View style={styles.headerContent}>
                                <Ionicons name="chatbubble-ellipses" size={24} color="#29c439" style={styles.headerIcon} />
                                <Text style={styles.headerText}>Nutrition Assistant</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={() => setIsVisible(false)}
                            >
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {/* Chat Messages Container with Auto-scroll */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.messagesContainer}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        >
                            {/* Message Bubbles */}
                            {messages.map((message, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.messageBubble,
                                        message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                                    ]}
                                >
                                    <Text style={[
                                        styles.messageText,
                                        message.role === 'user' && styles.userMessageText
                                    ]}>
                                        {message.content}
                                    </Text>
                                </View>
                            ))}
                            {/* Loading Indicator */}
                            {loading && (
                                <View style={styles.loadingBubble}>
                                    <ActivityIndicator size="small" color="#29c439" />
                                    <Text style={styles.loadingText}>Thinking...</Text>
                                </View>
                            )}
                            {/* Error Message */}
                            {error && (
                                <View style={styles.errorBubble}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Input Area with Keyboard Handling */}
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.inputContainer}
                        >
                            <TextInput
                                style={styles.input}
                                value={input}
                                onChangeText={setInput}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about nutrition, BMI, or healthy living..."
                                placeholderTextColor="#666"
                                multiline
                                editable={!loading}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                                onPress={handleSend}
                                disabled={loading || !input.trim()}
                            >
                                <Ionicons
                                    name="send"
                                    size={24}
                                    color={loading || !input.trim() ? '#ccc' : '#29c439'}
                                />
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#29c439',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginRight: 8,
    },
    headerText: {
        fontSize: rf(2.2),
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 8,
    },
    messagesContainer: {
        flex: 1,
        marginBottom: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#29c439',
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
    },
    messageText: {
        fontSize: rf(1.8),
        color: '#333',
    },
    userMessageText: {
        color: '#fff',
    },
    loadingBubble: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    loadingText: {
        fontSize: rf(1.6),
        color: '#666',
        marginLeft: 8,
    },
    errorBubble: {
        alignSelf: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#ffebee',
    },
    errorText: {
        fontSize: rf(1.6),
        color: '#d32f2f',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        fontSize: rf(1.8),
        maxHeight: 100,
    },
    sendButton: {
        padding: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
}); 
