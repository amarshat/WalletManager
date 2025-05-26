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

  // Your wallet URL - fallback to test connectivity
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
    // Hide desktop-only elements and add mobile bottom panel
    const style = document.createElement('style');
    style.innerHTML = \`
      /* Optimize for mobile */
      body {
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        padding-bottom: 80px !important; /* Space for bottom panel */
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
      
      /* Mobile Bottom Panel */
      #mobile-bottom-panel {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 80px;
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 9999;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        backdrop-filter: blur(10px);
      }
      
      .bottom-action {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px 12px;
        color: white;
        text-decoration: none;
        border-radius: 12px;
        min-width: 60px;
        transition: all 0.2s ease;
        cursor: pointer;
      }
      
      .bottom-action:hover {
        background: rgba(255,255,255,0.1);
        transform: translateY(-2px);
      }
      
      .bottom-action-icon {
        font-size: 20px;
        margin-bottom: 4px;
      }
      
      .bottom-action-text {
        font-size: 10px;
        font-weight: 500;
        color: rgba(255,255,255,0.9);
      }
    \`;
    document.head.appendChild(style);
    
    // Create the bottom panel
    const createBottomPanel = () => {
      // Remove existing panel if any
      const existingPanel = document.getElementById('mobile-bottom-panel');
      if (existingPanel) {
        existingPanel.remove();
      }
      
      const panel = document.createElement('div');
      panel.id = 'mobile-bottom-panel';
      panel.innerHTML = \`
        <div class="bottom-action" onclick="navigateToBalance()">
          <div class="bottom-action-icon">💳</div>
          <div class="bottom-action-text">Balance</div>
        </div>
        <div class="bottom-action" onclick="navigateToCards()">
          <div class="bottom-action-icon">🪪</div>
          <div class="bottom-action-text">Cards</div>
        </div>
        <div class="bottom-action" onclick="navigateToSend()">
          <div class="bottom-action-icon">⬆️</div>
          <div class="bottom-action-text">Send</div>
        </div>
        <div class="bottom-action" onclick="navigateToReceive()">
          <div class="bottom-action-icon">⬇️</div>
          <div class="bottom-action-text">Receive</div>
        </div>
        <div class="bottom-action" onclick="navigateToTransactions()">
          <div class="bottom-action-icon">📋</div>
          <div class="bottom-action-text">History</div>
        </div>
      \`;
      
      document.body.appendChild(panel);
    };
    
    // Navigation functions
    window.navigateToBalance = () => {
      // Check if we're on the main dashboard, if not navigate there
      if (!window.location.pathname.includes('/') || window.location.pathname === '/') {
        // We're on the main page, scroll to balance section or trigger balance view
        const balanceElement = document.querySelector('[data-testid="balance"], .balance, #balance');
        if (balanceElement) {
          balanceElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.location.href = '/';
      }
      window.ReactNativeWebView?.postMessage(JSON.stringify({type: 'QUICK_ACTION', action: 'balance'}));
    };
    
    window.navigateToCards = () => {
      // Look for cards navigation or section
      const cardsLink = document.querySelector('a[href*="cards"], a[href*="card"], .cards-nav');
      if (cardsLink) {
        cardsLink.click();
      } else {
        window.location.hash = '#cards';
      }
      window.ReactNativeWebView?.postMessage(JSON.stringify({type: 'QUICK_ACTION', action: 'cards'}));
    };
    
    window.navigateToSend = () => {
      // Look for send money button or link
      const sendButton = document.querySelector('button[data-testid="send"], .send-money, [aria-label*="send"], button:contains("Send")');
      if (sendButton) {
        sendButton.click();
      } else {
        window.location.hash = '#send';
      }
      window.ReactNativeWebView?.postMessage(JSON.stringify({type: 'QUICK_ACTION', action: 'send'}));
    };
    
    window.navigateToReceive = () => {
      // Look for receive money button or link
      const receiveButton = document.querySelector('button[data-testid="receive"], .receive-money, [aria-label*="receive"], button:contains("Add Money")');
      if (receiveButton) {
        receiveButton.click();
      } else {
        window.location.hash = '#receive';
      }
      window.ReactNativeWebView?.postMessage(JSON.stringify({type: 'QUICK_ACTION', action: 'receive'}));
    };
    
    window.navigateToTransactions = () => {
      // Look for transactions link
      const transactionsLink = document.querySelector('a[href*="transaction"], .transactions-nav, [data-testid="transactions"]');
      if (transactionsLink) {
        transactionsLink.click();
      } else {
        window.location.hash = '#transactions';
      }
      window.ReactNativeWebView?.postMessage(JSON.stringify({type: 'QUICK_ACTION', action: 'transactions'}));
    };
    
    // Create panel when page loads
    setTimeout(createBottomPanel, 1000);
    
    // Recreate panel on navigation changes
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(createBottomPanel, 500);
      }
    }).observe(document, {subtree: true, childList: true});
    
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
        originWhitelist={['https://*', 'http://*']}
        userAgent="PaysafeWalletMobile/1.0"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={false}
        allowsLinkPreview={false}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
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