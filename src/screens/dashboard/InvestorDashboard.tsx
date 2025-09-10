import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  Music,
  Settings,
  LogOut,
  Play,
  Heart,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export const InvestorDashboard: React.FC = () => {
  const { colors, typography, spacing } = useTheme();
  const { user, logout } = useAuthStore();

  const portfolioStats = [
    {
      title: 'Portfolio Value',
      value: '$12,450',
      icon: DollarSign,
      color: colors.primary,
      change: '+18%',
    },
    {
      title: 'Total Invested',
      value: '$8,200',
      icon: Wallet,
      color: colors.accent,
      change: '+5%',
    },
    {
      title: 'Total Returns',
      value: '$4,250',
      icon: TrendingUp,
      color: colors.success,
      change: '+52%',
    },
    {
      title: 'Active Investments',
      value: '23',
      icon: Music,
      color: colors.primary,
      change: '+3',
    },
  ];

  const trendingTracks = [
    {
      id: '1',
      title: 'Electric Nights',
      artist: 'DJ Nova',
      genre: 'Electronic',
      coverArt: 'https://via.placeholder.com/60x60/FFD700/000000?text=EN',
      fundingProgress: 85,
      raised: '$4,250',
      goal: '$5,000',
      estimatedROI: '15%',
      streams: '8.2K',
    },
    {
      id: '2',
      title: 'Sunset Dreams',
      artist: 'Luna Rose',
      genre: 'Indie Pop',
      coverArt: 'https://via.placeholder.com/60x60/6B3FC9/FFFFFF?text=SD',
      fundingProgress: 92,
      raised: '$2,760',
      goal: '$3,000',
      estimatedROI: '22%',
      streams: '12.5K',
    },
    {
      id: '3',
      title: 'Urban Pulse',
      artist: 'MC Flow',
      genre: 'Hip-Hop',
      coverArt: 'https://via.placeholder.com/60x60/00FFFF/000000?text=UP',
      fundingProgress: 67,
      raised: '$2,010',
      goal: '$3,000',
      estimatedROI: '18%',
      streams: '5.8K',
    },
  ];

  const myInvestments = [
    {
      id: '1',
      title: 'Midnight Jazz',
      artist: 'Sarah Blues',
      invested: '$500',
      currentValue: '$650',
      roi: '+30%',
      status: 'active',
    },
    {
      id: '2',
      title: 'Rock Anthem',
      artist: 'Thunder Band',
      invested: '$300',
      currentValue: '$420',
      roi: '+40%',
      status: 'active',
    },
    {
      id: '3',
      title: 'Chill Vibes',
      artist: 'Zen Master',
      invested: '$750',
      currentValue: '$825',
      roi: '+10%',
      status: 'completed',
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                Welcome back,
              </Text>
              <Text style={[styles.username, { color: colors.text }]}>
                {user?.username}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <ThemeToggle />
              <TouchableOpacity style={styles.headerButton}>
                <Settings size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
                <LogOut size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Portfolio Stats */}
          <View style={styles.statsGrid}>
            {portfolioStats.map((stat, index) => (
              <Card key={index} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <stat.icon size={24} color={stat.color} />
                  <Text style={[styles.statChange, { color: colors.success }]}>
                    {stat.change}
                  </Text>
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stat.value}
                </Text>
                <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                  {stat.title}
                </Text>
              </Card>
            ))}
          </View>

          {/* Quick Actions */}
          <Card style={styles.quickActionsCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              <Button
                title="Explore Tracks"
                onPress={() => {}}
                style={styles.actionButton}
              />
              <Button
                title="Withdraw Profits"
                onPress={() => {}}
                variant="secondary"
                style={styles.actionButton}
              />
            </View>
          </Card>

          {/* Trending Tracks */}
          <Card style={styles.trendingCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Trending Tracks
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            
            {trendingTracks.map((track) => (
              <View key={track.id} style={styles.trackCard}>
                <View style={styles.trackHeader}>
                  <Image
                    source={{ uri: track.coverArt }}
                    style={styles.coverArt}
                  />
                  <View style={styles.trackInfo}>
                    <Text style={[styles.trackTitle, { color: colors.text }]}>
                      {track.title}
                    </Text>
                    <Text style={[styles.trackArtist, { color: colors.textSecondary }]}>
                      {track.artist} • {track.genre}
                    </Text>
                    <Text style={[styles.trackStreams, { color: colors.textSecondary }]}>
                      {track.streams} streams
                    </Text>
                  </View>
                  <View style={styles.trackActions}>
                    <TouchableOpacity style={styles.playButton}>
                      <Play size={16} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.likeButton}>
                      <Heart size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.fundingInfo}>
                  <View style={styles.fundingProgress}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.fundingText, { color: colors.textSecondary }]}>
                        {track.raised} / {track.goal}
                      </Text>
                      <Text style={[styles.roiText, { color: colors.primary }]}>
                        Est. ROI: {track.estimatedROI}
                      </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: colors.primary,
                            width: `${track.fundingProgress}%`,
                          }
                        ]}
                      />
                    </View>
                  </View>
                  <Button
                    title="Invest Now"
                    onPress={() => {}}
                    size="sm"
                    style={styles.investButton}
                  />
                </View>
              </View>
            ))}
          </Card>

          {/* My Investments */}
          <Card style={styles.investmentsCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                My Investments
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  View Portfolio
                </Text>
              </TouchableOpacity>
            </View>
            
            {myInvestments.map((investment) => (
              <View key={investment.id} style={styles.investmentItem}>
                <View style={styles.investmentInfo}>
                  <Text style={[styles.investmentTitle, { color: colors.text }]}>
                    {investment.title}
                  </Text>
                  <Text style={[styles.investmentArtist, { color: colors.textSecondary }]}>
                    {investment.artist}
                  </Text>
                </View>
                
                <View style={styles.investmentStats}>
                  <Text style={[styles.investmentValue, { color: colors.text }]}>
                    {investment.currentValue}
                  </Text>
                  <Text style={[styles.investmentRoi, { color: colors.success }]}>
                    {investment.roi}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: investment.status === 'active' ? colors.primary + '20' : colors.success + '20'
                    }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      {
                        color: investment.status === 'active' ? colors.primary : colors.success
                      }
                    ]}>
                      {investment.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
  },
  quickActionsCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  trendingCard: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  trackCard: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2D47',
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coverArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    marginBottom: 2,
  },
  trackStreams: {
    fontSize: 12,
  },
  trackActions: {
    flexDirection: 'row',
    gap: 8,
  },
  playButton: {
    padding: 8,
  },
  likeButton: {
    padding: 8,
  },
  fundingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fundingProgress: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fundingText: {
    fontSize: 12,
  },
  roiText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  investButton: {
    minWidth: 80,
  },
  investmentsCard: {
    marginBottom: 24,
  },
  investmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2D47',
  },
  investmentInfo: {
    flex: 1,
  },
  investmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  investmentArtist: {
    fontSize: 14,
  },
  investmentStats: {
    alignItems: 'flex-end',
  },
  investmentValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  investmentRoi: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});