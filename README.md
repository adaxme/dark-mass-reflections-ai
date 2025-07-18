# Catholic Mass Readings - React Native App

A React Native application that provides daily Catholic Mass readings, saint information, and spiritual reflections.

## Features

- **Daily Mass Readings**: First reading, psalm, second reading (when applicable), gospel acclamation, and gospel
- **Saint of the Day**: Information about Catholic saints with biographies, feast days, and prayers
- **Spiritual Reflections**: AI-generated homilies based on the daily gospel reading
- **Multi-language Support**: Available in English, Spanish, and French
- **Offline Storage**: Language preferences are saved locally

## Prerequisites

- Node.js (>= 18)
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd catholic-mass-readings-app
```

2. Install dependencies:
```bash
npm install
```

3. For iOS, install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

## Running the App

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Development Server
```bash
npm start
```

## Building APK

To build a release APK for Android:

```bash
npm run build
```

The APK will be generated in `android/app/build/outputs/apk/release/`

## Project Structure

```
src/
├── contexts/          # React contexts (Language)
├── lib/              # Utility libraries (AI service, readings API)
├── screens/          # Main app screens
└── App.tsx           # Main app component
```

## API Services

- **Universalis API**: Provides daily Catholic Mass readings
- **Google Gemini AI**: Generates spiritual reflections and saint information

## Technologies Used

- React Native 0.73
- React Navigation 6
- AsyncStorage for local data persistence
- Vector Icons for UI elements
- Google Generative AI for content generation

## License

This project is licensed under the MIT License.