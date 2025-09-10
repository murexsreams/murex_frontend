# Testing Documentation

This directory contains comprehensive tests for the Murex Streams platform.

## Test Structure

```
src/
├── __tests__/
│   ├── integration/          # Integration tests
│   └── README.md            # This file
├── components/
│   ├── ui/__tests__/        # UI component tests
│   ├── music/__tests__/     # Music component tests
│   ├── social/__tests__/    # Social component tests
│   └── investment/__tests__/ # Investment component tests
├── store/__tests__/         # Store/state management tests
└── utils/
    ├── testUtils.tsx        # Test utilities and helpers
    └── testSetup.ts         # Jest setup configuration
```

## Test Categories

### 1. Unit Tests
- **UI Components**: Button, Input, and other reusable components
- **Business Logic**: Store functions, utilities, and hooks
- **Services**: API services, audio services, and data processing

### 2. Integration Tests
- **Music Player Flow**: Track selection, playback, and controls
- **Investment Flow**: Track investment, portfolio management
- **Social Features**: Likes, comments, follows, and sharing
- **Navigation**: Screen transitions and deep linking

### 3. Component Tests
- **Music Components**: MiniPlayer, FullPlayer, TrackCard, etc.
- **Social Components**: LikeButton, CommentSection, ShareButton
- **Investment Components**: InvestmentModal, PortfolioCard, ROICalculator
- **UI Components**: Button, Input, and form components

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="renders correctly"
```

## Test Utilities

### Custom Render Function
```typescript
import { render } from '../utils/testUtils';

// Automatically wraps components with necessary providers
const { getByText } = render(<MyComponent />);
```

### Mock Data
```typescript
import { mockTrack, mockUser, mockInvestment } from '../utils/testUtils';

// Use predefined mock objects in tests
const component = render(<TrackCard track={mockTrack} />);
```

### Navigation Mocking
```typescript
import { mockNavigation } from '../utils/testUtils';

// Mock navigation functions
jest.mocked(useNavigation).mockReturnValue(mockNavigation);
```

## Testing Best Practices

### 1. Test Structure
- **Arrange**: Set up test data and mocks
- **Act**: Perform the action being tested
- **Assert**: Verify the expected outcome

### 2. Test Naming
- Use descriptive test names that explain what is being tested
- Follow the pattern: "should [expected behavior] when [condition]"

### 3. Mock Strategy
- Mock external dependencies (APIs, navigation, storage)
- Use real implementations for internal logic when possible
- Keep mocks simple and focused

### 4. Assertions
- Test user-visible behavior, not implementation details
- Use semantic queries (getByRole, getByLabelText) when possible
- Verify accessibility attributes

### 5. Async Testing
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(getByText('Loading...')).toBeTruthy();
});

// Use act for state updates
await act(async () => {
  await userEvent.press(button);
});
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Key Test Files

### Component Tests
- `Button.test.tsx` - Basic UI component functionality
- `Input.test.tsx` - Form input validation and interaction
- `MiniPlayer.test.tsx` - Music player controls and state
- `TrackCard.test.tsx` - Track display and interaction
- `LikeButton.test.tsx` - Social interaction functionality
- `InvestmentModal.test.tsx` - Investment flow validation

### Store Tests
- `tracksStore.test.ts` - Track data management and filtering
- `themeStore.test.ts` - Theme switching and preferences

### Integration Tests
- `musicPlayer.integration.test.tsx` - End-to-end music playback flow

## Accessibility Testing

All components should be tested for accessibility:

```typescript
// Test for proper labels
expect(getByLabelText('Play track')).toBeTruthy();

// Test for semantic roles
expect(getByRole('button')).toBeTruthy();

// Test for screen reader support
expect(getByA11yLabel('Track information')).toBeTruthy();
```

## Performance Testing

Critical user flows should include performance considerations:

```typescript
// Test for reasonable render times
const startTime = performance.now();
render(<ExpensiveComponent />);
const renderTime = performance.now() - startTime;
expect(renderTime).toBeLessThan(100); // 100ms threshold
```

## Debugging Tests

### Common Issues
1. **Async operations**: Use `waitFor` and `act` appropriately
2. **Navigation mocks**: Ensure navigation is properly mocked
3. **Store state**: Reset store state between tests
4. **Timers**: Use `jest.useFakeTimers()` for time-dependent code

### Debug Tools
```typescript
// Debug rendered component
screen.debug();

// Log queries
screen.logTestingPlaygroundURL();

// Check what's rendered
console.log(container.innerHTML);
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Release builds

### CI Configuration
- Tests must pass before merging
- Coverage reports are generated
- Performance regression detection
- Accessibility compliance checks

## Future Improvements

1. **Visual Regression Testing**: Add screenshot testing for UI components
2. **E2E Testing**: Implement end-to-end tests with Detox
3. **Performance Monitoring**: Add performance benchmarks
4. **Accessibility Auditing**: Automated accessibility testing
5. **API Contract Testing**: Validate API responses and contracts