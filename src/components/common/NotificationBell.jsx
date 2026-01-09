// Notification Bell Component for Header
// Shows bell icon with badge count, navigates to NotificationCenterScreen

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const NotificationBell = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [notificationCount, setNotificationCount] = useState(0);

    // Fetch notification count using simple API polling
    const fetchNotificationCount = useCallback(async () => {
        try {
            // Try to get notification count based on role
            const role = user?.role?.toLowerCase();
            let endpoint = 'notifications/count';

            // Fallback: just use the notifications endpoint
            const response = await api.get('notification');

            if (response.data) {
                // Count unread notifications
                const tasks = response.data.tasks || [];
                const inquiries = response.data.inquiries || [];

                // For students, only count tasks
                if (role === 'student') {
                    setNotificationCount(tasks.length);
                } else {
                    setNotificationCount(tasks.length + inquiries.length);
                }
            }
        } catch (error) {
            // Silently fail - notification count is not critical
            console.log('Notification count fetch skipped:', error.message);
        }
    }, [user]);

    useEffect(() => {
        fetchNotificationCount();

        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotificationCount, 30000);

        return () => clearInterval(interval);
    }, [fetchNotificationCount]);

    const handlePress = () => {
        // Navigate to NotificationCenter nested in MoreStack
        navigation.navigate('More', { screen: 'NotificationCenter' });
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {notificationCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.error,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.white,
    },
});

export default NotificationBell;
