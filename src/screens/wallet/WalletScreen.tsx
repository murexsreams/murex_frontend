import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Plus,
  Minus,
  BarChart3,
  Clock,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/ui/Button';

const { width: screenWidth } = Dimensions.get('window');

interface Investment {
  id: string;
  trackId: string;
  trackTitle: string;
  artist: string;
  investmentAmount: number;
  currentValue: number;
  shares: number;
  roi: number;
  status: 'active' | 'completed' | 'pending';
  investmentDate: string;
}

interface Transaction {
  id: string;
  type: 'investment' | 'withdrawal' | 'return' | 'deposit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const WalletScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'portfolio' | 'transactions'>('portfolio');

  // Mock data
  const walletBalance = 2847.50;
  const totalInvested = 5200.00;
  const totalReturns = 1247.50;
  const availableForWithdrawal = 847.50;
  const portfolioValue = 6447.50;
  const totalROI = 24.0;

  const investments: Investment[] = [
    {
      id: '1',
      trackId: 'track1',
      trackTitle: 'Midnight Dreams',
      artist: 'Luna Echo',
      investmentAmount: 1500,
      currentValue: 1890,
      shares: 150,
      roi: 26.0,
      status: 'active',
      investmentDate: '2024-01-15',
    },
    {
      id: '2',
      trackId: 'track2',
      trackTitle: 'Electric Pulse',
      artist: 'Neon Waves',
      investmentAmount: 2000,
      currentValue: 2340,
      shares: 200,
      roi: 17.0,
      status: 'active',
      investmentDate: '2024-01-20',
    },
    {
      id: '3',
      trackId: 'track3',
      trackTitle: 'Ocean Breeze',
      artist: 'Coastal Vibes',
      investmentAmount: 1700,
      currentValue: 2217.50,
      shares: 170,
      roi: 30.4,
      status: 'active',
      investmentDate: '2024-02-01',
    },
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'return',
      amount: 247.50,
      description: 'Returns from "Midnight Dreams"',
      date: '2024-02-28',
      status: 'completed',
    },
    {
      id: '2',
      type: 'investment',
      amount: -1700,
      description: 'Investment in "Ocean Breeze"',
      date: '2024-02-01',
      status: 'completed',
    },
    {
      id: '3',
      type: 'deposit',
      amount: 1000,
      description: 'Wallet deposit via bank transfer',
      date: '2024-01-30',
      status: 'completed',
    },
    {
      id: '4',
      type: 'withdrawal',
      amount: -500,
      description: 'Withdrawal to bank account',
      date: '2024-01-25',
      status: 'completed',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const renderWalletHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.primary + '80']}
      style={styles.walletHeader}
    >
      <View style={styles.balanceSection}>
        <View style={styles.balanceRow}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
            <View style={styles.balanceAmount}>
              <Text style={styles.balanceValue}>
                {balanceVisible ? `$${portfolioValue.toLocaleString()}` : '••••••'}
              </Text>
              <TouchableOpacity
                onPress={() => setBalanceVisible(!balanceVisible)}
                style={styles.visibilityToggle}
              >
                {balanceVisible ? (
                  <Eye size={20} color={colors.background} />
                ) : (
                  <EyeOff size={20} color={colors.background} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.roiIndicator}>
            <TrendingUp size={16} color={colors.background} />
            <Text style={styles.roiText}>+{totalROI}%</Text>
          </View>
        </View>

        <View style={styles.walletStats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              ${balanceVisible ? walletBalance.toLocaleString() : '••••'}
            </Text>
            <Text style={styles.statLabel}>Available Balance</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              ${balanceVisible ? totalReturns.toLocaleString() : '••••'}
            </Text>
            <Text style={styles.statLabel}>Total Returns</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              ${balanceVisible ? availableForWithdrawal.toLocaleString() : '••••'}
            </Text>
            <Text style={styles.statLabel}>Available to Withdraw</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Button
          title="Deposit"
          onPress={() => {/* TODO: Implement deposit */}}
          variant="secondary"
          leftIcon={<Plus size={16} color={colors.primary} />}
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          textStyle={{ color: colors.primary }}
        />
        <Button
          title="Withdraw"
          onPress={() => {/* TODO: Implement withdrawal */}}
          variant="secondary"
          leftIcon={<Minus size={16} color={colors.primary} />}
          style={[styles.actionButton, { backgroundColor: colors.background }]}
          textStyle={{ color: colors.primary }}
        />
      </View>
    </LinearGradient>
  );

  const renderTabSelector = () => (
    <View style={[styles.tabSelector, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'portfolio' && { backgroundColor: colors.primary }
        ]}
        onPress={() => setSelectedTab('portfolio')}
      >
        <BarChart3 size={16} color={selectedTab === 'portfolio' ? colors.background : colors.textSecondary} />
        <Text style={[
          styles.tabText,
          { color: selectedTab === 'portfolio' ? colors.background : colors.textSecondary }
        ]}>
          Portfolio
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'transactions' && { backgroundColor: colors.primary }
        ]}
        onPress={() => setSelectedTab('transactions')}
      >
        <Clock size={16} color={selectedTab === 'transactions' ? colors.background : colors.textSecondary} />
        <Text style={[
          styles.tabText,
          { color: selectedTab === 'transactions' ? colors.background : colors.textSecondary }
        ]}>
          Transactions
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInvestmentCard = (investment: Investment) => (
    <TouchableOpacity
      key={investment.id}
      style={[styles.investmentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.investmentHeader}>
        <View style={styles.investmentInfo}>
          <Text style={[styles.trackTitle, { color: colors.text }]} numberOfLines={1}>
            {investment.trackTitle}
          </Text>
          <Text style={[styles.artistName, { color: colors.textSecondary }]}>
            by {investment.artist}
          </Text>
        </View>
        <View style={styles.investmentStatus}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: investment.status === 'active' ? colors.success : colors.warning }
          ]} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {investment.status}
          </Text>
        </View>
      </View>

      <View style={styles.investmentMetrics}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Invested
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            ${investment.investmentAmount.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Current Value
          </Text>
          <Text style={[styles.metricValue, { color: colors.text }]}>
            ${investment.currentValue.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            ROI
          </Text>
          <View style={styles.roiMetric}>
            {investment.roi >= 0 ? (
              <TrendingUp size={12} color={colors.success} />
            ) : (
              <TrendingDown size={12} color={colors.error} />
            )}
            <Text style={[
              styles.metricValue,
              { color: investment.roi >= 0 ? colors.success : colors.error }
            ]}>
              {investment.roi >= 0 ? '+' : ''}{investment.roi.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.investmentFooter}>
        <Text style={[styles.sharesText, { color: colors.textSecondary }]}>
          {investment.shares} shares • Invested {new Date(investment.investmentDate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTransactionItem = (transaction: Transaction) => {
    const isPositive = transaction.amount > 0;
    const icon = transaction.type === 'investment' ? ArrowDownLeft :
                 transaction.type === 'withdrawal' ? ArrowDownLeft :
                 transaction.type === 'deposit' ? ArrowUpRight : TrendingUp;
    
    return (
      <View
        key={transaction.id}
        style={[styles.transactionItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={[
          styles.transactionIcon,
          { backgroundColor: isPositive ? colors.success + '20' : colors.error + '20' }
        ]}>
          {React.createElement(icon, {
            size: 16,
            color: isPositive ? colors.success : colors.error
          })}
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionDescription, { color: colors.text }]} numberOfLines={1}>
            {transaction.description}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {new Date(transaction.date).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText,
            { color: isPositive ? colors.success : colors.text }
          ]}>
            {isPositive ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
          </Text>
          <View style={[
            styles.transactionStatus,
            { backgroundColor: transaction.status === 'completed' ? colors.success : colors.warning }
          ]}>
            <Text style={[styles.statusLabel, { color: colors.background }]}>
              {transaction.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPortfolio = () => (
    <View style={styles.portfolioSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Investments
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          {investments.length} active investments
        </Text>
      </View>
      
      {investments.map(renderInvestmentCard)}
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.transactionsSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Transactions
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Last 30 days
        </Text>
      </View>
      
      {transactions.map(renderTransactionItem)}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderWalletHeader()}
        {renderTabSelector()}
        
        <View style={styles.content}>
          {selectedTab === 'portfolio' ? renderPortfolio() : renderTransactions()}
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
  walletHeader: {
    padding: 20,
    paddingTop: 60,
  },
  balanceSection: {
    marginBottom: 24,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceValue: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
  },
  visibilityToggle: {
    padding: 4,
  },
  roiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roiText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  walletStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  tabSelector: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  portfolioSection: {
    gap: 16,
  },
  investmentCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  investmentInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 14,
  },
  investmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  investmentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  roiMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  investmentFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  sharesText: {
    fontSize: 12,
  },
  transactionsSection: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});