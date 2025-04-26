import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/layouts/AdminLayout';
import TroubleshootingWizard from '@/components/troubleshooting/TroubleshootingWizard';
import ErrorTracker from '@/components/troubleshooting/ErrorTracker';
import PhantomPayDiagnostics from '@/components/troubleshooting/PhantomPayDiagnostics';
import { AlertTriangle, Activity, Wrench, Database } from 'lucide-react';

export default function TroubleshootingDashboard() {
  const [activeTab, setActiveTab] = useState('wizard');
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Wrench className="mr-2 h-8 w-8 text-primary" />
              System Troubleshooting
            </h1>
            <p className="text-gray-500 mt-1">
              Tools for diagnosing and resolving system issues
            </p>
          </div>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="wizard" className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span>Troubleshooter</span>
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              <span>Diagnostics</span>
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              <span>Error Logs</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="wizard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Wizard</CardTitle>
                <CardDescription>
                  Step-by-step guide to diagnose and fix common issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TroubleshootingWizard />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="diagnostics" className="space-y-4">
            <PhantomPayDiagnostics />
          </TabsContent>
          
          <TabsContent value="errors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Error Tracking and Analysis</CardTitle>
                <CardDescription>
                  Track and analyze system errors to improve stability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {/* Error tracker is floating component, we don't render it directly */}
                  <div className="p-6 border border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50">
                    <Activity className="h-8 w-8 text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium">Real-time Error Tracker</h3>
                    <p className="text-sm text-gray-500 text-center mt-1">
                      The Error Tracker is available as a floating window in the bottom-right corner of your screen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Always render the error tracker */}
      <ErrorTracker />
    </AdminLayout>
  );
}