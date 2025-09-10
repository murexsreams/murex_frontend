import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  AccessibilityInfo,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { supportsAccessibility, safeCall } from '../../utils/platformUtils';

interface AccessibleButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'tab';
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled = false,
  style,
  testID,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled }}
      testID={testID}
      style={[style, disabled && styles.disabled]}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

interface AccessibleTextProps {
  children: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityRole?: 'header' | 'text' | 'summary';
  style?: TextStyle;
  numberOfLines?: number;
  testID?: string;
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  accessibilityLabel,
  accessibilityRole = 'text',
  style,
  numberOfLines,
  testID,
}) => {
  return (
    <Text
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      style={style}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Text>
  );
};

interface ScreenReaderAnnouncementProps {
  message: string;
  delay?: number;
}

export const ScreenReaderAnnouncement: React.FC<ScreenReaderAnnouncementProps> = ({
  message,
  delay = 0,
}) => {
  React.useEffect(() => {
    if (!supportsAccessibility) return;
    
    const timer = setTimeout(() => {
      safeCall(
        () => AccessibilityInfo.announceForAccessibility(message),
        undefined,
        `Failed to announce: ${message}`
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [message, delay]);

  return null;
};

interface FocusableViewProps {
  children: React.ReactNode;
  accessibilityLabel: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  onFocus?: () => void;
  testID?: string;
}

export const FocusableView: React.FC<FocusableViewProps> = ({
  children,
  accessibilityLabel,
  accessibilityHint,
  style,
  onFocus,
  testID,
}) => {
  const viewRef = React.useRef<View>(null);

  const handleFocus = () => {
    onFocus?.();
    if (viewRef.current) {
      AccessibilityInfo.setAccessibilityFocus(viewRef.current);
    }
  };

  return (
    <View
      ref={viewRef}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={style}
      onAccessibilityTap={handleFocus}
      testID={testID}
    >
      {children}
    </View>
  );
};

interface ProgressIndicatorProps {
  progress: number;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export const AccessibleProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  accessibilityLabel,
  style,
}) => {
  const { colors } = useTheme();
  const progressPercentage = Math.round(progress);

  return (
    <View
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || `Progress: ${progressPercentage}%`}
      accessibilityValue={{ min: 0, max: 100, now: progressPercentage }}
      style={[styles.progressContainer, { backgroundColor: colors.border }, style]}
    >
      <View
        style={[
          styles.progressBar,
          {
            backgroundColor: colors.primary,
            width: `${progressPercentage}%`,
          },
        ]}
      />
    </View>
  );
};

interface TabBarProps {
  tabs: Array<{
    key: string;
    title: string;
    accessibilityLabel?: string;
  }>;
  activeTab: string;
  onTabPress: (key: string) => void;
  style?: ViewStyle;
}

export const AccessibleTabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      accessible={false}
      accessibilityRole="tablist"
      style={[styles.tabBar, style]}
    >
      {tabs.map((tab, index) => (
        <AccessibleButton
          key={tab.key}
          onPress={() => onTabPress(tab.key)}
          accessibilityLabel={tab.accessibilityLabel || tab.title}
          accessibilityRole="tab"
          accessibilityHint={`Tab ${index + 1} of ${tabs.length}`}
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === tab.key ? colors.primary : 'transparent',
            },
          ]}
          testID={`tab-${tab.key}`}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === tab.key ? colors.background : colors.text,
              },
            ]}
          >
            {tab.title}
          </Text>
        </AccessibleButton>
      ))}
    </View>
  );
};

// Hook for managing focus and screen reader announcements
export const useAccessibility = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = React.useState(false);

  React.useEffect(() => {
    if (!supportsAccessibility) {
      setIsScreenReaderEnabled(false);
      return;
    }

    const checkScreenReader = async () => {
      const enabled = await safeCall(
        () => AccessibilityInfo.isScreenReaderEnabled(),
        false,
        'Failed to check screen reader status'
      );
      setIsScreenReaderEnabled(enabled || false);
    };

    checkScreenReader();

    let subscription: any = null;
    
    const setupSubscription = async () => {
      subscription = await safeCall(
        () => AccessibilityInfo.addEventListener('screenReaderChanged', setIsScreenReaderEnabled),
        null,
        'Failed to add accessibility event listener'
      );
    };

    setupSubscription();

    return () => {
      if (subscription) {
        safeCall(
          () => subscription.remove(),
          undefined,
          'Failed to remove accessibility event listener'
        );
      }
    };
  }, []);

  const announceForScreenReader = React.useCallback((message: string) => {
    if (isScreenReaderEnabled && supportsAccessibility) {
      safeCall(
        () => AccessibilityInfo.announceForAccessibility(message),
        undefined,
        `Failed to announce: ${message}`
      );
    }
  }, [isScreenReaderEnabled]);

  const setFocus = React.useCallback((ref: React.RefObject<any>) => {
    if (ref.current && isScreenReaderEnabled && supportsAccessibility) {
      safeCall(
        () => AccessibilityInfo.setAccessibilityFocus(ref.current),
        undefined,
        'Failed to set accessibility focus'
      );
    }
  }, [isScreenReaderEnabled]);

  return {
    isScreenReaderEnabled,
    announceForScreenReader,
    setFocus,
  };
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.6,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});