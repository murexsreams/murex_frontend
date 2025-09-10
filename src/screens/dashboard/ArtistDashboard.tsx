import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Upload,
  TrendingUp,
  DollarSign,
  Music,
  Users,
  Settings,
  LogOut,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export const ArtistDashboard: React.FC = () => {
  const { colors, typography, spacing } = useTheme();
  const { user, logout } = useAuthStore();

  const statsData = [
    {
      title: 'Total Streams',
      value: '12.5K',
      icon: Music,
      color: colors.primary,
      change: '+15%',
    },
    {
      title: 'Total Raised',
      value: '$8,450',
      icon: DollarSign,
      color: colors.accent,
      change: '+23%',
    },
    {
      title: 'Revenue Available',
      value: '$2,340',
      icon: TrendingUp,
      color: colors.success,
      change: '+8%',
    },
    {
      title: 'Followers',
      value: '1,234',
      icon: Users,
      color: colors.primary,
      change: '+12%',
    },
  ];

  const recentTracks = [
    {
      id: '1',
      title: 'Midnight Dreams',
      genre: 'Electronic',
      streams: '2.1K',
      raised: '$1,200',
      goal: '$2,000',
      progress: 60,
    },
    {
      id: '2',
      title: 'Summer Vibes',
      genre: 'Pop',
      streams: '5.8K',
      raised: '$3,500',
      goal: '$3,500',
      progress: 100,
    },
    {
      id: '3',
      title: 'Urban Flow',
      genre: 'Hip-Hop',
      streams: '4.6K',
      raised: '$2,750',
      goal: '$4,000',
      progress: 69,
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

          {/* Quick Actions */}
          <Card style={styles.quickActionsCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              <Button
                title="Upload Music"
                onPress={() => {}}
                style={styles.actionButton}
              />
              <Button
                title="Withdraw Funds"
                onPress={() => {}}
                variant="secondary"
                style={styles.actionButton}
              />
            </View>
          </Card>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => (
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

          {/* Recent Tracks */}
          <Card style={styles.tracksCard}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Your Uploaded Songs
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            
            {recentTracks.map((track) => (
              <View key={track.id} style={styles.trackItem}>
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, { color: colors.text }]}>
                    {track.title}
                  </Text>
                  <Text style={[styles.trackGenre, { color: colors.textSecondary }]}>
                    {track.genre} • {track.streams} streams
                  </Text>
                </View>
                
                <View style={styles.trackStats}>
                  <Text style={[styles.trackRaised, { color: colors.primary }]}>
                    {track.raised} / {track.goal}
                  </Text>
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { backgroundColor: colors.border }
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: colors.primary,
                            width: `${track.progress}%`,
                          }
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                      {track.progress}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>

          {/* Upload New Track CTA */}
          <Card style={styles.ctaCard}>
            <Upload size={48} color={colors.primary} />
            <Text style={[styles.ctaTitle, { color: colors.text }]}>
              Ready to share your next hit?
            </Text>
            <Text style={[styles.ctaDescription, { color: colors.textSecondary }]}>
              Upload your music and start raising funds from your fans
            </Text>
            <Button
              title="Upload New Track"
              onPress={() => {}}
              style={styles.ctaButton}
            />
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
  tracksCard: {
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
  trackItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2D47',
  },
  trackInfo: {
    marginBottom: 8,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackGenre: {
    fontSize: 14,
  },
  trackStats: {
    alignItems: 'flex-end',
  },
  trackRaised: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    width: 100,
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    minWidth: 30,
  },
  ctaCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaButton: {
    minWidth: 200,
  },
});