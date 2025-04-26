import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ChevronRight, Database, RotateCcw, Server, ShieldAlert, Wallet, Zap } from 'lucide-react';
import PhantomPayDiagnostics from './PhantomPayDiagnostics';

const issues = [
  {
    id: 'authentication',
    title: 'Authentication Issues',
    description: 'Troubleshoot login, registration, or authentication problems',
    icon: <ShieldAlert className="h-5 w-5 text-red-500" />,
    solutions: [
      { text: 'Check if the username and password are correct', action: 'Check credentials and try again' },
      { text: 'Reset your password', action: 'Use the "Forgot Password" link on the login page' },
      { text: 'User account might be locked', action: 'Contact the administrator to unlock your account' },
      { text: 'Session may have expired', action: 'Try logging out and logging back in' }
    ]
  },
  {
    id: 'wallet',
    title: 'Wallet & Balance Issues',
    description: 'Troubleshoot wallet creation, balance display, or currency issues',
    icon: <Wallet className="h-5 w-5 text-blue-500" />,
    solutions: [
      { text: 'Wallet not created properly', action: 'Contact administrator to review wallet creation' },
      { text: 'Balance not updated after transaction', action: 'Refresh the page or wait a few minutes' },
      { text: 'Currency not available', action: 'Check if the selected currency is supported' },
      { text: 'Wrong balance shown', action: 'Review recent transactions for any discrepancies' }
    ]
  },
  {
    id: 'transaction',
    title: 'Transaction Problems',
    description: 'Troubleshoot deposit, withdrawal, or transfer issues',
    icon: <RotateCcw className="h-5 w-5 text-green-500" />,
    solutions: [
      { text: 'Transaction failed', action: 'Check for sufficient funds and try again' },
      { text: 'Transaction pending for too long', action: 'Wait up to 30 minutes, then contact support' },
      { text: 'Recipient not found', action: 'Verify recipient username or wallet ID' },
      { text: 'Currency conversion issue', action: 'Ensure currencies are compatible for the transaction' }
    ]
  },
  {
    id: 'connection',
    title: 'Connection Issues',
    description: 'Troubleshoot API connection or server communication problems',
    icon: <Server className="h-5 w-5 text-purple-500" />,
    solutions: [
      { text: 'Server communication error', action: 'Check your internet connection and try again' },
      { text: 'API timeout', action: 'The server might be experiencing high load, try again later' },
      { text: 'Unexpected disconnect', action: 'Refresh the page to establish a new connection' },
      { text: 'CORS or security issue', action: 'Ensure you\'re using the correct URL and protocol' }
    ]
  },
  {
    id: 'phantom',
    title: 'PhantomPay Diagnostics',
    description: 'Run diagnostics on the PhantomPay mock system',
    icon: <Zap className="h-5 w-5 text-amber-500" />,
    component: <PhantomPayDiagnostics />
  }
];

export default function TroubleshootingWizard() {
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [_, setLocation] = useLocation();
  
  const selectedIssueDef = issues.find(issue => issue.id === selectedIssue);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Troubleshooting Wizard</CardTitle>
          <CardDescription>
            Select the type of issue you're experiencing to see potential solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedIssue ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issues.map(issue => (
                <Card 
                  key={issue.id} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedIssue(issue.id)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {issue.icon}
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                    <CardDescription className="pt-1">
                      {issue.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : selectedIssueDef?.component ? (
            <div>
              <Button 
                variant="outline" 
                className="mb-4"
                onClick={() => setSelectedIssue(null)}
              >
                Back to Issues
              </Button>
              {selectedIssueDef.component}
            </div>
          ) : (
            <div>
              <Button 
                variant="outline" 
                className="mb-4"
                onClick={() => setSelectedIssue(null)}
              >
                Back to Issues
              </Button>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Troubleshooting: {selectedIssueDef?.title}</AlertTitle>
                <AlertDescription>
                  Here are some common solutions for this issue type.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 space-y-4">
                {selectedIssueDef?.solutions?.map((solution, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Issue: {solution.text}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Recommended Action:
                    </p>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {solution.action}
                    </div>
                  </div>
                ))}
                
                <div className="border rounded-lg p-4 bg-amber-50">
                  <h3 className="font-medium mb-2">Still having issues?</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    If none of these solutions resolved your problem, you may need administrator assistance.
                  </p>
                  <Button
                    variant="default"
                    onClick={() => {
                      if (window.confirm('Navigate to contact admin page?')) {
                        setLocation('/admin/contact');
                      }
                    }}
                  >
                    Contact Administrator
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 px-6 py-3 text-sm text-gray-600">
          For system-wide diagnostics, select the PhantomPay Diagnostics option
        </CardFooter>
      </Card>
    </div>
  );
}