// Chat Screen (Common) - Socket.IO Implementation
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';

import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { CustomHeader } from '../../components/common';
import { formatDateTime } from '../../utils/formatting';

// Socket URL from requirement
const SOCKET_URL = 'https://afsana-backend-production-0897.up.railway.app';

const ChatScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const { receiverId, receiverName } = route.params || {};

    const flatListRef = useRef(null);
    const socketRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');

    // Format message to internal structure
    const formatMessage = (msg) => ({
        id: msg._id || `${msg.senderId || msg.sender_id}-${msg.timestamp}`,
        senderId: msg.senderId || msg.sender_id,
        content: msg.content || msg.message,
        timestamp: msg.timestamp || msg.created_at,
    });

    useEffect(() => {
        if (!user?.id || !receiverId) return;

        // Disconnect existing
        if (socketRef.current) socketRef.current.disconnect();

        // 1. Connect
        const socket = io(SOCKET_URL, {
            forceNew: true,
            transports: ['websocket'], // explicit for React Native often helps
        });
        socketRef.current = socket;

        setMessages([]);
        setLoading(true);

        // 2. Register & Join
        socket.on('connect', () => {
            // console.log('Socket connected');
            socket.emit("registerUser", user.id);
            socket.emit("joinRoom", {
                user_id: user.id,
                other_user_id: receiverId,
            });

            // 3. Get History
            const chatId = [user.id, receiverId].sort((a, b) => a - b).join("_");
            socket.emit("getChatHistory", {
                chatId,
                limit: 50,
                offset: 0,
            });
        });

        // 4. Listeners
        socket.on("receiveMessage", (msg) => {
            // handle single or array
            const msgs = Array.isArray(msg) ? msg : [msg];
            const formatted = msgs.map(formatMessage);

            setMessages((prev) => {
                const incoming = formatted.filter(m => String(m.senderId) !== String(user.id));
                // check duplicates
                const existingIds = new Set(prev.map(p => p.id));
                const unique = incoming.filter(m => !existingIds.has(m.id));
                return [...prev, ...unique];
            });
        });

        socket.on("chatHistory", ({ messages: historyMessages }) => {
            if (historyMessages) {
                const formatted = historyMessages.map(formatMessage);
                setMessages((prev) => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const unique = formatted.filter(m => !existingIds.has(m.id));
                    // History comes usually sorted? Web app appends them. 
                    // We might need to sort by timestamp if order isn't guaranteed.
                    return [...unique, ...prev].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                });
            }
            setLoading(false);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };

    }, [user?.id, receiverId]);

    const handleSend = () => {
        if (!newMessage.trim() || !socketRef.current) return;

        const timestamp = new Date().toISOString();
        const msgPayload = {
            sender_id: user.id,
            receiver_id: receiverId,
            message: newMessage,
            timestamp: timestamp,
        };

        // Emit
        socketRef.current.emit("sendMessage", msgPayload);

        // Optimistic Update
        const optimisticMsg = {
            id: `${user.id}-${timestamp}`,
            senderId: user.id,
            content: newMessage,
            timestamp: timestamp,
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
    };

    const renderMessage = ({ item }) => {
        const isOwnMessage = String(item.senderId) === String(user?.id);

        return (
            <View style={[
                styles.messageBubble,
                isOwnMessage ? styles.ownMessage : styles.otherMessage,
            ]}>
                <Text style={[
                    styles.messageText,
                    isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                ]}>
                    {item.content}
                </Text>
                <Text style={[
                    styles.messageTime,
                    isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
                ]}>
                    {formatDateTime(item.timestamp)}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <LoadingSpinner />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <CustomHeader
                title={receiverName || "Chat"}
                showBack={true}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust based on header height
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Start the conversation</Text>
                        </View>
                    }
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.gray400}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!newMessage.trim()}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={newMessage.trim() ? colors.white : colors.gray400}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    messagesList: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
    },
    ownMessage: {
        backgroundColor: colors.primary,
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        backgroundColor: colors.white,
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        ...shadows.sm,
    },
    messageText: {
        fontSize: fontSizes.md,
        lineHeight: 20,
    },
    ownMessageText: {
        color: colors.white,
    },
    otherMessageText: {
        color: colors.text,
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    ownMessageTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    otherMessageTime: {
        color: colors.textSecondary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.sm,
        paddingBottom: Platform.OS === 'ios' ? spacing.sm : spacing.md,
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
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2, // Align with input text
    },
    sendButtonDisabled: {
        backgroundColor: colors.gray200,
    },
});

export default ChatScreen;
