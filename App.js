// App Entry Point
import 'react-native-url-polyfill/auto';

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import { LeadProvider } from './src/context/LeadContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { toastConfig } from './src/components/common/Toast';

import { registerRootComponent } from 'expo';

function App() {
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
