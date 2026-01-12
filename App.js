// App Entry Point
import 'react-native-url-polyfill/auto';

import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import { LeadProvider } from './src/context/LeadContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { toastConfig, showToast } from './src/components/common/Toast';
import notificationService from './src/services/notificationService';

import { registerRootComponent } from 'expo';

function App() {
    const notificationResponseRef = useRef(null);

    useEffect(() => {
        // Initialize push notifications
        const initNotifications = async () => {
            try {
                await notificationService.registerForPushNotifications();

                // Set up notification listeners
                notificationService.setupListeners(
                    // On notification received (foreground)
                    (notification) => {
                        const { title, body } = notification.request.content;
                        showToast.info(title || 'Notification', body || '');
                    },
                    // On notification response (user tapped)
                    (response) => {
                        notificationResponseRef.current = response;
                        // Handle navigation based on notification data
                        const data = response.notification.request.content.data;
                        console.log('Notification tapped with data:', data);
                    }
                );
            } catch (error) {
                console.error('Error initializing notifications:', error);
            }
        };

        initNotifications();

        // Cleanup on unmount
        return () => {
            notificationService.removeListeners();
        };
    }, []);

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <LeadProvider>
                        <StatusBar style="auto" />
                        <RootNavigator />
                        <Toast config={toastConfig} />
                    </LeadProvider>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

registerRootComponent(App);
