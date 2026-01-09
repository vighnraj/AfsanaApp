// Notification Center Screen - API Integration
// Matches Web Frontend Notification System

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../components/common/Toast';
import CustomHeader from '../../components/common/CustomHeader';
import api from '../../api';
import { formatDateReadable } from '../../utils/formatting';

const NotificationCenterScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread

  // Fetch notifications via API
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('notification');

      if (response.data) {
        const tasks = (response.data.tasks || []).map((task) => ({
          id: task.id,
          title: task.title || 'Task Notification',
          message: task.title || task.description || '',
          type: 'task',
          is_read: task.notification_status === '1',
          created_at: task.due_date || task.created_at,
        }));

        const inquiries = (response.data.inquiries || []).map((inquiry) => ({
          id: `inq-${inquiry.id}`,
          title: inquiry.full_name || 'New Inquiry',
          message: `${inquiry.inquiry_type || 'Inquiry'} - ${inquiry.full_name || 'Unknown'}`,
          type: 'inquiry',
          is_read: inquiry.notification_status === '1',
          created_at: inquiry.created_at,
        }));

        // For students, only show tasks
        const role = user?.role?.toLowerCase();
        if (role === 'student') {
          setNotifications(tasks);
        } else {
          setNotifications([...tasks, ...inquiries]);
        }
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
      // Don't show error toast for 404 - just no notifications
      if (error.response?.status !== 404) {
        showToast.error('Error', 'Failed to load notifications');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Clear all notifications
  const handleClearAll = useCallback(async () => {
    if (notifications.length === 0) return;

    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const taskIds = notifications
                .filter((n) => n.type === 'task')
                .map((n) => n.id);
              const inquiryIds = notifications
                .filter((n) => n.type === 'inquiry')
                .map((n) => String(n.id).replace('inq-', ''));

              await api.patch('notifications/update-status', {
                taskIds,
                inquiryIds,
              });

              showToast.success('Success', 'Notifications cleared');
              fetchNotifications();
            } catch (error) {
              console.error('Clear notifications error:', error);
              showToast.error('Error', 'Failed to clear notifications');
            }
          },
        },
      ]
    );
  }, [notifications, fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.is_read;
      return true;
    });
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getTypeIcon = (type) => {
    const iconMap = {
      task: 'checkbox-outline',
      inquiry: 'mail-outline',
      application: 'document-text-outline',
      followup: 'calendar-outline',
      message: 'chatbubble-outline',
      payment: 'card-outline',
      document: 'document-attach-outline',
      system: 'notifications-outline',
    };
    return iconMap[type?.toLowerCase()] || 'notifications-outline';
  };

  const getTypeColor = (type) => {
    const colorMap = {
      task: colors.primary,
      inquiry: colors.success,
      application: colors.info,
      followup: colors.warning,
      message: colors.secondary,
      payment: colors.danger,
      document: colors.primary,
      system: colors.textSecondary,
    };
    return colorMap[type?.toLowerCase()] || colors.primary;
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, !item.is_read && styles.cardUnread]}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: `${getTypeColor(item.type)}15` }]}>
          <Ionicons name={getTypeIcon(item.type)} size={22} color={getTypeColor(item.type)} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardMessage} numberOfLines={2}>
            {item.message || item.title}
          </Text>
          <View style={styles.cardMeta}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.cardTime}>
              {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: `${getTypeColor(item.type)}20` }]}>
              <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
                {item.type === 'task' ? '📝 Task' : '📩 Inquiry'}
              </Text>
            </View>
          </View>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CustomHeader title="Notifications" showBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <CustomHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} new` : 'All caught up'}
        showBack={true}
        onBack={() => navigation.goBack()}
        rightAction={
          notifications.length > 0 ? (
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearAllButton}>Clear All</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['all', 'unread'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={colors.gray300} />
          <Text style={styles.emptyTitle}>
            {filter === 'unread' ? 'No unread notifications' : 'No new notifications'}
          </Text>
          <Text style={styles.emptySubtext}>
            You're all caught up! New notifications will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  clearAllButton: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardUnread: {
    backgroundColor: `${colors.primary}08`,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardMessage: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  cardTime: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
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
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default NotificationCenterScreen;
