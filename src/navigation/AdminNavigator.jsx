// Admin Navigator - Bottom Tabs + Stack
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import DashboardScreen from '../screens/admin/DashboardScreen';
import InquiryScreen from '../screens/admin/InquiryScreen';
import LeadScreen from '../screens/admin/LeadScreen';
import StudentListScreen from '../screens/admin/StudentListScreen';
import MoreScreen from '../screens/admin/MoreScreen';
import AddCounselorScreen from '../screens/admin/AddCounselorScreen';
import AddStudentScreen from '../screens/admin/AddStudentScreen';
import AddStaffScreen from '../screens/admin/AddStaffScreen';
import TasksScreen from '../screens/admin/TasksScreen';
import PaymentsScreen from '../screens/admin/PaymentsScreen';
import VisaListScreen from '../screens/admin/VisaListScreen';
import VisaProcessingScreen from '../screens/student/VisaProcessingScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import AddLeadScreen from '../screens/common/AddLeadScreen';
import LeadDetailScreen from '../screens/common/LeadDetailScreen';
import StudentDetailScreen from '../screens/common/StudentDetailScreen';
import AddProcessorScreen from '../screens/admin/AddProcessorScreen';
import RolesManagementScreen from '../screens/admin/RolesManagementScreen';
import PermissionsScreen from '../screens/admin/PermissionsScreen';
import ChatScreen from '../screens/common/ChatScreen';

// BATCH 3: Reporting & Analytics
import ReportsScreen from '../screens/admin/ReportsScreen';
import LeadReportsScreen from '../screens/admin/LeadReportsScreen';
import StudentReportsScreen from '../screens/admin/StudentReportsScreen';
import CounselorReportsScreen from '../screens/admin/CounselorReportsScreen';
import PaymentReportsScreen from '../screens/admin/PaymentReportsScreen';
import BranchReportsScreen from '../screens/admin/BranchReportsScreen';
import ApplicationReportsScreen from '../screens/admin/ApplicationReportsScreen';
import VisaReportsScreen from '../screens/admin/VisaReportsScreen';

// BATCH 4: Application & Payment
import ApplicationTrackerScreen from '../screens/admin/ApplicationTrackerScreen';
import UniversitySubmissionsScreen from '../screens/admin/UniversitySubmissionsScreen';
import InvoiceDownloadScreen from '../screens/admin/InvoiceDownloadScreen';

// BATCH 5: Additional Features
import BranchManagementScreen from '../screens/admin/BranchManagementScreen';
import AddBranchScreen from '../screens/admin/AddBranchScreen';
import TaskRemindersScreen from '../screens/admin/TaskRemindersScreen';
import TodaysInquiriesScreen from '../screens/admin/TodaysInquiriesScreen';
import NotificationCenterScreen from '../screens/notification/NotificationCenterScreen';

import { colors, fontSizes } from '../context/ThemeContext';

import { getTabScreenOptions } from './navigationStyles';
import CustomHeader from '../components/common/CustomHeader';

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

// Lead Stack (Screens manage their own headers)
const LeadStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="LeadList" component={LeadScreen} />
        <Stack.Screen name="InquiryList" component={InquiryScreen} />
        <Stack.Screen name="LeadDetail" component={LeadDetailScreen} />
        <Stack.Screen name="AddLead" component={AddLeadScreen} />
    </Stack.Navigator>
);

// Student Stack
const StudentStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="StudentList" component={StudentListScreen} />
        <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
        <Stack.Screen name="AddStudent" component={AddStudentScreen} />
    </Stack.Navigator>
);

// More Stack
const MoreStack = () => (
    <Stack.Navigator screenOptions={commonStackOptions}>
        <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddCounselor" component={AddCounselorScreen} options={{ title: 'Add Counselor' }} />
        <Stack.Screen name="AddStaff" component={AddStaffScreen} options={{ title: 'Add Staff' }} />
        <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Task Management' }} />
        <Stack.Screen name="Payments" component={PaymentsScreen} options={{ title: 'Payments & Invoices' }} />
        <Stack.Screen name="VisaList" component={VisaListScreen} options={{ title: 'Visa Processing' }} />
        <Stack.Screen name="VisaProcessing" component={VisaProcessingScreen} options={{ title: 'Process Application' }} />
        <Stack.Screen name="AddProcessor" component={AddProcessorScreen} options={{ title: 'Add Processor' }} />
        <Stack.Screen name="RolesManagement" component={RolesManagementScreen} options={{ title: 'Roles & Permissions' }} />
        <Stack.Screen name="Permissions" component={PermissionsScreen} options={{ title: 'Configure Permissions' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />

        {/* BATCH 3: Reporting & Analytics */}
        <Stack.Screen name="Reports" component={ReportsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LeadReports" component={LeadReportsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StudentReports" component={StudentReportsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CounselorReports" component={CounselorReportsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentReports" component={PaymentReportsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BranchReports" component={BranchReportsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ApplicationReports" component={ApplicationReportsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VisaReports" component={VisaReportsScreen} options={{ headerShown: false }} />

        {/* BATCH 4: Application & Payment */}
        <Stack.Screen name="ApplicationTracker" component={ApplicationTrackerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UniversitySubmissions" component={UniversitySubmissionsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="InvoiceDownload" component={InvoiceDownloadScreen} options={{ headerShown: false }} />

        {/* BATCH 5: Additional Features */}
        <Stack.Screen name="BranchManagement" component={BranchManagementScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddBranch" component={AddBranchScreen} options={{ title: 'Add Branch' }} />
        <Stack.Screen name="TaskReminders" component={TaskRemindersScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TodaysInquiries" component={TodaysInquiriesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
        <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

const AdminNavigator = () => {
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

export default AdminNavigator;
