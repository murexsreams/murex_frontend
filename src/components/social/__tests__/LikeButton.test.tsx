import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../../utils/testUtils';
import { LikeButton } from '../LikeButton';

// Mock the hooks
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#3B82F6',
      text: '#1F2937',
      textSecondary: '#6B7280',
      error: '#EF4444',
    },
  }),
}));

jest.mock('../../../hooks/useSocial', () => ({
  useSocial: () => ({
    likeTrack: jest.fn(),
    isLiked: jest.fn(),
  }),
}));

describe('LikeButton Component', () => {
  const mockOnLike = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with like count', () => {
    const { getByText } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={42}
        onLike={mockOnLike}
      />
    );

    expect(getByText('42')).toBeTruthy();
  });

  it('shows heart icon', () => {
    const { getByTestId } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={0}
        onLike={mockOnLike}
      />
    );

    expect(getByTestId('heart-icon')).toBeTruthy();
  });

  it('calls onLike when pressed', () => {
    const { getByTestId } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={0}
        onLike={mockOnLike}
      />
    );

    fireEvent.press(getByTestId('like-button'));
    expect(mockOnLike).toHaveBeenCalledTimes(1);
  });

  it('calls social service likeTrack', () => {
    const mockLikeTrack = jest.fn();
    
    jest.mocked(require('../../../hooks/useSocial').useSocial)
      .mockReturnValue({
        likeTrack: mockLikeTrack,
        isLiked: jest.fn(() => false),
      });

    const { getByTestId } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={0}
        onLike={mockOnLike}
      />
    );

    fireEvent.press(getByTestId('like-button'));
    expect(mockLikeTrack).toHaveBeenCalledWith('track-1', 'track');
  });

  it('shows liked state correctly', () => {
    jest.mocked(require('../../../hooks/useSocial').useSocial)
      .mockReturnValue({
        likeTrack: jest.fn(),
        isLiked: jest.fn(() => true),
      });

    const { getByTestId } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={1}
        onLike={mockOnLike}
        liked
      />
    );

    const heartIcon = getByTestId('heart-icon');
    expect(heartIcon).toBeTruthy();
  });

  it('shows unliked state correctly', () => {
    jest.mocked(require('../../../hooks/useSocial').useSocial)
      .mockReturnValue({
        likeTrack: jest.fn(),
        isLiked: jest.fn(() => false),
      });

    const { getByTestId } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={0}
        onLike={mockOnLike}
        liked={false}
      />
    );

    const heartIcon = getByTestId('heart-icon');
    expect(heartIcon).toBeTruthy();
  });

  it('handles large like counts', () => {
    const { getByText } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={1500}
        onLike={mockOnLike}
      />
    );

    expect(getByText('1.5K')).toBeTruthy();
  });

  it('handles very large like counts', () => {
    const { getByText } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={1500000}
        onLike={mockOnLike}
      />
    );

    expect(getByText('1.5M')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByTestId } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={0}
        onLike={mockOnLike}
        disabled
      />
    );

    fireEvent.press(getByTestId('like-button'));
    expect(mockOnLike).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={0}
        onLike={mockOnLike}
        loading
      />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders in compact mode', () => {
    const { getByTestId } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={42}
        onLike={mockOnLike}
        compact
      />
    );

    expect(getByTestId('like-button')).toBeTruthy();
  });

  it('handles animation on like', () => {
    const { getByTestId } = render(
      <LikeButton 
        targetId="track-1" 
        targetType="track" 
        likeCount={0}
        onLike={mockOnLike}
        animated
      />
    );

    fireEvent.press(getByTestId('like-button'));
    expect(getByTestId('heart-animation')).toBeTruthy();
  });
});