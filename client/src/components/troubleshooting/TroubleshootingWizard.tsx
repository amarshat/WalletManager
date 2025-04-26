import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  ShieldAlert,
  WifiOff,
  PlugZap,
  Wallet,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Users,
  LucideIcon,
  DatabaseBackup,
  Webhook
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Problem = 
  | 'authentication'
  | 'transactions'
  | 'wallet'
  | 'accounts'
  | 'connectivity';

type ProblemDetails = {
  title: string;
  description: string;
  icon: React.ReactNode;
  solutions: Solution[];
};

type Solution = {
  title: string;
  description: string;
  action: string;
  actionHandler?: () => Promise<any>;
  successMessage: string;
  errorMessage: string;
};

export default function TroubleshootingWizard() {
  const { toast } = useToast();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [executingFix, setExecutingFix] = useState(false);
  const [fixResult, setFixResult] = useState<{ success: boolean; message: string } | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  
  const problems: Record<Problem, ProblemDetails> = {
    authentication: {
      title: 'Authentication Issues',
      description: 'Problems with user login, registration, or session management',
      icon: <ShieldAlert className="h-8 w-8 text-red-500" />,
      solutions: [
        {
          title: 'Reset User Session',
          description: 'Clear the user session data and force a re-login',
          action: 'Reset Session',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            return { success: true, message: 'Session reset successful. User will need to log in again.' };
          },
          successMessage: 'Session has been reset successfully',
          errorMessage: 'Failed to reset session'
        },
        {
          title: 'Clear Browser Cache',
          description: 'Instruct the user to clear their browser cache and cookies',
          action: 'View Instructions',
          successMessage: 'Browser cache clearing instructions provided',
          errorMessage: 'Failed to provide instructions'
        },
        {
          title: 'Reset User Password',
          description: 'Send a password reset email to the user',
          action: 'Send Reset Email',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1800));
            return { success: true, message: 'Password reset email has been sent to the user.' };
          },
          successMessage: 'Password reset email sent successfully',
          errorMessage: 'Failed to send password reset email'
        }
      ]
    },
    connectivity: {
      title: 'Connectivity Issues',
      description: 'Network-related problems or connection failures',
      icon: <WifiOff className="h-8 w-8 text-orange-500" />,
      solutions: [
        {
          title: 'Test API Connectivity',
          description: 'Check the connection to the Paysafe API endpoints',
          action: 'Run Test',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { success: true, message: 'Connection to Paysafe API is active and responding correctly.' };
          },
          successMessage: 'API connection is working properly',
          errorMessage: 'Failed to connect to the API'
        },
        {
          title: 'Check Network Configuration',
          description: 'Verify network settings and firewall rules',
          action: 'Run Diagnostic',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1800));
            return { success: true, message: 'Network configuration is correct. No firewall issues detected.' };
          },
          successMessage: 'Network configuration is correct',
          errorMessage: 'Network configuration issues detected'
        }
      ]
    },
    transactions: {
      title: 'Transaction Problems',
      description: 'Issues with payments, transfers, or transaction history',
      icon: <PlugZap className="h-8 w-8 text-purple-500" />,
      solutions: [
        {
          title: 'Verify Transaction Status',
          description: 'Check the status of recent transactions in the system',
          action: 'Check Status',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2200));
            return { success: true, message: 'All recent transactions are in a valid state. No pending transactions found.' };
          },
          successMessage: 'All transactions are in a valid state',
          errorMessage: 'Some transactions may be in an invalid state'
        },
        {
          title: 'Synchronize Transaction Records',
          description: 'Ensure local transaction records match the payment provider',
          action: 'Synchronize',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2500));
            return { success: true, message: 'Transaction records have been synchronized with the payment provider.' };
          },
          successMessage: 'Transaction records have been synchronized',
          errorMessage: 'Failed to synchronize transaction records'
        },
        {
          title: 'Clear Transaction Cache',
          description: 'Clear cached transaction data to resolve display issues',
          action: 'Clear Cache',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            return { success: true, message: 'Transaction cache has been cleared. Data will be refreshed from the source.' };
          },
          successMessage: 'Transaction cache cleared successfully',
          errorMessage: 'Failed to clear transaction cache'
        }
      ]
    },
    wallet: {
      title: 'Wallet Issues',
      description: 'Problems with digital wallets or account balances',
      icon: <Wallet className="h-8 w-8 text-green-500" />,
      solutions: [
        {
          title: 'Refresh Wallet Balance',
          description: 'Force a refresh of wallet balances from the payment provider',
          action: 'Refresh Balance',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1800));
            return { success: true, message: 'Wallet balances have been refreshed from the payment provider.' };
          },
          successMessage: 'Wallet balances have been refreshed',
          errorMessage: 'Failed to refresh wallet balances'
        },
        {
          title: 'Verify Wallet Status',
          description: 'Check if the wallet is active and in good standing',
          action: 'Check Status',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { success: true, message: 'Wallet is active and in good standing. No restrictions detected.' };
          },
          successMessage: 'Wallet is active and in good standing',
          errorMessage: 'Wallet may have restrictions or issues'
        }
      ]
    },
    accounts: {
      title: 'Account Issues',
      description: 'Problems with user accounts or profile information',
      icon: <Users className="h-8 w-8 text-blue-500" />,
      solutions: [
        {
          title: 'Verify Account Information',
          description: 'Check if user account information is complete and valid',
          action: 'Verify Info',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            return { success: true, message: 'Account information is complete and valid.' };
          },
          successMessage: 'Account information is complete and valid',
          errorMessage: 'Account information may be incomplete or invalid'
        },
        {
          title: 'Check KYC Status',
          description: 'Verify the Know Your Customer verification status',
          action: 'Check KYC',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2200));
            return { success: true, message: 'KYC verification is complete and up to date.' };
          },
          successMessage: 'KYC verification is complete and up to date',
          errorMessage: 'KYC verification may be incomplete or pending'
        },
        {
          title: 'Reset Account Preferences',
          description: 'Reset user account preferences to defaults',
          action: 'Reset Preferences',
          actionHandler: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1800));
            return { success: true, message: 'Account preferences have been reset to defaults.' };
          },
          successMessage: 'Account preferences have been reset',
          errorMessage: 'Failed to reset account preferences'
        }
      ]
    }
  };

  // Run diagnostic function
  const { mutate: runDiagnostic, isPending: isDiagnosticRunning } = useMutation({
    mutationFn: async (data: { type: string; action: string }) => {
      setExecutingFix(true);
      setFixResult(null);
      
      try {
        // If there's a custom action handler, use it
        const currentSolution = problems[selectedProblem as Problem].solutions[solutionIndex];
        if (currentSolution.actionHandler) {
          const result = await currentSolution.actionHandler();
          setFixResult(result);
          
          if (result.success) {
            toast({
              title: 'Success',
              description: currentSolution.successMessage,
            });
          } else {
            toast({
              title: 'Error',
              description: currentSolution.errorMessage,
              variant: 'destructive',
            });
          }
        } else {
          // Just show success for view-only actions
          setFixResult({ success: true, message: currentSolution.successMessage });
          toast({
            title: 'Info',
            description: currentSolution.successMessage,
          });
        }
      } catch (error) {
        console.error('Error in diagnostic:', error);
        const currentSolution = problems[selectedProblem as Problem].solutions[solutionIndex];
        setFixResult({ success: false, message: currentSolution.errorMessage });
        toast({
          title: 'Error',
          description: currentSolution.errorMessage,
          variant: 'destructive',
        });
      } finally {
        setExecutingFix(false);
      }
    }
  });

  // Submit report function
  const { mutate: submitReport, isPending: isSubmittingReport } = useMutation({
    mutationFn: async (data: { problem: string; description: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Report Submitted',
        description: 'Your troubleshooting report has been submitted to the support team.',
      });
      setReportOpen(false);
      setReportDescription('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit troubleshooting report.',
        variant: 'destructive',
      });
    }
  });

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setSolutionIndex(0);
    setFixResult(null);
  };

  const handleRunAction = () => {
    if (!selectedProblem) return;
    
    const currentSolution = problems[selectedProblem].solutions[solutionIndex];
    runDiagnostic({
      type: selectedProblem,
      action: currentSolution.action
    });
  };

  const handleSubmitReport = () => {
    if (!selectedProblem || !reportDescription.trim()) return;
    
    submitReport({
      problem: selectedProblem,
      description: reportDescription
    });
  };

  const renderProblemCard = (type: Problem) => {
    const problem = problems[type];
    return (
      <Card 
        key={type}
        className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
          selectedProblem === type ? 'border-primary ring-1 ring-primary' : ''
        }`}
        onClick={() => handleSelectProblem(type)}
      >
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-3">
            {problem.icon}
          </div>
          <h3 className="font-medium">{problem.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{problem.description}</p>
        </CardContent>
      </Card>
    );
  };

  const currentProblem = selectedProblem ? problems[selectedProblem] : null;
  const currentSolution = currentProblem?.solutions[solutionIndex];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Troubleshooting Wizard</CardTitle>
        <CardDescription>
          Diagnose and solve common issues with the wallet system
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!selectedProblem ? (
          <div className="space-y-6">
            <div className="text-sm text-gray-500 mb-4">
              Select the type of issue you're experiencing to begin troubleshooting:
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(problems).map((problem) => 
                renderProblemCard(problem as Problem)
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSelectedProblem(null);
                  setFixResult(null);
                }}
                className="gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back to Issues
              </Button>
              
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setReportOpen(true)}
              >
                <AlertCircle className="h-4 w-4" />
                Report Issue
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-1">
                <div className="space-y-4">
                  <div className="rounded-md border p-4 bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-gray-200 p-2">
                        {currentProblem?.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{currentProblem?.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{currentProblem?.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Troubleshooting Steps:</h4>
                    <div className="border rounded-md overflow-hidden">
                      {currentProblem?.solutions.map((solution, index) => (
                        <div 
                          key={index}
                          className={`p-3 flex gap-3 items-center ${
                            index === solutionIndex 
                              ? 'bg-primary/10 border-l-2 border-primary' 
                              : index < solutionIndex 
                                ? 'bg-gray-50' 
                                : 'bg-white'
                          } ${
                            index !== currentProblem.solutions.length - 1 ? 'border-b' : ''
                          } cursor-pointer`}
                          onClick={() => setSolutionIndex(index)}
                        >
                          <div className={`rounded-full w-6 h-6 flex items-center justify-center text-xs ${
                            index < solutionIndex 
                              ? 'bg-green-100 text-green-800' 
                              : index === solutionIndex 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {index < solutionIndex ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{solution.title}</div>
                            <div className="text-xs text-gray-500">{solution.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <div className="rounded-md border p-6 h-full">
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-lg font-medium mb-1">{currentSolution?.title}</h3>
                      <p className="text-gray-500 mb-6">{currentSolution?.description}</p>
                    </div>
                    
                    {fixResult && (
                      <div className={`rounded-md p-4 mb-6 ${
                        fixResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex gap-3">
                          {fixResult.success ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div>
                            <h4 className={`text-sm font-medium ${
                              fixResult.success ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {fixResult.success ? 'Action Completed Successfully' : 'Action Failed'}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              fixResult.success ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {fixResult.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3 mt-auto pt-4">
                      <Button
                        onClick={handleRunAction}
                        disabled={executingFix}
                        className="gap-2"
                      >
                        {executingFix ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          currentSolution?.action === "Run Test" || 
                          currentSolution?.action === "Check Status" || 
                          currentSolution?.action === "Run Diagnostic" ? (
                            <RefreshCcw className="h-4 w-4" />
                          ) : currentSolution?.action === "Verify Info" || 
                              currentSolution?.action === "Check KYC" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : currentSolution?.action === "Reset Session" || 
                              currentSolution?.action === "Reset Preferences" ? (
                            <DatabaseBackup className="h-4 w-4" />
                          ) : currentSolution?.action === "Synchronize" ? (
                            <Webhook className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )
                        )}
                        {currentSolution?.action}
                      </Button>
                      
                      {solutionIndex < (currentProblem?.solutions.length ?? 0) - 1 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSolutionIndex(solutionIndex + 1);
                            setFixResult(null);
                          }}
                        >
                          Skip to Next Step
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-gray-500">
          If you can't resolve your issue with this wizard, please contact support.
        </div>
      </CardFooter>
      
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              Submit details about the issue you're experiencing for further investigation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <h4 className="text-sm font-medium mb-1">Issue Type</h4>
              <div className="rounded-md border p-3 bg-gray-50">
                {currentProblem?.title}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <Textarea 
                placeholder="Please describe the issue in detail..." 
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReportOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReport}
              disabled={isSubmittingReport || !reportDescription.trim()}
            >
              {isSubmittingReport ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}