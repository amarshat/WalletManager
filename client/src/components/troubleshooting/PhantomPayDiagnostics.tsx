import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  CheckCircle2,
  DatabaseIcon,
  ServerCrash,
  Settings,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  const [activeTab, setActiveTab] = useState('system');
  const [customerId, setCustomerId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [testType, setTestType] = useState('all');
  
  const [systemStatus, setSystemStatus] = useState<SystemStatusResult | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  
  const { mutate: getSystemStatus, isPending: isLoadingStatus } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('GET', '/api/admin/phantom-system-status');
      return await res.json();
    },
    onSuccess: (data) => {
      setSystemStatus(data);
      toast({
        title: "System status retrieved",
        description: "Successfully retrieved current system status",
      });
    },
    onError: (error) => {
      toast({
        title: "Error retrieving status",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  const { mutate: runDiagnostic, isPending: isRunningDiagnostic } = useMutation({
    mutationFn: async (payload: { customerId?: string; transactionId?: string; testType: string }) => {
      const res = await apiRequest('POST', '/api/admin/phantom-diagnostics', payload);
      return await res.json();
    },
    onSuccess: (data) => {
      setDiagnosticResults(data.results || []);
      toast({
        title: "Diagnostic complete",
        description: "Diagnostic tests have completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error running diagnostic",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  const handleRunSystemDiagnostic = () => {
    runDiagnostic({ testType: 'system' });
  };
  
  const handleRunCustomerDiagnostic = () => {
    if (!customerId.trim()) {
      toast({
        title: "Customer ID required",
        description: "Please enter a customer ID to run this diagnostic",
        variant: "destructive",
      });
      return;
    }
    
    runDiagnostic({ customerId, testType });
  };
  
  const handleRunTransactionDiagnostic = () => {
    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID required",
        description: "Please enter a transaction ID to run this diagnostic",
        variant: "destructive",
      });
      return;
    }
    
    runDiagnostic({ transactionId, testType });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">PhantomPay Diagnostics</CardTitle>
        <CardDescription>
          Run diagnostics on the PhantomPay mock payment system
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="system" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>System Status</span>
            </TabsTrigger>
            <TabsTrigger value="customer" className="flex items-center gap-1">
              <DatabaseIcon className="h-4 w-4" />
              <span>Customer Tests</span>
            </TabsTrigger>
            <TabsTrigger value="transaction" className="flex items-center gap-1">
              <ServerCrash className="h-4 w-4" />
              <span>Transaction Tests</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="system" className="p-6 pt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">System Health Overview</h3>
                <p className="text-sm text-gray-500">
                  Check the overall health of the PhantomPay system
                </p>
              </div>
              <div className="space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => getSystemStatus()}
                  disabled={isLoadingStatus}
                  className="flex items-center gap-1"
                >
                  {isLoadingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                  <span>Check Status</span>
                </Button>
                <Button 
                  onClick={handleRunSystemDiagnostic}
                  disabled={isRunningDiagnostic}
                  className="flex items-center gap-1"
                >
                  {isRunningDiagnostic ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                  <span>Run Diagnostic</span>
                </Button>
              </div>
            </div>
            
            {systemStatus ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Server Health</p>
                        <p className="text-lg font-semibold">
                          {systemStatus.serverHealth ? 'Operational' : 'Issues Detected'}
                        </p>
                      </div>
                      {systemStatus.serverHealth ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Database Health</p>
                        <p className="text-lg font-semibold">
                          {systemStatus.databaseHealth ? 'Operational' : 'Issues Detected'}
                        </p>
                      </div>
                      {systemStatus.databaseHealth ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">API Health</p>
                        <p className="text-lg font-semibold">
                          {systemStatus.apiHealth ? 'Operational' : 'Issues Detected'}
                        </p>
                      </div>
                      {systemStatus.apiHealth ? (
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm font-medium text-gray-500">Customers</p>
                    <p className="text-2xl font-bold">{systemStatus.customersCount}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm font-medium text-gray-500">Accounts</p>
                    <p className="text-2xl font-bold">{systemStatus.accountsCount}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg border p-4">
                    <p className="text-sm font-medium text-gray-500">Transactions</p>
                    <p className="text-2xl font-bold">{systemStatus.transactionsCount}</p>
                  </div>
                </div>
                
                <div className="text-right text-xs text-gray-500 mt-2">
                  Last updated: {new Date(systemStatus.lastUpdate).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="border rounded-lg bg-gray-50 p-6 text-center mt-4">
                <ServerCrash className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="font-medium">No system status data</p>
                <p className="text-sm text-gray-500 mt-1">
                  Click "Check Status" to retrieve current system health status
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="customer" className="p-6 pt-4">
          <div className="space-y-6">
            <div>
              <Label htmlFor="customerId">Customer ID</Label>
              <div className="flex gap-3 mt-1.5">
                <Input
                  id="customerId"
                  placeholder="Enter phantom-cust-xxxxx ID"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
                
                <div className="flex-shrink-0">
                  <Label htmlFor="testType">Test Type</Label>
                  <select
                    id="testType"
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                  >
                    <option value="all">All Tests</option>
                    <option value="balance">Balance Tests</option>
                    <option value="transactions">Transaction Tests</option>
                    <option value="accounts">Account Tests</option>
                  </select>
                </div>
                
                <Button
                  onClick={handleRunCustomerDiagnostic}
                  disabled={isRunningDiagnostic || !customerId.trim()}
                  className="flex-shrink-0 flex items-center gap-1"
                >
                  {isRunningDiagnostic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                  <span>Run Tests</span>
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Diagnostic Results</h3>
              {diagnosticResults.length > 0 ? (
                <div className="space-y-3">
                  {diagnosticResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-md border ${
                        result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          {result.success ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <h4 className={`text-sm font-medium ${
                            result.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {result.success ? 'Success' : 'Error'}
                          </h4>
                          <p className="text-sm mt-1">{result.message}</p>
                          
                          {result.details && (
                            <div className="mt-2 p-2 bg-white/50 rounded text-xs font-mono">
                              <pre className="whitespace-pre-wrap break-all">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg bg-gray-50 p-6 text-center">
                  <ServerCrash className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium">No diagnostic results</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter a customer ID and run tests to see results
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="transaction" className="p-6 pt-4">
          <div className="space-y-6">
            <div>
              <Label htmlFor="transactionId">Transaction ID</Label>
              <div className="flex gap-3 mt-1.5">
                <Input
                  id="transactionId"
                  placeholder="Enter phantom-tx-xxxxx ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
                
                <div className="flex-shrink-0">
                  <Label htmlFor="transactionTestType">Test Type</Label>
                  <select
                    id="transactionTestType"
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                  >
                    <option value="all">All Tests</option>
                    <option value="consistency">Data Consistency</option>
                    <option value="accounts">Account Effects</option>
                  </select>
                </div>
                
                <Button
                  onClick={handleRunTransactionDiagnostic}
                  disabled={isRunningDiagnostic || !transactionId.trim()}
                  className="flex-shrink-0 flex items-center gap-1"
                >
                  {isRunningDiagnostic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                  <span>Run Tests</span>
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Diagnostic Results</h3>
              {diagnosticResults.length > 0 ? (
                <div className="space-y-3">
                  {diagnosticResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-md border ${
                        result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          {result.success ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <h4 className={`text-sm font-medium ${
                            result.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {result.success ? 'Success' : 'Error'}
                          </h4>
                          <p className="text-sm mt-1">{result.message}</p>
                          
                          {result.details && (
                            <div className="mt-2 p-2 bg-white/50 rounded text-xs font-mono">
                              <pre className="whitespace-pre-wrap break-all">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg bg-gray-50 p-6 text-center">
                  <ServerCrash className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium">No diagnostic results</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter a transaction ID and run tests to see results
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="bg-gray-50 border-t py-3 px-6 text-xs text-gray-500 flex justify-between">
        <div>PhantomPay Status & Diagnostics • {new Date().toLocaleString()}</div>
        <div>Mock Payment System for Testing</div>
      </CardFooter>
    </Card>
  );
}