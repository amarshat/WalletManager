import { useState } from 'react';
import { Activity, RefreshCw, CheckCircle, AlertTriangle, Database, Link2, Wallet, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

interface SystemStatus {
  phantomPayReady: boolean;
  databaseAvailable: boolean;
  routesRegistered: boolean;
  lastDiagnosticRun: string | null;
  totalPhantomAccounts: number;
  totalPhantomTransactions: number;
  totalPhantomWallets: number;
}

export default function PhantomPayDiagnostics() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Record<string, DiagnosticResult>>({});
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [currentTab, setCurrentTab] = useState('system');
  
  const runDiagnostic = async (testType: string) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/admin/phantom-diagnostics', {
        testType,
        customerId: testType === 'customer' ? customerId : undefined,
        transactionId: testType === 'transaction' ? transactionId : undefined,
      });
      
      const result = await response.json();
      
      // Store the result
      setResults(prev => ({
        ...prev,
        [testType]: {
          ...result,
          timestamp: new Date().toISOString()
        }
      }));
      
      // Update system status if available
      if (result.systemStatus) {
        setSystemStatus(result.systemStatus);
      }
      
      // Show success toast
      toast({
        title: result.success ? 'Diagnostic Passed' : 'Diagnostic Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
      
    } catch (error: any) {
      console.error('Diagnostic failed:', error);
      
      // Record the error
      setResults(prev => ({
        ...prev,
        [testType]: {
          success: false,
          message: error.message || 'Diagnostic test failed',
          timestamp: new Date().toISOString()
        }
      }));
      
      // Show error toast
      toast({
        title: 'Diagnostic Failed',
        description: error.message || 'Failed to run diagnostic test',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to fetch system status
  const fetchSystemStatus = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/admin/phantom-system-status');
      const status = await response.json();
      setSystemStatus(status);
      
      toast({
        title: 'System Status Updated',
        description: 'PhantomPay system status has been refreshed',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Fetch Status',
        description: error.message || 'Could not retrieve system status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const renderDiagnosticResult = (testType: string) => {
    const result = results[testType];
    
    if (!result) return null;
    
    return (
      <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex items-start">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.success ? 'Diagnostic Passed' : 'Diagnostic Failed'}
              </h4>
              <span className="text-xs text-gray-500">
                {formatTimestamp(result.timestamp)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{result.message}</p>
            
            {result.details && (
              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-xs py-2">
                    View Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-48">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">PhantomPay Diagnostics</h1>
          <p className="text-gray-600">
            Run diagnostic tests to verify PhantomPay mock system integration
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchSystemStatus}
          disabled={isLoading}
          className="flex items-center"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>
      
      {/* System Status Card */}
      {systemStatus && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">System Status</CardTitle>
            <CardDescription>Current state of PhantomPay mock system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${systemStatus.phantomPayReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium mr-2">PhantomPay Ready:</span>
                <span>{systemStatus.phantomPayReady ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${systemStatus.databaseAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium mr-2">Database Available:</span>
                <span>{systemStatus.databaseAvailable ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${systemStatus.routesRegistered ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium mr-2">Routes Registered:</span>
                <span>{systemStatus.routesRegistered ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Last Diagnostic Run:</span>
                <span>{systemStatus.lastDiagnosticRun ? formatTimestamp(systemStatus.lastDiagnosticRun) : 'Never'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-md flex items-center">
                <Wallet className="h-10 w-10 text-primary mr-4" />
                <div>
                  <div className="text-sm text-gray-500">PhantomPay Wallets</div>
                  <div className="text-2xl font-bold">{systemStatus.totalPhantomWallets}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md flex items-center">
                <Database className="h-10 w-10 text-indigo-500 mr-4" />
                <div>
                  <div className="text-sm text-gray-500">PhantomPay Accounts</div>
                  <div className="text-2xl font-bold">{systemStatus.totalPhantomAccounts}</div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md flex items-center">
                <Activity className="h-10 w-10 text-amber-500 mr-4" />
                <div>
                  <div className="text-sm text-gray-500">PhantomPay Transactions</div>
                  <div className="text-2xl font-bold">{systemStatus.totalPhantomTransactions}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Diagnostic Tools */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Diagnostic Tools</CardTitle>
          <CardDescription>Run tests to verify PhantomPay functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="system">
                <Link2 className="h-4 w-4 mr-2" />
                System Tests
              </TabsTrigger>
              <TabsTrigger value="customer">
                <Wallet className="h-4 w-4 mr-2" />
                Customer Tests
              </TabsTrigger>
              <TabsTrigger value="transaction">
                <Activity className="h-4 w-4 mr-2" />
                Transaction Tests
              </TabsTrigger>
              <TabsTrigger value="data">
                <FileText className="h-4 w-4 mr-2" />
                Data Integrity
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="system">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  System tests verify the core functionality of the PhantomPay mock system.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Database Connectivity</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Verifies database connections used by PhantomPay are working correctly.
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('database')}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('database')}
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">API Integration</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Tests the integration between WalletClient and PhantomPay implementations.
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('integration')}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('integration')}
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Schema Validation</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Validates database schemas and tables required by PhantomPay.
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('schema')}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('schema')}
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Route Registration</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Checks if all necessary API routes for PhantomPay are registered correctly.
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('routes')}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('routes')}
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="customer">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Test PhantomPay customer functionality by providing a customer ID.
                </p>
                
                <div className="mb-4">
                  <Label htmlFor="customerId">Customer ID</Label>
                  <div className="flex mt-1">
                    <Input
                      id="customerId"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      placeholder="Enter PhantomPay customer ID (phantom-wallet-*)"
                      className="mr-2"
                    />
                    <Button 
                      onClick={() => runDiagnostic('customer')}
                      disabled={isLoading || !customerId}
                      className="whitespace-nowrap"
                    >
                      Run Diagnostic
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Example: phantom-wallet-12345678
                  </p>
                </div>
                
                {renderDiagnosticResult('customer')}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Customer Lookup</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Verifies a customer can be found by ID.
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('customer_lookup')}
                        disabled={isLoading || !customerId}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('customer_lookup')}
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Tests retrieving wallet accounts and status.
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('account_status')}
                        disabled={isLoading || !customerId}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('account_status')}
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Balance Check</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Verifies balance calculation is working correctly.
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('balance_check')}
                        disabled={isLoading || !customerId}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('balance_check')}
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="transaction">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Test PhantomPay transaction processing by providing a transaction ID.
                </p>
                
                <div className="mb-4">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <div className="flex mt-1">
                    <Input
                      id="transactionId"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter PhantomPay transaction ID (phantom-tx-*)"
                      className="mr-2"
                    />
                    <Button 
                      onClick={() => runDiagnostic('transaction')}
                      disabled={isLoading || !transactionId}
                      className="whitespace-nowrap"
                    >
                      Run Diagnostic
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Example: phantom-tx-12345678
                  </p>
                </div>
                
                {renderDiagnosticResult('transaction')}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Transaction Flow</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Tests the complete transaction workflow (create, process, balance update).
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('transaction_flow')}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('transaction_flow')}
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Error Handling</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Verifies error handling during transaction failures (insufficient funds, etc.)
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('error_handling')}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('error_handling')}
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="data">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Verify data integrity across the PhantomPay database tables.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Database Consistency</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Checks for data consistency across PhantomPay tables.
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('data_consistency')}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('data_consistency')}
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Orphaned Records</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Identifies any orphaned records in the PhantomPay database.
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('orphaned_records')}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('orphaned_records')}
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Balance Reconciliation</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Reconciles account balances against transaction history.
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('balance_reconciliation')}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('balance_reconciliation')}
                  </Card>
                  
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-md">Data Repair</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 text-sm text-gray-600">
                      Attempts to repair any inconsistencies found in the PhantomPay database.
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Button 
                        onClick={() => runDiagnostic('data_repair')}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                      >
                        Run Test
                      </Button>
                    </CardFooter>
                    {renderDiagnosticResult('data_repair')}
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}