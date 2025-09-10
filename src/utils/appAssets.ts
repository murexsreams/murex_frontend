// App assets and branding utilities
export const APP_ASSETS = {
  // App Icons (different sizes for different platforms)
  icons: {
    ios: {
      '20x20': require('../../assets/icons/ios/icon-20.png'),
      '29x29': require('../../assets/icons/ios/icon-29.png'),
      '40x40': require('../../assets/icons/ios/icon-40.png'),
      '58x58': require('../../assets/icons/ios/icon-58.png'),
      '60x60': require('../../assets/icons/ios/icon-60.png'),
      '80x80': require('../../assets/icons/ios/icon-80.png'),
      '87x87': require('../../assets/icons/ios/icon-87.png'),
      '120x120': require('../../assets/icons/ios/icon-120.png'),
      '180x180': require('../../assets/icons/ios/icon-180.png'),
      '1024x1024': require('../../assets/icons/ios/icon-1024.png'),
    },
    android: {
      'mdpi': require('../../assets/icons/android/icon-48.png'),
      'hdpi': require('../../assets/icons/android/icon-72.png'),
      'xhdpi': require('../../assets/icons/android/icon-96.png'),
      'xxhdpi': require('../../assets/icons/android/icon-144.png'),
      'xxxhdpi': require('../../assets/icons/android/icon-192.png'),
    },
  },
  
  // Splash Screens
  splash: {
    default: require('../../assets/splash/splash.png'),
    ios: {
      'iPhone5': require('../../assets/splash/ios/splash-640x1136.png'),
      'iPhone6': require('../../assets/splash/ios/splash-750x1334.png'),
      'iPhone6Plus': require('../../assets/splash/ios/splash-1242x2208.png'),
      'iPhoneX': require('../../assets/splash/ios/splash-1125x2436.png'),
      'iPad': require('../../assets/splash/ios/splash-1536x2048.png'),
      'iPadPro': require('../../assets/splash/ios/splash-2048x2732.png'),
    },
    android: {
      'mdpi': require('../../assets/splash/android/splash-320x480.png'),
      'hdpi': require('../../assets/splash/android/splash-480x800.png'),
      'xhdpi': require('../../assets/splash/android/splash-720x1280.png'),
      'xxhdpi': require('../../assets/splash/android/splash-960x1600.png'),
      'xxxhdpi': require('../../assets/splash/android/splash-1280x1920.png'),
    },
  },
  
  // App Store Assets
  appStore: {
    screenshots: {
      ios: {
        'iPhone6.5': [
          require('../../assets/screenshots/ios/6.5/screenshot-1.png'),
          require('../../assets/screenshots/ios/6.5/screenshot-2.png'),
          require('../../assets/screenshots/ios/6.5/screenshot-3.png'),
          require('../../assets/screenshots/ios/6.5/screenshot-4.png'),
          require('../../assets/screenshots/ios/6.5/screenshot-5.png'),
        ],
        'iPhone5.5': [
          require('../../assets/screenshots/ios/5.5/screenshot-1.png'),
          require('../../assets/screenshots/ios/5.5/screenshot-2.png'),
          require('../../assets/screenshots/ios/5.5/screenshot-3.png'),
          require('../../assets/screenshots/ios/5.5/screenshot-4.png'),
          require('../../assets/screenshots/ios/5.5/screenshot-5.png'),
        ],
        'iPad': [
          require('../../assets/screenshots/ios/ipad/screenshot-1.png'),
          require('../../assets/screenshots/ios/ipad/screenshot-2.png'),
          require('../../assets/screenshots/ios/ipad/screenshot-3.png'),
          require('../../assets/screenshots/ios/ipad/screenshot-4.png'),
          require('../../assets/screenshots/ios/ipad/screenshot-5.png'),
        ],
      },
      android: {
        'phone': [
          require('../../assets/screenshots/android/phone/screenshot-1.png'),
          require('../../assets/screenshots/android/phone/screenshot-2.png'),
          require('../../assets/screenshots/android/phone/screenshot-3.png'),
          require('../../assets/screenshots/android/phone/screenshot-4.png'),
          require('../../assets/screenshots/android/phone/screenshot-5.png'),
        ],
        'tablet': [
          require('../../assets/screenshots/android/tablet/screenshot-1.png'),
          require('../../assets/screenshots/android/tablet/screenshot-2.png'),
          require('../../assets/screenshots/android/tablet/screenshot-3.png'),
          require('../../assets/screenshots/android/tablet/screenshot-4.png'),
          require('../../assets/screenshots/android/tablet/screenshot-5.png'),
        ],
      },
    },
    
    // Feature Graphics
    featureGraphic: require('../../assets/store/feature-graphic.png'),
    promoGraphic: require('../../assets/store/promo-graphic.png'),
  },
  
  // Branding
  branding: {
    logo: require('../../assets/branding/logo.png'),
    logoWhite: require('../../assets/branding/logo-white.png'),
    logoMark: require('../../assets/branding/logo-mark.png'),
    wordmark: require('../../assets/branding/wordmark.png'),
  },
  
  // Onboarding
  onboarding: {
    welcome: require('../../assets/onboarding/welcome.png'),
    discover: require('../../assets/onboarding/discover.png'),
    invest: require('../../assets/onboarding/invest.png'),
    earn: require('../../assets/onboarding/earn.png'),
  },
};

// App Store Metadata
export const APP_STORE_METADATA = {
  // Basic Info
  name: 'Murex Streams',
  subtitle: 'Invest in Music, Earn from Streams',
  description: {
    short: 'Discover emerging artists, invest in their music, and earn returns from streaming revenue.',
    full: `Murex Streams revolutionizes music investment by connecting fans directly with emerging artists. 

🎵 DISCOVER NEW MUSIC
• Explore trending tracks from up-and-coming artists
• Filter by genre, investment potential, and popularity
• Get early access to the next big hits

💰 INVEST IN ARTISTS
• Support your favorite artists with direct investments
• Earn returns based on streaming performance
• Track your portfolio and ROI in real-time

🎧 PREMIUM LISTENING
• High-quality audio streaming
• Personalized playlists and recommendations
• Offline listening for invested tracks

🤝 CONNECT WITH ARTISTS
• Follow artists and get updates on new releases
• Comment and engage with the music community
• Share your favorite discoveries

📊 TRANSPARENT RETURNS
• Real-time streaming analytics
• Clear ROI calculations and projections
• Secure USDC-based transactions

Join the future of music investment and help shape the careers of tomorrow's superstars while earning from their success.`,
  },
  
  // Keywords for App Store Optimization
  keywords: [
    'music investment',
    'streaming revenue',
    'artist funding',
    'music discovery',
    'crypto music',
    'USDC',
    'music streaming',
    'artist support',
    'music portfolio',
    'emerging artists',
    'music ROI',
    'decentralized music',
  ],
  
  // Categories
  category: {
    primary: 'Music',
    secondary: 'Finance',
  },
  
  // Age Rating
  ageRating: '12+',
  
  // Privacy Policy URL
  privacyPolicyUrl: 'https://murexstreams.com/privacy',
  
  // Terms of Service URL
  termsOfServiceUrl: 'https://murexstreams.com/terms',
  
  // Support URL
  supportUrl: 'https://murexstreams.com/support',
  
  // Marketing URL
  marketingUrl: 'https://murexstreams.com',
  
  // Version Info
  version: '1.0.0',
  buildNumber: '1',
  
  // What's New (for updates)
  whatsNew: `🎉 Welcome to Murex Streams v1.0!

• Discover and invest in emerging music artists
• Earn returns from streaming revenue
• High-quality audio streaming experience
• Secure USDC-based transactions
• Real-time portfolio tracking
• Social features to connect with artists and fans

Start your music investment journey today!`,
  
  // Promotional Text
  promotionalText: 'Limited time: Get 10% bonus on your first investment! Discover the next big hit and earn from streaming success.',
};

// Screenshot Descriptions (for accessibility and context)
export const SCREENSHOT_DESCRIPTIONS = {
  ios: {
    '6.5': [
      'Discover trending music from emerging artists with investment opportunities',
      'View detailed track information, streaming stats, and investment potential',
      'Invest in your favorite tracks with secure USDC transactions',
      'Track your music investment portfolio and earnings in real-time',
      'Enjoy high-quality streaming with personalized playlists and recommendations',
    ],
  },
  android: {
    phone: [
      'Browse and discover new music from up-and-coming artists',
      'Analyze investment opportunities with detailed ROI calculations',
      'Make secure investments using USDC cryptocurrency',
      'Monitor your portfolio performance and streaming revenue',
      'Stream music with premium quality and social features',
    ],
  },
};

// App Store Review Guidelines Compliance
export const COMPLIANCE_CHECKLIST = {
  content: {
    appropriateForAgeRating: true,
    noOffensiveContent: true,
    accurateMetadata: true,
    functionalLinks: true,
  },
  
  functionality: {
    crashFree: true,
    completeFeatures: true,
    properNavigation: true,
    appropriatePermissions: true,
  },
  
  business: {
    clearMonetization: true,
    transparentPricing: true,
    properFinancialDisclosures: true,
    complianceWithFinancialRegulations: true,
  },
  
  legal: {
    privacyPolicy: true,
    termsOfService: true,
    properCopyrights: true,
    noTrademarkViolations: true,
  },
  
  technical: {
    properApiUsage: true,
    secureDataHandling: true,
    appropriatePermissions: true,
    noPrivateApis: true,
  },
};

export default {
  APP_ASSETS,
  APP_STORE_METADATA,
  SCREENSHOT_DESCRIPTIONS,
  COMPLIANCE_CHECKLIST,
};