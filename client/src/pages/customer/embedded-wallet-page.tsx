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
              <CardContent className="p-0 overflow-hidden">
                <div className="relative bg-white rounded-md overflow-hidden" style={{ height: '680px' }}>
                  <iframe 
                    src="/dashboard?hideSidebar=true"
                    title="PaySage Wallet Dashboard"
                    className="absolute top-0 left-0 w-full h-full border-0" 
                    style={{ width: '100%', height: '100%', borderRadius: '0 0 8px 8px' }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
}