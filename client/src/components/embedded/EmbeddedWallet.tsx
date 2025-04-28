import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ParkingApp from "@/components/embedded/ParkingApp";
import ReligiousApp from "@/components/embedded/ReligiousApp";
import GamingApp from "@/components/embedded/GamingApp";
import EmbeddingCode from "@/components/embedded/EmbeddingCode";

// Component to display embedded wallet demos
export function EmbeddedWallet() {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  
  // Handle back button to return to app selection
  const handleBack = () => {
    setSelectedApp(null);
  };
  
  // If an app is selected, show that app with wallet integration
  if (selectedApp) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="mb-4"
        >
          &larr; Back to App Selection
        </Button>
        
        {selectedApp === 'parking' && <ParkingApp />}
        {selectedApp === 'religious' && <ReligiousApp />}
        {selectedApp === 'gaming' && <GamingApp />}
      </div>
    );
  }
  
  // Otherwise show app selection screen
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Embedded Wallet Demos</CardTitle>
          <CardDescription>
            Select an application to see how PaySage Wallet can be embedded as a feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Parking App Card */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedApp('parking')}>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <CardTitle>BingGo Parking</CardTitle>
                <CardDescription className="text-blue-100">
                  Smart city parking application
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p>BingGo helps users find and pay for parking in urban areas with an integrated wallet for seamless payments.</p>
                <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
                  Launch Demo
                </Button>
              </CardContent>
            </Card>
            
            {/* Religious App Card */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedApp('religious')}>
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
                <CardTitle>Jehovah's Witnesses</CardTitle>
                <CardDescription className="text-purple-100">
                  Evangelist management platform
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p>A platform for managing evangelists, donations, and community activities with integrated wallet services.</p>
                <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700">
                  Launch Demo
                </Button>
              </CardContent>
            </Card>
            
            {/* Gaming App Card */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedApp('gaming')}>
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-800 text-white">
                <CardTitle>FusionForge</CardTitle>
                <CardDescription className="text-red-100">
                  Online gaming platform
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p>A gaming platform with in-game purchases, rewards, and player-to-player transactions powered by an embedded wallet.</p>
                <Button className="mt-4 w-full bg-red-600 hover:bg-red-700">
                  Launch Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="react" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="react">React</TabsTrigger>
          <TabsTrigger value="angular">Angular</TabsTrigger>
          <TabsTrigger value="vanilla">Vanilla JS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="react">
          <EmbeddingCode language="jsx" framework="React" />
        </TabsContent>
        
        <TabsContent value="angular">
          <EmbeddingCode language="typescript" framework="Angular" />
        </TabsContent>
        
        <TabsContent value="vanilla">
          <EmbeddingCode language="javascript" framework="Vanilla JS" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EmbeddedWallet;