import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { useState } from 'react';

interface EmbeddingCodeProps {
  language: string;
  framework: string;
}

const EmbeddingCode: React.FC<EmbeddingCodeProps> = ({ language, framework }) => {
  const [copied, setCopied] = useState(false);

  const getAppName = () => {
    if (framework === 'React') return 'BingGo Parking';
    if (framework === 'Angular') return 'Jehovah\'s Witnesses Portal';
    if (framework === 'Vanilla JS') return 'FusionForge Gaming';
    return 'Your Application';
  };

  const getEmbeddingCode = () => {
    const appName = getAppName();
    
    switch (framework) {
      case 'React':
        return `
// Install dependencies first
// npm install paysage-wallet-sdk react-paysage-wallet

import React from 'react';
import { PaySageWallet } from 'react-paysage-wallet';

// Initialize the PaySage SDK with your API key and configuration
const walletConfig = {
  apiKey: 'YOUR_API_KEY',
  environment: 'sandbox', // or 'production'
  brandingId: 'YOUR_BRANDING_ID', // Optional - use your custom branding
  theme: {
    primaryColor: '#3B82F6',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '0.5rem'
  }
};

function MyApp() {
  return (
    <div className="my-app">
      <h1>Welcome to ${appName}</h1>
      
      {/* Other app content */}
      
      {/* Embedded PaySage Wallet */}
      <PaySageWallet 
        config={walletConfig}
        userId="user123"
        showHeader={true}
        allowedCurrencies={['USD', 'EUR']}
        onTransaction={(data) => console.log('Transaction:', data)}
        embedMode={true} // Set to true to customize the UI for embedded view
      />
    </div>
  );
}

export default MyApp;`;

      case 'Angular':
        return `
// Install dependencies first
// npm install paysage-wallet-sdk @paysage/angular

import { Component, OnInit } from '@angular/core';
import { PaySageWalletService } from '@paysage/angular';

@Component({
  selector: 'app-wallet',
  template: \`
    <div class="my-app">
      <h1>Welcome to ${appName}</h1>
      
      <!-- Other app content -->
      
      <!-- Embedded PaySage Wallet -->
      <div class="wallet-container" #walletContainer></div>
    </div>
  \`,
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  constructor(private paysageService: PaySageWalletService) {}

  ngOnInit() {
    // Initialize the wallet with configuration
    this.paysageService.initialize({
      apiKey: 'YOUR_API_KEY',
      environment: 'sandbox', // or 'production'
      brandingId: 'YOUR_BRANDING_ID', // Optional - custom branding
      userId: 'user123',
      elementId: 'walletContainer',
      theme: {
        primaryColor: '#8B5CF6',
        fontFamily: 'Roboto, sans-serif',
        borderRadius: '0.5rem'
      },
      embedMode: true, // Set to true to customize the UI for embedded view
      callbacks: {
        onTransaction: (data) => console.log('Transaction:', data)
      }
    });
  }
}`;

      case 'Vanilla JS':
        return `
// Include the PaySage Wallet SDK on your page
// <script src="https://cdn.paysagewallet.com/sdk/v1/paysage-wallet.js"></script>

// Initialize the wallet when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the PaySage SDK with your API key and configuration
  const paysageWallet = new PaySageWallet.init({
    apiKey: 'YOUR_API_KEY',
    environment: 'sandbox', // or 'production'
    brandingId: 'YOUR_BRANDING_ID', // Optional - custom branding
    containerId: 'wallet-container',
    userId: 'user123',
    theme: {
      primaryColor: '#EF4444',
      fontFamily: 'Poppins, sans-serif',
      borderRadius: '0.75rem'
    },
    showHeader: true,
    embedMode: true, // Set to true to customize the UI for embedded view
    allowedCurrencies: ['USD', 'EUR', 'GBP'],
    callbacks: {
      onTransaction: function(data) {
        console.log('Transaction:', data);
      },
      onReady: function() {
        console.log('Wallet is ready');
      },
      onError: function(error) {
        console.error('Wallet error:', error);
      }
    }
  });
});

// In your HTML:
// <div id="wallet-container" class="wallet-wrapper"></div>
`;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    const code = getEmbeddingCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{framework} Integration Code</CardTitle>
            <CardDescription>Copy and paste this code to embed the PaySage Wallet in your application</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="flex items-center gap-1"
          >
            {copied ? (
              <>
                <CheckIcon className="h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
          <code>{getEmbeddingCode()}</code>
        </pre>
      </CardContent>
    </Card>
  );
};

export default EmbeddingCode;