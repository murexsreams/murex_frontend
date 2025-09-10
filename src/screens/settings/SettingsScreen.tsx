import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  Lock,
  Eye,
  Mail,
  Smartphone,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export const SettingsScreen: React.FC = () => {
  const { 
    colors, 
    isDark, 
    mode, 
    fontSize, 
    isHighContrast, 
    isReducedMotion,
    toggleTheme, 
    setTheme, 
    updatePreferences 
  } = useTheme();
  const { user, logout } = useAuthStore();
  
  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showInvestments, setShowInvestments] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Account deletion functionality will be implemented soon.');
          },
        },
      ]
    );
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  const settingSections: SettingSection[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Edit Profile',
          subtitle: 'Update your profile information',
          icon: <User size={20} color={colors.primary} />,
          type: 'navigation',
          onPress: () => Alert.alert('Edit Profile', 'Profile editing coming soon!'),
        },
        {
          id: 'privacy',
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          icon: <Shield size={20} color={colors.primary} />,
          type: 'navigation',
          onPress: () => Alert.alert('Privacy', 'Privacy settings coming soon!'),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: 'Theme',
          subtitle: `Current: ${mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light'}`,
          icon: <Palette size={20} color={colors.primary} />,
          type: 'navigation',
          onPress: () => Alert.alert(
            'Theme Settings',
            'Choose your preferred theme',
            [
              { text: 'Light', onPress: () => setTheme('light') },
              { text: 'Dark', onPress: () => setTheme('dark') },
              { text: 'System', onPress: () => setTheme('system') },
              { text: 'Cancel', style: 'cancel' },
            ]
          ),
        },
        {
          id: 'fontSize',
          title: 'Font Size',
          subtitle: `Current: ${fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}`,
          icon: <FileText size={20} color={colors.primary} />,
          type: 'navigation',
          onPress: () => Alert.alert(
            'Font Size',
            'Choose your preferred font size',
            [
              { text: 'Small', onPress: () => updatePreferences({ fontSize: 'small' }) },
              { text: 'Medium', onPress: () => updatePreferences({ fontSize: 'medium' }) },
              { text: 'Large', onPress: () => updatePreferences({ fontSize: 'large' }) },
              { text: 'Cancel', style: 'cancel' },
            ]
          ),
        },
        {
          id: 'highContrast',
          title: 'High Contrast',
          subtitle: 'Improve text readability',
          icon: <Eye size={20} color={colors.primary} />,
          type: 'toggle',
          value: isHighContrast,
          onToggle: (value) => updatePreferences({ highContrast: value }),
        },
        {
          id: 'reducedMotion',
          title: 'Reduce Motion',
          subtitle: 'Minimize animations and transitions',
          icon: <Globe size={20} color={colors.primary} />,
          type: 'toggle',
          value: isReducedMotion,
          onToggle: (value) => updatePreferences({ reducedMotion: value }),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          icon: <Bell size={20} color={colors.primary} />,
          type: 'toggle',
          value: pushNotifications,
          onToggle: setPushNotifications,
        },
        {
          id: 'email',
          title: 'Email Notifications',
          subtitle: 'Receive updates via email',
          icon: <Mail size={20} color={colors.primary} />,
          type: 'toggle',
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
      ],
    },
    {
      title: 'Audio & Playback',
      items: [
        {
          id: 'sound',
          title: 'Sound Effects',
          subtitle: 'Play sounds for interactions',
          icon: <Volume2 size={20} color={colors.primary} />,
          type: 'toggle',
          value: soundEffects,
          onToggle: setSoundEffects,
        },
        {
          id: 'autoplay',
          title: 'Auto-play Next Track',
          subtitle: 'Automatically play the next track',
          icon: <Smartphone size={20} color={colors.primary} />,
          type: 'toggle',
          value: autoPlay,
          onToggle: setAutoPlay,
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          id: 'private',
          title: 'Private Profile',
          subtitle: 'Make your profile visible to followers only',
          icon: <Lock size={20} color={colors.primary} />,
          type: 'toggle',
          value: privateProfile,
          onToggle: setPrivateProfile,
        },
        {
          id: 'investments',
          title: 'Show Investment Activity',
          subtitle: 'Display your investment history publicly',
          icon: <Eye size={20} color={colors.primary} />,
          type: 'toggle',
          value: showInvestments,
          onToggle: setShowInvestments,
        },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'Get help and support',
          icon: <HelpCircle size={20} color={colors.primary} />,
          type: 'navigation',
          onPress: () => openURL('https://murex-streams.com/help'),
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          icon: <FileText size={20} color={colors.primary} />,
          type: 'navigation',
          onPress: () => openURL('https://murex-streams.com/terms'),
        },
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          icon: <Shield size={20} color={colors.primary} />,
          type: 'navigation',
          onPress: () => openURL('https://murex-streams.com/privacy'),
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          id: 'logout',
          title: 'Sign Out',
          icon: <LogOut size={20} color={colors.error} />,
          type: 'action',
          onPress: handleLogout,
          destructive: true,
        },
        {
          id: 'delete',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account',
          icon: <User size={20} color={colors.error} />,
          type: 'action',
          onPress: handleDeleteAccount,
          destructive: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.settingItem,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }
      ]}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          {item.icon}
        </View>
        
        <View style={styles.settingText}>
          <Text style={[
            styles.settingTitle,
            {
              color: item.destructive ? colors.error : colors.text,
            }
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
        
        <View style={styles.settingAction}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{
                false: colors.border,
                true: colors.primary + '40',
              }}
              thumbColor={item.value ? colors.primary : colors.textSecondary}
            />
          ) : (
            <ChevronRight size={16} color={colors.textSecondary} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: SettingSection) => (
    <View key={section.title} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {section.title.toUpperCase()}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>
        {section.items.map((item, index) => (
          <View key={item.id}>
            {renderSettingItem(item)}
            {index < section.items.length - 1 && (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderUserInfo = () => (
    <View style={[styles.userInfo, { backgroundColor: colors.surface }]}>
      <View style={styles.userDetails}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.username || 'Unknown User'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user?.email || 'No email'}
        </Text>
        <View style={styles.userRole}>
          <Text style={[styles.roleText, { color: colors.primary }]}>
            {user?.role === 'artist' ? '🎵 Artist' : '💰 Investor'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderUserInfo()}
        
        {settingSections.map(renderSection)}
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Murex Streams v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2024 Murex Streams. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  userInfo: {
    padding: 20,
    marginTop: 60,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
  },
  userDetails: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  userRole: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  settingAction: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    marginLeft: 60,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});