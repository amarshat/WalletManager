import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [walletTab, setWalletTab] = useState('balance');
  
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
        <Tabs value={walletTab} onValueChange={setWalletTab} className="w-full">
          <TabsList className={`grid grid-cols-4 w-full mb-4 ${colors.tabsList}`}>
            <TabsTrigger value="balance" className={colors.tabsTrigger}>Balance</TabsTrigger>
            <TabsTrigger value="cards" className={colors.tabsTrigger}>Payment Methods</TabsTrigger>
            <TabsTrigger value="transactions" className={colors.tabsTrigger}>Transactions</TabsTrigger>
            <TabsTrigger value="real-wallet" className={colors.tabsTrigger}>
              <Badge variant="outline" className="mr-1.5">Live</Badge>
              Real Wallet
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="balance" className="space-y-4">
            {/* Balance Card */}
            <Card className={colors.innerCard}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <h3 className={`text-sm font-medium ${colors.description}`}>Current Balance</h3>
                    <div className="flex items-center mt-1">
                      <span className={`text-3xl font-bold ${colors.heading}`}>$215.75</span>
                      <Badge className={`ml-2 ${colors.light} ${colors.border}`}>Available</Badge>
                    </div>
                  </div>
                  <div className="flex mt-4 md:mt-0 space-x-2">
                    <Button className={colors.primary}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                    <Button variant="outline">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Withdraw
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={colors.innerCard}>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-full bg-${appColor}-100 mr-4`}>
                      <DollarSign className={colors.text} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${colors.heading}`}>Make a Payment</h3>
                      <p className={`text-sm mt-1 ${colors.description}`}>
                        Pay for products and services in {appName}
                      </p>
                      <Button className={`mt-3 ${colors.primary}`}>Pay Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className={colors.innerCard}>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-full bg-${appColor}-100 mr-4`}>
                      <Landmark className={colors.text} />
                    </div>
                    <div>
                      <h3 className={`font-medium ${colors.heading}`}>Link Bank Account</h3>
                      <p className={`text-sm mt-1 ${colors.description}`}>
                        Connect your bank for easy transfers
                      </p>
                      <Button className={`mt-3 ${colors.primary}`}>Link Account</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activity */}
            <h3 className={`text-lg font-medium mt-6 ${colors.heading}`}>Recent Activity</h3>
            <div className="space-y-3">
              {transactions.slice(0, 3).map(transaction => (
                <Card key={transaction.id} className={colors.innerCard}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      {transaction.type === 'deposit' ? (
                        <ArrowDownLeft className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-500 mr-3" />
                      )}
                      <div>
                        <p className={colors.heading}>{transaction.description}</p>
                        <p className={`text-xs ${colors.description}`}>{transaction.date}</p>
                      </div>
                    </div>
                    <span className={transaction.amount > 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center mt-2">
              <Button 
                variant="ghost" 
                onClick={() => setWalletTab('transactions')}
                className={`text-sm ${colors.text}`}
              >
                View All Transactions
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="cards" className="space-y-4">
            {/* Payment Methods */}
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${colors.heading}`}>Your Payment Methods</h3>
              <Button className={colors.primary}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Card
              </Button>
            </div>
            
            <div className="space-y-3">
              {cards.map(card => (
                <Card key={card.id} className={colors.innerCard}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <CreditCard className={`h-5 w-5 mr-3 ${colors.text}`} />
                        <div>
                          <div className="flex items-center">
                            <p className={colors.heading}>{card.type} {card.number}</p>
                            {card.default && (
                              <Badge className={`ml-2 ${colors.light} ${colors.border}`}>Default</Badge>
                            )}
                          </div>
                          <p className={`text-xs ${colors.description}`}>Expires {card.expires}</p>
                        </div>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm" className="text-red-500">Remove</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Add New Card Form */}
            <Card className={colors.innerCard}>
              <CardHeader>
                <CardTitle className={`text-lg ${colors.heading}`}>Add New Payment Method</CardTitle>
                <CardDescription className={colors.description}>
                  All card information is securely encrypted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="cardNumber" className={`text-sm font-medium ${colors.heading}`}>Card Number</label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" className={colors.input} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="expiry" className={`text-sm font-medium ${colors.heading}`}>Expiry Date</label>
                      <Input id="expiry" placeholder="MM/YY" className={colors.input} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="cvc" className={`text-sm font-medium ${colors.heading}`}>CVC</label>
                      <Input id="cvc" placeholder="123" className={colors.input} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="name" className={`text-sm font-medium ${colors.heading}`}>Cardholder Name</label>
                    <Input id="name" placeholder="Name on card" className={colors.input} />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button className={colors.primary}>Save Card</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="real-wallet" className="space-y-4">
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
                    src="/dashboard"
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
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${colors.heading}`}>Transaction History</h3>
              <Button variant="outline" className="flex items-center">
                <DownloadCloud className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <Card className={colors.innerCard}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`py-3 px-4 text-left text-xs font-medium ${colors.description} uppercase tracking-wider`}>Date</th>
                      <th className={`py-3 px-4 text-left text-xs font-medium ${colors.description} uppercase tracking-wider`}>Description</th>
                      <th className={`py-3 px-4 text-right text-xs font-medium ${colors.description} uppercase tracking-wider`}>Amount</th>
                      <th className={`py-3 px-4 text-right text-xs font-medium ${colors.description} uppercase tracking-wider`}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map(transaction => (
                      <tr key={transaction.id} className={darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}>
                        <td className={`py-4 px-4 ${colors.description}`}>{transaction.date}</td>
                        <td className={colors.heading}>{transaction.description}</td>
                        <td className={`py-4 px-4 text-right font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Badge className={transaction.status === 'completed' ? 'bg-green-500/20 text-green-600' : 'bg-yellow-500/20 text-yellow-700'}>
                            {transaction.status === 'completed' ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            <span className="capitalize">{transaction.status}</span>
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            
            <div className={`flex items-center p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg mt-4`}>
              <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />
              <p className={colors.description}>
                Transaction history shows all activities from the past 90 days. For older transactions, please contact support.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
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