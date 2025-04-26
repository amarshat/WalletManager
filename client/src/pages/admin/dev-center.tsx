import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';

// Test phases
type TestPhase = 'auth' | 'wallet' | 'deposit' | 'withdrawal';

// Test status 
type TestStatus = 'idle' | 'running' | 'success' | 'error';

// Response interface
interface ApiResponse {
  status: number;
  data: any;
  error?: string;
}

// Form schema for wallet creation
const walletFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  dateOfBirth: z.string().optional(),
  nationalId: z.string().optional(),
  customerId: z.string().optional(),
});

// Form schema for deposit
const depositFormSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  amount: z.string().min(1, 'Amount is required'),
  currencyCode: z.string().min(1, 'Currency code is required'),
  description: z.string().optional(),
});

// Form schema for withdrawal
const withdrawalFormSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  amount: z.string().min(1, 'Amount is required'),
  currencyCode: z.string().min(1, 'Currency code is required'),
  description: z.string().optional(),
});

export default function DevCenterPage() {
  const [activePhase, setActivePhase] = useState<TestPhase>('auth');
  const [testStatus, setTestStatus] = useState<Record<TestPhase, TestStatus>>({
    auth: 'idle',
    wallet: 'idle',
    deposit: 'idle',
    withdrawal: 'idle'
  });
  const [apiResponses, setApiResponses] = useState<Record<TestPhase, ApiResponse | null>>({
    auth: null,
    wallet: null,
    deposit: null,
    withdrawal: null
  });

  // Forms
  const walletForm = useForm<z.infer<typeof walletFormSchema>>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      dateOfBirth: '1990-01-01',
      nationalId: '',
      customerId: '',
    }
  });

  const depositForm = useForm<z.infer<typeof depositFormSchema>>({
    resolver: zodResolver(depositFormSchema),
    defaultValues: {
      customerId: '',
      amount: '10.00',
      currencyCode: 'USD',
      description: 'Test deposit',
    }
  });

  const withdrawalForm = useForm<z.infer<typeof withdrawalFormSchema>>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      customerId: '',
      amount: '5.00',
      currencyCode: 'USD',
      description: 'Test withdrawal',
    }
  });

  // Auth test mutation
  const authTestMutation = useMutation({
    mutationFn: async () => {
      setTestStatus(prev => ({ ...prev, auth: 'running' }));
      try {
        const response = await apiRequest('GET', '/api/admin/test/auth');
        const data = await response.json();
        setApiResponses(prev => ({ ...prev, auth: { status: response.status, data } }));
        setTestStatus(prev => ({ ...prev, auth: 'success' }));
        return data;
      } catch (error: any) {
        setApiResponses(prev => ({ 
          ...prev, 
          auth: { 
            status: error.status || 500, 
            data: error.data || {}, 
            error: error.message || 'Unknown error' 
          } 
        }));
        setTestStatus(prev => ({ ...prev, auth: 'error' }));
        throw error;
      }
    }
  });

  // Wallet creation mutation
  const walletCreationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof walletFormSchema>) => {
      setTestStatus(prev => ({ ...prev, wallet: 'running' }));
      try {
        const response = await apiRequest('POST', '/api/admin/test/wallet', data);
        const responseData = await response.json();
        setApiResponses(prev => ({ ...prev, wallet: { status: response.status, data: responseData } }));
        setTestStatus(prev => ({ ...prev, wallet: 'success' }));
        
        // Set the customerId in the deposit and withdrawal forms if available
        if (responseData?.id) {
          depositForm.setValue('customerId', responseData.id);
          withdrawalForm.setValue('customerId', responseData.id);
        }
        return responseData;
      } catch (error: any) {
        setApiResponses(prev => ({ 
          ...prev, 
          wallet: { 
            status: error.status || 500, 
            data: error.data || {}, 
            error: error.message || 'Unknown error' 
          } 
        }));
        setTestStatus(prev => ({ ...prev, wallet: 'error' }));
        throw error;
      }
    }
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: z.infer<typeof depositFormSchema>) => {
      setTestStatus(prev => ({ ...prev, deposit: 'running' }));
      try {
        const response = await apiRequest('POST', '/api/admin/test/deposit', {
          ...data,
          amount: parseFloat(data.amount)
        });
        const responseData = await response.json();
        setApiResponses(prev => ({ ...prev, deposit: { status: response.status, data: responseData } }));
        setTestStatus(prev => ({ ...prev, deposit: 'success' }));
        return responseData;
      } catch (error: any) {
        setApiResponses(prev => ({ 
          ...prev, 
          deposit: { 
            status: error.status || 500, 
            data: error.data || {}, 
            error: error.message || 'Unknown error' 
          } 
        }));
        setTestStatus(prev => ({ ...prev, deposit: 'error' }));
        throw error;
      }
    }
  });

  // Withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof withdrawalFormSchema>) => {
      setTestStatus(prev => ({ ...prev, withdrawal: 'running' }));
      try {
        const response = await apiRequest('POST', '/api/admin/test/withdrawal', {
          ...data,
          amount: parseFloat(data.amount)
        });
        const responseData = await response.json();
        setApiResponses(prev => ({ ...prev, withdrawal: { status: response.status, data: responseData } }));
        setTestStatus(prev => ({ ...prev, withdrawal: 'success' }));
        return responseData;
      } catch (error: any) {
        setApiResponses(prev => ({ 
          ...prev, 
          withdrawal: { 
            status: error.status || 500, 
            data: error.data || {}, 
            error: error.message || 'Unknown error' 
          } 
        }));
        setTestStatus(prev => ({ ...prev, withdrawal: 'error' }));
        throw error;
      }
    }
  });

  // Status badge component
  const StatusBadge = ({ status }: { status: TestStatus }) => {
    switch (status) {
      case 'running':
        return <Badge variant="outline" className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Running</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Success</Badge>;
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Not Run</Badge>;
    }
  };

  // JSON viewer component
  const JsonViewer = ({ data }: { data: any }) => {
    return (
      <ScrollArea className="h-[300px] w-full border rounded-md bg-gray-50 dark:bg-gray-900">
        <pre className="p-4 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </ScrollArea>
    );
  };

  return (
    <AdminLayout title="Developer Testing Center" description="Test Paysafe API integration">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>API Testing Console</CardTitle>
            <CardDescription>
              Test the Paysafe API integration with predefined test cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activePhase} onValueChange={(value) => setActivePhase(value as TestPhase)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="auth" className="relative">
                  Health & Auth
                  <div className="absolute -top-1 -right-1">
                    <StatusBadge status={testStatus.auth} />
                  </div>
                </TabsTrigger>
                <TabsTrigger value="wallet" className="relative">
                  Wallet Creation
                  <div className="absolute -top-1 -right-1">
                    <StatusBadge status={testStatus.wallet} />
                  </div>
                </TabsTrigger>
                <TabsTrigger value="deposit" className="relative">
                  Deposit
                  <div className="absolute -top-1 -right-1">
                    <StatusBadge status={testStatus.deposit} />
                  </div>
                </TabsTrigger>
                <TabsTrigger value="withdrawal" className="relative">
                  Withdrawal
                  <div className="absolute -top-1 -right-1">
                    <StatusBadge status={testStatus.withdrawal} />
                  </div>
                </TabsTrigger>
              </TabsList>
              
              {/* Health & Auth Test */}
              <TabsContent value="auth">
                <Card>
                  <CardHeader>
                    <CardTitle>Health Check & Authentication Test</CardTitle>
                    <CardDescription>
                      Tests if the API is accessible and your authentication credentials are valid
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md font-mono text-sm">
                        GET /digitalwallets/v2/features
                      </div>
                      {apiResponses.auth && (
                        <>
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">Response:</h4>
                            <JsonViewer data={apiResponses.auth} />
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      onClick={() => authTestMutation.mutate()}
                      disabled={testStatus.auth === 'running'}
                    >
                      {testStatus.auth === 'running' && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Run Test
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Wallet Creation */}
              <TabsContent value="wallet">
                <Card>
                  <CardHeader>
                    <CardTitle>Wallet Account Creation</CardTitle>
                    <CardDescription>
                      Create a new wallet account for a customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Form {...walletForm}>
                        <form className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={walletForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={walletForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={walletForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={walletForm.control}
                              name="dateOfBirth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of Birth</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="date" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={walletForm.control}
                              name="nationalId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>National ID (Optional)</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={walletForm.control}
                            name="customerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer ID (Optional, for existing customers)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>

                      {apiResponses.wallet && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Response:</h4>
                          <JsonViewer data={apiResponses.wallet} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      onClick={() => walletCreationMutation.mutate(walletForm.getValues())}
                      disabled={testStatus.wallet === 'running'}
                    >
                      {testStatus.wallet === 'running' && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Wallet
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Deposit */}
              <TabsContent value="deposit">
                <Card>
                  <CardHeader>
                    <CardTitle>Deposit Test</CardTitle>
                    <CardDescription>
                      Test depositing funds into a wallet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Form {...depositForm}>
                        <form className="space-y-4">
                          <FormField
                            control={depositForm.control}
                            name="customerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer ID</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={depositForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amount</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" step="0.01" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={depositForm.control}
                              name="currencyCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Currency</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={depositForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>

                      {apiResponses.deposit && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Response:</h4>
                          <JsonViewer data={apiResponses.deposit} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      onClick={() => depositMutation.mutate(depositForm.getValues())}
                      disabled={testStatus.deposit === 'running'}
                    >
                      {testStatus.deposit === 'running' && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Make Deposit
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Withdrawal */}
              <TabsContent value="withdrawal">
                <Card>
                  <CardHeader>
                    <CardTitle>Withdrawal Test</CardTitle>
                    <CardDescription>
                      Test withdrawing funds from a wallet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Form {...withdrawalForm}>
                        <form className="space-y-4">
                          <FormField
                            control={withdrawalForm.control}
                            name="customerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer ID</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={withdrawalForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amount</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="number" step="0.01" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={withdrawalForm.control}
                              name="currencyCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Currency</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={withdrawalForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>

                      {apiResponses.withdrawal && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-2">Response:</h4>
                          <JsonViewer data={apiResponses.withdrawal} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      onClick={() => withdrawalMutation.mutate(withdrawalForm.getValues())}
                      disabled={testStatus.withdrawal === 'running'}
                    >
                      {testStatus.withdrawal === 'running' && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Make Withdrawal
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}