import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCcw,
  WalletCards,
  DatabaseZap,
  ShieldAlert,
  Users,
  Wallet
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
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

const problems: Record<Problem, ProblemDetails> = {
  authentication: {
    title: 'Authentication Issues',
    description: 'Problems with user login, access rights, or permissions',
    icon: <Users className="h-8 w-8 text-orange-500" />,
    solutions: [
      {
        title: 'Reset User Password',
        description: 'Force a password reset for users having login issues',
        action: 'Reset Password',
        successMessage: 'Password has been reset successfully',
        errorMessage: 'Failed to reset password'
      },
      {
        title: 'Check Administrator Rights',
        description: 'Verify if the user has proper admin permissions',
        action: 'Verify Permissions',
        successMessage: 'User permissions have been verified',
        errorMessage: 'Failed to verify user permissions'
      }
    ]
  },
  transactions: {
    title: 'Transaction Problems',
    description: 'Issues with deposits, withdrawals, or transfers',
    icon: <Wallet className="h-8 w-8 text-blue-500" />,
    solutions: [
      {
        title: 'Verify Transaction Status',
        description: 'Check status of pending or failed transactions',
        action: 'Check Status',
        successMessage: 'Transaction status verified',
        errorMessage: 'Failed to verify transaction status'
      },
      {
        title: 'Fix Balance Discrepancies',
        description: 'Reconcile customer account balances',
        action: 'Reconcile Balance',
        successMessage: 'Account balances have been reconciled',
        errorMessage: 'Failed to reconcile account balances'
      }
    ]
  },
  wallet: {
    title: 'Wallet Configuration',
    description: 'Problems with wallet setup or configuration',
    icon: <WalletCards className="h-8 w-8 text-purple-500" />,
    solutions: [
      {
        title: 'Reinitialize Wallet',
        description: 'Recreate wallet configuration for a user',
        action: 'Reinitialize',
        successMessage: 'Wallet has been reinitialized successfully',
        errorMessage: 'Failed to reinitialize wallet'
      },
      {
        title: 'Verify External Wallet ID',
        description: 'Check if external wallet ID exists and is valid',
        action: 'Verify ID',
        successMessage: 'Wallet ID has been verified',
        errorMessage: 'Failed to verify wallet ID'
      }
    ]
  },
  accounts: {
    title: 'Account Problems',
    description: 'Issues with sub-accounts, currencies, or balance visibility',
    icon: <DatabaseZap className="h-8 w-8 text-green-500" />,
    solutions: [
      {
        title: 'Reset Account Cache',
        description: 'Clear cached account data to refresh view',
        action: 'Clear Cache',
        successMessage: 'Account cache has been cleared',
        errorMessage: 'Failed to clear account cache'
      },
      {
        title: 'Fix Missing Accounts',
        description: 'Restore accounts that are not visible to users',
        action: 'Restore Accounts',
        successMessage: 'Missing accounts have been restored',
        errorMessage: 'Failed to restore accounts'
      }
    ]
  },
  connectivity: {
    title: 'API Connectivity',
    description: 'Problems connecting to external payment APIs',
    icon: <ShieldAlert className="h-8 w-8 text-red-500" />,
    solutions: [
      {
        title: 'Check API Credentials',
        description: 'Verify API keys and permissions',
        action: 'Check Credentials',
        successMessage: 'API credentials have been verified',
        errorMessage: 'Failed to verify API credentials'
      },
      {
        title: 'Test Connection',
        description: 'Run a diagnostic test on API connections',
        action: 'Test Connection',
        successMessage: 'Connection test completed successfully',
        errorMessage: 'Connection test failed'
      }
    ]
  }
};

export default function TroubleshootingWizard() {
  const { toast } = useToast();
  const [step, setStep] = useState<'problem' | 'solution' | 'complete'>('problem');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<number | null>(null);
  const [actionResult, setActionResult] = useState<{success: boolean; message: string} | null>(null);
  
  const { mutate: runAction, isPending } = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would make a server request
      // For now we'll simulate a success or failure
      if (!selectedProblem || selectedSolution === null) return null;
      
      // Simulate API call with mock success/failure (80% success rate)
      await new Promise(resolve => setTimeout(resolve, 1500));
      const success = Math.random() > 0.2;
      
      return {
        success,
        message: success 
          ? problems[selectedProblem].solutions[selectedSolution].successMessage
          : problems[selectedProblem].solutions[selectedSolution].errorMessage
      };
    },
    onSuccess: (data) => {
      if (data) {
        setActionResult(data);
        toast({
          title: data.success ? 'Success' : 'Error',
          description: data.message,
          variant: data.success ? 'default' : 'destructive',
        });
        
        if (data.success) {
          setStep('complete');
        }
      }
    },
    onError: (error) => {
      setActionResult({
        success: false,
        message: 'An unexpected error occurred'
      });
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });
  
  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setStep('solution');
  };
  
  const handleSelectSolution = (index: number) => {
    setSelectedSolution(index);
  };
  
  const handleRunAction = () => {
    setActionResult(null);
    runAction();
  };
  
  const handleReset = () => {
    setStep('problem');
    setSelectedProblem(null);
    setSelectedSolution(null);
    setActionResult(null);
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      {step === 'problem' && (
        <div className="space-y-4">
          <div className="mb-6">
            <h3 className="text-lg font-medium">Step 1: Select the problem you're experiencing</h3>
            <p className="text-sm text-gray-500">
              Choose the category that best describes the issue you're facing
            </p>
          </div>
          
          <RadioGroup value={selectedProblem || ''} onValueChange={(value) => setSelectedProblem(value as Problem)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(problems).map(([key, problem]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedProblem === key ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedProblem(key as Problem)}
                >
                  <CardContent className="p-4 flex items-start space-x-4">
                    <RadioGroupItem
                      value={key}
                      id={`problem-${key}`}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={`problem-${key}`}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        {problem.icon}
                        <span className="font-medium">{problem.title}</span>
                      </div>
                      <p className="text-sm text-gray-500">{problem.description}</p>
                    </Label>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>
          
          <div className="pt-4 flex justify-end">
            <Button
              onClick={() => handleSelectProblem(selectedProblem as Problem)}
              disabled={!selectedProblem}
              className="flex items-center gap-2"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {step === 'solution' && selectedProblem && (
        <div className="space-y-4">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('problem')}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <h3 className="text-lg font-medium">
                Step 2: Choose a solution for {problems[selectedProblem].title}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-16">
              Select one of the recommended solutions below
            </p>
          </div>
          
          <RadioGroup
            value={selectedSolution?.toString() || ''}
            onValueChange={(value) => handleSelectSolution(parseInt(value))}
          >
            <div className="space-y-3">
              {problems[selectedProblem].solutions.map((solution, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedSolution === index ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleSelectSolution(index)}
                >
                  <CardContent className="p-4 flex items-start space-x-4">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`solution-${index}`}
                      className="mt-1"
                    />
                    <Label
                      htmlFor={`solution-${index}`}
                      className="flex-1 cursor-pointer space-y-1"
                    >
                      <span className="font-medium">{solution.title}</span>
                      <p className="text-sm text-gray-500">{solution.description}</p>
                    </Label>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>
          
          {selectedSolution !== null && (
            <div className="pt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep('problem')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              
              <Button
                onClick={handleRunAction}
                disabled={isPending}
                className="flex items-center gap-2"
              >
                {isPending ? (
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{problems[selectedProblem].solutions[selectedSolution].action}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
          
          {actionResult && !actionResult.success && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-sm mt-1 text-red-700">{actionResult.message}</p>
                  <p className="text-xs mt-1 text-red-600">
                    Please try a different solution or contact support for assistance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {step === 'complete' && selectedProblem && selectedSolution !== null && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-medium">Solution Applied Successfully</h3>
            <p className="mt-1 text-sm text-gray-500">
              The {problems[selectedProblem].solutions[selectedSolution].title.toLowerCase()} operation has been completed.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">Success</h4>
                <p className="text-sm mt-1 text-green-700">
                  {problems[selectedProblem].solutions[selectedSolution].successMessage}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Start New Troubleshooting</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}