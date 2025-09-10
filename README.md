# Murex Streams - Music Investment Platform

A React Native mobile application that allows artists to raise funds for their music and investors to earn returns from streaming performance.

## 🎨 Design System

Based on the Figma design specifications with a focus on:
- **Dark Theme**: Primary with Dark Blue (#0B0C2A) background and Gold (#FFD700) accents
- **Light Theme**: Clean white background with consistent gold branding
- **Typography**: Montserrat for headings, Inter for body text
- **Components**: Reusable UI components following design system principles

## 🏗️ Architecture

### Project Structure
```
src/
├── components/
│   └── ui/                 # Reusable UI components
│       ├── Button.tsx      # Primary/Secondary/Ghost button variants
│       ├── Input.tsx       # Form input with validation
│       ├── Card.tsx        # Container component
│       └── ThemeToggle.tsx # Light/Dark mode toggle
├── constants/
│   └── theme.ts           # Design tokens and theme configuration
├── hooks/
│   └── useTheme.ts        # Theme context hook
├── navigation/
│   ├── AuthNavigator.tsx  # Authentication flow navigation
│   └── AppNavigator.tsx   # Main app navigation
├── screens/
│   ├── auth/              # Authentication screens
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   └── dashboard/         # Dashboard screens
│       ├── ArtistDashboard.tsx
│       └── InvestorDashboard.tsx
└── store/
    ├── authStore.ts       # Authentication state management
    └── themeStore.ts      # Theme state management
```

### Key Features Implemented

#### 🔐 Authentication System
- **Login/Register**: Email/password authentication with form validation
- **Role Selection**: Users can choose between Artist or Investor roles
- **Mock Authentication**: Simulated backend with persistent storage
- **Wallet Integration**: Placeholder for Web3 wallet connection

#### 🎨 Theme System
- **Dual Themes**: Light and dark mode support
- **Persistent Storage**: Theme preference saved locally
- **Design Tokens**: Centralized color, typography, and spacing system
- **Responsive Components**: All UI components adapt to theme changes

#### 📱 User Dashboards

**Artist Dashboard:**
- Portfolio metrics (streams, revenue, followers)
- Track management with funding progress
- Upload music interface (placeholder)
- Revenue withdrawal options

**Investor Dashboard:**
- Investment portfolio overview
- Trending tracks discovery
- Investment opportunities with ROI estimates
- Portfolio performance tracking

#### 🧩 UI Components
- **Button**: Primary (gradient), Secondary (outlined), Ghost variants
- **Input**: Form inputs with validation, password visibility toggle
- **Card**: Flexible container with shadow and padding options
- **ThemeToggle**: Switch between light/dark modes

### 🛠️ Technical Implementation

#### State Management
- **Zustand**: Lightweight state management for auth and theme
- **Persistent Storage**: AsyncStorage integration for data persistence
- **Type Safety**: Full TypeScript implementation

#### Navigation
- **React Navigation**: Stack and tab navigation
- **Role-based Routing**: Different navigation based on user role
- **Theme Integration**: Navigation components adapt to theme

#### Security & Best Practices
- **Input Validation**: Client-side form validation with error handling
- **Password Security**: Secure text entry with visibility toggle
- **Type Safety**: Comprehensive TypeScript coverage
- **Error Handling**: Graceful error handling with user feedback

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator

### Installation
```bash
cd murex/murex-streams
npm install
```

### Running the App
```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

### Test Credentials
- **Email**: test@example.com
- **Password**: password

## 🎯 Current Status

### ✅ Completed Features
- Theme system with light/dark mode
- Authentication flow with role selection
- Artist and Investor dashboards
- Reusable UI component library
- Navigation structure
- Mock data and state management

### 🚧 Next Steps
- Backend API integration
- Real authentication system
- Music upload functionality
- Investment transaction processing
- Audio player implementation
- Social features (likes, comments, follows)
- Push notifications
- Wallet integration

## 🎨 Design Compliance

The implementation follows the Figma design specifications:
- ✅ Color palette (Gold #FFD700, Dark Blue #0B0C2A)
- ✅ Typography hierarchy (Montserrat, Inter)
- ✅ Component variants (buttons, inputs, cards)
- ✅ Dark theme as primary design
- ✅ Light theme for accessibility
- ✅ Responsive design principles
- ✅ Accessibility considerations

## 📱 Platform Support

- **iOS**: Full support with native navigation
- **Android**: Full support with material design compliance
- **Web**: Basic support for development and testing

## 🔧 Development Notes

- All components are built with scalability in mind
- Theme system allows easy customization
- Mock authentication can be easily replaced with real backend
- Component library follows atomic design principles
- Code is structured for maintainability and testing