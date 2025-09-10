import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Search, Upload, Wallet, User, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';

// Import screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { DiscoverScreen } from '../screens/discover/DiscoverScreen';
import { UploadScreen } from '../screens/upload/UploadScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

// Import modals
import { FullPlayer } from '../components/music/FullPlayer';
import { InvestmentScreen } from '../screens/investment/InvestmentScreen';
import { CommentsModal } from '../components/modals/CommentsModal';

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
  TrackDetail: { trackId: string };
  ArtistProfile: { artistId: string };
  Investment: { trackId: string };
  EditProfile: undefined;
  FullPlayer: undefined;
  Comments: { trackId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Upload: undefined;
  Wallet: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabNavigator = () => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { currentTrack } = usePlayerStore();

  // Adjust tab bar position when MiniPlayer is visible
  const miniPlayerHeight = 70; // Height of MiniPlayer
  const tabBarHeight = Platform.OS === 'ios' ? 85 : 60;
  const bottomOffset = currentTrack ? miniPlayerHeight : 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 8,
          height: tabBarHeight,
          marginBottom: bottomOffset, // Push tab bar up when MiniPlayer is visible
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          switch (route.name) {
            case 'Home':
              IconComponent = Home;
              break;
            case 'Discover':
              IconComponent = Search;
              break;
            case 'Upload':
              IconComponent = Upload;
              break;
            case 'Wallet':
              IconComponent = Wallet;
              break;
            case 'Profile':
              IconComponent = User;
              break;
            default:
              IconComponent = Home;
          }

          return <IconComponent size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{
          tabBarLabel: 'Discover',
        }}
      />
      {user?.role === 'artist' && (
        <Tab.Screen 
          name="Upload" 
          component={UploadScreen}
          options={{
            tabBarLabel: 'Upload',
          }}
        />
      )}
      <Tab.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{
          tabBarLabel: user?.role === 'artist' ? 'Earnings' : 'Portfolio',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const RootStackNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen 
        name="FullPlayer" 
        component={FullPlayer}
        options={{
          headerShown: false,
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="Investment" 
        component={InvestmentScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
          gestureEnabled: true,
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return <RootStackNavigator />;
};