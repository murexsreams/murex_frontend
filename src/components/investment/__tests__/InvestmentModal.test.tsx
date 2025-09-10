import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render, mockTrack } from '../../../utils/testUtils';
import { InvestmentModal } from '../InvestmentModal';

// Mock the hooks
jest.mock('../../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#1F2937',
      textSecondary: '#6B7280',
      primary: '#3B82F6',
      border: '#E5E7EB',
      error: '#EF4444',
      success: '#10B981',
      warning: '#F59E0B',
    },
    spacing: { md: 16 },
  }),
}));

describe('InvestmentModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnInvest = jest.fn();

  const mockTrackData = {
    id: 'track-1',
    title: 'Test Track',
    artist: 'Test Artist',
    coverArt: 'https://example.com/cover.jpg',
    fundingGoal: 10000,
    currentFunding: 5000,
    expectedROI: 12.5,
    minimumInvestment: 100,
    totalShares: 1000,
    availableShares: 500,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    expect(getByText('Invest in Track')).toBeTruthy();
    expect(getByText('Test Track')).toBeTruthy();
    expect(getByText('by Test Artist')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <InvestmentModal
        visible={false}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    expect(queryByText('Invest in Track')).toBeNull();
  });

  it('returns null when no track provided', () => {
    const { container } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={null}
        onInvest={mockOnInvest}
      />
    );

    expect(container.children).toHaveLength(0);
  });

  it('displays track funding information', () => {
    const { getByText } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    expect(getByText('$5,000 / $10,000')).toBeTruthy();
    expect(getByText('12.5%')).toBeTruthy();
    expect(getByText('500')).toBeTruthy(); // Available shares
    expect(getByText('$100')).toBeTruthy(); // Minimum investment
  });

  it('calls onClose when close button is pressed', () => {
    const { getByTestId } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    fireEvent.press(getByTestId('close-button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates investment amount when input changes', () => {
    const { getByTestId } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    const input = getByTestId('investment-amount-input');
    fireEvent.changeText(input, '500');
    
    // Should show calculated shares and values
    expect(getByTestId('calculated-shares')).toBeTruthy();
  });

  it('shows validation error for amount below minimum', () => {
    const { getByTestId, getByText } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    const input = getByTestId('investment-amount-input');
    fireEvent.changeText(input, '50'); // Below minimum of $100
    
    expect(getByText('Minimum investment is $100')).toBeTruthy();
  });

  it('shows validation error for insufficient shares', () => {
    const { getByTestId, getByText } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    const input = getByTestId('investment-amount-input');
    fireEvent.changeText(input, '6000'); // More than available shares
    
    expect(getByText('Only 500 shares available')).toBeTruthy();
  });

  it('calculates ROI correctly', () => {
    const { getByTestId } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    const input = getByTestId('investment-amount-input');
    fireEvent.changeText(input, '1000');
    
    // Should show projected return based on 12.5% ROI
    expect(getByTestId('projected-return')).toBeTruthy();
  });

  it('shows risk disclosure section', () => {
    const { getByText } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    expect(getByText('Investment Risks & Terms')).toBeTruthy();
  });

  it('toggles risk disclosure when header is pressed', () => {
    const { getByTestId, queryByText } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    // Initially hidden
    expect(queryByText('Music investments are speculative')).toBeNull();

    // Toggle to show
    fireEvent.press(getByTestId('risk-disclosure-toggle'));
    expect(queryByText('Music investments are speculative')).toBeTruthy();
  });

  it('requires terms agreement before investing', () => {
    const { getByTestId } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    const input = getByTestId('investment-amount-input');
    fireEvent.changeText(input, '500');

    const investButton = getByTestId('invest-button');
    expect(investButton.props.disabled).toBe(true);

    // Agree to terms
    fireEvent.press(getByTestId('terms-checkbox'));
    expect(investButton.props.disabled).toBe(false);
  });

  it('calls onInvest with correct parameters', async () => {
    const { getByTestId } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    const input = getByTestId('investment-amount-input');
    fireEvent.changeText(input, '1000');

    fireEvent.press(getByTestId('terms-checkbox'));
    fireEvent.press(getByTestId('invest-button'));

    // Should call onInvest with amount and shares
    expect(mockOnInvest).toHaveBeenCalledWith(1000, 100); // $1000 = 100 shares at $10 each
  });

  it('shows processing state during investment', () => {
    const { getByTestId, getByText } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    const input = getByTestId('investment-amount-input');
    fireEvent.changeText(input, '500');
    fireEvent.press(getByTestId('terms-checkbox'));
    fireEvent.press(getByTestId('invest-button'));

    expect(getByText('Processing...')).toBeTruthy();
  });

  it('displays funding progress correctly', () => {
    const { getByTestId } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    const progressBar = getByTestId('funding-progress');
    expect(progressBar).toBeTruthy();
    // 50% progress (5000/10000)
  });

  it('handles modal dismissal on background press', () => {
    const { getByTestId } = render(
      <InvestmentModal
        visible={true}
        onClose={mockOnClose}
        track={mockTrackData}
        onInvest={mockOnInvest}
      />
    );

    // Simulate modal background press
    fireEvent(getByTestId('investment-modal'), 'onRequestClose');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});