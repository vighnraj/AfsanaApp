// ChatListScreen - Display list of chat conversations

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes } from '../../context/ThemeContext';
import CustomHeader from '../../components/common/CustomHeader';
import Loading from '../../components/common/Loading';
import socketService from '../../services/socketService';
import api from '../../api';

const ChatListScreen = ({ navigation }) => {
    const { user, role } = useAuth();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    // Get current user's role-specific ID
    const getCurrentRoleWiseId = useCallback(() => {
        if (role === 'student') return user?.student_id;
        if (role === 'counselor') return user?.counselor_id;
        return user?.user_id || user?.id;
    }, [role, user]);

    // Fetch chat list based on role
    const fetchChats = useCallback(async () => {
        try {
            const userId = getCurrentRoleWiseId();
            let endpoint = `userdetails?userId=${user?.user_id || user?.id}`;

            if (role === 'counselor') {
                endpoint = `getAssignedStudents?counselor_id=${user?.counselor_id}`;
            } else if (role === 'student') {
                endpoint = `getAssignedcounselor?student_id=${user?.student_id}`;
            }

            const response = await api.get(endpoint);
            const fetchedUsers = (response.data?.users || []).map(u => ({ ...u, type: 'user' }));
            const fetchedGroups = (response.data?.groups || []).map(g => ({ ...g, type: 'group' }));

            // Merge and sort by last message time
            const merged = [...fetchedUsers, ...fetchedGroups].sort((a, b) => {
                return new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0);
            });

            setChats(merged);
            setAvailableUsers(fetchedUsers);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [getCurrentRoleWiseId, role, user]);

    // Initialize socket and fetch chats
    useEffect(() => {
        const userId = getCurrentRoleWiseId();
        if (userId) {
            socketService.connect(userId);
        }

        fetchChats();

        // Socket connection listener
        const removeConnectionListener = socketService.addConnectionListener((connected) => {
            setIsConnected(connected);
        });

        // Listen for new messages to update chat list
        const removeMessageListener = socketService.addMessageListener((message) => {
            fetchChats(); // Refresh list when new message arrives
        });

        return () => {
            removeConnectionListener();
            removeMessageListener();
        };
    }, [getCurrentRoleWiseId, fetchChats]);

    // Handle refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchChats();
    }, [fetchChats]);

    // Navigate to chat
    const openChat = (chat) => {
        navigation.navigate('ChatBox', { chat });
    };

    // Create group
    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert('Error', 'Please enter a group name');
            return;
        }
        if (selectedMembers.length === 0) {
            Alert.alert('Error', 'Please select at least one member');
            return;
        }

        try {
            const userId = getCurrentRoleWiseId();
            const memberIds = selectedMembers.map(m => m.id);

            // Always include admin (user_id 1) if not already included
            if (!memberIds.includes(1)) {
                memberIds.push(1);
            }

            await api.post('creategroup', {
                group_name: groupName,
                user_ids: memberIds.join(','),
                created_by: userId,
            });

            setShowGroupModal(false);
            setGroupName('');
            setSelectedMembers([]);
            fetchChats();
            Alert.alert('Success', 'Group created successfully');
        } catch (error) {
            console.error('Error creating group:', error);
            Alert.alert('Error', 'Failed to create group');
        }
    };

    // Delete group (admin only)
    const handleDeleteGroup = async (groupId) => {
        Alert.alert(
            'Delete Group',
            'Are you sure you want to delete this group?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`deletegroup/${groupId}`);
                            fetchChats();
                            Alert.alert('Success', 'Group deleted successfully');
                        } catch (error) {
                            console.error('Error deleting group:', error);
                            Alert.alert('Error', 'You are not authorized to delete this group');
                        }
                    },
                },
            ]
        );
    };

    // Toggle member selection
    const toggleMember = (member) => {
        const isSelected = selectedMembers.find(m => m.id === member.id);
        if (isSelected) {
            setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
        } else {
            setSelectedMembers([...selectedMembers, member]);
        }
    };

    // Format time
    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    // Render chat item
    const renderChatItem = ({ item }) => {
        const isGroup = item.type === 'group';
        const name = isGroup ? item.group_name : item.full_name;
        const isAdmin = (user?.user_id === 1 || user?.id === 1);

        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => openChat(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.avatar, isGroup && styles.groupAvatar]}>
                    <Ionicons
                        name={isGroup ? 'people' : 'person'}
                        size={24}
                        color={colors.white}
                    />
                </View>

                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.chatName} numberOfLines={1}>
                            {name}
                            {!isGroup && item.role && (
                                <Text style={styles.roleTag}> ({item.role})</Text>
                            )}
                        </Text>
                        <Text style={styles.chatTime}>
                            {formatTime(item.last_message_time)}
                        </Text>
                    </View>
                    <Text style={styles.chatType}>
                        {isGroup ? 'Group Chat' : 'Direct Message'}
                    </Text>
                </View>

                {isGroup && isAdmin && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteGroup(item.id)}
                    >
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    // Render empty state
    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.gray400} />
            <Text style={styles.emptyTitle}>No Conversations</Text>
            <Text style={styles.emptyText}>
                {role === 'student'
                    ? 'You will see your counselor here once assigned'
                    : 'Start a conversation or create a group'}
            </Text>
        </View>
    );

    if (loading) {
        return <Loading />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <CustomHeader
                title="Messages"
                showBack={navigation.canGoBack()}
                onBack={() => navigation.goBack()}
                rightComponent={
                    role !== 'student' && (
                        <TouchableOpacity
                            style={styles.headerButton}
                            onPress={() => setShowGroupModal(true)}
                        >
                            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    )
                }
            />

            {/* Connection status */}
            {!isConnected && (
                <View style={styles.connectionBanner}>
                    <Ionicons name="cloud-offline-outline" size={16} color={colors.white} />
                    <Text style={styles.connectionText}>Connecting...</Text>
                </View>
            )}

            <FlatList
                data={chats}
                renderItem={renderChatItem}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                contentContainerStyle={chats.length === 0 ? styles.emptyList : styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                    />
                }
            />

            {/* Create Group Modal */}
            <Modal
                visible={showGroupModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowGroupModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Group</Text>
                            <TouchableOpacity onPress={() => setShowGroupModal(false)}>
                                <Ionicons name="close" size={24} color={colors.gray700} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.groupNameInput}
                            placeholder="Group Name"
                            value={groupName}
                            onChangeText={setGroupName}
                            placeholderTextColor={colors.gray400}
                        />

                        <Text style={styles.sectionTitle}>Select Members</Text>
                        <FlatList
                            data={availableUsers}
                            keyExtractor={(item) => item.id.toString()}
                            style={styles.membersList}
                            renderItem={({ item }) => {
                                const isSelected = selectedMembers.find(m => m.id === item.id);
                                return (
                                    <TouchableOpacity
                                        style={[styles.memberItem, isSelected && styles.memberSelected]}
                                        onPress={() => toggleMember(item)}
                                    >
                                        <View style={styles.memberAvatar}>
                                            <Ionicons name="person" size={16} color={colors.white} />
                                        </View>
                                        <Text style={styles.memberName}>{item.full_name}</Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                        />

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowGroupModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.createButton]}
                                onPress={handleCreateGroup}
                            >
                                <Text style={styles.createButtonText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerButton: {
        padding: spacing.xs,
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
    listContent: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
    emptyList: {
        flex: 1,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    groupAvatar: {
        backgroundColor: colors.info,
    },
    chatInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    roleTag: {
        fontSize: fontSizes.sm,
        color: colors.gray500,
        fontWeight: '400',
    },
    chatTime: {
        fontSize: fontSizes.xs,
        color: colors.gray500,
        marginLeft: spacing.sm,
    },
    chatType: {
        fontSize: fontSizes.sm,
        color: colors.gray500,
        marginTop: 2,
    },
    deleteButton: {
        padding: spacing.sm,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.gray700,
        marginTop: spacing.md,
    },
    emptyText: {
        fontSize: fontSizes.md,
        color: colors.gray500,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        padding: spacing.lg,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    groupNameInput: {
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSizes.md,
        color: colors.text,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSizes.md,
        fontWeight: '500',
        color: colors.gray700,
        marginBottom: spacing.sm,
    },
    membersList: {
        maxHeight: 300,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.xs,
    },
    memberSelected: {
        backgroundColor: colors.primaryLight,
    },
    memberAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray400,
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberName: {
        flex: 1,
        fontSize: fontSizes.md,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    modalButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
    },
    cancelButton: {
        backgroundColor: colors.gray200,
    },
    cancelButtonText: {
        fontSize: fontSizes.md,
        color: colors.gray700,
        fontWeight: '500',
    },
    createButton: {
        backgroundColor: colors.primary,
    },
    createButtonText: {
        fontSize: fontSizes.md,
        color: colors.white,
        fontWeight: '500',
    },
});

export default ChatListScreen;
