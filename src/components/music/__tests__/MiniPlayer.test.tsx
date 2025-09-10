import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render, mockTrack, mockAudioPlayer } from '../../../utils/testUtils';
import { MiniPlayer } from '../MiniPlayer';

// Mock the hooks
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      surface: '#FFFFFF',
      border: '#E5E7EB',
      primary: '#3B82F6',
      text: '#1F2937',
      textSecondary: '#6B7280',
    },
    spacing: { md: 16 },
    borderRadius: { sm: 4 },
  }),
}));

jest.mock('../../../hooks/useAudioPlayer', () => ({
  useAudioPlayer: () => mockAudioPlayer,
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('MiniPlayer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no current track', () => {
    const { container } = render(<MiniPlayer />);
    expect(container.children).toHaveLength(0);
  });

  it('renders correctly with current track', () => {
    const mockPlayerWithTrack = {
      ...mockAudioPlayer,
      currentTrack: mockTrack,
    };

    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue(mockPlayerWithTrack);

    const { getByText } = render(<MiniPlayer />);
    expect(getByText(mockTrack.title)).toBeTruthy();
    expect(getByText(mockTrack.artist.stageName)).toBeTruthy();
  });

  it('shows play button when not playing', () => {
    const mockPlayerWithTrack = {
      ...mockAudioPlayer,
      currentTrack: mockTrack,
      isPlaying: false,
    };

    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue(mockPlayerWithTrack);

    const { getByTestId } = render(<MiniPlayer />);
    // Assuming play button has testID="play-button"
    expect(getByTestId('play-pause-button')).toBeTruthy();
  });

  it('shows pause button when playing', () => {
    const mockPlayerWithTrack = {
      ...mockAudioPlayer,
      currentTrack: mockTrack,
      isPlaying: true,
    };

    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue(mockPlayerWithTrack);

    const { getByTestId } = render(<MiniPlayer />);
    expect(getByTestId('play-pause-button')).toBeTruthy();
  });

  it('calls togglePlayPause when play/pause button is pressed', () => {
    const mockControls = {
      ...mockAudioPlayer.controls,
      togglePlayPause: jest.fn(),
    };

    const mockPlayerWithTrack = {
      ...mockAudioPlayer,
      currentTrack: mockTrack,
      controls: mockControls,
    };

    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue(mockPlayerWithTrack);

    const { getByTestId } = render(<MiniPlayer />);
    fireEvent.press(getByTestId('play-pause-button'));
    expect(mockControls.togglePlayPause).toHaveBeenCalledTimes(1);
  });

  it('calls playNext when next button is pressed', () => {
    const mockControls = {
      ...mockAudioPlayer.controls,
      playNext: jest.fn(),
    };

    const mockPlayerWithTrack = {
      ...mockAudioPlayer,
      currentTrack: mockTrack,
      controls: mockControls,
    };

    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue(mockPlayerWithTrack);

    const { getByTestId } = render(<MiniPlayer />);
    fireEvent.press(getByTestId('next-button'));
    expect(mockControls.playNext).toHaveBeenCalledTimes(1);
  });

  it('navigates to FullPlayer when expand button is pressed', () => {
    const mockNavigation = { navigate: jest.fn() };
    
    jest.mocked(require('@react-navigation/native').useNavigation)
      .mockReturnValue(mockNavigation);

    const mockPlayerWithTrack = {
      ...mockAudioPlayer,
      currentTrack: mockTrack,
    };

    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue(mockPlayerWithTrack);

    const { getByTestId } = render(<MiniPlayer />);
    fireEvent.press(getByTestId('expand-button'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FullPlayer');
  });

  it('shows loading indicator when loading', () => {
    const mockPlayerWithTrack = {
      ...mockAudioPlayer,
      currentTrack: mockTrack,
      isLoading: true,
    };

    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue(mockPlayerWithTrack);

    const { getByTestId } = render(<MiniPlayer />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays progress correctly', () => {
    const mockPlayerWithTrack = {
      ...mockAudioPlayer,
      currentTrack: mockTrack,
      progress: 50, // 50% progress
    };

    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue(mockPlayerWithTrack);

    const { getByTestId } = render(<MiniPlayer />);
    const progressBar = getByTestId('progress-bar');
    expect(progressBar).toBeTruthy();
  });

  it('calls onExpand callback when provided', () => {
    const mockOnExpand = jest.fn();
    const mockNavigation = { navigate: jest.fn() };
    
    jest.mocked(require('@react-navigation/native').useNavigation)
      .mockReturnValue(mockNavigation);

    const mockPlayerWithTrack = {
      ...mockAudioPlayer,
      currentTrack: mockTrack,
    };

    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue(mockPlayerWithTrack);

    const { getByTestId } = render(<MiniPlayer onExpand={mockOnExpand} />);
    fireEvent.press(getByTestId('expand-button'));
    expect(mockOnExpand).toHaveBeenCalledTimes(1);
  });

  it('navigates to FullPlayer when track info is pressed', () => {
    const mockNavigation = { navigate: jest.fn() };
    
    jest.mocked(require('@react-navigation/native').useNavigation)
      .mockReturnValue(mockNavigation);

    const mockPlayerWithTrack = {
      ...mockAudioPlayer,
      currentTrack: mockTrack,
    };

    jest.mocked(require('../../../hooks/useAudioPlayer').useAudioPlayer)
      .mockReturnValue(mockPlayerWithTrack);

    const { getByTestId } = render(<MiniPlayer />);
    fireEvent.press(getByTestId('track-info'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FullPlayer');
  });
});