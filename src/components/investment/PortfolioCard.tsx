import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Play,
  Share,
  BarChart3,
  Calendar,
  Users,
  DollarSign,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';

const { width: screenWidth } = Dimensions.get('window');

interface Investment {
  id: string;
  trackId: string;
  trackTitle: string;
  artist: string;
  coverArt: string;
  investmentAmount: number;
  currentValue: number;
  shares: number;
  totalShares: number;
  roi: number;
  dailyChange: number;
  status: 'active' | 'completed' | 'pending';
  investmentDate: string;
  lastUpdate: string;
  streamCount: number;
  monthlyReturns: number[];
}

interface PortfolioCardProps {
  investment: Investment;
  onPress?: () => void;
  onPlayTrack?: () => void;
  onShare?: () => void;
  onViewDetails?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  investment,
  onPress,
  onPlayTrack,
  onShare,
  onViewDetails,
  showActions = true,
  compact = false,
}) => {
  const { colors, spacing } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const ownershipPercentage = (investment.shares / investment.totalShares) * 100;
  const profitLoss = investment.currentValue - investment.investmentAmount;
  const isProfit = profitLoss >= 0;

  const handleMenuPress = () => {
    Alert.alert(
      'Investment Actions',
      'Choose an action for this investment:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: onViewDetails },
        { text: 'Share Investment', onPress: onShare },
        { text: 'View Performance Chart', onPress: () => {/* TODO */} },
      ]
    );
  };

  const renderMiniChart = () => {
    const chartData = investment.monthlyReturns.slice(-6); // Last 6 months
    const maxValue = Math.max(...chartData);
    const minValue = Math.min(...chartData);
    const range = maxValue - minValue || 1;

    return (
      <View style={styles.miniChart}>
        {chartData.map((value, index) => {
          const height = ((value - minValue) / range) * 30 + 5;
          const isLast = index === chartData.length - 1;
          return (
            <View
              key={index}
              style={[
                styles.chartBar,
                {
                  height,
                  backgroundColor: isLast ? colors.primary : colors.primary + '60',
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  const renderCompactCard = () => (
    <TouchableOpacity
      style={[styles.compactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: investment.coverArt }}
        style={styles.compactCoverArt}
        resizeMode="cover"
      />
      
      <View style={styles.compactInfo}>
        <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
          {investment.trackTitle}
        </Text>
        <Text style={[styles.compactArtist, { color: colors.textSecondary }]} numberOfLines={1}>
          {investment.artist}
        </Text>
        
        <View style={styles.compactMetrics}>
          <Text style={[styles.compactValue, { color: colors.text }]}>
            ${investment.currentValue.toLocaleString()}
          </Text>
          <View style={styles.compactROI}>
            {isProfit ? (
              <TrendingUp size={12} color={colors.success} />
            ) : (
              <TrendingDown size={12} color={colors.error} />
            )}
            <Text style={[
              styles.compactROIText,
              { color: isProfit ? colors.success : colors.error }
            ]}>
              {isProfit ? '+' : ''}{investment.roi.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFullCard = () => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[colors.surface, colors.background + '40']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.trackInfo}>
            <Image
              source={{ uri: investment.coverArt }}
              style={[styles.coverArt, { borderColor: colors.border }]}
              resizeMode="cover"
            />
            
            <View style={styles.trackDetails}>
              <Text style={[styles.trackTitle, { color: colors.text }]} numberOfLines={1}>
                {investment.trackTitle}
              </Text>
              <Text style={[styles.artistName, { color: colors.textSecondary }]}>
                by {investment.artist}
              </Text>
              
              <View style={styles.statusRow}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: investment.status === 'active' ? colors.success : colors.warning }
                ]} />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                  {investment.status}
                </Text>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                  • {new Date(investment.investmentDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {showActions && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
              activeOpacity={0.7}
            >
              <MoreVertical size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.metricsSection}>
          <View style={styles.primaryMetrics}>
            <View style={styles.valueSection}>
              <Text style={[styles.currentValue, { color: colors.text }]}>
                ${investment.currentValue.toLocaleString()}
              </Text>
              <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>
                Current Value
              </Text>
            </View>
            
            <View style={styles.performanceSection}>
              <View style={styles.roiContainer}>
                {isProfit ? (
                  <TrendingUp size={16} color={colors.success} />
                ) : (
                  <TrendingDown size={16} color={colors.error} />
                )}
                <Text style={[
                  styles.roiValue,
                  { color: isProfit ? colors.success : colors.error }
                ]}>
                  {isProfit ? '+' : ''}{investment.roi.toFixed(1)}%
                </Text>
              </View>
              
              <Text style={[
                styles.profitLoss,
                { color: isProfit ? colors.success : colors.error }
              ]}>
                {isProfit ? '+' : ''}${profitLoss.toFixed(2)}
              </Text>
              
              <Text style={[styles.dailyChange, { color: colors.textSecondary }]}>
                {investment.dailyChange >= 0 ? '+' : ''}{investment.dailyChange.toFixed(2)}% today
              </Text>
            </View>
          </View>

          <View style={styles.secondaryMetrics}>
            <View style={styles.metric}>
              <DollarSign size={14} color={colors.textSecondary} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Invested
              </Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                ${investment.investmentAmount.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.metric}>
              <Users size={14} color={colors.textSecondary} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Ownership
              </Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {ownershipPercentage.toFixed(2)}%
              </Text>
            </View>
            
            <View style={styles.metric}>
              <BarChart3 size={14} color={colors.textSecondary} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Streams
              </Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {investment.streamCount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              6-Month Performance
            </Text>
            {renderMiniChart()}
          </View>
        </View>

        {showActions && (
          <View style={styles.actionButtons}>
            <Button
              title="Play"
              onPress={onPlayTrack}
              variant="outline"
              leftIcon={<Play size={14} color={colors.text} />}
              style={styles.actionButton}
              textStyle={{ fontSize: 12 }}
            />
            
            <Button
              title="Details"
              onPress={onViewDetails}
              variant="outline"
              leftIcon={<BarChart3 size={14} color={colors.text} />}
              style={styles.actionButton}
              textStyle={{ fontSize: 12 }}
            />
            
            <Button
              title="Share"
              onPress={onShare}
              variant="outline"
              leftIcon={<Share size={14} color={colors.text} />}
              style={styles.actionButton}
              textStyle={{ fontSize: 12 }}
            />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return compact ? renderCompactCard() : renderFullCard();
};

const styles = StyleSheet.create({
  // Compact card styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  compactCoverArt: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactArtist: {
    fontSize: 12,
    marginBottom: 6,
  },
  compactMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactROI: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactROIText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Full card styles
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trackInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  coverArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  menuButton: {
    padding: 4,
  },
  metricsSection: {
    marginBottom: 16,
  },
  primaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  valueSection: {
    flex: 1,
  },
  currentValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  valueLabel: {
    fontSize: 12,
  },
  performanceSection: {
    alignItems: 'flex-end',
  },
  roiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  roiValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  profitLoss: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  dailyChange: {
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
  metricLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartSection: {
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 35,
  },
  chartBar: {
    width: 4,
    borderRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
  },
});