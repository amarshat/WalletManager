import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Workflow, 
  Link, 
  User, 
  CreditCard, 
  BarChart4, 
  Wallet,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
  recommendation?: string;
}

export default function PhantomPayDiagnostics() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('system');
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, DiagnosticResult | null>>({
    database: null,
    schema: null,
    integration: null,
    routes: null,
    errorHandling: null,
    dataIntegrity: null
  });
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  
  // Run a diagnostic test
  const runDiagnosticTest = async (type: string, params: Record<string, string> = {}) => {
    setIsRunningTest(true);
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({ type, ...params }).toString();
      
      // Run the diagnostic test
      const response = await apiRequest('GET', `/api/phantom/diagnostics?${queryParams}`);
      const result = await response.json();
      
      // Update test results
      setTestResults(prev => ({
        ...prev,
        [type]: result
      }));
      
      toast({
        title: result.success ? 'Diagnostic Complete' : 'Diagnostic Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
      
      return result;
    } catch (error) {
      console.error('Error running diagnostic test:', error);
      toast({
        title: 'Error Running Diagnostic',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsRunningTest(false);
    }
  };
  
  // Get system status
  const getSystemStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const response = await apiRequest('GET', '/api/phantom/status');
      const status = await response.json();
      
      setSystemStatus(status);
      
      toast({
        title: 'System Status Updated',
        description: 'PhantomPay system status has been refreshed.'
      });
    } catch (error) {
      console.error('Error fetching system status:', error);
      toast({
        title: 'Status Update Failed',
        description: error instanceof Error ? error.message : 'Failed to fetch system status',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };
  
  // Run all system tests
  const runAllSystemTests = async () => {
    await runDiagnosticTest('database');
    await runDiagnosticTest('schema');
    await runDiagnosticTest('integration');
    await runDiagnosticTest('routes');
  };
  
  // Format diagnostic result as a component
  const formatResult = (result: DiagnosticResult | null) => {
    if (!result) {
      return <div className="text-gray-500 italic">No test results available</div>;
    }
    
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          {result.success ? (
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
          )}
          <div>
            <div className="font-medium">{result.message}</div>
            {result.recommendation && (
              <p className="text-sm text-gray-600">{result.recommendation}</p>
            )}
          </div>
        </div>
        
        {result.details && (
          <Accordion type="single" collapsible className="mt-2">
            <AccordionItem value="details">
              <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-60">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-primary" />
                PhantomPay Diagnostics
              </CardTitle>
              <CardDescription>
                Run diagnostics to check the health of the PhantomPay mock system
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={getSystemStatus}
              disabled={isLoadingStatus}
            >
              {isLoadingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check System Status'
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {systemStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Database</h4>
                <Badge variant={systemStatus.database.status === 'healthy' ? 'outline' : 'destructive'}>
                  {systemStatus.database.status}
                </Badge>
                <p className="text-xs text-gray-500">{systemStatus.database.message}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Schema</h4>
                <Badge variant={systemStatus.schemas.status === 'healthy' ? 'outline' : 'destructive'}>
                  {systemStatus.schemas.status}
                </Badge>
                <p className="text-xs text-gray-500">{systemStatus.schemas.message}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Services</h4>
                <div className="flex space-x-2">
                  <Badge variant={systemStatus.services.wallet ? 'outline' : 'destructive'}>
                    Wallet {systemStatus.services.wallet ? 'OK' : 'Error'}
                  </Badge>
                  <Badge variant={systemStatus.services.transactions ? 'outline' : 'destructive'}>
                    Transactions {systemStatus.services.transactions ? 'OK' : 'Error'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">Last updated: {new Date(systemStatus.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium">No System Status Available</h3>
              <p className="text-sm text-gray-500 mt-1">
                Click the "Check System Status" button to get the current health status of PhantomPay.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="system">System Tests</TabsTrigger>
          <TabsTrigger value="data">Data Tests</TabsTrigger>
          <TabsTrigger value="transaction">Transaction Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PhantomPay System Tests</CardTitle>
              <CardDescription>
                Run diagnostics to verify the core system functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-medium">Database Connectivity</h3>
                  </div>
                  <div className="pl-7">
                    {formatResult(testResults.database)}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="mt-2"
                      onClick={() => runDiagnosticTest('database')}
                      disabled={isRunningTest}
                    >
                      {isRunningTest ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Database className="mr-2 h-4 w-4" />
                      )}
                      Run Test
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Workflow className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="font-medium">Schema Validation</h3>
                  </div>
                  <div className="pl-7">
                    {formatResult(testResults.schema)}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="mt-2"
                      onClick={() => runDiagnosticTest('schema')}
                      disabled={isRunningTest}
                    >
                      {isRunningTest ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Workflow className="mr-2 h-4 w-4" />
                      )}
                      Run Test
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Link className="h-5 w-5 text-purple-500 mr-2" />
                    <h3 className="font-medium">Integration Points</h3>
                  </div>
                  <div className="pl-7">
                    {formatResult(testResults.integration)}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="mt-2"
                      onClick={() => runDiagnosticTest('integration')}
                      disabled={isRunningTest}
                    >
                      {isRunningTest ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Link className="mr-2 h-4 w-4" />
                      )}
                      Run Test
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Link className="h-5 w-5 text-amber-500 mr-2" />
                    <h3 className="font-medium">API Routes</h3>
                  </div>
                  <div className="pl-7">
                    {formatResult(testResults.routes)}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="mt-2"
                      onClick={() => runDiagnosticTest('routes')}
                      disabled={isRunningTest}
                    >
                      {isRunningTest ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Link className="mr-2 h-4 w-4" />
                      )}
                      Run Test
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-center">
                <Button onClick={runAllSystemTests} disabled={isRunningTest}>
                  {isRunningTest ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BarChart4 className="mr-2 h-4 w-4" />
                  )}
                  Run All System Tests
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Integrity Tests</CardTitle>
              <CardDescription>
                Run diagnostics to verify data consistency and integrity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    <h3 className="font-medium">Error Handling</h3>
                  </div>
                  <div className="pl-7">
                    {formatResult(testResults.errorHandling)}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="mt-2"
                      onClick={() => runDiagnosticTest('error-handling')}
                      disabled={isRunningTest}
                    >
                      {isRunningTest ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <AlertTriangle className="mr-2 h-4 w-4" />
                      )}
                      Run Test
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 text-red-500 mr-2" />
                    <h3 className="font-medium">Data Integrity</h3>
                  </div>
                  <div className="pl-7">
                    {formatResult(testResults.dataIntegrity)}
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => runDiagnosticTest('data-integrity', { testType: 'basic' })}
                        disabled={isRunningTest}
                      >
                        {isRunningTest ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Database className="mr-2 h-4 w-4" />
                        )}
                        Basic
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => runDiagnosticTest('data-integrity', { testType: 'comprehensive' })}
                        disabled={isRunningTest}
                      >
                        {isRunningTest ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Database className="mr-2 h-4 w-4" />
                        )}
                        Comprehensive
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Tests</CardTitle>
              <CardDescription>
                Run diagnostics to verify transaction processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Transaction Testing</AlertTitle>
                <AlertDescription>
                  Enter a customer ID or transaction ID to test specific transaction functionality.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <label htmlFor="customerId" className="text-sm font-medium">Customer ID</label>
                    <input
                      type="text"
                      id="customerId"
                      placeholder="phantom-wallet-xxxx"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const customerId = (document.getElementById('customerId') as HTMLInputElement)?.value;
                        if (customerId) {
                          runDiagnosticTest('customer', { customerId, testType: 'basic' });
                        } else {
                          toast({
                            title: 'Missing Customer ID',
                            description: 'Please enter a customer ID to run this test',
                            variant: 'destructive'
                          });
                        }
                      }}
                      disabled={isRunningTest}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Test Customer
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        const customerId = (document.getElementById('customerId') as HTMLInputElement)?.value;
                        if (customerId) {
                          runDiagnosticTest('account', { customerId, testType: 'basic' });
                        } else {
                          toast({
                            title: 'Missing Customer ID',
                            description: 'Please enter a customer ID to run this test',
                            variant: 'destructive'
                          });
                        }
                      }}
                      disabled={isRunningTest}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Test Accounts
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <label htmlFor="transactionId" className="text-sm font-medium">Transaction ID</label>
                    <input
                      type="text"
                      id="transactionId"
                      placeholder="phantom-tx-xxxx"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const transactionId = (document.getElementById('transactionId') as HTMLInputElement)?.value;
                      runDiagnosticTest('transaction', transactionId ? { transactionId } : {});
                    }}
                    disabled={isRunningTest}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Test Transaction
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => runDiagnosticTest('transaction', { testType: 'stats' })}
                    disabled={isRunningTest}
                  >
                    {isRunningTest ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <BarChart4 className="mr-2 h-4 w-4" />
                    )}
                    Get Transaction Statistics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}