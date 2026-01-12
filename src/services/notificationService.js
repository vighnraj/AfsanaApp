// Push Notification Service - Handles push notification setup and management

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from '../api';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class NotificationService {
    constructor() {
        this.expoPushToken = null;
        this.notificationListener = null;
        this.responseListener = null;
        this.onNotificationReceived = null;
        this.onNotificationResponse = null;
    }

    // Request notification permissions and get token
    async registerForPushNotifications() {
        let token = null;

        // Check if physical device (required for push notifications)
        if (!Device.isDevice) {
            console.log('Push notifications require a physical device');
            return null;
        }

        // Check existing permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Request permissions if not granted
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Push notification permissions not granted');
            return null;
        }

        // Get Expo push token
        try {
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: '03389b61-fcdd-4f26-a37a-62dc4511f5dd', // From app.json/eas.json
            });
            token = tokenData.data;
            this.expoPushToken = token;
            console.log('Expo Push Token:', token);
        } catch (error) {
            console.error('Error getting push token:', error);
        }

        // Configure Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#4169E1',
            });

            // Additional channels for different notification types
            await Notifications.setNotificationChannelAsync('tasks', {
                name: 'Task Reminders',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
            });

            await Notifications.setNotificationChannelAsync('messages', {
                name: 'Messages',
                importance: Notifications.AndroidImportance.HIGH,
                sound: 'default',
            });

            await Notifications.setNotificationChannelAsync('updates', {
                name: 'Application Updates',
                importance: Notifications.AndroidImportance.DEFAULT,
            });
        }

        return token;
    }

    // Register device token with backend
    async registerDeviceToken(userId) {
        if (!this.expoPushToken) {
            await this.registerForPushNotifications();
        }

        if (!this.expoPushToken || !userId) {
            console.log('Cannot register device token: missing token or userId');
            return false;
        }

        try {
            await api.post('registerDeviceToken', {
                user_id: userId,
                token: this.expoPushToken,
                platform: Platform.OS,
                device_type: Device.modelName || 'Unknown',
            });
            console.log('Device token registered with backend');
            return true;
        } catch (error) {
            console.error('Error registering device token:', error);
            return false;
        }
    }

    // Set up notification listeners
    setupListeners(onReceived, onResponse) {
        this.onNotificationReceived = onReceived;
        this.onNotificationResponse = onResponse;

        // Listener for foreground notifications
        this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
            if (this.onNotificationReceived) {
                this.onNotificationReceived(notification);
            }
        });

        // Listener for notification responses (user tapped notification)
        this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response:', response);
            if (this.onNotificationResponse) {
                this.onNotificationResponse(response);
            }
        });
    }

    // Remove listeners
    removeListeners() {
        if (this.notificationListener) {
            Notifications.removeNotificationSubscription(this.notificationListener);
            this.notificationListener = null;
        }
        if (this.responseListener) {
            Notifications.removeNotificationSubscription(this.responseListener);
            this.responseListener = null;
        }
    }

    // Schedule a local notification
    async scheduleLocalNotification(title, body, data = {}, triggerSeconds = 1) {
        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                },
                trigger: {
                    seconds: triggerSeconds,
                },
            });
            return id;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return null;
        }
    }

    // Schedule a notification for a specific date/time
    async scheduleNotificationAtDate(title, body, date, data = {}) {
        try {
            const id = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                },
                trigger: date,
            });
            return id;
        } catch (error) {
            console.error('Error scheduling notification:', error);
            return null;
        }
    }

    // Cancel a scheduled notification
    async cancelNotification(notificationId) {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
            return true;
        } catch (error) {
            console.error('Error canceling notification:', error);
            return false;
        }
    }

    // Cancel all scheduled notifications
    async cancelAllNotifications() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            return true;
        } catch (error) {
            console.error('Error canceling all notifications:', error);
            return false;
        }
    }

    // Get all scheduled notifications
    async getScheduledNotifications() {
        try {
            return await Notifications.getAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Error getting scheduled notifications:', error);
            return [];
        }
    }

    // Set badge count (iOS)
    async setBadgeCount(count) {
        try {
            await Notifications.setBadgeCountAsync(count);
        } catch (error) {
            console.error('Error setting badge count:', error);
        }
    }

    // Get badge count
    async getBadgeCount() {
        try {
            return await Notifications.getBadgeCountAsync();
        } catch (error) {
            console.error('Error getting badge count:', error);
            return 0;
        }
    }

    // Dismiss all notifications
    async dismissAllNotifications() {
        try {
            await Notifications.dismissAllNotificationsAsync();
        } catch (error) {
            console.error('Error dismissing notifications:', error);
        }
    }

    // Get the push token
    getToken() {
        return this.expoPushToken;
    }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;
