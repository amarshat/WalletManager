import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Wallet, 
  Clock, 
  Check, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign,
  Landmark,
  AlertCircle,
  DownloadCloud,
  Copy,
  ExternalLink
} from 'lucide-react';

// PaySage Wallet Demo component that can be embedded in various apps
interface WalletTabContentProps {
  appName: string;
  appColor: string;  // 'blue' | 'purple' | 'red'
  customMessage?: string;
  darkMode?: boolean;
}

const WalletTabContent: React.FC<WalletTabContentProps> = ({ 
  appName,
  appColor,
  customMessage,
  darkMode = false
}) => {
  
  // Get tailwind classes based on appColor and darkMode
  const getColorClasses = () => {
    const baseClasses = {
      blue: {
        primary: 'bg-blue-600 hover:bg-blue-700',
        light: 'bg-blue-50 text-blue-800',
        border: 'border-blue-200',
        text: 'text-blue-600',
        gradient: 'from-blue-600 to-blue-800'
      },
      purple: {
        primary: 'bg-purple-600 hover:bg-purple-700',
        light: 'bg-purple-50 text-purple-800',
        border: 'border-purple-200',
        text: 'text-purple-600',
        gradient: 'from-purple-600 to-purple-800'
      },
      red: {
        primary: 'bg-red-600 hover:bg-red-700',
        light: 'bg-red-50 text-red-800',
        border: 'border-red-200',
        text: 'text-red-600',
        gradient: 'from-red-600 to-red-800'
      }
    };

    if (darkMode) {
      return {
        ...baseClasses[appColor as keyof typeof baseClasses],
        card: 'bg-gray-800 border-gray-700',
        innerCard: 'bg-gray-700 border-gray-600',
        tabsList: 'bg-gray-800',
        tabsTrigger: `data-[state=active]:bg-${appColor}-700`,
        text: `text-${appColor}-400`,
        heading: 'text-white',
        description: 'text-gray-400',
        input: 'bg-gray-700 border-gray-600 text-white',
      };
    }

    return {
      ...baseClasses[appColor as keyof typeof baseClasses],
      card: 'bg-white',
      innerCard: 'bg-white',
      tabsList: 'bg-muted',
      tabsTrigger: '',
      heading: 'text-foreground',
      description: 'text-muted-foreground',
      input: 'bg-background',
    };
  };

  const colors = getColorClasses();
  
  const cards = [
    { id: 1, type: 'Visa', number: '•••• 4242', expires: '09/25', default: true },
    { id: 2, type: 'Mastercard', number: '•••• 5555', expires: '12/24', default: false }
  ];
  
  const transactions = [
    { id: 101, type: 'deposit', description: 'Add Funds', amount: 50.00, date: 'April 25, 2023', status: 'completed' },
    { id: 102, type: 'payment', description: `${appName} Purchase`, amount: -24.99, date: 'April 23, 2023', status: 'completed' },
    { id: 103, type: 'payment', description: 'Subscription Renewal', amount: -9.99, date: 'April 15, 2023', status: 'completed' },
    { id: 104, type: 'deposit', description: 'Add Funds', amount: 100.00, date: 'April 10, 2023', status: 'completed' },
  ];

  return (
    <Card className={`${colors.card} relative overflow-hidden`}>
      {/* PaySage Wallet Brand Banner */}
      <div className={`absolute top-0 right-0 px-3 py-1 bg-gradient-to-r ${colors.gradient} text-white text-xs font-medium rounded-bl-md`}>
        Powered by PaySage Wallet
      </div>

      <CardHeader>
        <div className="flex items-center">
          <Wallet className={`h-6 w-6 mr-2 ${colors.text}`} />
          <div>
            <CardTitle className={colors.heading}>Embedded Wallet</CardTitle>
            <CardDescription className={colors.description}>
              {customMessage || `Manage your payment methods and transactions in ${appName}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <Card className={colors.innerCard}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className={colors.heading}>Live PaySage Wallet</CardTitle>
                <CardDescription className={colors.description}>
                  Access your actual wallet directly from {appName}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center" 
                onClick={() => window.open('/dashboard', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1.5" />
                Open Full Wallet
              </Button>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className="relative bg-white rounded-md overflow-hidden" style={{ height: '480px' }}>
                <iframe 
                  src="/dashboard?hideSidebar=true"
                  title="PaySage Wallet Dashboard"
                  className="absolute top-0 left-0 w-full h-full border-0" 
                  style={{ 
                    transform: 'scale(0.95)', 
                    transformOrigin: 'top left',
                    borderRadius: '0 0 8px 8px'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Wallet API Key Section for Demo Purposes */}
        <div className={`mt-8 p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className={`text-sm font-medium ${colors.heading}`}>Your PaySage Wallet API Key</h3>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
            Use this key to integrate with {appName}'s services
          </p>
          <div className={`p-2 text-sm font-mono ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded`}>
            psg_live_deMo1234keY5678foR9012integration3456
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletTabContent;