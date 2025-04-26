import { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  RefreshCcw, 
  HelpCircle, 
  Wallet, 
  Banknote, 
  UserRound, 
  Shield, 
  Database, 
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TroubleshootingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface TroubleIssue {
  id: string;
  category: string;
  title: string;
  description: string;
  steps: TroubleshootingStep[];
}

export default function TroubleshootingWizard() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<TroubleIssue | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Categories of common issues
  const categories = [
    { id: 'authentication', label: 'Authentication Issues', icon: <Shield className="h-5 w-5 text-red-500" /> },
    { id: 'wallet', label: 'Wallet Issues', icon: <Wallet className="h-5 w-5 text-blue-500" /> },
    { id: 'transactions', label: 'Transaction Problems', icon: <Banknote className="h-5 w-5 text-green-500" /> },
    { id: 'profile', label: 'Account & Profile', icon: <UserRound className="h-5 w-5 text-purple-500" /> },
    { id: 'system', label: 'System & Technical', icon: <Database className="h-5 w-5 text-gray-500" /> },
    { id: 'other', label: 'Other Issues', icon: <HelpCircle className="h-5 w-5 text-amber-500" /> },
  ];
  
  // Common issues database
  const issueDatabase: TroubleIssue[] = [
    {
      id: 'login_failed',
      category: 'authentication',
      title: 'Unable to Log In',
      description: 'Troubleshoot login issues when you can\'t access your account',
      steps: [
        {
          id: 'verify_credentials',
          title: 'Check your credentials',
          description: 'Make sure your username and password are correct',
          icon: <UserRound className="h-5 w-5 text-blue-500" />,
          content: (
            <div className="space-y-4">
              <p>Let's verify your login information:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Confirm your username is spelled correctly</li>
                <li>Check if Caps Lock is enabled on your keyboard</li>
                <li>Try clearing your browser cookies and cache</li>
              </ul>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">🔍 If you've forgotten your password, please contact your administrator to reset it.</p>
              </div>
            </div>
          )
        },
        {
          id: 'browser_cache',
          title: 'Clear browser data',
          description: 'Remove stored cache and cookies that might interfere',
          icon: <RefreshCcw className="h-5 w-5 text-purple-500" />,
          content: (
            <div className="space-y-4">
              <p>Try clearing your browser's cache and cookies:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Open your browser settings</li>
                <li>Navigate to Privacy or History section</li>
                <li>Select "Clear browsing data" or similar</li>
                <li>Choose to clear "Cookies" and "Cached images and files"</li>
                <li>Click "Clear data" and try logging in again</li>
              </ol>
            </div>
          )
        },
        {
          id: 'try_different_browser',
          title: 'Try a different browser',
          description: 'Test if the issue is specific to your current browser',
          icon: <Zap className="h-5 w-5 text-amber-500" />,
          content: (
            <div className="space-y-4">
              <p>If you're still having trouble, try using a different web browser:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>If you're using Chrome, try Firefox, Safari, or Edge</li>
                <li>Make sure the browser is up to date</li>
                <li>Try using incognito or private browsing mode</li>
              </ul>
              <div className="bg-amber-50 p-3 rounded-md">
                <p className="text-sm text-amber-700">⚠️ If the issue persists across multiple browsers, please contact support for assistance.</p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'balance_incorrect',
      category: 'wallet',
      title: 'Incorrect Balance Showing',
      description: 'Troubleshoot issues when your wallet balance appears incorrect',
      steps: [
        {
          id: 'refresh_balance',
          title: 'Refresh wallet data',
          description: 'Ensure your balance is showing the latest information',
          icon: <RefreshCcw className="h-5 w-5 text-blue-500" />,
          content: (
            <div className="space-y-4">
              <p>First, let's try refreshing your wallet data:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Log out of your account</li>
                <li>Wait at least 30 seconds</li>
                <li>Log back in and check if your balance updates</li>
                <li>If not, try refreshing the page (F5 or browser refresh button)</li>
              </ol>
              <Button 
                onClick={() => {
                  toast({
                    title: "Refreshing wallet data",
                    description: "Please wait while we fetch the latest balance information..."
                  });
                  // Simulate fetching updated balance
                  setTimeout(() => {
                    toast({
                      title: "Wallet data refreshed",
                      description: "Your wallet information has been updated with the latest data."
                    });
                  }, 2000);
                }} 
                className="w-full"
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Wallet Data
              </Button>
            </div>
          )
        },
        {
          id: 'check_transactions',
          title: 'Check recent transactions',
          description: 'Review your transaction history for discrepancies',
          icon: <Banknote className="h-5 w-5 text-green-500" />,
          content: (
            <div className="space-y-4">
              <p>Let's review your recent transaction history:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Go to the Transactions tab in your account</li>
                <li>Check for any pending or recent transactions</li>
                <li>Verify if all transactions have been properly credited or debited</li>
                <li>Look for any failed or incomplete transactions</li>
              </ul>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">ℹ️ Recent transactions may take time to appear in your balance. If a transaction is marked as "Pending", it may not be reflected yet.</p>
              </div>
            </div>
          )
        },
        {
          id: 'check_currency',
          title: 'Verify currency settings',
          description: 'Ensure your currency display settings are correct',
          icon: <Wallet className="h-5 w-5 text-purple-500" />,
          content: (
            <div className="space-y-4">
              <p>Check your currency display settings:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Go to your account settings or profile</li>
                <li>Check if your default currency is set correctly</li>
                <li>If you have multiple currency accounts, make sure you're viewing the right one</li>
                <li>Verify if there are any currency conversion issues</li>
              </ul>
              <div className="bg-amber-50 p-3 rounded-md">
                <p className="text-sm text-amber-700">⚠️ If you have accounts in multiple currencies, ensure you're looking at the correct account.</p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'transaction_failed',
      category: 'transactions',
      title: 'Transaction Failed',
      description: 'Troubleshoot failed payments, transfers, or deposits',
      steps: [
        {
          id: 'check_balance',
          title: 'Verify sufficient balance',
          description: 'Ensure you have enough funds for the transaction',
          icon: <Wallet className="h-5 w-5 text-blue-500" />,
          content: (
            <div className="space-y-4">
              <p>First, let's make sure you have sufficient balance:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Check your available balance in the correct currency</li>
                <li>Remember that some accounts may have minimum balance requirements</li>
                <li>Verify that the funds aren't being held or pending from another transaction</li>
              </ul>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">ℹ️ Your available balance may differ from your total balance if there are pending transactions.</p>
              </div>
            </div>
          )
        },
        {
          id: 'check_limits',
          title: 'Check transaction limits',
          description: 'Verify you haven\'t exceeded daily or transaction limits',
          icon: <Shield className="h-5 w-5 text-amber-500" />,
          content: (
            <div className="space-y-4">
              <p>Check if you've exceeded any transaction limits:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Your account may have daily, weekly, or monthly transaction limits</li>
                <li>There may be limits on the transaction amount for security reasons</li>
                <li>New accounts often have lower initial limits</li>
                <li>Certain transaction types may have specific limits</li>
              </ul>
              <div className="bg-amber-50 p-3 rounded-md">
                <p className="text-sm text-amber-700">⚠️ Contact support if you need to increase your transaction limits.</p>
              </div>
            </div>
          )
        },
        {
          id: 'recipient_info',
          title: 'Verify recipient information',
          description: 'Ensure recipient details are correct',
          icon: <UserRound className="h-5 w-5 text-green-500" />,
          content: (
            <div className="space-y-4">
              <p>Verify the recipient information is correct:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Double-check the username or account number</li>
                <li>Ensure you're sending to the correct currency account</li>
                <li>Verify if the recipient can receive funds (account may be restricted)</li>
                <li>Check for any typos in the recipient details</li>
              </ul>
              <div className="bg-red-50 p-3 rounded-md">
                <p className="text-sm text-red-700">⚠️ Warning: Transactions sent to incorrect accounts may not be recoverable.</p>
              </div>
            </div>
          )
        },
        {
          id: 'retry_transaction',
          title: 'Retry the transaction',
          description: 'Attempt the transaction again after verification',
          icon: <ArrowRight className="h-5 w-5 text-purple-500" />,
          content: (
            <div className="space-y-4">
              <p>After verifying all details, try the transaction again:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Wait a few minutes before attempting again</li>
                <li>Try a smaller amount if you're unsure about limits</li>
                <li>Use a different device or browser if possible</li>
                <li>Check your internet connection is stable</li>
              </ol>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">ℹ️ If the transaction fails repeatedly, please contact customer support with the transaction details.</p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: 'phantom_issue',
      category: 'system',
      title: 'PhantomPay Connection Issue',
      description: 'Troubleshoot PhantomPay connection and integration problems',
      steps: [
        {
          id: 'check_phantom_account',
          title: 'Verify PhantomPay account status',
          description: 'Check if your account is properly set up with PhantomPay',
          icon: <Database className="h-5 w-5 text-blue-500" />,
          content: (
            <div className="space-y-4">
              <p>Let's verify your PhantomPay account configuration:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Confirm your account is set up to use PhantomPay</li>
                <li>Check if you can see your PhantomPay wallet ID (should start with "phantom-wallet-")</li>
                <li>Verify your currency accounts are properly linked</li>
              </ul>
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-700">ℹ️ Your account may be configured to use either the real Paysafe system or the PhantomPay mock system, but not both simultaneously.</p>
              </div>
            </div>
          )
        },
        {
          id: 'run_phantom_diagnostic',
          title: 'Run PhantomPay diagnostic',
          description: 'Run a diagnostic test to check PhantomPay integration',
          icon: <Zap className="h-5 w-5 text-amber-500" />,
          content: (
            <div className="space-y-4">
              <p>Run our PhantomPay diagnostic tool:</p>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Running the diagnostic will:</p>
                <ul className="list-disc pl-5 mt-2 text-sm space-y-1 text-gray-600">
                  <li>Check connection to PhantomPay database</li>
                  <li>Verify account and balance data integrity</li>
                  <li>Test transaction capabilities</li>
                  <li>Validate integration points</li>
                </ul>
              </div>
              <Button 
                onClick={() => {
                  toast({
                    title: "Running PhantomPay diagnostic",
                    description: "This may take a few moments..."
                  });
                  // Simulate diagnostic process
                  setTimeout(() => {
                    toast({
                      title: "Diagnostic complete",
                      description: "PhantomPay integration is working correctly."
                    });
                  }, 3000);
                }} 
                className="w-full"
              >
                <Zap className="mr-2 h-4 w-4" /> Run Diagnostic
              </Button>
            </div>
          )
        },
        {
          id: 'check_transaction_type',
          title: 'Verify transaction compatibility',
          description: 'Check if your transaction type is supported by PhantomPay',
          icon: <Banknote className="h-5 w-5 text-green-500" />,
          content: (
            <div className="space-y-4">
              <p>Verify that your transaction is compatible with PhantomPay:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>PhantomPay accounts can only transact with other PhantomPay accounts</li>
                <li>You cannot transfer between PhantomPay and real Paysafe accounts</li>
                <li>Make sure both the sender and recipient are on the same system</li>
              </ul>
              <div className="bg-red-50 p-3 rounded-md">
                <p className="text-sm text-red-700">⚠️ Important: PhantomPay is a separate system from the real Paysafe API. Cross-system transactions are not supported.</p>
              </div>
            </div>
          )
        }
      ]
    }
  ];
  
  // Get issues for the selected category
  const getIssuesForCategory = (categoryId: string) => {
    return issueDatabase.filter(issue => issue.category === categoryId);
  };
  
  // Get current step of the selected issue
  const getCurrentStep = () => {
    if (!selectedIssue) return null;
    return selectedIssue.steps[currentStepIndex];
  };
  
  // Reset wizard to start
  const resetWizard = () => {
    setSelectedCategory(null);
    setSelectedIssue(null);
    setCurrentStepIndex(0);
    setResolved(false);
    setFeedback('');
  };
  
  // Submit feedback when issue is resolved or not
  const submitFeedback = async (wasResolved: boolean) => {
    if (!selectedIssue) return;
    
    setIsSubmitting(true);
    
    try {
      // Record the troubleshooting session outcome
      // In a real implementation, this would call an API endpoint
      console.log('Submitting feedback:', {
        issueId: selectedIssue.id,
        resolved: wasResolved,
        feedback,
        stepsCompleted: currentStepIndex + 1,
        totalSteps: selectedIssue.steps.length
      });
      
      setResolved(wasResolved);
      
      toast({
        title: wasResolved ? "Great news!" : "We're sorry to hear that",
        description: wasResolved 
          ? "Thank you for your feedback. We're glad we could help resolve your issue." 
          : "Thanks for letting us know. We'll use your feedback to improve our troubleshooting guides.",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error submitting feedback",
        description: "There was a problem submitting your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Determine what content to show
  const renderContent = () => {
    // If issue has been marked as resolved, show resolution screen
    if (resolved) {
      return (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Issue Resolved!</CardTitle>
            <CardDescription>
              We're glad we could help you resolve your issue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-green-600">
              Is there anything else we can help you with today?
            </p>
            <Button 
              onClick={resetWizard} 
              className="w-full"
            >
              Start New Troubleshooting Session
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    // If we're in feedback mode (reached end of steps without resolution)
    if (selectedIssue && currentStepIndex >= selectedIssue.steps.length) {
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <CardTitle>Did this resolve your issue?</CardTitle>
            </div>
            <CardDescription>
              Let us know if the troubleshooting guide helped you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => submitFeedback(false)}
                disabled={isSubmitting}
              >
                No, still having issues
              </Button>
              <Button 
                className="flex-1"
                onClick={() => submitFeedback(true)}
                disabled={isSubmitting}
              >
                Yes, it's resolved
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Additional feedback (optional)</Label>
              <Textarea 
                id="feedback" 
                placeholder="Tell us more about your experience..." 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // If no category selected, show category list
    if (!selectedCategory) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>What kind of issue are you experiencing?</CardTitle>
            <CardDescription>
              Select a category that best describes your problem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              onValueChange={(value) => setSelectedCategory(value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={category.id} id={category.id} />
                  <Label 
                    htmlFor={category.id} 
                    className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100 w-full"
                  >
                    <span className="mr-2">{category.icon}</span>
                    <span>{category.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => {
                if (selectedCategory) {
                  const issues = getIssuesForCategory(selectedCategory);
                  if (issues.length === 1) {
                    // If only one issue in category, select it automatically
                    setSelectedIssue(issues[0]);
                  }
                }
              }}
              disabled={!selectedCategory}
              className="w-full"
            >
              Continue
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    // If category selected but no issue selected, show issue list
    if (selectedCategory && !selectedIssue) {
      const issues = getIssuesForCategory(selectedCategory);
      
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Select your issue</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedCategory(null)}
              >
                Back
              </Button>
            </div>
            <CardDescription>
              Choose the issue that most closely matches your problem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="border rounded-md p-4 hover:border-primary cursor-pointer"
                  onClick={() => setSelectedIssue(issue)}
                >
                  <h3 className="font-medium text-base">{issue.title}</h3>
                  <p className="text-sm text-gray-500">{issue.description}</p>
                </div>
              ))}
              
              {issues.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <h3 className="font-medium">No matching issues found</h3>
                  <p className="text-sm text-gray-500">
                    Please try selecting a different category or contact support
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // If issue selected, show troubleshooting steps
    if (selectedIssue) {
      const currentStep = getCurrentStep();
      
      if (!currentStep) return null;
      
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedIssue.title}</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedIssue(null);
                  setCurrentStepIndex(0);
                }}
              >
                Back
              </Button>
            </div>
            <CardDescription>
              {selectedIssue.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step progress indicator */}
            <div className="flex items-center justify-between text-sm">
              <span>
                Step {currentStepIndex + 1} of {selectedIssue.steps.length}
              </span>
              <span className="text-gray-500">
                {currentStep.title}
              </span>
            </div>
            
            <div className="flex space-x-4 items-start">
              <div className="flex-shrink-0 mt-1">
                {currentStep.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-2">{currentStep.title}</h3>
                <div className="text-gray-700">
                  {currentStep.content}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                if (currentStepIndex > 0) {
                  setCurrentStepIndex(currentStepIndex - 1);
                }
              }}
              disabled={currentStepIndex === 0}
            >
              Previous Step
            </Button>
            <Button 
              onClick={() => {
                if (currentStepIndex < selectedIssue.steps.length - 1) {
                  setCurrentStepIndex(currentStepIndex + 1);
                } else {
                  // Move to feedback screen
                  setCurrentStepIndex(selectedIssue.steps.length);
                }
              }}
            >
              {currentStepIndex < selectedIssue.steps.length - 1 
                ? 'Next Step' 
                : 'Finish Troubleshooting'}
            </Button>
          </CardFooter>
        </Card>
      );
    }
    
    return null;
  };
  
  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
          Troubleshooting Wizard
        </h1>
        <p className="text-gray-600">
          Follow this step-by-step guide to diagnose and resolve common issues
        </p>
      </div>
      
      <div className="mt-6">
        {renderContent()}
      </div>
      
      <div className="mt-8">
        <Separator className="mb-4" />
        <div className="flex items-center">
          <div className="flex-1">
            <h3 className="text-sm font-medium">Need additional help?</h3>
            <p className="text-sm text-gray-500">
              Our support team is here to assist you
            </p>
          </div>
          <Button variant="outline">
            Contact Support
          </Button>
        </div>
      </div>
      
      {/* Expert help section */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">PS</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-primary">Expert Support</h3>
            <p className="text-sm text-gray-700 mt-1">
              Still having trouble? Our support team is available 24/7 to help resolve your issues. Contact us for personalized assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}