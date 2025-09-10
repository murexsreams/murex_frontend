import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render, mockTrack } from '../../../utils/testUtils';
import { TrackCard } from '../TrackCard';

// Mock the hooks
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      border: '#E5E7EB',
      primary: '#3B82F6',
      text: '#1F2937',
      textSecondary: '#6B7280',
      success: '#10B981',
    },
    spacing: { md: 16, sm: 8 },
    borderRadius: { md: 8 },
  }),
}));

jest.mock('../../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => ({
    currentTrack: null,
    isPlaying: false,
    controls: {
      play: jest.fn(),
    },
  }),
}));

jest.mock('../../../store/tracksStore', () => ({
  useTracksStore: () => ({
    toggleLike: jest.fn(),
  }),
}));

describe('TrackCard Component', () => {
  const mockOnPress = jest.fn();
  const mockOnInvest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders track information correctly', () => {
    const { getByText } = render(
      <TrackCard 
        track={mockTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    expect(getByText(mockTrack.title)).toBeTruthy();
    expect(getByText(mockTrack.artist.stageName)).toBeTruthy();
  });

  it('displays funding information', () => {
    const { getByText } = render(
      <TrackCard 
        track={mockTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    expect(getByText('$5,000 / $10,000')).toBeTruthy();
    expect(getByText('12.5% ROI')).toBeTruthy();
  });

  it('shows funding progress bar', () => {
    const { getByTestId } = render(
      <TrackCard 
        track={mockTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    expect(getByTestId('funding-progress')).toBeTruthy();
  });

  it('displays social stats', () => {
    const { getByText } = render(
      <TrackCard 
        track={mockTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    expect(getByText('1,000')).toBeTruthy(); // plays
    expect(getByText('50')).toBeTruthy(); // likes
  });

  it('calls onPress when card is pressed', () => {
    const { getByTestId } = render(
      <TrackCard 
        track={mockTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
        testID="track-card"
      />
    );

    fireEvent.press(getByTestId('track-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockTrack);
  });

  it('calls onInvest when invest button is pressed', () => {
    const { getByTestId } = render(
      <TrackCard 
        track={mockTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    fireEvent.press(getByTestId('invest-button'));
    expect(mockOnInvest).toHaveBeenCalledWith(mockTrack);
  });

  it('plays track when play button is pressed', () => {
    const mockPlay = jest.fn();
    
    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue({
        currentTrack: null,
        isPlaying: false,
        controls: { play: mockPlay },
      });

    const { getByTestId } = render(
      <TrackCard 
        track={mockTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    fireEvent.press(getByTestId('play-button'));
    expect(mockPlay).toHaveBeenCalledWith(mockTrack);
  });

  it('shows playing indicator when track is currently playing', () => {
    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue({
        currentTrack: mockTrack,
        isPlaying: true,
        controls: { play: jest.fn() },
      });

    const { getByTestId } = render(
      <TrackCard 
        track={mockTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    expect(getByTestId('playing-indicator')).toBeTruthy();
  });

  it('toggles like when like button is pressed', () => {
    const mockToggleLike = jest.fn();
    
    jest.mocked(require('../../../store/tracksStore').useTracksStore)
      .mockReturnValue({ toggleLike: mockToggleLike });

    const { getByTestId } = render(
      <TrackCard 
        track={mockTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    fireEvent.press(getByTestId('like-button'));
    expect(mockToggleLike).toHaveBeenCalledWith(mockTrack.id);
  });

  it('shows verified badge for verified artists', () => {
    const verifiedTrack = {
      ...mockTrack,
      artist: {
        ...mockTrack.artist,
        verified: true,
      },
    };

    const { getByTestId } = render(
      <TrackCard 
        track={verifiedTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    expect(getByTestId('verified-badge')).toBeTruthy();
  });

  it('displays correct funding status for fully funded tracks', () => {
    const fullyFundedTrack = {
      ...mockTrack,
      currentFunding: 10000,
      fundingGoal: 10000,
    };

    const { getByText } = render(
      <TrackCard 
        track={fullyFundedTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    expect(getByText('Fully Funded')).toBeTruthy();
  });

  it('renders in compact mode', () => {
    const { getByTestId } = render(
      <TrackCard 
        track={mockTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
        compact
        testID="compact-card"
      />
    );

    expect(getByTestId('compact-card')).toBeTruthy();
  });

  it('handles long track titles correctly', () => {
    const longTitleTrack = {
      ...mockTrack,
      title: 'This is a very long track title that should be truncated properly',
    };

    const { getByText } = render(
      <TrackCard 
        track={longTitleTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    expect(getByText(longTitleTrack.title)).toBeTruthy();
  });

  it('shows genre tag', () => {
    const { getByText } = render(
      <TrackCard 
        track={mockTrack} 
        onPress={mockOnPress}
        onInvest={mockOnInvest}
      />
    );

    expect(getByText(mockTrack.genre)).toBeTruthy();
  });
});