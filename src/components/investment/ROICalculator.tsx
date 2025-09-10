import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  BarChart3,
  DollarSign,
  Calendar,
  Target,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../ui/Input';

const { width: screenWidth } = Dimensions.get('window');

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  fundingGoal: number;
  currentFunding: number;
  totalShares: number;
  availableShares: number;
  minimumInvestment: number;
  historicalData?: {
    averageStreamsPerMonth: number;
    revenuePerStream: number;
    growthRate: number;
  };
}

interface ROIProjection {
  timeframe: '3m' | '6m' | '1y' | '2y' | '5y';
  projectedStreams: number;
  projectedRevenue: number;
  investorShare: number;
  roi: number;
  totalReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ROICalculatorProps {
  track: Track;
  investmentAmount: number;
  onInvestmentChange?: (amount: number) => void;
}

export const ROICalculator: React.FC<ROICalculatorProps> = ({
  track,
  investmentAmount,
  onInvestmentChange,
}) => {
  const { colors, spacing } = useTheme();
  const [amount, setAmount] = useState(investmentAmount.toString());
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3m' | '6m' | '1y' | '2y' | '5y'>('1y');

  // Default historical data if not provided
  const historicalData = track.historicalData || {
    averageStreamsPerMonth: 50000,
    revenuePerStream: 0.004, // $0.004 per stream
    growthRate: 0.15, // 15% monthly growth
  };

  useEffect(() => {
    setAmount(investmentAmount.toString());
  }, [investmentAmount]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numValue = parseFloat(value) || 0;
    onInvestmentChange?.(numValue);
  };

  const calculateProjections = (): ROIProjection[] => {
    const investment = parseFloat(amount) || 0;
    if (investment === 0) return [];

    const sharePrice = track.fundingGoal / track.totalShares;
    const shares = Math.floor(investment / sharePrice);
    const ownershipPercentage = shares / track.totalShares;

    const timeframes: Array<{ period: '3m' | '6m' | '1y' | '2y' | '5y'; months: number }> = [
      { period: '3m', months: 3 },
      { period: '6m', months: 6 },
      { period: '1y', months: 12 },
      { period: '2y', months: 24 },
      { period: '5y', months: 60 },
    ];

    return timeframes.map(({ period, months }) => {
      // Calculate projected streams with growth
      let totalStreams = 0;
      let currentMonthlyStreams = historicalData.averageStreamsPerMonth;
      
      for (let month = 1; month <= months; month++) {
        totalStreams += currentMonthlyStreams;
        // Apply growth rate with diminishing returns over time
        const growthFactor = Math.max(0.02, historicalData.growthRate * Math.pow(0.95, month));
        currentMonthlyStreams *= (1 + growthFactor);
      }

      const projectedRevenue = totalStreams * historicalData.revenuePerStream;
      const investorShare = projectedRevenue * ownershipPercentage;
      const roi = ((investorShare - investment) / investment) * 100;
      const totalReturn = investment + investorShare;

      // Determine risk level based on timeframe and ROI
      let riskLevel: 'low' | 'medium' | 'high' = 'medium';
      if (months <= 6) riskLevel = 'high';
      else if (months >= 24) riskLevel = 'low';
      else riskLevel = 'medium';

      return {
        timeframe: period,
        projectedStreams: Math.round(totalStreams),
        projectedRevenue: projectedRevenue,
        investorShare: investorShare,
        roi: roi,
        totalReturn: totalReturn,
        riskLevel,
      };
    });
  };

  const projections = calculateProjections();
  const selectedProjection = projections.find(p => p.timeframe === selectedTimeframe);

  const renderTimeframeSelector = () => (
    <View style={styles.timeframeSelector}>
      <Text style={[styles.selectorTitle, { color: colors.text }]}>
        Projection Timeframe
      </Text>
      <View style={styles.timeframeButtons}>
        {projections.map((projection) => (
          <TouchableOpacity
            key={projection.timeframe}
            style={[
              styles.timeframeButton,
              {
                backgroundColor: selectedTimeframe === projection.timeframe 
                  ? colors.primary 
                  : colors.surface,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setSelectedTimeframe(projection.timeframe)}
          >
            <Text style={[
              styles.timeframeText,
              {
                color: selectedTimeframe === projection.timeframe 
                  ? colors.background 
                  : colors.text
              }
            ]}>
              {projection.timeframe.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderProjectionCard = (projection: ROIProjection) => {
    const isPositive = projection.roi >= 0;
    const riskColor = projection.riskLevel === 'low' ? colors.success :
                     projection.riskLevel === 'medium' ? colors.warning : colors.error;

    return (
      <View style={[styles.projectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <LinearGradient
          colors={[colors.surface, colors.background + '40']}
          style={styles.projectionGradient}
        >
          <View style={styles.projectionHeader}>
            <View style={styles.timeframeInfo}>
              <Text style={[styles.projectionTimeframe, { color: colors.text }]}>
                {projection.timeframe.toUpperCase()} Projection
              </Text>
              <View style={[styles.riskBadge, { backgroundColor: riskColor + '20' }]}>
                <Text style={[styles.riskText, { color: riskColor }]}>
                  {projection.riskLevel.toUpperCase()} RISK
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.projectionMetrics}>
            <View style={styles.primaryMetric}>
              <View style={styles.roiContainer}>
                {isPositive ? (
                  <TrendingUp size={20} color={colors.success} />
                ) : (
                  <TrendingDown size={20} color={colors.error} />
                )}
                <Text style={[
                  styles.roiValue,
                  { color: isPositive ? colors.success : colors.error }
                ]}>
                  {isPositive ? '+' : ''}{projection.roi.toFixed(1)}%
                </Text>
              </View>
              <Text style={[styles.roiLabel, { color: colors.textSecondary }]}>
                Return on Investment
              </Text>
            </View>

            <View style={styles.secondaryMetrics}>
              <View style={styles.metric}>
                <DollarSign size={16} color={colors.primary} />
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  ${projection.totalReturn.toFixed(2)}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Total Return
                </Text>
              </View>

              <View style={styles.metric}>
                <Target size={16} color={colors.primary} />
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  ${projection.investorShare.toFixed(2)}
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Your Share
                </Text>
              </View>

              <View style={styles.metric}>
                <BarChart3 size={16} color={colors.primary} />
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {(projection.projectedStreams / 1000).toFixed(0)}K
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Est. Streams
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.projectionDetails}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Projected Revenue:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                ${projection.projectedRevenue.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Revenue per Stream:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                ${historicalData.revenuePerStream.toFixed(4)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Monthly Growth Rate:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {(historicalData.growthRate * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderRiskFactors = () => (
    <View style={styles.riskSection}>
      <View style={styles.riskHeader}>
        <AlertTriangle size={20} color={colors.warning} />
        <Text style={[styles.riskTitle, { color: colors.text }]}>
          Risk Factors & Assumptions
        </Text>
      </View>
      
      <View style={styles.riskFactors}>
        <Text style={[styles.riskFactor, { color: colors.textSecondary }]}>
          • Projections based on historical streaming data and industry averages
        </Text>
        <Text style={[styles.riskFactor, { color: colors.textSecondary }]}>
          • Actual performance may vary significantly from projections
        </Text>
        <Text style={[styles.riskFactor, { color: colors.textSecondary }]}>
          • Music industry trends and platform changes can affect returns
        </Text>
        <Text style={[styles.riskFactor, { color: colors.textSecondary }]}>
          • Growth rates typically diminish over time
        </Text>
        <Text style={[styles.riskFactor, { color: colors.textSecondary }]}>
          • Revenue sharing may change based on platform policies
        </Text>
      </View>
    </View>
  );

  const renderAssumptions = () => (
    <View style={styles.assumptionsSection}>
      <View style={styles.assumptionsHeader}>
        <Info size={20} color={colors.primary} />
        <Text style={[styles.assumptionsTitle, { color: colors.text }]}>
          Calculation Assumptions
        </Text>
      </View>
      
      <View style={styles.assumptions}>
        <View style={styles.assumption}>
          <Text style={[styles.assumptionLabel, { color: colors.textSecondary }]}>
            Base Monthly Streams:
          </Text>
          <Text style={[styles.assumptionValue, { color: colors.text }]}>
            {historicalData.averageStreamsPerMonth.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.assumption}>
          <Text style={[styles.assumptionLabel, { color: colors.textSecondary }]}>
            Revenue per Stream:
          </Text>
          <Text style={[styles.assumptionValue, { color: colors.text }]}>
            ${historicalData.revenuePerStream.toFixed(4)}
          </Text>
        </View>
        
        <View style={styles.assumption}>
          <Text style={[styles.assumptionLabel, { color: colors.textSecondary }]}>
            Initial Growth Rate:
          </Text>
          <Text style={[styles.assumptionValue, { color: colors.text }]}>
            {(historicalData.growthRate * 100).toFixed(1)}% monthly
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Calculator size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          ROI Calculator
        </Text>
      </View>

      <Input
        label="Investment Amount (USDC)"
        value={amount}
        onChangeText={handleAmountChange}
        placeholder="Enter amount"
        keyboardType="numeric"
        leftIcon={<DollarSign size={16} color={colors.textSecondary} />}
        style={styles.amountInput}
      />

      {projections.length > 0 && (
        <>
          {renderTimeframeSelector()}
          
          {selectedProjection && renderProjectionCard(selectedProjection)}
          
          <View style={styles.allProjections}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              All Timeframes
            </Text>
            {projections.map((projection) => (
              <View
                key={projection.timeframe}
                style={[styles.projectionRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.projectionTimeframeSmall, { color: colors.text }]}>
                  {projection.timeframe.toUpperCase()}
                </Text>
                <Text style={[
                  styles.projectionROI,
                  { color: projection.roi >= 0 ? colors.success : colors.error }
                ]}>
                  {projection.roi >= 0 ? '+' : ''}{projection.roi.toFixed(1)}%
                </Text>
                <Text style={[styles.projectionReturn, { color: colors.text }]}>
                  ${projection.totalReturn.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {renderAssumptions()}
          {renderRiskFactors()}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  amountInput: {
    marginBottom: 24,
  },
  timeframeSelector: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeframeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  projectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  projectionGradient: {
    padding: 16,
  },
  projectionHeader: {
    marginBottom: 16,
  },
  timeframeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectionTimeframe: {
    fontSize: 16,
    fontWeight: '600',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600',
  },
  projectionMetrics: {
    marginBottom: 16,
  },
  primaryMetric: {
    alignItems: 'center',
    marginBottom: 16,
  },
  roiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  roiValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  roiLabel: {
    fontSize: 12,
  },
  secondaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  projectionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  allProjections: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  projectionTimeframeSmall: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  projectionROI: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  projectionReturn: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  assumptionsSection: {
    marginBottom: 24,
  },
  assumptionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  assumptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  assumptions: {
    gap: 8,
  },
  assumption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assumptionLabel: {
    fontSize: 12,
  },
  assumptionValue: {
    fontSize: 12,
    fontWeight: '600',
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
  },
  riskFactors: {
    gap: 6,
  },
  riskFactor: {
    fontSize: 12,
    lineHeight: 16,
  },
});