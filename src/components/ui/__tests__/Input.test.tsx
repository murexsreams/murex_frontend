import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '../../../utils/testUtils';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders correctly with label', () => {
    const { getByText } = render(<Input label="Test Label" />);
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('renders with placeholder', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text here" />
    );
    expect(getByPlaceholderText('Enter text here')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    const { getByTestId } = render(
      <Input 
        onChangeText={mockOnChangeText} 
        testID="test-input"
      />
    );
    
    fireEvent.changeText(getByTestId('test-input'), 'new text');
    expect(mockOnChangeText).toHaveBeenCalledWith('new text');
  });

  it('shows error message when error prop is provided', () => {
    const { getByText } = render(
      <Input label="Test" error="This field is required" />
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('renders with left icon', () => {
    const MockIcon = () => null;
    const { getByTestId } = render(
      <Input 
        label="With Icon" 
        leftIcon={<MockIcon />}
        testID="input-with-icon"
      />
    );
    expect(getByTestId('input-with-icon')).toBeTruthy();
  });

  it('renders with right icon', () => {
    const MockIcon = () => null;
    const { getByTestId } = render(
      <Input 
        label="With Icon" 
        rightIcon={<MockIcon />}
        testID="input-with-icon"
      />
    );
    expect(getByTestId('input-with-icon')).toBeTruthy();
  });

  it('handles secure text entry', () => {
    const { getByTestId } = render(
      <Input 
        label="Password" 
        secureTextEntry 
        testID="password-input"
      />
    );
    expect(getByTestId('password-input')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnChangeText = jest.fn();
    const { getByTestId } = render(
      <Input 
        onChangeText={mockOnChangeText}
        disabled
        testID="disabled-input"
      />
    );
    
    const input = getByTestId('disabled-input');
    fireEvent.changeText(input, 'test');
    // Disabled input should not call onChangeText
    expect(mockOnChangeText).not.toHaveBeenCalled();
  });

  it('renders multiline input', () => {
    const { getByTestId } = render(
      <Input 
        label="Description" 
        multiline 
        numberOfLines={4}
        testID="multiline-input"
      />
    );
    expect(getByTestId('multiline-input')).toBeTruthy();
  });

  it('handles different keyboard types', () => {
    const { getByTestId } = render(
      <Input 
        label="Email" 
        keyboardType="email-address"
        testID="email-input"
      />
    );
    expect(getByTestId('email-input')).toBeTruthy();
  });

  it('calls onFocus when input is focused', () => {
    const mockOnFocus = jest.fn();
    const { getByTestId } = render(
      <Input 
        onFocus={mockOnFocus}
        testID="focus-input"
      />
    );
    
    fireEvent(getByTestId('focus-input'), 'onFocus');
    expect(mockOnFocus).toHaveBeenCalledTimes(1);
  });

  it('calls onBlur when input loses focus', () => {
    const mockOnBlur = jest.fn();
    const { getByTestId } = render(
      <Input 
        onBlur={mockOnBlur}
        testID="blur-input"
      />
    );
    
    fireEvent(getByTestId('blur-input'), 'onBlur');
    expect(mockOnBlur).toHaveBeenCalledTimes(1);
  });

  it('applies custom styles', () => {
    const customStyle = { borderColor: 'red' };
    const { getByTestId } = render(
      <Input 
        label="Custom Style" 
        style={customStyle}
        testID="custom-input"
      />
    );
    expect(getByTestId('custom-input')).toBeTruthy();
  });
});