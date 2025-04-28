import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CustomerLayout from "@/components/layouts/CustomerLayout";
import { usePaysafe } from "@/hooks/use-paysafe";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, LineChart, ParkingCircle, ParkingSquare, CalendarDays, 
  UserCheck, ChevronDown, ChevronUp, Car, Zap, DollarSign, Check, MapPin
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarbonImpactSummary } from "@/components/wallet/CarbonImpactSummary";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export default function EmbeddedExperiencePage() {
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  
  const apps = [
    {
      id: "binggo",
      name: "BingGo Parking",
      logo: "🅿️",
      description: "Manage your parking spaces and earnings",
      tagline: "Share your parking spaces and earn money",
      color: "#3b82f6"
    },
    {
      id: "quickshop",
      name: "QuickShop",
      logo: "🛒",
      description: "Fast checkout for your online shopping",
      tagline: "Shop faster, safer, smarter",
      color: "#8b5cf6"
    },
    {
      id: "travelpay",
      name: "TravelPay",
      logo: "✈️",
      description: "Travel bookings with integrated payments",
      tagline: "Book flights, hotels, and more with ease",
      color: "#ec4899"
    }
  ];
  
  if (selectedApp === "binggo") {
    return <BingGoParkingExperience onBack={() => setSelectedApp(null)} />;
  }
  
  return (
    <CustomerLayout 
      title="Embedded Experiences" 
      description="Use your wallet with integrated partner applications"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <Card key={app.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4" style={{ backgroundColor: app.color, color: "white" }}>
              <div className="flex items-center mb-2">
                <div className="text-3xl mr-2">{app.logo}</div>
                <CardTitle>{app.name}</CardTitle>
              </div>
              <CardDescription className="text-white/80">{app.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow pt-4 pb-6">
              <p className="text-muted-foreground mb-6">{app.description}</p>
              <Button 
                className="w-full" 
                style={{ backgroundColor: app.color }}
                onClick={() => setSelectedApp(app.id)}
              >
                Launch Experience
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </CustomerLayout>
  );
}

function BingGoParkingExperience({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const { balances, transactions } = usePaysafe();
  const [expandSpaces, setExpandSpaces] = useState(false);
  
  // Mock data for parking spaces
  const parkingSpaces = [
    {
      id: 1,
      address: "123 Main St, Apt 4B",
      city: "San Francisco",
      type: "Residential",
      size: "Standard",
      pricePerHour: 5.75,
      earnings: 432.50,
      bookings: 24,
      reviews: 4.8,
      availability: 0.7, // 70% available
      isActive: true
    },
    {
      id: 2,
      address: "8721 Park Ave",
      city: "San Francisco",
      type: "Garage",
      size: "Large",
      pricePerHour: 7.25,
      earnings: 289.75,
      bookings: 18,
      reviews: 4.6,
      availability: 0.5, // 50% available
      isActive: true
    },
    {
      id: 3,
      address: "456 Downtown Blvd",
      city: "San Francisco",
      type: "Commercial",
      size: "Standard",
      pricePerHour: 9.00,
      earnings: 612.00,
      bookings: 32,
      reviews: 4.9,
      availability: 0.3, // 30% available
      isActive: true
    }
  ];

  // Calculate total earnings
  const totalEarnings = parkingSpaces.reduce((total, space) => total + space.earnings, 0);
  const totalBookings = parkingSpaces.reduce((total, space) => total + space.bookings, 0);
  
  // Mock data for earnings chart
  const earningsData = [
    { month: "Jan", earnings: 420 },
    { month: "Feb", earnings: 385 },
    { month: "Mar", earnings: 520 },
    { month: "Apr", earnings: 650 },
    { month: "May", earnings: 782 },
    { month: "Jun", earnings: 1100 },
  ];
  
  return (
    <CustomerLayout 
      title="BingGo Parking Partner Dashboard"
      description="Manage your parking spaces and earnings"
      showRefreshButton
      onRefresh={() => {
        toast({
          title: "Dashboard refreshed",
          description: "Your parking data has been updated",
        });
      }}
      appType="binggo"
    >
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={onBack}
      >
        ← Back to Experiences
      </Button>
      
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <h3 className="text-2xl font-bold">${totalEarnings.toFixed(2)}</h3>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <span className="inline-block mr-1">↑</span> 24% from last month
                </p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <h3 className="text-2xl font-bold">{totalBookings}</h3>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <span className="inline-block mr-1">↑</span> 18% from last month
                </p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Car className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <h3 className="text-2xl font-bold">
                  ${(balances?.find(b => b.currencyCode === "USD")?.availableBalance || 0).toFixed(2)}
                </h3>
                <p className="text-xs text-blue-600 mt-1">Ready for withdrawal</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <h3 className="text-2xl font-bold">4.8 / 5</h3>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <span className="inline-block mr-1">↑</span> 0.2 from last month
                </p>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <UserCheck className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Monthly Earnings Chart */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
              <CardDescription>Your earnings trend over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[240px] flex items-end justify-between">
                {earningsData.map((data) => (
                  <div key={data.month} className="flex flex-col items-center">
                    <div 
                      className="bg-blue-500 w-14 rounded-t-md"
                      style={{ 
                        height: `${(data.earnings / 1100) * 200}px`,
                        background: "linear-gradient(to top, #3b82f6, #60a5fa)"
                      }}
                    ></div>
                    <div className="mt-2 text-sm">{data.month}</div>
                    <div className="text-xs text-muted-foreground">${data.earnings}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* My Parking Spaces */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>My Parking Spaces</CardTitle>
                <Button variant="ghost" onClick={() => setExpandSpaces(!expandSpaces)}>
                  {expandSpaces ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <CardDescription>Manage your registered parking spaces</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {parkingSpaces.slice(0, expandSpaces ? parkingSpaces.length : 2).map((space) => (
                  <div key={space.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                          {space.address}
                        </h3>
                        <p className="text-sm text-muted-foreground">{space.city} • {space.type} • {space.size}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${space.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {space.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-medium">${space.pricePerHour}/hr</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Earnings</p>
                        <p className="font-medium">${space.earnings}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bookings</p>
                        <p className="font-medium">{space.bookings}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <p className="font-medium">{space.reviews} ⭐</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-1">Availability Calendar Fill</p>
                      <Progress value={space.availability * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(space.availability * 100)}% of time slots available for booking
                      </p>
                    </div>
                    
                    <div className="flex justify-end mt-3 space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Manage Schedule</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Availability Schedule</DialogTitle>
                            <DialogDescription>
                              Set your parking space availability for {space.address}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <CalendarScheduleDemo />
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm">Edit Space</Button>
                    </div>
                  </div>
                ))}
                
                {!expandSpaces && parkingSpaces.length > 2 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => setExpandSpaces(true)}
                  >
                    Show {parkingSpaces.length - 2} more spaces
                  </Button>
                )}
                
                <Button className="w-full mt-2">
                  + Add New Parking Space
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Green Impact */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center">
                <div className="mr-2 bg-green-100 p-1.5 rounded-full">
                  <Zap className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle>Green Parking Impact</CardTitle>
              </div>
              <CardDescription>
                By sharing your parking spaces, you help reduce urban congestion and carbon emissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <CarbonImpactSummary />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-green-700 font-medium">Emissions Reduced</div>
                  <div className="text-2xl font-bold text-green-800 mt-1">178 kg</div>
                  <div className="text-xs text-green-600 mt-1">Carbon dioxide equivalent</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-blue-700 font-medium">Parking Hours Shared</div>
                  <div className="text-2xl font-bold text-blue-800 mt-1">124 hrs</div>
                  <div className="text-xs text-blue-600 mt-1">Last 30 days</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-purple-700 font-medium">Trees Equivalent</div>
                  <div className="text-2xl font-bold text-purple-800 mt-1">8 trees</div>
                  <div className="text-xs text-purple-600 mt-1">Carbon sequestration</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="earnings">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Earnings Detail</CardTitle>
              <CardDescription>Detailed breakdown of your earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Coming soon: Detailed earnings analytics and reporting.</p>
              <Button disabled>Generate Earnings Report</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bookings">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <CardDescription>Manage your upcoming and past bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Coming soon: Comprehensive booking management system.</p>
              <Button disabled>View All Bookings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View your payment history and withdrawal options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions?.slice(0, 5).map((transaction, index) => (
                  <div key={index} className="flex justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">
                        {transaction.type === 'DEPOSIT' ? 'Parking Earnings' : 
                         transaction.type === 'TRANSFER_IN' ? 'Payment Received' :
                         transaction.type === 'WITHDRAWAL' ? 'Withdrawal to Bank' : 
                         transaction.type === 'TRANSFER_OUT' ? 'Transfer Sent' : 
                         transaction.type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.note || 
                          (transaction.type === 'DEPOSIT' ? 'BingGo booking payment' : 
                           transaction.type === 'WITHDRAWAL' ? 'Funds to connected bank' : 
                           'Transaction')}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(transaction.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'DEPOSIT' || transaction.type === 'TRANSFER_IN' ? 
                        'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.type === 'DEPOSIT' || transaction.type === 'TRANSFER_IN' ? '+' : '-'}
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">{transaction.status}</p>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">View All Transactions</Button>
                <Button className="w-full">Withdraw to Bank Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </CustomerLayout>
  );
}

// Mock calendar schedule component
function CalendarScheduleDemo() {
  return (
    <div className="border rounded-md p-4">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center font-medium text-sm">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 31 }, (_, i) => (
          <div 
            key={i} 
            className={`aspect-square border rounded-md flex items-center justify-center text-sm
              ${Math.random() > 0.3 ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Button>Save Schedule</Button>
      </div>
    </div>
  );
}