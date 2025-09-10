import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Info,
  Calculator,
  Lock,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const { width: screenWidth } = Dimensions.get('window');

interface Track {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  fundingGoal: number;
  currentFunding: number;
  expectedROI: number;
  minimumInvestment: number;
  totalShares: number;
  availableShares: number;
}

interface InvestmentModalProps {
  visible: boolean;
  onClose: () => void;
  track: Track | null;
  onInvest: (amount: number, shares: number) => void;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  visible,
  onClose,
  track,
  onInvest,
}) => {
  const { colors, spacing } = useTheme();
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRiskDisclosure, setShowRiskDisclosure] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setInvestmentAmount('');
      setIsProcessing(false);
      setShowRiskDisclosure(false);
      setAgreedToTerms(false);
    }
  }, [visible]);

  if (!track) return null;

  const amount = parseFloat(investmentAmount) || 0;
  const sharePrice = track.fundingGoal / track.totalShares;
  const shares = Math.floor(amount / sharePrice);
  const actualAmount = shares * sharePrice;
  const ownershipPercentage = (shares / track.totalShares) * 100;
  const projectedReturn = actualAmount * (track.expectedROI / 100);
  const totalReturn = actualAmount + projectedReturn;

  const isValidAmount = amount >= track.minimumInvestment && shares <= track.availableShares;
  const fundingProgress = (track.currentFunding / track.fundingGoal) * 100;

  const handleInvest = async () => {
    if (!isValidAmount || !agreedToTerms) return;

    try {
      setIsProcessing(true);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onInvest(actualAmount, shares);
      onClose();
      
      Alert.alert(
        'Investment Successful!',
        `You have successfully invested $${actualAmount.toFixed(2)} in "${track.title}" and acquired ${shares} shares.`
      );
    } catch (error) {
      Alert.alert('Investment Failed', 'Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderTrackInfo = () => (
    <View style={styles.trackInfo}>
      <Text style={[styles.trackTitle, { color: colors.text }]}>
        {track.title}
      </Text>
      <Text style={[styles.trackArtist, { color: colors.textSecondary }]}>
        by {track.artist}
      </Text>
      
      <View style={styles.fundingInfo}>
        <View style={styles.fundingRow}>
          <Text style={[styles.fundingLabel, { color: colors.textSecondary }]}>
            Funding Progress
          </Text>
          <Text style={[styles.fundingValue, { color: colors.text }]}>
            ${track.currentFunding.toLocaleString()} / ${track.fundingGoal.toLocaleString()}
          </Text>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${Math.min(fundingProgress, 100)}%`,
              }
            ]}
          />
        </View>
        
        <View style={styles.fundingStats}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {track.expectedROI}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Expected ROI
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {track.availableShares.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Shares Available
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              ${track.minimumInvestment}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Min. Investment
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderInvestmentCalculator = () => (
    <View style={styles.calculator}>
      <View style={styles.calculatorHeader}>
        <Calculator size={20} color={colors.primary} />
        <Text style={[styles.calculatorTitle, { color: colors.text }]}>
          Investment Calculator
        </Text>
      </View>
      
      <Input
        label="Investment Amount (USDC)"
        value={investmentAmount}
        onChangeText={setInvestmentAmount}
        placeholder={`Minimum $${track.minimumInvestment}`}
        keyboardType="numeric"
        leftIcon={<DollarSign size={16} color={colors.textSecondary} />}
        style={styles.amountInput}
      />
      
      {amount > 0 && (
        <View style={styles.calculationResults}>
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              Shares to acquire:
            </Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>
              {shares.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              Actual investment:
            </Text>
            <Text style={[styles.resultValue, { color: colors.text }]}>
              ${actualAmount.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              Ownership percentage:
            </Text>
            <Text style={[styles.resultValue, { color: colors.primary }]}>
              {ownershipPercentage.toFixed(3)}%
            </Text>
          </View>
          
          <View style={[styles.resultRow, styles.projectionRow]}>
            <View>
              <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                Projected return:
              </Text>
              <Text style={[styles.projectionNote, { color: colors.textSecondary }]}>
                Based on {track.expectedROI}% ROI
              </Text>
            </View>
            <View style={styles.projectionValues}>
              <Text style={[styles.projectionProfit, { color: colors.success }]}>
                +${projectedReturn.toFixed(2)}
              </Text>
              <Text style={[styles.projectionTotal, { color: colors.text }]}>
                ${totalReturn.toFixed(2)} total
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {amount > 0 && !isValidAmount && (
        <View style={styles.validationErrors}>
          {amount < track.minimumInvestment && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Minimum investment is ${track.minimumInvestment}
            </Text>
          )}
          {shares > track.availableShares && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Only {track.availableShares} shares available
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const renderRiskDisclosure = () => (
    <View style={styles.riskSection}>
      <TouchableOpacity
        style={styles.riskHeader}
        onPress={() => setShowRiskDisclosure(!showRiskDisclosure)}
        activeOpacity={0.7}
      >
        <AlertTriangle size={20} color={colors.warning} />
        <Text style={[styles.riskTitle, { color: colors.text }]}>
          Investment Risks & Terms
        </Text>
        <Text style={[styles.riskToggle, { color: colors.primary }]}>
          {showRiskDisclosure ? 'Hide' : 'Show'}
        </Text>
      </TouchableOpacity>
      
      {showRiskDisclosure && (
        <View style={styles.riskContent}>
          <Text style={[styles.riskText, { color: colors.textSecondary }]}>
            • Music investments are speculative and carry high risk
          </Text>
          <Text style={[styles.riskText, { color: colors.textSecondary }]}>
            • Returns are not guaranteed and depend on track performance
          </Text>
          <Text style={[styles.riskText, { color: colors.textSecondary }]}>
            • You may lose some or all of your investment
          </Text>
          <Text style={[styles.riskText, { color: colors.textSecondary }]}>
            • Investments are illiquid and may not be easily sold
          </Text>
          <Text style={[styles.riskText, { color: colors.textSecondary }]}>
            • Past performance does not guarantee future results
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.termsCheckbox}
        onPress={() => setAgreedToTerms(!agreedToTerms)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox,
          {
            backgroundColor: agreedToTerms ? colors.primary : 'transparent',
            borderColor: colors.primary,
          }
        ]}>
          {agreedToTerms && (
            <Text style={[styles.checkmark, { color: colors.background }]}>✓</Text>
          )}
        </View>
        <Text style={[styles.termsText, { color: colors.text }]}>
          I understand the risks and agree to the terms and conditions
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Invest in Track
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderTrackInfo()}
          {renderInvestmentCalculator()}
          {renderRiskDisclosure()}
        </ScrollView>
        
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Button
            title={isProcessing ? 'Processing...' : `Invest $${actualAmount.toFixed(2)}`}
            onPress={handleInvest}
            disabled={!isValidAmount || !agreedToTerms || isProcessing}
            leftIcon={isProcessing ? undefined : <Lock size={16} color={colors.background} />}
            style={styles.investButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  trackInfo: {
    marginBottom: 24,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 16,
    marginBottom: 16,
  },
  fundingInfo: {
    gap: 12,
  },
  fundingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fundingLabel: {
    fontSize: 14,
  },
  fundingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  fundingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  calculator: {
    marginBottom: 24,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountInput: {
    marginBottom: 16,
  },
  calculationResults: {
    gap: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  projectionRow: {
    alignItems: 'flex-start',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  projectionNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  projectionValues: {
    alignItems: 'flex-end',
  },
  projectionProfit: {
    fontSize: 14,
    fontWeight: '600',
  },
  projectionTotal: {
    fontSize: 12,
  },
  validationErrors: {
    marginTop: 12,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
  },
  riskSection: {
    marginBottom: 24,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  riskToggle: {
    fontSize: 12,
  },
  riskContent: {
    gap: 8,
    marginBottom: 16,
  },
  riskText: {
    fontSize: 12,
    lineHeight: 16,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  investButton: {
    width: '100%',
  },
});