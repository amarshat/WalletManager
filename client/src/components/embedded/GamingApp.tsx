import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Gamepad2,
  Users,
  MessageSquare,
  Bell,
  Wallet,
  User,
  Zap,
  ShoppingCart,
  BarChart3,
  Award,
  Gift,
  Sword
} from 'lucide-react';
import WalletTabContent from '@/components/embedded/WalletTabContent';

const games = [
  { id: 1, title: 'Stellar Conquest', genre: 'Strategy', level: 32, xp: 4580, lastPlayed: '2 hours ago', image: 'bg-gradient-to-br from-blue-600 to-indigo-900' },
  { id: 2, title: 'Shadow Realm', genre: 'RPG', level: 47, xp: 8920, lastPlayed: 'Yesterday', image: 'bg-gradient-to-br from-purple-600 to-purple-900' },
  { id: 3, title: 'Mech Warriors', genre: 'Action', level: 15, xp: 2100, lastPlayed: '3 days ago', image: 'bg-gradient-to-br from-red-600 to-orange-700' },
];

const shopItems = [
  { id: 1, name: 'Premium Battle Pass', description: 'Unlock premium rewards and challenges', price: 9.99, image: 'bg-gradient-to-br from-yellow-500 to-yellow-700' },
  { id: 2, name: '5,000 Fusion Coins', description: 'In-game currency for all FusionForge games', price: 49.99, image: 'bg-gradient-to-br from-green-500 to-emerald-700' },
  { id: 3, name: 'Legendary Weapon Pack', description: 'Rare weapons for Shadow Realm', price: 24.99, image: 'bg-gradient-to-br from-red-500 to-red-800' },
  { id: 4, name: 'Cosmic Skin Bundle', description: 'Limited edition character skins', price: 19.99, image: 'bg-gradient-to-br from-purple-500 to-violet-800' },
];

const achievements = [
  { id: 1, name: 'World Champion', game: 'Stellar Conquest', description: 'Win a global tournament', completed: true, date: '2023-03-15' },
  { id: 2, name: 'Shadow Master', game: 'Shadow Realm', description: 'Complete all shadow quests', completed: false, progress: 80 },
  { id: 3, name: 'Mech Engineer', game: 'Mech Warriors', description: 'Build 10 custom mechs', completed: true, date: '2023-02-28' },
];

const recentTransactions = [
  { id: 101, date: 'April 23, 2023', description: 'Premium Battle Pass', amount: -9.99, status: 'Completed' },
  { id: 102, date: 'April 18, 2023', description: 'Tournament Winnings', amount: 25.00, status: 'Completed' },
  { id: 103, date: 'April 10, 2023', description: 'Legendary Weapon Pack', amount: -24.99, status: 'Completed' },
];

export const GamingApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-red-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-8 w-8" />
            <h1 className="text-2xl font-bold">FusionForge Gaming</h1>
          </div>
          <div className="flex items-center space-x-6">
            <Bell className="h-5 w-5 cursor-pointer hover:text-red-300" />
            <MessageSquare className="h-5 w-5 cursor-pointer hover:text-red-300" />
            <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-sm font-medium">
              DK
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full mb-6 bg-gray-800">
            <TabsTrigger value="home" className="data-[state=active]:bg-red-700">Home</TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-red-700">Games</TabsTrigger>
            <TabsTrigger value="shop" className="data-[state=active]:bg-red-700">Shop</TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-red-700">Wallet</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-red-700">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Welcome back, Dragon Knight!</CardTitle>
                <CardDescription className="text-gray-400">
                  Your gaming stats and activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Total XP</p>
                        <p className="text-2xl font-bold text-white">15,600</p>
                      </div>
                      <Zap className="h-10 w-10 text-yellow-500" />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Games Owned</p>
                        <p className="text-2xl font-bold text-white">12</p>
                      </div>
                      <Gamepad2 className="h-10 w-10 text-purple-500" />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Achievements</p>
                        <p className="text-2xl font-bold text-white">87/120</p>
                      </div>
                      <Trophy className="h-10 w-10 text-amber-500" />
                    </CardContent>
                  </Card>
                </div>
                
                <h3 className="text-lg font-medium text-white mt-6">Recent Games</h3>
                <div className="space-y-4">
                  {games.map((game) => (
                    <Card key={game.id} className="bg-gray-700 border-gray-600 overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className={`p-6 md:w-1/4 flex flex-col justify-center items-center ${game.image}`}>
                          <Sword className="h-12 w-12 text-white mb-2" />
                          <span className="text-lg font-medium text-white">{game.title}</span>
                          <Badge className="mt-2 bg-gray-800">{game.genre}</Badge>
                        </div>
                        <div className="p-4 md:w-3/4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="text-white">Level <span className="text-xl font-bold text-red-500">{game.level}</span></span>
                              <span className="ml-4 text-gray-400">XP: {game.xp}</span>
                            </div>
                            <span className="text-gray-400">Last played: {game.lastPlayed}</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
                            <div className="bg-red-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-600">View Stats</Button>
                            <Button className="bg-red-600 hover:bg-red-700">Play Now</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="games" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Your Game Library</CardTitle>
                <CardDescription className="text-gray-400">
                  Access and manage all your games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games.map((game) => (
                    <Card key={game.id} className="bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors">
                      <div className={`h-40 ${game.image} flex items-center justify-center`}>
                        <Sword className="h-16 w-16 text-white" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-medium text-white">{game.title}</h3>
                        <div className="flex justify-between items-center mt-2 mb-4">
                          <Badge className="bg-gray-800">{game.genre}</Badge>
                          <span className="text-gray-400">Level {game.level}</span>
                        </div>
                        <Button className="w-full bg-red-600 hover:bg-red-700">Play</Button>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Explore More Card */}
                  <Card className="bg-gray-700 border-gray-600 hover:bg-gray-650 transition-colors">
                    <div className="h-40 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                      <ShoppingCart className="h-16 w-16 text-white opacity-50" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-medium text-white">Explore More Games</h3>
                      <p className="text-gray-400 mt-2 mb-4">Discover new titles and experiences</p>
                      <Button 
                        variant="outline" 
                        className="w-full border-red-600 text-red-500 hover:bg-red-900 hover:text-white"
                        onClick={() => setActiveTab('shop')}
                      >
                        Browse Store
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-white mb-4">Achievements</h3>
                  <div className="space-y-4">
                    {achievements.map((achievement) => (
                      <Card key={achievement.id} className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-start">
                            <div className={`p-3 rounded-full ${achievement.completed ? 'bg-amber-500/20' : 'bg-gray-600'} mr-4`}>
                              <Award className={`h-6 w-6 ${achievement.completed ? 'text-amber-500' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-white">{achievement.name}</h4>
                                  <p className="text-gray-400 text-sm">{achievement.game}</p>
                                  <p className="text-gray-400 mt-1">{achievement.description}</p>
                                </div>
                                {achievement.completed ? (
                                  <Badge className="bg-amber-500/20 text-amber-500">Completed</Badge>
                                ) : (
                                  <Badge className="bg-gray-600">{achievement.progress}%</Badge>
                                )}
                              </div>
                              
                              {!achievement.completed && (
                                <div className="w-full bg-gray-800 rounded-full h-2 mt-3">
                                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${achievement.progress}%` }}></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shop" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Game Shop</CardTitle>
                <CardDescription className="text-gray-400">
                  Purchase in-game items, currencies, and passes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {shopItems.map((item) => (
                    <Card key={item.id} className="bg-gray-700 border-gray-600">
                      <div className={`h-32 ${item.image} flex items-center justify-center`}>
                        <Gift className="h-12 w-12 text-white" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-medium text-white">{item.name}</h3>
                        <p className="text-gray-400 text-sm mt-1 h-12">{item.description}</p>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-xl font-bold text-white">${item.price}</span>
                          <Button 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => setActiveTab('wallet')}
                          >
                            Buy Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-white mb-4">Your Transaction History</h3>
                  <Card className="bg-gray-700 border-gray-600">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="py-2 px-4 text-left text-gray-400">Date</th>
                            <th className="py-2 px-4 text-left text-gray-400">Description</th>
                            <th className="py-2 px-4 text-right text-gray-400">Amount</th>
                            <th className="py-2 px-4 text-right text-gray-400">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentTransactions.map((transaction) => (
                            <tr key={transaction.id} className="border-b border-gray-600 hover:bg-gray-650">
                              <td className="py-3 px-4 text-gray-300">{transaction.date}</td>
                              <td className="py-3 px-4 text-white">{transaction.description}</td>
                              <td className={`py-3 px-4 text-right ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Badge className="bg-green-500/20 text-green-500">
                                  {transaction.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet">
            <WalletTabContent 
              appName="FusionForge Gaming" 
              appColor="red"
              customMessage="Manage your payment methods and make in-game purchases"
              darkMode={true}
            />
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Player Profile</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your gaming profile and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-gray-700">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-3xl font-bold">
                      DK
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold text-white">Dragon Knight</h3>
                      <p className="text-gray-400">Premium Member</p>
                      <div className="flex items-center justify-center md:justify-start mt-2 space-x-2">
                        <Badge className="bg-amber-600">Pro Gamer</Badge>
                        <Badge className="bg-purple-700">Tournament Winner</Badge>
                      </div>
                    </div>
                    <div className="ml-auto flex-shrink-0 mt-4 md:mt-0">
                      <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                        Edit Profile
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Player Statistics</h3>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Games Played</span>
                            <span className="text-white font-medium">352</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Win Rate</span>
                            <span className="text-white font-medium">68%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total Play Time</span>
                            <span className="text-white font-medium">487 hours</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Achievements</span>
                            <span className="text-white font-medium">87/120</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Tournaments Won</span>
                            <span className="text-white font-medium">12</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Payment Methods</h3>
                      <Card className="bg-gray-700 border-gray-600">
                        <CardContent className="p-4 space-y-4">
                          <p className="text-gray-400">
                            Your payment methods are managed securely through your integrated PaySage Wallet.
                          </p>
                          <Button 
                            className="flex items-center w-full justify-center bg-red-600 hover:bg-red-700" 
                            onClick={() => setActiveTab('wallet')}
                          >
                            <Wallet className="h-4 w-4 mr-2" />
                            Manage Payment Methods
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-2 md:mb-0">
              <Gamepad2 className="h-5 w-5 text-red-500" />
              <span className="text-gray-400 font-medium">FusionForge Gaming &copy; 2023</span>
            </div>
            <div className="flex space-x-4 text-sm text-gray-400">
              <a href="#" className="hover:text-red-400">Privacy Policy</a>
              <a href="#" className="hover:text-red-400">Terms of Service</a>
              <a href="#" className="hover:text-red-400">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GamingApp;