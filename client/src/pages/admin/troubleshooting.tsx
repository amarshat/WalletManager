import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/layouts/AdminLayout';
import TroubleshootingWizard from '@/components/troubleshooting/TroubleshootingWizard';
import ErrorTracker from '@/components/troubleshooting/ErrorTracker';
import PhantomPayDiagnostics from '@/components/troubleshooting/PhantomPayDiagnostics';
import { CircleHelp, AlertTriangle, Database } from 'lucide-react';

export default function TroubleshootingPage() {
  const [activeTab, setActiveTab] = useState('wizard');
  
  return (
    <AdminLayout 
      title="Troubleshooting & Diagnostics"
      subtitle="Monitor, diagnose, and resolve system issues"
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wizard" className="flex items-center gap-2">
            <CircleHelp className="h-4 w-4" />
            <span>Troubleshooting Wizard</span>
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Error Tracker</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>PhantomPay Diagnostics</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="wizard" className="space-y-6">
          <div className="rounded-lg border bg-card">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
              <h3 className="text-lg font-semibold">Interactive Troubleshooting</h3>
              <p className="text-sm text-muted-foreground">
                Use this guided tool to diagnose and fix common issues
              </p>
            </div>
            <div className="px-6 pb-6">
              <TroubleshootingWizard />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="errors" className="space-y-6">
          <ErrorTracker />
        </TabsContent>
        
        <TabsContent value="diagnostics" className="space-y-6">
          <PhantomPayDiagnostics />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}