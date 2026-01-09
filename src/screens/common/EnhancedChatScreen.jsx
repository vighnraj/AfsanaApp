// Enhanced Chat Screen with Real-time, File Attachments, Read Receipts, Typing Indicators

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import {
    getChatHistory,
    sendMessage,
    sendMessageWithFile,
    markMessagesAsRead,
    updateTypingStatus,
    getUserOnlineStatus,
} from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateTime, getInitials } from '../../utils/formatting';
import { CustomHeader } from '../../components/common';

const EnhancedChatScreen = ({ route, navigation }) => {
    const { receiverId, receiverName, receiverAvatar } = route.params || {};
    const { user } = useAuth();
    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [onlineStatus, setOnlineStatus] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        try {
            if (!user?.id || !receiverId) return;
            const data = await getChatHistory(user.id, receiverId);
            setMessages(Array.isArray(data) ? data : data.messages || []);

            // Mark messages as read
            await markMessagesAsRead(user.id, receiverId);
        } catch (error) {
            if (error.response?.status === 404) {
                setMessages([]);
            } else {
                console.error('Fetch messages error:', error);
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id, receiverId]);

    // Check online status
    const checkOnlineStatus = useCallback(async () => {
        try {
            if (!receiverId) return;
            const status = await getUserOnlineStatus(receiverId);
            setOnlineStatus(status?.isOnline || false);
        } catch (error) {
            console.error('Online status error:', error);
        }
    }, [receiverId]);

    // Real-time polling (every 3 seconds)
    useEffect(() => {
        fetchMessages();
        checkOnlineStatus();

        // Poll for new messages
        pollingIntervalRef.current = setInterval(() => {
            fetchMessages();
            checkOnlineStatus();
        }, 3000);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [fetchMessages, checkOnlineStatus]);

    // Handle text input change with typing indicator
    const handleTextChange = useCallback((text) => {
        setNewMessage(text);

        // Update typing status
        if (text.trim() && !isTyping) {
            setIsTyping(true);
            updateTypingStatus(user?.id, receiverId, true).catch(console.error);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            updateTypingStatus(user?.id, receiverId, false).catch(console.error);
        }, 2000);
    }, [isTyping, user?.id, receiverId]);

    // Pick document
    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.type === 'success' || !result.canceled) {
                const file = result.assets ? result.assets[0] : result;
                setSelectedFile(file);
                setShowAttachmentMenu(false);
                showToast.success('File Selected', file.name || 'Document');
            }
        } catch (error) {
            console.error('Document picker error:', error);
            showToast.error('Error', 'Failed to pick document');
        }
    };

    // Pick image
    const handlePickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                showToast.error('Permission', 'Camera roll permission required');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const image = result.assets[0];
                setSelectedFile({
                    uri: image.uri,
                    name: `image_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: image.fileSize,
                });
                setShowAttachmentMenu(false);
                showToast.success('Image Selected', 'Image ready to send');
            }
        } catch (error) {
            console.error('Image picker error:', error);
            showToast.error('Error', 'Failed to pick image');
        }
    };

    // Take photo
    const handleTakePhoto = async () => {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

            if (permissionResult.granted === false) {
                showToast.error('Permission', 'Camera permission required');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const image = result.assets[0];
                setSelectedFile({
                    uri: image.uri,
                    name: `photo_${Date.now()}.jpg`,
                    mimeType: 'image/jpeg',
                    size: image.fileSize,
                });
                setShowAttachmentMenu(false);
                showToast.success('Photo Captured', 'Photo ready to send');
            }
        } catch (error) {
            console.error('Camera error:', error);
            showToast.error('Error', 'Failed to take photo');
        }
    };

    // Send message
    const handleSend = async () => {
        if (!newMessage.trim() && !selectedFile) return;

        setSending(true);
        try {
            const messageData = {
                sender_id: user?.id,
                receiver_id: receiverId,
                message: newMessage.trim(),
            };

            if (selectedFile) {
                await sendMessageWithFile(messageData, selectedFile);
            } else {
                await sendMessage(messageData);
            }

            setNewMessage('');
            setSelectedFile(null);
            setIsTyping(false);
            await updateTypingStatus(user?.id, receiverId, false);

            // Immediately fetch new messages
            await fetchMessages();

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Send message error:', error);
            showToast.error('Error', 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Render message
    const renderMessage = ({ item }) => {
        const isOwnMessage = item.sender_id === user?.id;
        const hasAttachment = item.file_url || item.attachment_url;

        return (
            <View style={[
                styles.messageBubble,
                isOwnMessage ? styles.ownMessage : styles.otherMessage,
            ]}>
                {/* Message text */}
                {item.message && (
                    <Text style={[
                        styles.messageText,
                        isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                    ]}>
                        {item.message}
                    </Text>
                )}

                {/* File attachment */}
                {hasAttachment && (
                    <TouchableOpacity
                        onPress={() => {
                            const url = item.file_url || item.attachment_url;
                            if (url) Linking.openURL(url).catch(console.error);
                        }}
                        style={styles.attachmentContainer}
                    >
                        {item.file_type?.startsWith('image/') ? (
                            <Image
                                source={{ uri: item.file_url || item.attachment_url }}
                                style={styles.imageAttachment}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.fileAttachment}>
                                <Ionicons name="document-outline" size={32} color={isOwnMessage ? colors.white : colors.primary} />
                                <Text style={[
                                    styles.fileName,
                                    isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                                ]}>
                                    {item.file_name || 'Attachment'}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                {/* Timestamp and read receipt */}
                <View style={styles.messageFooter}>
                    <Text style={[
                        styles.messageTime,
                        isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
                    ]}>
                        {formatDateTime(item.created_at)}
                    </Text>
                    {isOwnMessage && (
                        <Ionicons
                            name={item.is_read ? 'checkmark-done' : 'checkmark'}
                            size={14}
                            color={item.is_read ? colors.success : 'rgba(255,255,255,0.7)'}
                            style={{ marginLeft: 4 }}
                        />
                    )}
                </View>
            </View>
        );
    };

    // Render attachment menu
    const renderAttachmentMenu = () => {
        if (!showAttachmentMenu) return null;

        return (
            <View style={styles.attachmentMenu}>
                <TouchableOpacity style={styles.attachmentOption} onPress={handlePickImage}>
                    <View style={[styles.attachmentIconContainer, { backgroundColor: colors.primary }]}>
                        <Ionicons name="image" size={24} color={colors.white} />
                    </View>
                    <Text style={styles.attachmentOptionText}>Photo Library</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.attachmentOption} onPress={handleTakePhoto}>
                    <View style={[styles.attachmentIconContainer, { backgroundColor: colors.success }]}>
                        <Ionicons name="camera" size={24} color={colors.white} />
                    </View>
                    <Text style={styles.attachmentOptionText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.attachmentOption} onPress={handlePickDocument}>
                    <View style={[styles.attachmentIconContainer, { backgroundColor: colors.warning }]}>
                        <Ionicons name="document" size={24} color={colors.white} />
                    </View>
                    <Text style={styles.attachmentOptionText}>Document</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.attachmentOption}
                    onPress={() => setShowAttachmentMenu(false)}
                >
                    <View style={[styles.attachmentIconContainer, { backgroundColor: colors.gray400 }]}>
                        <Ionicons name="close" size={24} color={colors.white} />
                    </View>
                    <Text style={styles.attachmentOptionText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <CustomHeader title="Chat" />
                <LoadingSpinner />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* Header with online status */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.avatarContainer}>
                        {receiverAvatar ? (
                            <Image source={{ uri: receiverAvatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarText}>{getInitials(receiverName || 'User')}</Text>
                            </View>
                        )}
                        {onlineStatus && <View style={styles.onlineIndicator} />}
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>{receiverName || 'Chat'}</Text>
                        <Text style={styles.headerSubtitle}>
                            {onlineStatus ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.headerAction}>
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={90}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id?.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    inverted={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={64} color={colors.gray300} />
                            <Text style={styles.emptyText}>No messages yet</Text>
                            <Text style={styles.emptySubText}>Start a conversation!</Text>
                        </View>
                    }
                />

                {/* Typing indicator */}
                {otherUserTyping && (
                    <View style={styles.typingIndicator}>
                        <View style={styles.typingDot} />
                        <View style={[styles.typingDot, { animationDelay: '0.2s' }]} />
                        <View style={[styles.typingDot, { animationDelay: '0.4s' }]} />
                        <Text style={styles.typingText}>{receiverName} is typing...</Text>
                    </View>
                )}

                {/* Selected file preview */}
                {selectedFile && (
                    <View style={styles.selectedFilePreview}>
                        <View style={styles.selectedFileInfo}>
                            <Ionicons name="attach" size={20} color={colors.primary} />
                            <Text style={styles.selectedFileName} numberOfLines={1}>
                                {selectedFile.name}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                            <Ionicons name="close-circle" size={24} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Attachment menu */}
                {renderAttachmentMenu()}

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <TouchableOpacity
                        style={styles.attachButton}
                        onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    >
                        <Ionicons name="add-circle" size={28} color={colors.primary} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.gray400}
                        value={newMessage}
                        onChangeText={handleTextChange}
                        multiline
                        maxLength={1000}
                    />

                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!newMessage.trim() && !selectedFile) && styles.sendButtonDisabled
                        ]}
                        onPress={handleSend}
                        disabled={(!newMessage.trim() && !selectedFile) || sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <Ionicons
                                name="send"
                                size={20}
                                color={(newMessage.trim() || selectedFile) ? colors.white : colors.gray400}
                            />
                        )}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        ...shadows.sm,
    },
    backButton: {
        marginRight: spacing.sm,
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: spacing.sm,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        backgroundColor: `${colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.primary,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.success,
        borderWidth: 2,
        borderColor: colors.white,
    },
    headerTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
    },
    headerAction: {
        padding: spacing.xs,
    },
    keyboardView: {
        flex: 1,
    },
    messagesList: {
        padding: spacing.md,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: spacing.sm,
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
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    messageTime: {
        fontSize: fontSizes.xs,
    },
    ownMessageTime: {
        color: 'rgba(255,255,255,0.7)',
    },
    otherMessageTime: {
        color: colors.textMuted,
    },
    attachmentContainer: {
        marginTop: spacing.xs,
    },
    imageAttachment: {
        width: 200,
        height: 200,
        borderRadius: borderRadius.md,
    },
    fileAttachment: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: borderRadius.md,
    },
    fileName: {
        fontSize: fontSizes.sm,
        marginLeft: spacing.xs,
        flex: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginTop: spacing.md,
        fontWeight: '600',
    },
    emptySubText: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.gray400,
        marginRight: 4,
    },
    typingText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    selectedFilePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: `${colors.primary}10`,
        padding: spacing.sm,
        marginHorizontal: spacing.md,
        marginBottom: spacing.xs,
        borderRadius: borderRadius.md,
    },
    selectedFileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    selectedFileName: {
        fontSize: fontSizes.sm,
        color: colors.text,
        marginLeft: spacing.xs,
        flex: 1,
    },
    attachmentMenu: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.white,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    attachmentOption: {
        alignItems: 'center',
    },
    attachmentIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    attachmentOptionText: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: spacing.sm,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    attachButton: {
        marginRight: spacing.xs,
        marginBottom: spacing.xs,
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
    },
    sendButtonDisabled: {
        backgroundColor: colors.gray200,
    },
});

export default EnhancedChatScreen;
