import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StatusBar,
    Alert,
} from 'react-native';
import { responsiveFontSize as rf } from 'react-native-responsive-dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { sendMessage } from '../api/geminiAPI';
import { getUserProfile } from '../lib/supabaseUtils';

export default function ChatbotScreen() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);

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

        fetchUserProfile();
    }, []);

    const [input, setInput] = useState('');
    const [error, setError] = useState(null);
    const scrollViewRef = useRef();

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

    const handleKeyPress = ({ nativeEvent: { key } }) => {
        if (key === 'Enter' && !loading) {
            handleSend();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Ionicons name="chatbubble-ellipses" size={24} color="#29c439" style={styles.headerIcon} />
                    <Text style={styles.headerText}>Nutrition Assistant</Text>
                </View>
            </View>

            {/* Chat Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
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
                {loading && (
                    <View style={styles.loadingBubble}>
                        <ActivityIndicator size="small" color="#29c439" />
                        <Text style={styles.loadingText}>Thinking...</Text>
                    </View>
                )}
                {error && (
                    <View style={styles.errorBubble}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
            </ScrollView>

            {/* Input Area */}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#edffdd',
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
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginRight: 10,
    },
    headerText: {
        fontSize: rf(2.5),
        fontWeight: 'bold',
        color: '#333',
    },
    messagesContainer: {
        flex: 1,
        padding: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 15,
        borderRadius: 20,
        marginBottom: 10,
    },
    userBubble: {
        backgroundColor: '#29c439',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 5,
    },
    assistantBubble: {
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    loadingBubble: {
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        padding: 15,
        borderRadius: 20,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingText: {
        marginLeft: 10,
        fontSize: rf(1.8),
        color: '#666',
    },
    errorBubble: {
        backgroundColor: '#ffebee',
        alignSelf: 'center',
        padding: 15,
        borderRadius: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ffcdd2',
    },
    errorText: {
        fontSize: rf(1.8),
        color: '#d32f2f',
        textAlign: 'center',
    },
    messageText: {
        fontSize: rf(1.8),
        color: '#333',
    },
    userMessageText: {
        color: 'white',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: rf(1.8),
        maxHeight: 100,
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
}); 