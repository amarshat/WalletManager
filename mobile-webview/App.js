import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  BackHandler,
  Text,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef(null);

  // Your wallet URL
  const WALLET_URL = 'https://wallet.amar.im';

  // Handle back button on Android
  React.useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior (exit app)
    };

    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }
  }, [canGoBack]);

  const onLoadStart = () => {
    setIsLoading(true);
  };

  const onLoadEnd = () => {
    setIsLoading(false);
    SplashScreen.hideAsync();
  };

  const onNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
  };

  const onError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    Alert.alert(
      'Connection Error',
      'Unable to load the wallet. Please check your internet connection and try again.',
      [
        {
          text: 'Retry',
          onPress: () => webViewRef.current?.reload(),
        },
      ]
    );
  };

  // Inject JavaScript to enhance mobile experience
  const injectedJavaScript = `
    // Hide desktop-only elements
    const style = document.createElement('style');
    style.innerHTML = \`
      /* Optimize for mobile */
      body {
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }
      
      /* Hide scrollbars */
      ::-webkit-scrollbar {
        width: 0px;
        background: transparent;
      }
      
      /* Improve tap targets */
      button, a, input, select {
        min-height: 44px;
      }
    \`;
    document.head.appendChild(style);
    
    // Notify React Native when the page is ready
    window.ReactNativeWebView?.postMessage(JSON.stringify({
      type: 'PAGE_LOADED',
      url: window.location.href
    }));
    
    true; // Required for iOS
  `;

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', data);
      
      // Handle specific messages from the web app if needed
      switch (data.type) {
        case 'PAGE_LOADED':
          console.log('Page loaded:', data.url);
          break;
        default:
          break;
      }
    } catch (error) {
      console.log('Non-JSON message:', event.nativeEvent.data);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4f46e5" />
      
      <WebView
        ref={webViewRef}
        source={{ uri: WALLET_URL }}
        style={styles.webview}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
        onNavigationStateChange={onNavigationStateChange}
        onError={onError}
        onMessage={onMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={true}
        allowsBackForwardNavigationGestures={true}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        userAgent="PaysafeWalletMobile/1.0"
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        )}
        renderError={(errorDomain, errorCode, errorDesc) => (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load wallet</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => webViewRef.current?.reload()}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4f46e5',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});