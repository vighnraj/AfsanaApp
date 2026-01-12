// ChatBoxScreen - Individual chat conversation

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes } from '../../context/ThemeContext';
import CustomHeader from '../../components/common/CustomHeader';
import socketService from '../../services/socketService';

const ChatBoxScreen = ({ navigation, route }) => {
    const { chat } = route.params;
    const { user, role } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const flatListRef = useRef(null);

    // Get current user's role-specific ID
    const getCurrentRoleWiseId = useCallback(() => {
        if (role === 'student') return user?.student_id;
        if (role === 'counselor') return user?.counselor_id;
        return user?.user_id || user?.id;
    }, [role, user]);

    // Get receiver ID based on role and chat type
    const getReceiverId = useCallback(() => {
        if (chat.type === 'group') return null;

        if (role === 'admin') {
            return chat.student_id || chat.counselor_id || chat.id;
        } else if (role === 'counselor') {
            return chat.student_id || chat.id;
        } else if (role === 'student') {
            return chat.counselor_id || chat.id;
        }
        return chat.id;
    }, [chat, role]);

    // Initialize chat
    useEffect(() => {
        const senderId = getCurrentRoleWiseId();

        // Join room for group chat
        if (chat.type === 'group') {
            socketService.joinRoom(chat.id);
        }

        // Request message history
        const payload = chat.type === 'group'
            ? { group_id: chat.id }
            : { sender_id: senderId, receiver_id: getReceiverId() };

        socketService.getMessages(payload);

        // Listen for message history
        const removeHistoryListener = socketService.addHistoryListener((history) => {
            setMessages(history || []);
        });

        // Listen for new messages
        const removeMessageListener = socketService.addMessageListener((message) => {
            const currentId = getCurrentRoleWiseId();
            const receiverId = getReceiverId();

            // Check if message belongs to this chat
            if (chat.type === 'group' && message.group_id === chat.id) {
                setMessages(prev => [...prev, message]);
            } else if (
                chat.type === 'user' &&
                (message.sender_id === receiverId || message.receiver_id === receiverId ||
                    message.sender_id === currentId || message.receiver_id === currentId)
            ) {
                setMessages(prev => [...prev, message]);
            }
        });

        // Listen for connection status
        const removeConnectionListener = socketService.addConnectionListener((connected) => {
            setIsConnected(connected);
        });

        setIsConnected(socketService.getConnectionStatus());

        return () => {
            removeHistoryListener();
            removeMessageListener();
            removeConnectionListener();
        };
    }, [chat, getCurrentRoleWiseId, getReceiverId]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    // Send message
    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        const senderId = getCurrentRoleWiseId();
        const receiverId = getReceiverId();

        const payload = {
            message: inputMessage.trim(),
            sender_id: senderId,
            type: 'text',
            group_id: chat.type === 'group' ? chat.id : null,
            receiver_id: chat.type === 'user' ? receiverId : null,
        };

        socketService.sendMessage(payload);
        setInputMessage('');
    };

    // Format date label
    const formatDateLabel = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const isSameDay = (d1, d2) =>
            d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();

        if (isSameDay(date, today)) return 'Today';
        if (isSameDay(date, yesterday)) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Check if date separator needed
    const shouldShowDateSeparator = (currentMsg, prevMsg) => {
        if (!prevMsg) return true;

        const currentDate = new Date(currentMsg.created_at).toDateString();
        const prevDate = new Date(prevMsg.created_at).toDateString();

        return currentDate !== prevDate;
    };

    // Render message
    const renderMessage = ({ item, index }) => {
        const isSender = String(item.sender_id) === String(getCurrentRoleWiseId());
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showDateSeparator = shouldShowDateSeparator(item, prevMessage);

        return (
            <View>
                {showDateSeparator && (
                    <View style={styles.dateSeparator}>
                        <Text style={styles.dateSeparatorText}>
                            {formatDateLabel(item.created_at)}
                        </Text>
                    </View>
                )}

                <View style={[
                    styles.messageContainer,
                    isSender ? styles.senderContainer : styles.receiverContainer,
                ]}>
                    <View style={[
                        styles.messageBubble,
                        isSender ? styles.senderBubble : styles.receiverBubble,
                    ]}>
                        <Text style={[
                            styles.messageText,
                            isSender ? styles.senderText : styles.receiverText,
                        ]}>
                            {item.message}
                        </Text>
                        <Text style={[
                            styles.messageTime,
                            isSender ? styles.senderTime : styles.receiverTime,
                        ]}>
                            {!isSender && chat.type === 'group' && item.sender_full_name && (
                                <Text style={styles.senderName}>{item.sender_full_name} - </Text>
                            )}
                            {formatTime(item.created_at)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // Get chat name
    const getChatName = () => {
        return chat.type === 'group' ? chat.group_name : chat.full_name;
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomHeader
                title={getChatName()}
                showBack={true}
                onBack={() => navigation.goBack()}
                subtitle={chat.type === 'group' ? 'Group Chat' : chat.role}
            />

            {/* Connection status */}
            {!isConnected && (
                <View style={styles.connectionBanner}>
                    <Ionicons name="cloud-offline-outline" size={16} color={colors.white} />
                    <Text style={styles.connectionText}>Connecting...</Text>
                </View>
            )}

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) => item._id || `msg-${index}`}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.gray400} />
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubtext}>Start the conversation!</Text>
                        </View>
                    }
                    onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: false });
                    }}
                />

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your message..."
                        placeholderTextColor={colors.gray400}
                        value={inputMessage}
                        onChangeText={setInputMessage}
                        multiline
                        maxLength={1000}
                        returnKeyType="send"
                        onSubmitEditing={handleSendMessage}
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            !inputMessage.trim() && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSendMessage}
                        disabled={!inputMessage.trim()}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={inputMessage.trim() ? colors.white : colors.gray400}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    connectionBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.warning,
        paddingVertical: spacing.xs,
        gap: spacing.xs,
    },
    connectionText: {
        color: colors.white,
        fontSize: fontSizes.sm,
        fontWeight: '500',
    },
    keyboardView: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.gray700,
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: fontSizes.md,
        color: colors.gray500,
        marginTop: spacing.xs,
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    dateSeparatorText: {
        backgroundColor: colors.gray200,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        fontSize: fontSizes.sm,
        color: colors.gray600,
    },
    messageContainer: {
        marginVertical: spacing.xs,
    },
    senderContainer: {
        alignItems: 'flex-end',
    },
    receiverContainer: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '75%',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
    },
    senderBubble: {
        backgroundColor: colors.primary,
        borderBottomRightRadius: spacing.xs,
    },
    receiverBubble: {
        backgroundColor: colors.white,
        borderBottomLeftRadius: spacing.xs,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    messageText: {
        fontSize: fontSizes.md,
        lineHeight: 22,
    },
    senderText: {
        color: colors.white,
    },
    receiverText: {
        color: colors.text,
    },
    messageTime: {
        fontSize: fontSizes.xs,
        marginTop: spacing.xs,
    },
    senderTime: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'right',
    },
    receiverTime: {
        color: colors.gray500,
    },
    senderName: {
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 120,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: fontSizes.md,
        color: colors.text,
        marginRight: spacing.sm,
    },
    sendButton: {
        width: 44,
        height: 44,
        backgroundColor: colors.primary,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: colors.gray200,
    },
});

export default ChatBoxScreen;
