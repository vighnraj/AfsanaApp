// Chat List Screen
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ImageBackground,
    Modal,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getChatList, getCounselors, getAssignedStudents, getUserDetails } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { CustomHeader, NotificationBell } from '../../components/common';
import { formatDateTime } from '../../utils/formatting';

const ChatListScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userDetailsMap, setUserDetailsMap] = useState({});

    // New Chat selection state
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]); // Counselors or Students
    const [loadingUsers, setLoadingUsers] = useState(false);

    const fetchChats = useCallback(async () => {
        try {
            if (!user?.id) return;
            const data = await getChatList(user.id);
            const chatList = data.chatList || [];

            setChats(chatList);

            // Parallel fetch user details for each chat to get names/photos
            // The chat list API returns chatId like "1_5" but might not return names directly depending on backend
            // Based on Web ChatList.jsx, it fetches details:
            const details = {};
            await Promise.all(chatList.map(async (chat) => {
                const partnerId = getPartnerId(chat.chatId, user.id);
                try {
                    const userData = await getUserDetails(partnerId);
                    if (userData && userData.user) {
                        details[chat.chatId] = userData.user;
                    }
                } catch (e) {
                    console.log('Error fetching user details for', partnerId, e);
                    // Fallback or ignore
                }
            }));

            setUserDetailsMap(prev => ({ ...prev, ...details }));

        } catch (error) {
            console.error('Fetch chats error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchChats();
        }, [fetchChats])
    );

    const getPartnerId = (chatId, myId) => {
        const [id1, id2] = chatId.split('_');
        return String(id1) === String(myId) ? id2 : id1;
    };

    const handleChatPress = (chat) => {
        const partnerId = getPartnerId(chat.chatId, user.id);
        const partnerDetails = userDetailsMap[chat.chatId] || {};

        navigation.navigate('Chat', {
            chatId: chat.chatId,
            receiverId: partnerId,
            receiverName: partnerDetails.full_name || 'Chat',
            receiverRole: partnerDetails.role
        });
    };

    // Logic for "New Chat" - equivalent to the dropdowns in web
    const handleNewChatPress = async () => {
        setShowNewChatModal(true);
        setLoadingUsers(true);
        try {
            let usersList = [];
            if (user.role === 'student') {
                // Students can chat with Admin (id=1) or Counselors
                const counselors = await getCounselors();
                usersList = [
                    { id: 1, full_name: 'Admin', role: 'admin' },
                    ...(Array.isArray(counselors) ? counselors : [])
                ];
            } else if (user.role === 'counselor') {
                // Counselors can chat with Admin or Assigned Students
                const students = await getAssignedStudents(user.counselor_id || user.id);
                usersList = [
                    { id: 1, full_name: 'Admin', role: 'admin' },
                    ...(Array.isArray(students) ? students : [])
                ];
            } else {
                // Admin/Staff/Other - generic fallback or all users logic?
                // For parity with web, sticking to Student/Counselor flows primarily.
                // If Admin, they usually see all chats.
                usersList = [];
            }
            setAvailableUsers(usersList);
        } catch (error) {
            console.error('Error fetching users for new chat:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const startNewChat = (selectedUser) => {
        setShowNewChatModal(false);
        // Construct chat ID mechanism if needed, or just navigate with receiverId
        // Web does openChat(selectedUser.id)
        navigation.navigate('Chat', {
            receiverId: selectedUser.id,
            receiverName: selectedUser.full_name,
            receiverRole: selectedUser.role
        });
    };

    const renderChatItem = ({ item }) => {
        const partnerDetails = userDetailsMap[item.chatId] || {};
        const displayName = partnerDetails.full_name || 'Loading...';
        const displayPhoto = partnerDetails.photo
            ? { uri: partnerDetails.photo }
            : null; // Could add default avatar

        return (
            <TouchableOpacity
                style={[styles.chatItem, shadows.sm]}
                onPress={() => handleChatPress(item)}
            >
                <View style={styles.avatarContainer}>
                    {displayPhoto ? (
                        <Image source={displayPhoto} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitials}>
                                {displayName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                        <Text style={styles.timeText}>
                            {formatDateTime(item.lastMessageTime)}
                        </Text>
                    </View>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        Click to view conversation
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <CustomHeader
                title="Messages"
                showBack={false}
                rightAction={
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={handleNewChatPress} style={styles.addButton}>
                            <Ionicons name="create-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <NotificationBell />
                    </View>
                }
            />

            <FlatList
                data={chats}
                keyExtractor={(item) => item.chatId}
                renderItem={renderChatItem}
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true);
                    fetchChats();
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No conversations yet</Text>
                        <TouchableOpacity style={styles.startChatButton} onPress={handleNewChatPress}>
                            <Text style={styles.startChatText}>Start a New Chat</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* New Chat Modal */}
            <Modal
                visible={showNewChatModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowNewChatModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New Message</Text>
                            <TouchableOpacity onPress={() => setShowNewChatModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {loadingUsers ? (
                            <ActivityIndicator size="small" color={colors.primary} style={{ padding: 20 }} />
                        ) : (
                            <FlatList
                                data={availableUsers}
                                keyExtractor={(item) => item.id.toString()}
                                style={styles.userList}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.userItem}
                                        onPress={() => startNewChat(item)}
                                    >
                                        <View style={[styles.avatarSmall, styles.avatarPlaceholder]}>
                                            <Text style={styles.avatarInitialsSmall}>
                                                {item.full_name?.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={styles.userItemName}>{item.full_name}</Text>
                                            <Text style={styles.userItemRole}>{item.role}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.noUsersText}>No users available</Text>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: spacing.md,
    },
    chatItem: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: spacing.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.gray200,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary + '20', // lighter primary
    },
    avatarInitials: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.primary,
    },
    chatInfo: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    timeText: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
    },
    lastMessage: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginVertical: spacing.md,
    },
    startChatButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
    },
    startChatText: {
        color: colors.white,
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButton: {
        marginRight: spacing.md,
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '80%',
        paddingBottom: spacing.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    modalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
    },
    userList: {
        padding: spacing.md,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray50,
    },
    avatarSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: spacing.md,
    },
    avatarInitialsSmall: {
        fontSize: fontSizes.md,
        fontWeight: 'bold',
        color: colors.primary,
    },
    userItemName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    userItemRole: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        textTransform: 'capitalize',
    },
    noUsersText: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginTop: spacing.md,
    }
});

export default ChatListScreen;
