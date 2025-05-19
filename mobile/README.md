# PaySage Wallet Mobile App

This is the mobile version of PaySage Wallet, a comprehensive digital wallet solution for both iOS and Android platforms.

## Installation Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- For iOS: macOS with Xcode installed
- For Android: Android Studio with an emulator set up

### Getting Started

1. Clone the repository and navigate to the mobile folder:
   ```
   cd mobile
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or with yarn:
   ```
   yarn install
   ```

3. Start the Expo development server:
   ```
   npm start
   ```
   or with yarn:
   ```
   yarn start
   ```

4. Install on your device:

### iOS Installation

**Option 1: Using the Expo Go App (Easiest)**
1. Install the "Expo Go" app from the App Store on your iOS device
2. Scan the QR code shown in your terminal after running `npm start`
3. The app will open in Expo Go

**Option 2: Build a Standalone App**
1. Install EAS CLI: `npm install -g eas-cli`
2. Log in to your Expo account: `eas login`
3. Configure the build: `eas build:configure`
4. Start the iOS build: `eas build --platform ios`
5. Follow the prompts to create a build
6. Once the build is complete, download and install the .ipa file

### Android Installation

**Option 1: Using the Expo Go App (Easiest)**
1. Install the "Expo Go" app from the Google Play Store on your Android device
2. Scan the QR code shown in your terminal after running `npm start`
3. The app will open in Expo Go

**Option 2: Build a Standalone App**
1. Install EAS CLI: `npm install -g eas-cli`
2. Log in to your Expo account: `eas login`
3. Configure the build: `eas build:configure`
4. Start the Android build: `eas build --platform android`
5. Follow the prompts to create a build
6. Once the build is complete, download and install the .apk file

### Running on Simulators/Emulators

1. Start the development server: `npm start` or `yarn start`
2. For iOS: Press `i` in the terminal to open in iOS simulator (requires Xcode)
3. For Android: Press `a` in the terminal to open in Android emulator (requires Android Studio)

## Features

- User authentication (login and registration)
- Wallet dashboard with balance overview
- Send and receive money
- Transaction history and management
- Cards management (debit and prepaid cards)
- Budget tracking
- Carbon impact tracking
- User profile management

## Troubleshooting

If you encounter any issues during installation or runtime:

1. Make sure you have the latest version of Node.js and npm/yarn
2. Try clearing the npm/yarn cache: `npm cache clean -f` or `yarn cache clean`
3. Delete the node_modules folder and reinstall dependencies
4. For Android build issues, make sure Android Studio is properly configured
5. For iOS build issues, make sure Xcode is up to date

## Contact

For support or questions, please contact support@paysagewallet.com