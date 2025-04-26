import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCcw,
  Database,
  Server,
  Cpu,
  Layers,
  Users,
  CreditCard,
  BarChart3,
  Clock
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';

type DiagnosticResult = {
  success: boolean;
  message: string;
  details?: Record<string, any>;
};

type SystemStatusResult = {
  serverHealth: boolean;
  databaseHealth: boolean;
  apiHealth: boolean;
  customersCount: number;
  accountsCount: number;
  transactionsCount: number;
  lastUpdate: string;
};

export default function PhantomPayDiagnostics() {
  const { toast } = useToast();
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('system');

  // System status query
  const { 
    data: systemStatus,
    isLoading: isStatusLoading,
    refetch: refetchStatus
  } = useQuery({
    queryKey: ['/api/admin/phantom/status'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/admin/phantom/status');
        const data = await res.json();
        return data as SystemStatusResult;
      } catch (error) {
        return {
          serverHealth: false,
          databaseHealth: false,
          apiHealth: false,
          customersCount: 0,
          accountsCount: 0,
          transactionsCount: 0,
          lastUpdate: new Date().toISOString()
        } as SystemStatusResult;
      }
    },
  });

  // Run diagnostics mutation
  const { 
    mutate: runDiagnostic,
    data: diagnosticResult,
    isPending: isDiagnosticRunning,
    reset: resetDiagnostic
  } = useMutation({
    mutationFn: async (testType: string) => {
      setActiveTest(testType);
      const res = await apiRequest('POST', `/api/admin/phantom/diagnostic`, { testType });
      return res.json() as Promise<DiagnosticResult>;
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? 'Diagnostic Completed' : 'Diagnostic Failed',
        description: data.message,
        variant: data.success ? 'default' : 'destructive',
      });
      refetchStatus();
    },
    onError: (error) => {
      toast({
        title: 'Diagnostic Error',
        description: 'Failed to run diagnostic test',
        variant: 'destructive',
      });
      setActiveTest(null);
    },
  });

  const handleRunTest = (testType: string) => {
    resetDiagnostic();
    runDiagnostic(testType);
  };

  const renderStatusBadge = (status: boolean | undefined) => {
    if (status === undefined) return <Badge variant="outline">Unknown</Badge>;
    return status ? 
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Healthy</Badge> : 
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Unhealthy</Badge>;
  };

  const renderTestButton = (testType: string, label: string, icon: React.ReactNode) => (
    <Button
      variant="outline"
      className={`h-auto py-4 px-4 flex flex-col items-center justify-center gap-2 w-full ${
        activeTest === testType && isDiagnosticRunning ? 'border-primary' : ''
      }`}
      onClick={() => handleRunTest(testType)}
      disabled={isDiagnosticRunning}
    >
      {activeTest === testType && isDiagnosticRunning ? (
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      ) : (
        icon
      )}
      <span className="text-sm">{label}</span>
    </Button>
  );

  const renderDiagnosticResult = () => {
    if (!diagnosticResult) return null;

    return (
      <div className={`mt-4 p-4 rounded-md border ${
        diagnosticResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-3">
          {diagnosticResult.success ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          )}
          <div>
            <h4 className={`text-sm font-medium ${
              diagnosticResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {diagnosticResult.success ? 'Test Passed' : 'Test Failed'}
            </h4>
            <p className={`text-sm mt-1 ${
              diagnosticResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {diagnosticResult.message}
            </p>
          </div>
        </div>

        {diagnosticResult.details && Object.keys(diagnosticResult.details).length > 0 && (
          <div className="mt-3 pt-3 border-t border-dashed border-gray-200">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger className="text-xs font-medium">
                  View Diagnostic Details
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(diagnosticResult.details, null, 2)}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>
    );
  };

  const lastUpdateTime = systemStatus ? new Date(systemStatus.lastUpdate).toLocaleString() : 'N/A';

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">PhantomPay Diagnostics</CardTitle>
            <CardDescription>
              Diagnose and troubleshoot issues with the PhantomPay mock payment system
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={() => refetchStatus()}
            disabled={isStatusLoading}
          >
            {isStatusLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            <span>Refresh Status</span>
          </Button>
        </div>
      </CardHeader>

      <Tabs defaultValue="system" value={selectedTab} onValueChange={setSelectedTab}>
        <div className="px-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="system" className="text-xs py-2">
              System Health
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="text-xs py-2">
              Run Diagnostics
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs py-2">
              System Statistics
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="system" className="m-0 px-6 pb-6">
          {isStatusLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-gray-500">Loading system status...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${systemStatus?.serverHealth ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Server className={`h-5 w-5 ${systemStatus?.serverHealth ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Server</h4>
                        <p className="text-xs text-gray-500">Application server status</p>
                      </div>
                    </div>
                    {renderStatusBadge(systemStatus?.serverHealth)}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${systemStatus?.databaseHealth ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Database className={`h-5 w-5 ${systemStatus?.databaseHealth ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Database</h4>
                        <p className="text-xs text-gray-500">Database connectivity status</p>
                      </div>
                    </div>
                    {renderStatusBadge(systemStatus?.databaseHealth)}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${systemStatus?.apiHealth ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Cpu className={`h-5 w-5 ${systemStatus?.apiHealth ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">API</h4>
                        <p className="text-xs text-gray-500">API endpoints health</p>
                      </div>
                    </div>
                    {renderStatusBadge(systemStatus?.apiHealth)}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-base">System Overview</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-blue-600" />
                          Customers
                        </span>
                        <span className="text-sm font-medium">{systemStatus?.customersCount || 0}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, ((systemStatus?.customersCount || 0) / 50) * 100)} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4 text-purple-600" />
                          Accounts
                        </span>
                        <span className="text-sm font-medium">{systemStatus?.accountsCount || 0}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, ((systemStatus?.accountsCount || 0) / 100) * 100)} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <BarChart3 className="h-4 w-4 text-green-600" />
                          Transactions
                        </span>
                        <span className="text-sm font-medium">{systemStatus?.transactionsCount || 0}</span>
                      </div>
                      <Progress 
                        value={Math.min(100, ((systemStatus?.transactionsCount || 0) / 200) * 100)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="diagnostics" className="m-0 px-6 pb-6">
          <div className="space-y-6">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-700">System Tests</h3>
              <p className="text-xs text-gray-500 mt-1">
                Test PhantomPay's core system components and infrastructure
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {renderTestButton('database', 'Database Test', <Database className="h-8 w-8 text-blue-600" />)}
                {renderTestButton('schema', 'Schema Test', <Layers className="h-8 w-8 text-purple-600" />)}
                {renderTestButton('integration', 'Integration Test', <Cpu className="h-8 w-8 text-green-600" />)}
                {renderTestButton('routes', 'Routes Test', <Server className="h-8 w-8 text-orange-600" />)}
              </div>
            </div>
            
            <Separator />
            
            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-700">Data Tests</h3>
              <p className="text-xs text-gray-500 mt-1">
                Validate and analyze PhantomPay's data integrity and consistency
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {renderTestButton('customers', 'Customers Test', <Users className="h-8 w-8 text-indigo-600" />)}
                {renderTestButton('accounts', 'Accounts Test', <CreditCard className="h-8 w-8 text-violet-600" />)}
                {renderTestButton('transactions', 'Transactions Test', <BarChart3 className="h-8 w-8 text-emerald-600" />)}
                {renderTestButton('data-integrity', 'Data Integrity', <CheckCircle2 className="h-8 w-8 text-teal-600" />)}
              </div>
            </div>
            
            {diagnosticResult && renderDiagnosticResult()}
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="m-0 px-6 pb-6">
          <div className="space-y-4">
            <div className="rounded-md border bg-slate-50 p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Status</span>
                  <Badge variant="outline" className="gap-1 flex items-center">
                    <Clock className="h-3 w-3" />
                    Last updated: {lastUpdateTime}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Total Customers</span>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold">{systemStatus?.customersCount || 0}</span>
                          <Users className="h-5 w-5 text-blue-500 mb-0.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Total Accounts</span>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold">{systemStatus?.accountsCount || 0}</span>
                          <CreditCard className="h-5 w-5 text-purple-500 mb-0.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-gray-500">Total Transactions</span>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-bold">{systemStatus?.transactionsCount || 0}</span>
                          <BarChart3 className="h-5 w-5 text-green-500 mb-0.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">System Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Server Uptime</span>
                      <span className="text-sm font-medium">99.9%</span>
                    </div>
                    <Progress value={99.9} className="h-2" />
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Response Time</span>
                      <span className="text-sm font-medium">45ms</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Success Rate</span>
                      <span className="text-sm font-medium">98.7%</span>
                    </div>
                    <Progress value={98.7} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="px-6 pb-4 pt-0 text-xs text-gray-500 mt-2 border-t">
        <div className="flex justify-between items-center py-2">
          <div>
            PhantomPay is a mock payment system for development and testing purposes.
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {lastUpdateTime}
          </div>
        </div>
      </div>
    </Card>
  );
}