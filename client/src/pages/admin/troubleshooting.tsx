import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TroubleshootingWizard from '@/components/troubleshooting/TroubleshootingWizard';
import ErrorTracker from '@/components/troubleshooting/ErrorTracker';
import PhantomPayDiagnostics from '@/components/troubleshooting/PhantomPayDiagnostics';

export default function TroubleshootingPage() {
  return (
    <AdminLayout 
      title="System Troubleshooting" 
      subtitle="Diagnose and resolve system issues with the troubleshooting toolkit"
    >
      <div className="space-y-6">
        <Tabs defaultValue="wizard" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="wizard">Troubleshooting Wizard</TabsTrigger>
            <TabsTrigger value="errors">Error Tracker</TabsTrigger>
            <TabsTrigger value="phantom">PhantomPay Diagnostics</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            <TabsContent value="wizard" className="m-0">
              <TroubleshootingWizard />
            </TabsContent>
            
            <TabsContent value="errors" className="m-0">
              <ErrorTracker />
            </TabsContent>
            
            <TabsContent value="phantom" className="m-0">
              <PhantomPayDiagnostics />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </AdminLayout>
  );
}