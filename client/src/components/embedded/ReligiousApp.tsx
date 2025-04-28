import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Wallet, 
  Settings, 
  User, 
  HeartHandshake, 
  BookMarked,
  Globe,
  Home 
} from 'lucide-react';
import WalletTabContent from './WalletTabContent';

const upcomingEvents = [
  { id: 1, title: 'Community Service Meeting', date: 'Today', time: '7:00 PM - 9:00 PM', location: 'Kingdom Hall - Central', attendees: 42 },
  { id: 2, title: 'Bible Study Group', date: 'Tomorrow', time: '6:30 PM - 8:00 PM', location: 'Kingdom Hall - North', attendees: 18 },
  { id: 3, title: 'Public Talk', date: 'Sunday', time: '10:00 AM - 12:00 PM', location: 'Kingdom Hall - Central', attendees: 95 },
];

const fieldServiceReports = [
  { id: 101, date: 'April 2023', hours: 12, placements: 24, visits: 8, studies: 3, status: 'Submitted' },
  { id: 102, date: 'March 2023', hours: 15, placements: 31, visits: 10, studies: 4, status: 'Submitted' },
];

const donationOptions = [
  { id: 1, name: 'Local Congregation', description: 'Support your local Kingdom Hall maintenance and activities' },
  { id: 2, name: 'Worldwide Work', description: 'Support the global preaching work and disaster relief efforts' },
  { id: 3, name: 'Building Projects', description: 'Help fund new Kingdom Halls and Assembly Halls' },
];

export const ReligiousApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Jehovah's Witnesses Portal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">Sarah Miller</span>
            <div className="h-8 w-8 rounded-full bg-purple-400 flex items-center justify-center text-sm font-medium">
              SM
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full mb-6">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="fieldservice">Field Service</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Welcome, Sarah!</CardTitle>
                  <CardDescription>
                    Your spiritual activity dashboard for April 2023
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="text-lg font-medium mb-2">Upcoming Events</h3>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <Card key={event.id} className="border-l-4 border-purple-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-lg">{event.title}</h4>
                              <div className="flex items-center text-gray-500 mt-1">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span className="mr-3">{event.date}</span>
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center text-gray-500 mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                            <Badge className="bg-purple-500">{event.attendees} Attending</Badge>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm" className="mr-2">Details</Button>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">RSVP</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spiritual Goals</CardTitle>
                  <CardDescription>
                    Your progress for this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Field Service Hours</span>
                        <span className="text-sm font-medium">12/15 hours</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Bible Studies</span>
                        <span className="text-sm font-medium">3/5 studies</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Return Visits</span>
                        <span className="text-sm font-medium">8/10 visits</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Literature Placements</span>
                        <span className="text-sm font-medium">24/20 placements</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">Update Field Service</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="fieldservice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Field Service Reports</CardTitle>
                <CardDescription>
                  Manage your field service reports and monthly activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    New Report
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left">Month</th>
                        <th className="py-2 px-4 text-center">Hours</th>
                        <th className="py-2 px-4 text-center">Placements</th>
                        <th className="py-2 px-4 text-center">Return Visits</th>
                        <th className="py-2 px-4 text-center">Bible Studies</th>
                        <th className="py-2 px-4 text-center">Status</th>
                        <th className="py-2 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fieldServiceReports.map((report) => (
                        <tr key={report.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{report.date}</td>
                          <td className="py-3 px-4 text-center">{report.hours}</td>
                          <td className="py-3 px-4 text-center">{report.placements}</td>
                          <td className="py-3 px-4 text-center">{report.visits}</td>
                          <td className="py-3 px-4 text-center">{report.studies}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge className="bg-green-500">{report.status}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="outline" size="sm">View</Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">Current Month</td>
                        <td className="py-3 px-4 text-center">8</td>
                        <td className="py-3 px-4 text-center">17</td>
                        <td className="py-3 px-4 text-center">6</td>
                        <td className="py-3 px-4 text-center">2</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-yellow-500">In Progress</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Submit</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Territory Assignment</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <div className="bg-purple-100 p-3 rounded-lg mr-4">
                          <MapPin className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Oakwood Neighborhood - Section 12B</h4>
                          <p className="text-gray-500 mt-1">Assigned until May 31, 2023</p>
                          <div className="flex mt-3">
                            <Button variant="outline" size="sm" className="mr-2">View Map</Button>
                            <Button variant="outline" size="sm">Download Territory Card</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="donations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Donations</CardTitle>
                <CardDescription>
                  Support the worldwide work through your donations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {donationOptions.map((option) => (
                    <Card key={option.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle>{option.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-gray-600 mb-4">{option.description}</p>
                      </CardContent>
                      <div className="p-4 pt-0">
                        <Button 
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => setActiveTab('wallet')}
                        >
                          Donate Now
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Recent Donation History</h3>
                  <Card>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 px-4 text-left">Date</th>
                            <th className="py-2 px-4 text-left">Purpose</th>
                            <th className="py-2 px-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">April 15, 2023</td>
                            <td className="py-3 px-4">Local Congregation</td>
                            <td className="py-3 px-4 text-right">$50.00</td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">March 28, 2023</td>
                            <td className="py-3 px-4">Worldwide Work</td>
                            <td className="py-3 px-4 text-right">$100.00</td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">February 17, 2023</td>
                            <td className="py-3 px-4">Building Projects</td>
                            <td className="py-3 px-4 text-right">$75.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mt-6">
                  <div className="flex items-start">
                    <HeartHandshake className="h-6 w-6 text-purple-600 mr-3 mt-1" />
                    <div>
                      <h4 className="font-medium text-purple-800">Your Donations Make a Difference</h4>
                      <p className="text-purple-700 mt-1">
                        All donations are used to support our worldwide work including disaster relief,
                        Kingdom Hall construction, and the production of Bible-based literature in over 1,000 languages.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet">
            <WalletTabContent 
              appName="Jehovah's Witnesses Portal" 
              appColor="purple"
              customMessage="Manage your payment methods and make donations to support the worldwide work"
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
                    <div className="h-20 w-20 rounded-full bg-purple-400 flex items-center justify-center text-white text-2xl font-medium">
                      SM
                    </div>
                    <div>
                      <h3 className="text-xl font-medium">Sarah Miller</h3>
                      <p className="text-gray-500">sarah.miller@example.com</p>
                      <p className="text-gray-500">Pioneer since 2019</p>
                      <p className="text-gray-500">Congregation: Kingdom Hall - Central</p>
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
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span className="text-gray-600 font-medium">Jehovah's Witnesses Portal &copy; 2023</span>
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <a href="#" className="hover:text-purple-600">Privacy Policy</a>
              <a href="#" className="hover:text-purple-600">Terms of Service</a>
              <a href="#" className="hover:text-purple-600">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReligiousApp;