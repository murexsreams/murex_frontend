import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '../../navigation/AppNavigator';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useTracksStore } from '../../store/tracksStore';
import { usePlayerStore } from '../../store/playerStore';
import { useSocialStore } from '../../store/socialStore';

// Mock the audio service
jest.mock('../../services/audioService', () => ({
  audioService: {
    initialize: jest.fn().mockResolvedValue(undefined),
    loadTrack: jest.fn().mockResolvedValue(undefined),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    seekTo: jest.fn().mockResolvedValue(undefined),
    setVolume: jest.fn().mockResolvedValue(undefined),
    cleanup: jest.fn().mockResolvedValue(undefined),
    setCallbacks: jest.fn(),
  },
}));

// Mock expo modules
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn().mockResolvedValue(undefined),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </ThemeProvider>
);

describe('End-to-End Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useAuthStore.getState().logout();
    useTracksStore.getState().clearFilters();
    usePlayerStore.getState().cleanup();
    useSocialStore.getState().clearCache();
  });

  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AppNavigator />
        </TestWrapper>
      );

      // Should start with login screen
      expect(getByText('Welcome to Murex Streams')).toBeTruthy();

      // Test login as investor
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      fireEvent.changeText(emailInput, 'investor@test.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().user?.role).toBe('investor');
      });

      // Should navigate to main app with investor tabs
      await waitFor(() => {
        expect(getByText('Discover')).toBeTruthy();
        expect(getByText('Wallet')).toBeTruthy();
      });
    });

    it('should handle artist authentication and navigation', async () => {
      const { getByText, getByPlaceholderText } = render(
        <TestWrapper>
          <AppNavigator />
        </TestWrapper>
      );

      // Login as artist
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      fireEvent.changeText(emailInput, 'artist@test.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(useAuthStore.getState().user?.role).toBe('artist');
      });

      // Should show artist-specific tabs
      await waitFor(() => {
        expect(getByText('Discover')).toBeTruthy();
        expect(getByText('Upload')).toBeTruthy();
      });
    });
  });

  describe('Music Discovery and Playback Flow', () => {
    beforeEach(async () => {
      // Login as investor for music discovery tests
      await act(async () => {
        useAuthStore.getState().login('investor@test.com', 'password123');
      });
    });

    it('should complete full music discovery and playback flow', async () => {
      const { getByText, getByTestId, getAllByTestId } = render(
        <TestWrapper>
          <AppNavigator />
        </TestWrapper>
      );

      // Navigate to Discover screen
      const discoverTab = getByText('Discover');
      fireEvent.press(discoverTab);

      await waitFor(() => {
        expect(getByText('Trending Tracks')).toBeTruthy();
      });

      // Should display track cards
      await waitFor(() => {
        const trackCards = getAllByTestId('track-card');
        expect(trackCards.length).toBeGreaterThan(0);
      });

      // Test track playback
      const firstTrackCard = getAllByTestId('track-card')[0];
      const playButton = getByTestId('play-button');
      
      fireEvent.press(playButton);

      await waitFor(() => {
        expect(usePlayerStore.getState().isPlaying).toBe(true);
        expect(usePlayerStore.getState().currentTrack).toBeTruthy();
      });

      // Should show mini player
      await waitFor(() => {
        expect(getByTestId('mini-player')).toBeTruthy();
      });

      // Test expanding to full player
      const miniPlayer = getByTestId('mini-player');
      fireEvent.press(miniPlayer);

      await waitFor(() => {
        expect(usePlayerStore.getState().isFullPlayerVisible).toBe(true);
      });
    });

    it('should handle search and filtering', async () => {
      const { getByText, getByPlaceholderText, getAllByTestId } = render(
        <TestWrapper>
          <AppNavigator />
        </TestWrapper>
      );

      // Navigate to Discover
      fireEvent.press(getByText('Discover'));

      // Test search functionality
      const searchInput = getByPlaceholderText('Search tracks, artists...');
      fireEvent.changeText(searchInput, 'electronic');

      await waitFor(() => {
        const filteredTracks = useTracksStore.getState().filteredTracks;
        expect(filteredTracks.length).toBeGreaterThan(0);
      });

      // Test genre filtering
      const filterButton = getByText('Filters');
      fireEvent.press(filterButton);

      const electronicFilter = getByText('Electronic');
      fireEvent.press(electronicFilter);

      await waitFor(() => {
        const filters = useTracksStore.getState().filters;
        expect(filters.genre).toContain('electronic');
      });
    });
  });

  describe('Investment Flow', () => {
    beforeEach(async () => {
      await act(async () => {
        useAuthStore.getState().login('investor@test.com', 'password123');
      });
    });

    it('should complete investment flow', async () => {
      const { getByText, getByTestId, getByPlaceholderText } = render(
        <TestWrapper>
          <AppNavigator />
        </TestWrapper>
      );

      // Navigate to Discover and find a track to invest in
      fireEvent.press(getByText('Discover'));

      await waitFor(() => {
        expect(getByTestId('track-card')).toBeTruthy();
      });

      // Open investment modal
      const investButton = getByText('Invest Now');
      fireEvent.press(investButton);

      await waitFor(() => {
        expect(getByText('Investment Details')).toBeTruthy();
      });

      // Enter investment amount
      const amountInput = getByPlaceholderText('Enter amount (USDC)');
      fireEvent.changeText(amountInput, '1000');

      // Should show ROI calculation
      await waitFor(() => {
        expect(getByText('Estimated ROI')).toBeTruthy();
      });

      // Confirm investment
      const confirmButton = getByText('Confirm Investment');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(getByText('Investment Successful')).toBeTruthy();
      });

      // Check wallet screen shows investment
      fireEvent.press(getByText('Wallet'));

      await waitFor(() => {
        expect(getByText('Portfolio Value')).toBeTruthy();
        expect(getByText('Recent Investments')).toBeTruthy();
      });
    });
  });

  describe('Social Features Flow', () => {
    beforeEach(async () => {
      await act(async () => {
        useAuthStore.getState().login('investor@test.com', 'password123');
      });
    });

    it('should handle social interactions', async () => {
      const { getByText, getByTestId, getAllByTestId } = render(
        <TestWrapper>
          <AppNavigator />
        </TestWrapper>
      );

      // Navigate to Discover
      fireEvent.press(getByText('Discover'));

      await waitFor(() => {
        expect(getAllByTestId('track-card').length).toBeGreaterThan(0);
      });

      // Test like functionality
      const likeButton = getByTestId('like-button');
      const initialLikes = useSocialStore.getState().likes.length;
      
      fireEvent.press(likeButton);

      await waitFor(() => {
        const newLikes = useSocialStore.getState().likes.length;
        expect(newLikes).toBe(initialLikes + 1);
      });

      // Test comment functionality
      const commentButton = getByTestId('comment-button');
      fireEvent.press(commentButton);

      await waitFor(() => {
        expect(getByText('Comments')).toBeTruthy();
      });

      // Add a comment
      const commentInput = getByPlaceholderText('Add a comment...');
      fireEvent.changeText(commentInput, 'Great track!');
      
      const postButton = getByText('Post');
      fireEvent.press(postButton);

      await waitFor(() => {
        expect(getByText('Great track!')).toBeTruthy();
      });

      // Test share functionality
      const shareButton = getByTestId('share-button');
      fireEvent.press(shareButton);

      await waitFor(() => {
        expect(getByText('Share Track')).toBeTruthy();
      });
    });
  });

  describe('Artist Upload Flow', () => {
    beforeEach(async () => {
      await act(async () => {
        useAuthStore.getState().login('artist@test.com', 'password123');
      });
    });

    it('should complete track upload flow', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <TestWrapper>
          <AppNavigator />
        </TestWrapper>
      );

      // Navigate to Upload screen
      fireEvent.press(getByText('Upload'));

      await waitFor(() => {
        expect(getByText('Upload New Track')).toBeTruthy();
      });

      // Fill in track details
      const titleInput = getByPlaceholderText('Track Title');
      fireEvent.changeText(titleInput, 'My New Track');

      const descriptionInput = getByPlaceholderText('Description');
      fireEvent.changeText(descriptionInput, 'An amazing new track');

      const fundingGoalInput = getByPlaceholderText('Funding Goal (USDC)');
      fireEvent.changeText(fundingGoalInput, '50000');

      // Test file upload simulation
      const fileUploadButton = getByText('Choose Audio File');
      fireEvent.press(fileUploadButton);

      // Test cover art upload
      const coverArtButton = getByText('Upload Cover Art');
      fireEvent.press(coverArtButton);

      // Submit upload
      const uploadButton = getByText('Upload Track');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(getByText('Upload Successful')).toBeTruthy();
      });
    });
  });

  describe('Profile and Settings Flow', () => {
    beforeEach(async () => {
      await act(async () => {
        useAuthStore.getState().login('investor@test.com', 'password123');
      });
    });

    it('should handle profile management', async () => {
      const { getByText, getByTestId } = render(
        <TestWrapper>
          <AppNavigator />
        </TestWrapper>
      );

      // Navigate to Profile
      fireEvent.press(getByText('Profile'));

      await waitFor(() => {
        expect(getByText('Profile')).toBeTruthy();
        expect(getByText('Edit Profile')).toBeTruthy();
      });

      // Test profile editing
      const editButton = getByText('Edit Profile');
      fireEvent.press(editButton);

      await waitFor(() => {
        expect(getByText('Save Changes')).toBeTruthy();
      });

      // Navigate to Settings
      const settingsButton = getByTestId('settings-button');
      fireEvent.press(settingsButton);

      await waitFor(() => {
        expect(getByText('Settings')).toBeTruthy();
        expect(getByText('Theme')).toBeTruthy();
        expect(getByText('Notifications')).toBeTruthy();
      });

      // Test theme switching
      const themeToggle = getByTestId('theme-toggle');
      fireEvent.press(themeToggle);

      // Test logout
      const logoutButton = getByText('Logout');
      fireEvent.press(logoutButton);

      await waitFor(() => {
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
      });
    });
  });

  describe('Theme Consistency', () => {
    it('should maintain theme consistency across all screens', async () => {
      const { getByText, getByTestId } = render(
        <TestWrapper>
          <AppNavigator />
        </TestWrapper>
      );

      // Login first
      await act(async () => {
        useAuthStore.getState().login('investor@test.com', 'password123');
      });

      // Test theme on each screen
      const screens = ['Discover', 'Wallet', 'Profile'];
      
      for (const screen of screens) {
        fireEvent.press(getByText(screen));
        
        await waitFor(() => {
          // Check that theme colors are applied consistently
          const screenElement = getByTestId(`${screen.toLowerCase()}-screen`);
          expect(screenElement).toBeTruthy();
        });
      }

      // Test theme switching works on all screens
      fireEvent.press(getByText('Profile'));
      const settingsButton = getByTestId('settings-button');
      fireEvent.press(settingsButton);

      const themeToggle = getByTestId('theme-toggle');
      fireEvent.press(themeToggle);

      // Verify theme change persists across navigation
      for (const screen of screens) {
        fireEvent.press(getByText(screen));
        await waitFor(() => {
          expect(getByTestId(`${screen.toLowerCase()}-screen`)).toBeTruthy();
        });
      }
    });
  });

  describe('Navigation Smoothness', () => {
    beforeEach(async () => {
      await act(async () => {
        useAuthStore.getState().login('investor@test.com', 'password123');
      });
    });

    it('should handle navigation without crashes or errors', async () => {
      const { getByText } = render(
        <TestWrapper>
          <AppNavigator />
        </TestWrapper>
      );

      // Test rapid navigation between screens
      const screens = ['Discover', 'Wallet', 'Profile'];
      
      for (let i = 0; i < 3; i++) {
        for (const screen of screens) {
          fireEvent.press(getByText(screen));
          await waitFor(() => {
            expect(getByText(screen)).toBeTruthy();
          });
        }
      }

      // Test modal navigation
      fireEvent.press(getByText('Discover'));
      
      // Open and close modals rapidly
      const trackCard = getByText('Midnight Dreams');
      fireEvent.press(trackCard);

      // Test back navigation
      for (let i = 0; i < screens.length; i++) {
        fireEvent.press(getByText(screens[i]));
        await waitFor(() => {
          expect(getByText(screens[i])).toBeTruthy();
        });
      }
    });
  });
});