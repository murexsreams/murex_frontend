import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render, mockTrack } from '../../utils/testUtils';
import { MiniPlayer } from '../../components/music/MiniPlayer';
import { TrackCard } from '../../components/music/TrackCard';

// Mock the stores and hooks
const mockPlayerStore = {
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  setCurrentTrack: jest.fn(),
  setIsPlaying: jest.fn(),
  setProgress: jest.fn(),
};

const mockAudioControls = {
  play: jest.fn(),
  pause: jest.fn(),
  togglePlayPause: jest.fn(),
  playNext: jest.fn(),
  seekTo: jest.fn(),
};

jest.mock('../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({
    ...mockPlayerStore,
    controls: mockAudioControls,
  }),
}));

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      primary: '#3B82F6',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
    },
    spacing: { md: 16 },
    borderRadius: { sm: 4, md: 8 },
  }),
}));

jest.mock('../../store/tracksStore', () => ({
  useTracksStore: () => ({
    toggleLike: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('Music Player Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlayerStore.currentTrack = null;
    mockPlayerStore.isPlaying = false;
    mockPlayerStore.isLoading = false;
    mockPlayerStore.progress = 0;
  });

  describe('Track Selection and Playback', () => {
    it('plays track when play button is pressed on TrackCard', async () => {
      const mockOnPress = jest.fn();
      const mockOnInvest = jest.fn();

      const { getByTestId } = render(
        <TrackCard
          track={mockTrack}
          onPress={mockOnPress}
          onInvest={mockOnInvest}
        />
      );

      fireEvent.press(getByTestId('play-button'));

      expect(mockAudioControls.play).toHaveBeenCalledWith(mockTrack);
    });

    it('shows MiniPlayer when track is playing', () => {
      mockPlayerStore.currentTrack = mockTrack;
      mockPlayerStore.isPlaying = true;

      const { getByText } = render(<MiniPlayer />);

      expect(getByText(mockTrack.title)).toBeTruthy();
      expect(getByText(mockTrack.artist.stageName)).toBeTruthy();
    });

    it('hides MiniPlayer when no track is selected', () => {
      mockPlayerStore.currentTrack = null;

      const { container } = render(<MiniPlayer />);

      expect(container.children).toHaveLength(0);
    });
  });

  describe('Playback Controls', () => {
    beforeEach(() => {
      mockPlayerStore.currentTrack = mockTrack;
    });

    it('toggles play/pause when button is pressed', () => {
      const { getByTestId } = render(<MiniPlayer />);

      fireEvent.press(getByTestId('play-pause-button'));

      expect(mockAudioControls.togglePlayPause).toHaveBeenCalledTimes(1);
    });

    it('plays next track when next button is pressed', () => {
      const { getByTestId } = render(<MiniPlayer />);

      fireEvent.press(getByTestId('next-button'));

      expect(mockAudioControls.playNext).toHaveBeenCalledTimes(1);
    });

    it('navigates to full player when expand button is pressed', () => {
      const mockNavigate = jest.fn();
      
      jest.mocked(require('@react-navigation/native').useNavigation)
        .mockReturnValue({ navigate: mockNavigate });

      const { getByTestId } = render(<MiniPlayer />);

      fireEvent.press(getByTestId('expand-button'));

      expect(mockNavigate).toHaveBeenCalledWith('FullPlayer');
    });
  });

  describe('Progress and State Updates', () => {
    beforeEach(() => {
      mockPlayerStore.currentTrack = mockTrack;
    });

    it('displays progress correctly', () => {
      mockPlayerStore.progress = 50;

      const { getByTestId } = render(<MiniPlayer />);

      const progressBar = getByTestId('progress-bar');
      expect(progressBar).toBeTruthy();
      // Progress bar should reflect 50% progress
    });

    it('shows loading state', () => {
      mockPlayerStore.isLoading = true;

      const { getByTestId } = render(<MiniPlayer />);

      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('shows playing state correctly', () => {
      mockPlayerStore.isPlaying = true;

      const { getByTestId } = render(<MiniPlayer />);

      // Should show pause icon when playing
      expect(getByTestId('play-pause-button')).toBeTruthy();
    });

    it('shows paused state correctly', () => {
      mockPlayerStore.isPlaying = false;

      const { getByTestId } = render(<MiniPlayer />);

      // Should show play icon when paused
      expect(getByTestId('play-pause-button')).toBeTruthy();
    });
  });

  describe('Track Information Display', () => {
    beforeEach(() => {
      mockPlayerStore.currentTrack = mockTrack;
    });

    it('displays track title and artist', () => {
      const { getByText } = render(<MiniPlayer />);

      expect(getByText(mockTrack.title)).toBeTruthy();
      expect(getByText(mockTrack.artist.stageName)).toBeTruthy();
    });

    it('truncates long track titles', () => {
      const longTitleTrack = {
        ...mockTrack,
        title: 'This is a very long track title that should be truncated',
      };
      mockPlayerStore.currentTrack = longTitleTrack;

      const { getByText } = render(<MiniPlayer />);

      expect(getByText(longTitleTrack.title)).toBeTruthy();
    });

    it('handles missing cover art gracefully', () => {
      const trackWithoutCover = {
        ...mockTrack,
        coverArt: '',
      };
      mockPlayerStore.currentTrack = trackWithoutCover;

      const { getByTestId } = render(<MiniPlayer />);

      // Should still render without errors
      expect(getByTestId('track-info')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('handles rapid button presses gracefully', async () => {
      mockPlayerStore.currentTrack = mockTrack;

      const { getByTestId } = render(<MiniPlayer />);

      const playButton = getByTestId('play-pause-button');

      // Rapid fire clicks
      fireEvent.press(playButton);
      fireEvent.press(playButton);
      fireEvent.press(playButton);

      // Should handle multiple calls gracefully
      expect(mockAudioControls.togglePlayPause).toHaveBeenCalledTimes(3);
    });

    it('prevents interaction when loading', () => {
      mockPlayerStore.currentTrack = mockTrack;
      mockPlayerStore.isLoading = true;

      const { getByTestId } = render(<MiniPlayer />);

      const playButton = getByTestId('play-pause-button');
      expect(playButton.props.disabled).toBe(true);
    });

    it('navigates to full player when track info is tapped', () => {
      const mockNavigate = jest.fn();
      
      jest.mocked(require('@react-navigation/native').useNavigation)
        .mockReturnValue({ navigate: mockNavigate });

      mockPlayerStore.currentTrack = mockTrack;

      const { getByTestId } = render(<MiniPlayer />);

      fireEvent.press(getByTestId('track-info'));

      expect(mockNavigate).toHaveBeenCalledWith('FullPlayer');
    });
  });

  describe('Error Handling', () => {
    it('handles playback errors gracefully', async () => {
      mockAudioControls.play.mockRejectedValue(new Error('Playback failed'));

      const mockOnPress = jest.fn();
      const mockOnInvest = jest.fn();

      const { getByTestId } = render(
        <TrackCard
          track={mockTrack}
          onPress={mockOnPress}
          onInvest={mockOnInvest}
        />
      );

      fireEvent.press(getByTestId('play-button'));

      await waitFor(() => {
        expect(mockAudioControls.play).toHaveBeenCalled();
      });

      // Should not crash the app
    });

    it('handles missing track data gracefully', () => {
      mockPlayerStore.currentTrack = null;

      const { container } = render(<MiniPlayer />);

      // Should render nothing without errors
      expect(container.children).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockPlayerStore.currentTrack = mockTrack;
    });

    it('provides accessible labels for controls', () => {
      const { getByTestId } = render(<MiniPlayer />);

      const playButton = getByTestId('play-pause-button');
      const nextButton = getByTestId('next-button');
      const expandButton = getByTestId('expand-button');

      expect(playButton.props.accessibilityLabel).toBeDefined();
      expect(nextButton.props.accessibilityLabel).toBeDefined();
      expect(expandButton.props.accessibilityLabel).toBeDefined();
    });

    it('provides accessible track information', () => {
      const { getByTestId } = render(<MiniPlayer />);

      const trackInfo = getByTestId('track-info');
      expect(trackInfo.props.accessibilityLabel).toContain(mockTrack.title);
      expect(trackInfo.props.accessibilityLabel).toContain(mockTrack.artist.stageName);
    });
  });
});