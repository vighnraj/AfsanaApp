// AI Chatbot Component for Students

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { formatDateTime } from '../../utils/formatting';

// Simulated AI responses (in production, this would call an AI API)
const AI_RESPONSES = {
    greeting: [
        "Hello! I'm your virtual assistant. How can I help you today?",
        "Hi there! I'm here to help with your university application questions!",
        "Welcome! Ask me anything about the application process!",
    ],
    application: [
        "To apply to a university, you'll need to complete your profile, upload required documents (passport, transcripts, test scores), and submit your application through the 'Universities' section.",
        "The application process typically takes 2-4 weeks. You can track your application status in the 'My Applications' section.",
    ],
    documents: [
        "Required documents include: Passport copy, Academic transcripts, English proficiency test scores (IELTS/TOEFL), CV, Statement of Purpose, and Recommendation letters.",
        "You can upload documents in the 'Documents' section. Make sure all documents are clear and in PDF format.",
    ],
    visa: [
        "The visa process has 12 steps from registration to visa approval. You can track your progress in the 'Visa Journey' section of your dashboard.",
        "Visa processing times vary by country, typically 4-8 weeks. Make sure to submit all required documents on time.",
    ],
    payment: [
        "You can view all payment details in the 'Payments' section. We support multiple payment methods including bank transfer and card payments.",
        "Application fees vary by university. You'll see the exact amount when you start an application.",
    ],
    default: [
        "I can help you with questions about applications, documents, visa process, payments, and more. What would you like to know?",
        "I'm not sure about that, but our counselors are available to help. You can chat with them or schedule a call!",
    ],
};

// Keywords to match questions
const KEYWORDS = {
    greeting: ['hi', 'hello', 'hey', 'good morning', 'good evening'],
    application: ['apply', 'application', 'university', 'submit', 'program', 'course'],
    documents: ['document', 'upload', 'passport', 'transcript', 'certificate', 'ielts', 'toefl'],
    visa: ['visa', 'process', 'journey', 'embassy', 'immigration'],
    payment: ['payment', 'pay', 'fee', 'invoice', 'cost', 'price'],
};

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Pulse animation for FAB
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, []);

    // Add initial greeting when chatbot opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const greeting = AI_RESPONSES.greeting[0];
            setMessages([{
                id: Date.now(),
                text: greeting,
                isUser: false,
                timestamp: new Date().toISOString(),
            }]);
        }
    }, [isOpen]);

    // Get AI response based on input
    const getAIResponse = (userInput) => {
        const input = userInput.toLowerCase();

        // Check for keyword matches
        for (const [category, keywords] of Object.entries(KEYWORDS)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                const responses = AI_RESPONSES[category];
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }

        // Default response
        const defaults = AI_RESPONSES.default;
        return defaults[Math.floor(Math.random() * defaults.length)];
    };

    // Send message
    const handleSend = () => {
        if (!inputText.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate AI thinking time
        setTimeout(() => {
            const aiResponse = getAIResponse(userMessage.text);
            const aiMessage = {
                id: Date.now() + 1,
                text: aiResponse,
                isUser: false,
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }, 1000 + Math.random() * 1000); // Random delay 1-2 seconds
    };

    // Quick reply buttons
    const quickReplies = [
        { text: 'How do I apply?', icon: 'school' },
        { text: 'Required documents?', icon: 'document-text' },
        { text: 'Visa process?', icon: 'airplane' },
        { text: 'Payment info?', icon: 'card' },
    ];

    const handleQuickReply = (text) => {
        setInputText(text);
        setTimeout(() => handleSend(), 100);
    };

    // Render message
    const renderMessage = ({ item }) => (
        <View style={[
            styles.messageBubble,
            item.isUser ? styles.userMessage : styles.aiMessage,
        ]}>
            {!item.isUser && (
                <View style={styles.aiIcon}>
                    <Ionicons name="sparkles" size={16} color={colors.primary} />
                </View>
            )}
            <View style={[
                styles.messageContent,
                item.isUser ? styles.userMessageContent : styles.aiMessageContent,
            ]}>
                <Text style={[
                    styles.messageText,
                    item.isUser ? styles.userMessageText : styles.aiMessageText,
                ]}>
                    {item.text}
                </Text>
                <Text style={[
                    styles.messageTime,
                    item.isUser ? styles.userMessageTime : styles.aiMessageTime,
                ]}>
                    {formatDateTime(item.timestamp)}
                </Text>
            </View>
        </View>
    );

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <Animated.View style={[styles.fab, { transform: [{ scale: pulseAnim }] }]}>
                    <TouchableOpacity
                        onPress={() => setIsOpen(true)}
                        style={styles.fabButton}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="chatbubble-ellipses" size={28} color={colors.white} />
                        <View style={styles.fabBadge}>
                            <Ionicons name="sparkles" size={12} color={colors.white} />
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Chat Modal */}
            <Modal
                visible={isOpen}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={styles.aiAvatarContainer}>
                                <Ionicons name="sparkles" size={20} color={colors.white} />
                            </View>
                            <View>
                                <Text style={styles.headerTitle}>AI Assistant</Text>
                                <Text style={styles.headerSubtitle}>Always here to help</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.chatContainer}
                        keyboardVerticalOffset={90}
                    >
                        {/* Messages */}
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderMessage}
                            contentContainerStyle={styles.messagesList}
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                        />

                        {/* Typing indicator */}
                        {isTyping && (
                            <View style={styles.typingContainer}>
                                <View style={styles.aiIcon}>
                                    <Ionicons name="sparkles" size={16} color={colors.primary} />
                                </View>
                                <View style={styles.typingBubble}>
                                    <View style={styles.typingDot} />
                                    <View style={styles.typingDot} />
                                    <View style={styles.typingDot} />
                                </View>
                            </View>
                        )}

                        {/* Quick Replies */}
                        {messages.length === 1 && !isTyping && (
                            <View style={styles.quickRepliesContainer}>
                                <Text style={styles.quickRepliesTitle}>Quick Questions:</Text>
                                <View style={styles.quickRepliesGrid}>
                                    {quickReplies.map((reply, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.quickReplyButton}
                                            onPress={() => handleQuickReply(reply.text)}
                                        >
                                            <Ionicons name={reply.icon} size={20} color={colors.primary} />
                                            <Text style={styles.quickReplyText}>{reply.text}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ask me anything..."
                                placeholderTextColor={colors.gray400}
                                value={inputText}
                                onChangeText={setInputText}
                                multiline
                                maxLength={500}
                            />
                            <TouchableOpacity
                                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                                onPress={handleSend}
                                disabled={!inputText.trim() || isTyping}
                            >
                                <Ionicons
                                    name="send"
                                    size={20}
                                    color={inputText.trim() ? colors.white : colors.gray400}
                                />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>

                    {/* Disclaimer */}
                    <View style={styles.disclaimer}>
                        <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.disclaimerText}>
                            AI responses are for guidance only. Contact your counselor for specific advice.
                        </Text>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        zIndex: 1000,
    },
    fabButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.sm,
        elevation: 8,
    },
    fabBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.success,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        ...shadows.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiAvatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${colors.primary}`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    headerTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
    },
    closeButton: {
        padding: spacing.xs,
    },
    chatContainer: {
        flex: 1,
    },
    messagesList: {
        padding: spacing.md,
    },
    messageBubble: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
        maxWidth: '85%',
    },
    userMessage: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
    },
    aiMessage: {
        alignSelf: 'flex-start',
    },
    aiIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: `${colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.xs,
    },
    messageContent: {
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    userMessageContent: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
    },
    aiMessageContent: {
        backgroundColor: colors.white,
        borderBottomLeftRadius: 4,
        ...shadows.sm,
    },
    messageText: {
        fontSize: fontSizes.md,
        lineHeight: 20,
    },
    userMessageText: {
        color: colors.white,
    },
    aiMessageText: {
        color: colors.text,
    },
    messageTime: {
        fontSize: fontSizes.xs,
        marginTop: 4,
    },
    userMessageTime: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
    },
    aiMessageTime: {
        color: colors.textMuted,
    },
    typingContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    typingBubble: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.gray400,
        marginRight: 4,
    },
    quickRepliesContainer: {
        padding: spacing.md,
    },
    quickRepliesTitle: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    quickRepliesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    quickReplyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        marginRight: spacing.xs,
        marginBottom: spacing.xs,
        ...shadows.sm,
    },
    quickReplyText: {
        fontSize: fontSizes.sm,
        color: colors.text,
        marginLeft: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.sm,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    input: {
        flex: 1,
        marginRight: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.lg,
        fontSize: fontSizes.md,
        color: colors.text,
        maxHeight: 80,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: colors.gray200,
    },
    disclaimer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${colors.warning}10`,
        padding: spacing.sm,
    },
    disclaimerText: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
        flex: 1,
    },
});

export default AIChatbot;
