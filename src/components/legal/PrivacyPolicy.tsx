// Privacy Policy component
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ExternalLink } from 'lucide-react-native';

interface PrivacyPolicyProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  onClose,
  showCloseButton = true,
}) => {
  const { colors } = useTheme();

  const openExternalLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
        {showCloseButton && onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.primary }]}>Done</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
          Last updated: January 1, 2025
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            1. Information We Collect
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We collect information you provide directly to us, such as when you create an account, 
            make investments, or contact us for support. This includes:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Account information (email, username, display name)
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Investment and transaction data
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Music listening preferences and history
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Device information and usage analytics
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We use the information we collect to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Provide and maintain our services
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Process investments and transactions
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Personalize your music discovery experience
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Send important updates and notifications
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Improve our services and develop new features
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            3. Information Sharing
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except in the following circumstances:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • With service providers who assist in our operations
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • When required by law or to protect our rights
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • In connection with a business transfer or merger
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            4. Data Security
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. This includes:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Encryption of sensitive data in transit and at rest
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Secure storage of financial and personal information
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Regular security audits and updates
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Limited access to personal data by authorized personnel only
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            5. Cryptocurrency and Financial Data
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            As a platform that facilitates cryptocurrency investments, we handle financial data with 
            special care:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Wallet addresses and transaction data are encrypted
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • We never store private keys or seed phrases
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Investment data is used only for portfolio tracking and analytics
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Compliance with applicable financial regulations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            6. Your Rights and Choices
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            You have the right to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Access and update your personal information
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Delete your account and associated data
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Opt out of non-essential communications
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Request a copy of your data
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>
            • Withdraw consent for data processing (where applicable)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            7. Cookies and Analytics
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We use cookies and similar technologies to improve your experience and analyze app usage. 
            You can control cookie preferences in your device settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            8. Children's Privacy
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Our service is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            9. International Data Transfers
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place for such transfers.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            10. Changes to This Policy
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We may update this privacy policy from time to time. We will notify you of any changes 
            by posting the new policy on this page and updating the "Last updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            11. Contact Us
          </Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            If you have any questions about this privacy policy, please contact us:
          </Text>
          
          <TouchableOpacity
            style={styles.contactLink}
            onPress={() => openExternalLink('mailto:privacy@murexstreams.com')}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              privacy@murexstreams.com
            </Text>
            <ExternalLink size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactLink}
            onPress={() => openExternalLink('https://murexstreams.com/privacy')}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              murexstreams.com/privacy
            </Text>
            <ExternalLink size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            By using Murex Streams, you agree to the collection and use of information in 
            accordance with this privacy policy.
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  lastUpdated: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginLeft: 8,
    marginBottom: 4,
  },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 8,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 32,
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PrivacyPolicy;