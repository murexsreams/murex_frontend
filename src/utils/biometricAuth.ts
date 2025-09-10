// Biometric authentication utilities
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform, Alert } from 'react-native';
import { biometricManager } from './secureStorage';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: string;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  supportedTypes: string[];
  isEnrolled: boolean;
  securityLevel: 'none' | 'biometric' | 'passcode' | 'both';
}

class BiometricAuthService {
  // Check if biometric authentication is available
  async getCapabilities(): Promise<BiometricCapabilities> {
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

      const typeNames = supportedTypes.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face ID';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris';
          default:
            return 'Biometric';
        }
      });

      return {
        isAvailable,
        supportedTypes: typeNames,
        isEnrolled,
        securityLevel: this.mapSecurityLevel(securityLevel),
      };
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      return {
        isAvailable: false,
        supportedTypes: [],
        isEnrolled: false,
        securityLevel: 'none',
      };
    }
  }

  // Authenticate using biometrics
  async authenticate(
    reason: string = 'Authenticate to access your account',
    options?: {
      promptMessage?: string;
      cancelLabel?: string;
      fallbackLabel?: string;
      disableDeviceFallback?: boolean;
    }
  ): Promise<BiometricAuthResult> {
    try {
      const capabilities = await this.getCapabilities();
      
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      if (!capabilities.isEnrolled) {
        return {
          success: false,
          error: 'No biometric credentials are enrolled on this device',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options?.promptMessage || reason,
        cancelLabel: options?.cancelLabel || 'Cancel',
        fallbackLabel: options?.fallbackLabel || 'Use Passcode',
        disableDeviceFallback: options?.disableDeviceFallback || false,
      });

      if (result.success) {
        return {
          success: true,
          biometricType: capabilities.supportedTypes[0] || 'Biometric',
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  // Enable biometric authentication for the app
  async enableBiometric(): Promise<BiometricAuthResult> {
    try {
      const capabilities = await this.getCapabilities();
      
      if (!capabilities.isAvailable) {
        Alert.alert(
          'Biometric Not Available',
          'Biometric authentication is not available on this device.'
        );
        return { success: false, error: 'Biometric not available' };
      }

      if (!capabilities.isEnrolled) {
        Alert.alert(
          'No Biometric Enrolled',
          'Please set up biometric authentication in your device settings first.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Settings', 
              onPress: () => {
                // In production, open device settings
                console.log('Open device settings');
              }
            },
          ]
        );
        return { success: false, error: 'No biometric enrolled' };
      }

      const authResult = await this.authenticate(
        'Enable biometric authentication for secure access'
      );

      if (authResult.success) {
        await biometricManager.setBiometricEnabled(true);
        return authResult;
      }

      return authResult;
    } catch (error) {
      console.error('Error enabling biometric:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enable biometric',
      };
    }
  }

  // Disable biometric authentication
  async disableBiometric(): Promise<void> {
    try {
      await biometricManager.setBiometricEnabled(false);
    } catch (error) {
      console.error('Error disabling biometric:', error);
      throw error;
    }
  }

  // Check if biometric is enabled for the app
  async isBiometricEnabled(): Promise<boolean> {
    try {
      return await biometricManager.isBiometricEnabled();
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  }

  // Get user-friendly biometric type name
  getBiometricTypeName(capabilities: BiometricCapabilities): string {
    if (capabilities.supportedTypes.length === 0) {
      return 'Biometric';
    }

    if (Platform.OS === 'ios') {
      if (capabilities.supportedTypes.includes('Face ID')) {
        return 'Face ID';
      } else if (capabilities.supportedTypes.includes('Fingerprint')) {
        return 'Touch ID';
      }
    } else {
      if (capabilities.supportedTypes.includes('Fingerprint')) {
        return 'Fingerprint';
      } else if (capabilities.supportedTypes.includes('Face ID')) {
        return 'Face Recognition';
      }
    }

    return capabilities.supportedTypes[0] || 'Biometric';
  }

  // Map security level enum to string
  private mapSecurityLevel(level: LocalAuthentication.SecurityLevel): 'none' | 'biometric' | 'passcode' | 'both' {
    switch (level) {
      case LocalAuthentication.SecurityLevel.NONE:
        return 'none';
      case LocalAuthentication.SecurityLevel.SECRET:
        return 'passcode';
      case LocalAuthentication.SecurityLevel.BIOMETRIC:
        return 'biometric';
      case LocalAuthentication.SecurityLevel.SECRET_AND_BIOMETRIC:
        return 'both';
      default:
        return 'none';
    }
  }

  // Prompt user to set up biometric authentication
  async promptBiometricSetup(): Promise<void> {
    const capabilities = await this.getCapabilities();
    const biometricName = this.getBiometricTypeName(capabilities);

    if (!capabilities.isAvailable) {
      Alert.alert(
        'Biometric Not Supported',
        'Your device does not support biometric authentication.'
      );
      return;
    }

    if (!capabilities.isEnrolled) {
      Alert.alert(
        `Set Up ${biometricName}`,
        `Would you like to set up ${biometricName} for faster and more secure access?`,
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Set Up',
            onPress: () => {
              // In production, open device settings
              console.log('Open biometric setup in device settings');
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      `Enable ${biometricName}`,
      `Use ${biometricName} to quickly and securely access your account?`,
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: async () => {
            const result = await this.enableBiometric();
            if (result.success) {
              Alert.alert(
                'Success',
                `${biometricName} has been enabled for your account.`
              );
            }
          },
        },
      ]
    );
  }
}

// Create singleton instance
export const biometricAuth = new BiometricAuthService();

// React hook for biometric authentication
export const useBiometricAuth = () => {
  const [capabilities, setCapabilities] = React.useState<BiometricCapabilities | null>(null);
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadBiometricStatus = async () => {
      try {
        const caps = await biometricAuth.getCapabilities();
        const enabled = await biometricAuth.isBiometricEnabled();
        
        setCapabilities(caps);
        setIsEnabled(enabled);
      } catch (error) {
        console.error('Error loading biometric status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBiometricStatus();
  }, []);

  const authenticate = React.useCallback(async (reason?: string) => {
    return await biometricAuth.authenticate(reason);
  }, []);

  const enableBiometric = React.useCallback(async () => {
    const result = await biometricAuth.enableBiometric();
    if (result.success) {
      setIsEnabled(true);
    }
    return result;
  }, []);

  const disableBiometric = React.useCallback(async () => {
    await biometricAuth.disableBiometric();
    setIsEnabled(false);
  }, []);

  return {
    capabilities,
    isEnabled,
    loading,
    authenticate,
    enableBiometric,
    disableBiometric,
    promptSetup: biometricAuth.promptBiometricSetup,
  };
};

export default biometricAuth;