import React, { useState } from 'react';
import CustomerLayout from '@/components/layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ParkingApp from "@/components/embedded/ParkingApp";
import ReligiousApp from "@/components/embedded/ReligiousApp";
import GamingApp from "@/components/embedded/GamingApp";
import {
  Gamepad2,
  Car,
  BookOpen,
  Wallet,
  LayoutDashboard,
  RefreshCw,
  CreditCard
} from 'lucide-react';

export default function EmbeddedWalletPage() {
  const [selectedTab, setSelectedTab] = useState<string>("parking");

  return (
    <CustomerLayout
      title="Embedded Wallet Experience"
      description="Experience how your wallet can be seamlessly integrated into various applications"
    >
      <div className="space-y-6">
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              This page demonstrates how the PaySage Wallet is seamlessly embedded into different applications. 
              You can browse through different industry examples below. The "Your Wallet" tab shows your real wallet data.
            </p>
          </CardContent>
        </Card>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="parking" className="flex items-center">
              <Car className="w-4 h-4 mr-2" />
              BingGo Parking
            </TabsTrigger>
            <TabsTrigger value="religious" className="flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Jehovah's Witnesses
            </TabsTrigger>
            <TabsTrigger value="gaming" className="flex items-center">
              <Gamepad2 className="w-4 h-4 mr-2" />
              FusionForge
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center">
              <Wallet className="w-4 h-4 mr-2" />
              Your Dashboard
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="parking">
            <ParkingApp />
          </TabsContent>
          
          <TabsContent value="religious">
            <ReligiousApp />
          </TabsContent>
          
          <TabsContent value="gaming">
            <GamingApp />
          </TabsContent>
          
          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle>Your Real Wallet Dashboard</CardTitle>
                <CardDescription>
                  Access your main dashboard and wallet functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">To access your full wallet functionality, please return to your main dashboard.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer" onClick={() => window.location.href = "/dashboard"}>
                    <div className="flex items-center justify-center h-20">
                      <LayoutDashboard className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-center mt-4">
                      <h3 className="font-medium">Dashboard</h3>
                      <p className="text-sm text-gray-500">View your wallet overview</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer" onClick={() => window.location.href = "/transactions"}>
                    <div className="flex items-center justify-center h-20">
                      <RefreshCw className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-center mt-4">
                      <h3 className="font-medium">Transactions</h3>
                      <p className="text-sm text-gray-500">View your transaction history</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer" onClick={() => window.location.href = "/payment-methods"}>
                    <div className="flex items-center justify-center h-20">
                      <CreditCard className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-center mt-4">
                      <h3 className="font-medium">Payment Methods</h3>
                      <p className="text-sm text-gray-500">Manage your cards</p>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}