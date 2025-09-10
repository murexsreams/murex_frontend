// Comprehensive mock data for development and testing

import { 
  Track, 
  Artist, 
  User, 
  Investment, 
  Comment, 
  Portfolio,
  Genre,
  TrackStatus,
  InvestmentStatus,
  PaymentMethod,
  NotificationType
} from '../types';

// Mock Artists
export const mockArtists: Artist[] = [
  {
    id: 'artist-1',
    userId: 'user-1',
    stageName: 'Luna Echo',
    realName: 'Sarah Johnson',
    avatar: 'https://picsum.photos/150/150?random=1',
    bio: 'Electronic music producer from Los Angeles. Creating dreamy soundscapes that transport you to another dimension.',
    verified: true,
    totalTracks: 12,
    totalStreams: 450000,

    totalFunding: 180000,
    followerCount: 15000,
    socialLinks: {
      twitter: 'https://twitter.com/lunaecho',
      instagram: 'https://instagram.com/lunaecho',
      spotify: 'https://open.spotify.com/artist/lunaecho',
    },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'artist-2',
    userId: 'user-2',
    stageName: 'Street Vibes',
    realName: 'Marcus Williams',
    avatar: 'https://picsum.photos/150/150?random=2',
    bio: 'Hip-hop artist bringing authentic street stories to life through music.',
    verified: false,
    totalTracks: 8,
    totalStreams: 280000,
    totalFunding: 95000,
    followerCount: 8500,
    socialLinks: {
      instagram: 'https://instagram.com/streetvibes',
      soundcloud: 'https://soundcloud.com/streetvibes',
    },
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-01-28'),
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'sarah@example.com',
    username: 'lunaecho',
    displayName: 'Luna Echo',
    avatar: 'https://picsum.photos/150/150?random=1',
    role: 'artist',
    verified: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'user-5',
    email: 'investor@example.com',
    username: 'musicinvestor',
    displayName: 'Music Investor',
    avatar: 'https://picsum.photos/150/150?random=5',
    role: 'investor',
    verified: false,
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2024-01-25'),
  },
];

// Mock Tracks
export const mockTracks: Track[] = [
  {
    id: 'track-1',
    title: 'Midnight Dreams',
    artist: mockArtists[0],
    artistId: 'artist-1',
    duration: 240,
    audioUrl: 'https://example.com/track1.mp3',
    waveformData: Array.from({ length: 100 }, () => Math.random()),
    coverArt: 'https://picsum.photos/300/300?random=1',
    coverArtThumbnail: 'https://picsum.photos/150/150?random=1',
    genre: Genre.ELECTRONIC,
    tags: ['ambient', 'dreamy', 'electronic', 'chill'],
    description: 'A dreamy electronic journey through midnight landscapes.',
    fundingGoal: 100000,
    currentFunding: 85000,
    minimumInvestment: 100,
    totalShares: 10000,
    availableShares: 1500,
    sharePrice: 10,
    expectedROI: 12.5,
    streamingProjections: {
      monthlyStreams: 15000,
      projectedGrowth: 8.5,
      revenuePerStream: 0.004,
      projectedMonthlyRevenue: 60,
      projectedYearlyRevenue: 720,
    },
    status: TrackStatus.FUNDING,
    releaseDate: new Date('2024-03-15'),
    fundingDeadline: new Date('2024-02-28'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
    socialStats: {
      plays: 45000,
      likes: 1250,
      comments: 89,
      shares: 45,
      saves: 320,
    },
    investments: [],
    totalInvestors: 234,
  },
  {
    id: 'track-2',
    title: 'Urban Pulse',
    artist: mockArtists[1],
    artistId: 'artist-2',
    duration: 195,
    audioUrl: 'https://example.com/track2.mp3',
    waveformData: Array.from({ length: 100 }, () => Math.random()),
    coverArt: 'https://picsum.photos/300/300?random=2',
    coverArtThumbnail: 'https://picsum.photos/150/150?random=2',
    genre: Genre.HIP_HOP,
    tags: ['hip-hop', 'urban', 'beats', 'street'],
    description: 'Raw urban energy captured in powerful beats and lyrics.',
    fundingGoal: 80000,
    currentFunding: 65000,
    minimumInvestment: 50,
    totalShares: 8000,
    availableShares: 1200,
    sharePrice: 10,
    expectedROI: 8.2,
    streamingProjections: {
      monthlyStreams: 12000,
      projectedGrowth: 6.2,
      revenuePerStream: 0.004,
      projectedMonthlyRevenue: 48,
      projectedYearlyRevenue: 576,
    },
    status: TrackStatus.FUNDING,
    releaseDate: new Date('2024-03-01'),
    fundingDeadline: new Date('2024-02-20'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-28'),
    socialStats: {
      plays: 32000,
      likes: 890,
      comments: 67,
      shares: 23,
      saves: 180,
    },
    investments: [],
    totalInvestors: 156,
  },
];

// Mock Investments
export const mockInvestments: Investment[] = [
  {
    id: 'investment-1',
    investorId: 'user-5',
    investor: mockUsers[1],
    trackId: 'track-1',
    track: mockTracks[0],
    amount: 5000,
    shares: 500,
    sharePrice: 10,
    currentValue: 5625,
    totalReturns: 625,
    roi: 12.5,
    status: InvestmentStatus.ACTIVE,
    investedAt: new Date('2024-01-20'),
    lastUpdated: new Date('2024-02-01'),
    transactionHash: '0x1234567890abcdef',
    paymentMethod: PaymentMethod.USDC,
  },
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    trackId: 'track-1',
    userId: 'user-5',
    user: mockUsers[1],
    content: 'This track is absolutely amazing! The production quality is top-notch.',
    timestamp: 120,
    likes: 15,
    replies: [],
    flagged: false,
    hidden: false,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
];

// Mock Portfolio
export const mockPortfolio: Portfolio = {
  userId: 'user-5',
  totalValue: 8330,
  totalInvested: 7500,
  totalReturns: 830,
  totalROI: 11.07,
  investments: mockInvestments,
  performanceHistory: [
    {
      date: new Date('2024-01-15'),
      totalValue: 7500,
      totalReturns: 0,
      roi: 0,
    },
  ],
  genreDistribution: [
    {
      genre: Genre.ELECTRONIC,
      percentage: 67.5,
      value: 5625,
    },
  ],
  artistDistribution: [
    {
      artistId: 'artist-1',
      artistName: 'Luna Echo',
      percentage: 67.5,
      value: 5625,
    },
  ],
  lastUpdated: new Date('2024-02-05'),
};

// Helper functions to get mock data
export const getMockTrackById = (id: string): Track | undefined => {
  return mockTracks.find(track => track.id === id);
};

export const getMockArtistById = (id: string): Artist | undefined => {
  return mockArtists.find(artist => artist.id === id);
};

export const getMockUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getMockTracksByGenre = (genre: Genre): Track[] => {
  return mockTracks.filter(track => track.genre === genre);
};

export const getMockTrendingTracks = (): Track[] => {
  return mockTracks
    .sort((a, b) => b.socialStats.plays - a.socialStats.plays)
    .slice(0, 5);
};

export const getMockTracksByArtist = (artistId: string): Track[] => {
  return mockTracks.filter(track => track.artistId === artistId);
};

export const getMockInvestmentsByUser = (userId: string): Investment[] => {
  return mockInvestments.filter(investment => investment.investorId === userId);
};

export const getMockCommentsByTrack = (trackId: string): Comment[] => {
  return mockComments.filter(comment => comment.trackId === trackId);
};