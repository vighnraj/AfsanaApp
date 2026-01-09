// Counselor Navigator - Bottom Tabs + Stack
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import DashboardScreen from '../screens/counselor/DashboardScreen';
import LeadsScreen from '../screens/counselor/LeadsScreen';
import LeadDetailScreen from '../screens/common/LeadDetailScreen';
import StudentDetailScreen from '../screens/common/StudentDetailScreen';
import AddLeadScreen from '../screens/common/AddLeadScreen';
import StudentsScreen from '../screens/counselor/StudentsScreen';
import TasksScreen from '../screens/counselor/TasksScreen';
import MoreScreen from '../screens/counselor/MoreScreen';
import PaymentsScreen from '../screens/counselor/PaymentsScreen';
import ChatScreen from '../screens/common/ChatScreen';
import ChatListScreen from '../screens/common/ChatListScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import VisaListScreen from '../screens/admin/VisaListScreen';
import VisaProcessingScreen from '../screens/student/VisaProcessingScreen';
import NotificationCenterScreen from '../screens/notification/NotificationCenterScreen';

import { colors, fontSizes } from '../context/ThemeContext';
import { getTabScreenOptions } from './navigationStyles';
import { CustomHeader } from '../components/common';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const commonStackOptions = {
    header: ({ navigation, route, options }) => (
        <CustomHeader
            title={options.title || route.name}
            showBack={navigation.canGoBack()}
            onBack={() => navigation.goBack()}
        />
    ),
    cardStyle: { backgroundColor: colors.background },
};

// More Stack
const MoreStack = () => (
    <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Payments" component={PaymentsScreen} options={{ title: 'Student Invoices' }} />
        <Stack.Screen name="VisaList" component={VisaListScreen} options={{ title: 'Visa Processing' }} />
        <Stack.Screen name="VisaProcessing" component={VisaProcessingScreen} options={{ title: 'Process Application' }} />

        <Stack.Screen name="ChatList" component={ChatListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
        <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

// Lead Stack (Screens manage their own headers)
const LeadStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="LeadList" component={LeadsScreen} />
        <Stack.Screen name="LeadDetail" component={LeadDetailScreen} />
        <Stack.Screen name="AddLead" component={AddLeadScreen} />
    </Stack.Navigator>
);

// Student Stack
const StudentStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="StudentList" component={StudentsScreen} />
        <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
    </Stack.Navigator>
);

const CounselorNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                ...getTabScreenOptions(),
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'grid' : 'grid-outline';
                            break;
                        case 'Leads':
                            iconName = focused ? 'people' : 'people-outline';
                            break;
                        case 'Students':
                            iconName = focused ? 'school' : 'school-outline';
                            break;
                        case 'Tasks':
                            iconName = focused ? 'checkbox' : 'checkbox-outline';
                            break;
                        case 'More':
                            iconName = focused ? 'menu' : 'menu-outline';
                            break;
                        default:
                            iconName = 'circle';
                    }

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Leads" component={LeadStack} />
            <Tab.Screen name="Students" component={StudentStack} />
            <Tab.Screen name="Tasks" component={TasksScreen} />
            <Tab.Screen
                name="More"
                component={MoreStack}
                options={{ unmountOnBlur: true }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('More', { screen: 'MoreMenu' });
                    },
                })}
            />
        </Tab.Navigator>
    );
};

export default CounselorNavigator;
