import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Edit3,
  Settings,
  Music,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Award,
  BarChart3,
  Play,
  Share,
  MoreVertical,
} from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { FollowButton } from '../../components/social/FollowButton';
import { ShareButton } from '../../components/social/ShareButton';

const { width: screenWidth } = Dimensions.get('window');

interface UserStats {
  totalTracks: number;
  totalStreams: number;
  totalEarnings: number;
  totalInvestments: number;
  followers: number;
  following: number;
  joinDate: string;
}

interface Track {
  id: string;
  title: string;
  coverArt: string;
  streams: number;
  earnings: number;
  likes: number;
  releaseDate: string;
  status: 'published' | 'draft' | 'pending';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ProfileScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const user = useAuthStore(state => state.user);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'tracks' | 'stats' | 'achievements'>('tracks');
  const [isOwnProfile, setIsOwnProfile] = useState(true); // In real app, this would be determined by route params

  // Mock data - in real app, this would come from API
  const userStats: UserStats = {
    totalTracks: 12,
    totalStreams: 2847392,
    totalEarnings: 8542.30,
    totalInvestments: 15600.00,
    followers: 1247,
    following: 89,
    joinDate: '2023-06-15',
  };

  const userTracks: Track[] = [
    {
      id: '1',
      title: 'Midnight Dreams',
      coverArt: 'https://picsum.photos/300/300?random=1',
      streams: 847392,
      earnings: 2542.30,
      likes: 1247,
      releaseDate: '2024-01-15',
      status: 'published',
    },
    {
      id: '2',
      title: 'Electric Pulse',
      coverArt: 'https://picsum.photos/300/300?random=2',
      streams: 623847,
      earnings: 1876.54,
      likes: 892,
      releaseDate: '2024-02-01',
      status: 'published',
    },
    {
      id: '3',
      title: 'Ocean Breeze',
      coverArt: 'https://picsum.photos/300/300?random=3',
      streams: 456123,
      earnings: 1368.37,
      likes: 634,
      releaseDate: '2024-02-15',
      status: 'published',
    },
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Track',
      description: 'Published your first track',
      icon: '🎵',
      unlockedAt: '2023-06-20',
      rarity: 'common',
    },
    {
      id: '2',
      title: 'Viral Hit',
      description: 'Reached 1M streams on a single track',
      icon: '🔥',
      unlockedAt: '2024-01-20',
      rarity: 'epic',
    },
    {
      id: '3',
      title: 'Top Earner',
      description: 'Earned over $5,000 in a month',
      icon: '💰',
      unlockedAt: '2024-02-01',
      rarity: 'rare',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality coming soon!');
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'Settings functionality coming soon!');
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={[colors.primary, colors.primary + '80']}
      style={styles.profileHeader}
    >
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.background }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          
          {isOwnProfile && (
            <TouchableOpacity
              style={[styles.editAvatarButton, { backgroundColor: colors.background }]}
              onPress={handleEditProfile}
            >
              <Edit3 size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.username}>
            {user?.username || 'Unknown User'}
          </Text>
          <Text style={styles.userRole}>
            {user?.role === 'artist' ? '🎵 Artist' : '💰 Investor'}
          </Text>
          <Text style={styles.joinDate}>
            Joined {new Date(userStats.joinDate).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {isOwnProfile ? (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleSettings}
            >
              <Settings size={20} color={colors.background} />
            </TouchableOpacity>
          ) : (
            <View style={styles.socialActions}>
              <FollowButton
                artistId={user?.id || ''}
                size="small"
                variant="outline"
              />
              <ShareButton
                trackId=""
                trackTitle={`${user?.username}'s Profile`}
                artistName={user?.username || ''}
                variant="icon"
                size="small"
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {userStats.followers.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {userStats.following.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {userStats.totalTracks}
          </Text>
          <Text style={styles.statLabel}>Tracks</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {(userStats.totalStreams / 1000000).toFixed(1)}M
          </Text>
          <Text style={styles.statLabel}>Streams</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderTabSelector = () => (
    <View style={[styles.tabSelector, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'tracks' && { backgroundColor: colors.primary }
        ]}
        onPress={() => setSelectedTab('tracks')}
      >
        <Music size={16} color={selectedTab === 'tracks' ? colors.background : colors.textSecondary} />
        <Text style={[
          styles.tabText,
          { color: selectedTab === 'tracks' ? colors.background : colors.textSecondary }
        ]}>
          Tracks
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'stats' && { backgroundColor: colors.primary }
        ]}
        onPress={() => setSelectedTab('stats')}
      >
        <BarChart3 size={16} color={selectedTab === 'stats' ? colors.background : colors.textSecondary} />
        <Text style={[
          styles.tabText,
          { color: selectedTab === 'stats' ? colors.background : colors.textSecondary }
        ]}>
          Stats
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          selectedTab === 'achievements' && { backgroundColor: colors.primary }
        ]}
        onPress={() => setSelectedTab('achievements')}
      >
        <Award size={16} color={selectedTab === 'achievements' ? colors.background : colors.textSecondary} />
        <Text style={[
          styles.tabText,
          { color: selectedTab === 'achievements' ? colors.background : colors.textSecondary }
        ]}>
          Awards
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTrackItem = (track: Track) => (
    <TouchableOpacity
      key={track.id}
      style={[styles.trackItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: track.coverArt }}
        style={[styles.trackCover, { borderColor: colors.border }]}
        resizeMode="cover"
      />
      
      <View style={styles.trackInfo}>
        <View style={styles.trackHeader}>
          <Text style={[styles.trackTitle, { color: colors.text }]} numberOfLines={1}>
            {track.title}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: track.status === 'published' ? colors.success : colors.warning }
          ]}>
            <Text style={[styles.statusText, { color: colors.background }]}>
              {track.status}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.trackDate, { color: colors.textSecondary }]}>
          Released {new Date(track.releaseDate).toLocaleDateString()}
        </Text>
        
        <View style={styles.trackStats}>
          <View style={styles.trackStat}>
            <Play size={12} color={colors.textSecondary} />
            <Text style={[styles.trackStatText, { color: colors.textSecondary }]}>
              {(track.streams / 1000).toFixed(0)}K
            </Text>
          </View>
          
          <View style={styles.trackStat}>
            <DollarSign size={12} color={colors.textSecondary} />
            <Text style={[styles.trackStatText, { color: colors.textSecondary }]}>
              ${track.earnings.toFixed(0)}
            </Text>
          </View>
          
          <View style={styles.trackStat}>
            <TrendingUp size={12} color={colors.textSecondary} />
            <Text style={[styles.trackStatText, { color: colors.textSecondary }]}>
              {track.likes}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.trackMenu}>
        <MoreVertical size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderStatsSection = () => (
    <View style={styles.statsSection}>
      <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statCardHeader}>
          <TrendingUp size={20} color={colors.primary} />
          <Text style={[styles.statCardTitle, { color: colors.text }]}>
            Performance Overview
          </Text>
        </View>
        
        <View style={styles.statCardContent}>
          <View style={styles.statRow}>
            <Text style={[styles.statRowLabel, { color: colors.textSecondary }]}>
              Total Streams:
            </Text>
            <Text style={[styles.statRowValue, { color: colors.text }]}>
              {userStats.totalStreams.toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={[styles.statRowLabel, { color: colors.textSecondary }]}>
              Total Earnings:
            </Text>
            <Text style={[styles.statRowValue, { color: colors.success }]}>
              ${userStats.totalEarnings.toLocaleString()}
            </Text>
          </View>
          
          {user?.role === 'investor' && (
            <View style={styles.statRow}>
              <Text style={[styles.statRowLabel, { color: colors.textSecondary }]}>
                Total Investments:
              </Text>
              <Text style={[styles.statRowValue, { color: colors.primary }]}>
                ${userStats.totalInvestments.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderAchievementItem = (achievement: Achievement) => {
    const rarityColor = achievement.rarity === 'legendary' ? colors.warning :
                       achievement.rarity === 'epic' ? colors.error :
                       achievement.rarity === 'rare' ? colors.primary : colors.success;

    return (
      <View
        key={achievement.id}
        style={[styles.achievementItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.achievementIcon}>
          <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
        </View>
        
        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementTitle, { color: colors.text }]}>
            {achievement.title}
          </Text>
          <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>
            {achievement.description}
          </Text>
          <Text style={[styles.achievementDate, { color: colors.textSecondary }]}>
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
          <Text style={[styles.rarityText, { color: rarityColor }]}>
            {achievement.rarity.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'tracks':
        return (
          <View style={styles.tracksSection}>
            {userTracks.map(renderTrackItem)}
          </View>
        );
      case 'stats':
        return renderStatsSection();
      case 'achievements':
        return (
          <View style={styles.achievementsSection}>
            {achievements.map(renderAchievementItem)}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderTabSelector()}
        
        <View style={styles.content}>
          {renderContent()}
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
  profileHeader: {
    padding: 20,
    paddingTop: 60,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userRole: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 4,
  },
  joinDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  settingsButton: {
    padding: 8,
  },
  socialActions: {
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
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
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  tracksSection: {
    gap: 12,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  trackCover: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  trackDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  trackStats: {
    flexDirection: 'row',
    gap: 16,
  },
  trackStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackStatText: {
    fontSize: 12,
    fontWeight: '500',
  },
  trackMenu: {
    padding: 8,
  },
  statsSection: {
    gap: 16,
  },
  statCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statCardContent: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statRowLabel: {
    fontSize: 14,
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsSection: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600',
  },
});