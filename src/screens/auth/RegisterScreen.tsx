import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Music, User, DollarSign } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore, UserRole } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { colors, typography, spacing } = useTheme();
  const { register, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>('investor');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      await register(formData.email, formData.password, formData.username, selectedRole);
      // Navigation will be handled by the main App component
    } catch (error) {
      Alert.alert('Registration Failed', 'Please try again');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Music size={40} color={colors.primary} />
                <Text style={[styles.logoText, { color: colors.text }]}>
                  Murex Streams
                </Text>
              </View>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Join the future of music investment
              </Text>
            </View>

            {/* Role Selection */}
            <Card style={styles.roleCard}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Choose Your Role
              </Text>
              
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    {
                      borderColor: selectedRole === 'artist' ? colors.primary : colors.border,
                      backgroundColor: selectedRole === 'artist' ? `${colors.primary}20` : 'transparent',
                    }
                  ]}
                  onPress={() => setSelectedRole('artist')}
                >
                  <User size={24} color={selectedRole === 'artist' ? colors.primary : colors.textSecondary} />
                  <Text style={[
                    styles.roleTitle,
                    { color: selectedRole === 'artist' ? colors.primary : colors.text }
                  ]}>
                    Artist
                  </Text>
                  <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
                    Upload music and raise funds
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    {
                      borderColor: selectedRole === 'investor' ? colors.primary : colors.border,
                      backgroundColor: selectedRole === 'investor' ? `${colors.primary}20` : 'transparent',
                    }
                  ]}
                  onPress={() => setSelectedRole('investor')}
                >
                  <DollarSign size={24} color={selectedRole === 'investor' ? colors.primary : colors.textSecondary} />
                  <Text style={[
                    styles.roleTitle,
                    { color: selectedRole === 'investor' ? colors.primary : colors.text }
                  ]}>
                    Investor
                  </Text>
                  <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
                    Invest in music and earn returns
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Registration Form */}
            <Card style={styles.formCard}>
              <Text style={[styles.formTitle, { color: colors.text }]}>
                Create Account
              </Text>
              
              <Input
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              
              <Input
                label="Username"
                placeholder="Choose a username"
                value={formData.username}
                onChangeText={(text) => updateFormData('username', text)}
                autoCapitalize="none"
                error={errors.username}
              />
              
              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                secureTextEntry
                error={errors.password}
              />
              
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                secureTextEntry
                error={errors.confirmPassword}
              />
              
              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={isLoading}
                style={styles.registerButton}
              />
            </Card>

            {/* Sign In Link */}
            <View style={styles.signinContainer}>
              <Text style={[styles.signinText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.signinLink, { color: colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  roleCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  roleOption: {
    flex: 1,
    padding: 20,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  formCard: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  registerButton: {
    marginTop: 8,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signinText: {
    fontSize: 16,
  },
  signinLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});