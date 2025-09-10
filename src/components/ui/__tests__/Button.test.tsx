import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../../utils/testUtils';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled />
    );
    
    const button = getByText('Test Button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <Button title="Test Button" loading testID="test-button" />
    );
    
    expect(getByTestId('test-button')).toBeTruthy();
  });

  it('renders with different variants', () => {
    const { getByText: getPrimary } = render(
      <Button title="Primary" variant="primary" />
    );
    const { getByText: getSecondary } = render(
      <Button title="Secondary" variant="secondary" />
    );
    
    expect(getPrimary('Primary')).toBeTruthy();
    expect(getSecondary('Secondary')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { getByText: getSmall } = render(
      <Button title="Small" size="small" />
    );
    const { getByText: getLarge } = render(
      <Button title="Large" size="large" />
    );
    
    expect(getSmall('Small')).toBeTruthy();
    expect(getLarge('Large')).toBeTruthy();
  });

  it('renders with left icon', () => {
    const MockIcon = () => null;
    const { getByText } = render(
      <Button title="With Icon" leftIcon={<MockIcon />} />
    );
    
    expect(getByText('With Icon')).toBeTruthy();
  });

  it('renders with right icon', () => {
    const MockIcon = () => null;
    const { getByText } = render(
      <Button title="With Icon" rightIcon={<MockIcon />} />
    );
    
    expect(getByText('With Icon')).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <Button 
        title="Custom Style" 
        style={customStyle} 
        testID="custom-button"
      />
    );
    
    expect(getByTestId('custom-button')).toBeTruthy();
  });

  it('handles long press', () => {
    const mockOnLongPress = jest.fn();
    const { getByText } = render(
      <Button title="Long Press" onLongPress={mockOnLongPress} />
    );
    
    fireEvent(getByText('Long Press'), 'onLongPress');
    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
  });
});