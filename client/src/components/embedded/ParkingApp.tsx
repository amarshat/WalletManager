import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import WalletTabContent from '@/components/embedded/WalletTabContent';
import { Car, MapPin, Clock, CalendarDays, Wallet, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const parkingSpots = [
  { id: 1, location: 'Downtown Center', price: 2.50, available: 12, distance: '0.3 mi' },
  { id: 2, location: 'City Plaza', price: 3.25, available: 8, distance: '0.7 mi' },
  { id: 3, location: 'Westfield Mall', price: 1.75, available: 26, distance: '1.2 mi' },
  { id: 4, location: 'Central Station', price: 4.00, available: 5, distance: '0.5 mi' },
  { id: 5, location: 'Park Avenue', price: 2.00, available: 15, distance: '0.9 mi' },
];

const reservations = [
  { id: 101, location: 'Downtown Center', startTime: '10:00 AM', endTime: '1:00 PM', date: 'Today', status: 'Active', cost: 7.50 },
  { id: 102, location: 'City Plaza', startTime: '3:00 PM', endTime: '6:00 PM', date: 'Tomorrow', status: 'Scheduled', cost: 9.75 },
];

export const ParkingApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('find');
  const { user } = useAuth();
  
  // Get user's initials for the avatar
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8" />
            <h1 className="text-2xl font-bold">BingGo Parking</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">{user?.fullName || "Guest"}</span>
            <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center text-sm font-medium">
              {getInitials(user?.fullName)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="find">Find Parking</TabsTrigger>
            <TabsTrigger value="reservations">My Reservations</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="find" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Find Parking Near You</CardTitle>
                <CardDescription>
                  Search for available parking spaces in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-6">
                  <Input placeholder="Enter location or address" className="flex-grow" />
                  <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {parkingSpots.map((spot) => (
                    <Card key={spot.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="bg-blue-100 p-4 md:w-1/4 flex flex-col justify-center items-center">
                          <MapPin className="h-8 w-8 text-blue-600 mb-2" />
                          <span className="text-lg font-medium text-center">{spot.location}</span>
                          <span className="text-sm text-gray-500">{spot.distance} away</span>
                        </div>
                        <div className="p-4 md:w-3/4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <span className="text-2xl font-bold text-blue-600">${spot.price.toFixed(2)}</span>
                              <span className="text-gray-500"> / hour</span>
                            </div>
                            <Badge className={spot.available > 10 ? "bg-green-500" : spot.available > 5 ? "bg-yellow-500" : "bg-red-500"}>
                              {spot.available} spots available
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Secure parking with 24/7 access and surveillance. Reserve in advance or pay as you go.
                          </p>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline">View Details</Button>
                            <Button className="bg-blue-600 hover:bg-blue-700">Reserve Now</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reservations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Parking Reservations</CardTitle>
                <CardDescription>
                  Manage your active and upcoming parking reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reservations.length > 0 ? (
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <Card key={reservation.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className={`p-4 md:w-1/4 flex flex-col justify-center items-center ${
                            reservation.status === 'Active' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <Badge className={reservation.status === 'Active' ? 'bg-green-500' : 'bg-blue-500'}>
                              {reservation.status}
                            </Badge>
                            <CalendarDays className="h-8 w-8 text-blue-600 my-2" />
                            <span className="text-lg font-medium">{reservation.date}</span>
                          </div>
                          <div className="p-4 md:w-3/4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xl font-bold">{reservation.location}</span>
                              <span className="text-xl font-bold text-blue-600">${reservation.cost.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center text-gray-600 mb-4">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{reservation.startTime} - {reservation.endTime}</span>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline">Modify</Button>
                              <Button variant="destructive">Cancel</Button>
                              <Button className="bg-blue-600 hover:bg-blue-700">Extend</Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">You don't have any parking reservations yet.</p>
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab('find')}>
                      Find Parking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet">
            <WalletTabContent 
              appName="BingGo Parking"
              appColor="blue"
              customMessage="Manage your parking payment methods and view transaction history"
            />
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your profile and application preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-blue-400 flex items-center justify-center text-white text-2xl font-medium">
                      {getInitials(user?.fullName)}
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">{user?.fullName || "Guest User"}</h3>
                      <p className="text-gray-500">{user?.email || "No email provided"}</p>
                      <p className="text-gray-500">Member since {new Date().getFullYear()}</p>
                      <div className="flex items-center mt-2">
                        <ShieldCheck className="h-5 w-5 text-green-500 mr-1" />
                        <span className="text-green-500">Verified Account</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Payment Methods</h3>
                    <p className="text-gray-500">
                      Your payment methods are managed securely through your integrated PaySage Wallet.
                    </p>
                    <Button 
                      className="flex items-center" 
                      variant="outline"
                      onClick={() => setActiveTab('wallet')}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Manage Payment Methods
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 p-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-2 md:mb-0">
              <Car className="h-5 w-5 text-blue-600" />
              <span className="text-gray-600 font-medium">BingGo Parking &copy; 2023</span>
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600">Terms of Service</a>
              <a href="#" className="hover:text-blue-600">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ParkingApp;