// Root Navigator - Switches between Auth and Main based on authentication state

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { useAuth } from '../context/AuthContext';
import { LoadingOverlay } from '../components/common/Loading';

// Navigators
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import StudentNavigator from './StudentNavigator';
import CounselorNavigator from './CounselorNavigator';
import ProcessorNavigator from './ProcessorNavigator';
import StaffNavigator from './StaffNavigator';
import MasterAdminNavigator from './MasterAdminNavigator';

const Stack = createStackNavigator();

const RootNavigator = () => {
    const { isAuthenticated, loading, role } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return <LoadingOverlay visible message="Loading..." />;
    }

    // Get the appropriate navigator based on role
    const getMainNavigator = () => {
        switch (role) {
            case 'admin':
                return AdminNavigator;
            case 'student':
                return StudentNavigator;
            case 'counselor':
                return CounselorNavigator;
            case 'processors':
                return ProcessorNavigator;
            case 'staff':
                return StaffNavigator;
            case 'masteradmin':
                return MasterAdminNavigator;
            default:
                return AdminNavigator; // Default fallback
        }
    };

    const MainNavigator = getMainNavigator();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth Stack
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : (
                    // Main App Stack based on role
                    <Stack.Screen name="Main" component={MainNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
