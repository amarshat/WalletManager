import { useState, useEffect } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle, HelpCircle, ArrowLeftCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TroubleshootingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  errorType?: 'integration' | 'connection' | 'authentication' | 'transaction';
  errorMessage?: string;
  errorCode?: string;
}

// Define the troubleshooting steps for different error types
const TROUBLESHOOTING_STEPS = {
  integration: [
    {
      title: 'API Connection',
      description: 'Verify network connectivity to the payment API',
      action: 'check_api_connection',
      actionLabel: 'Check Connection'
    },
    {
      title: 'API Credentials',
      description: 'Validate that API keys are correct and active',
      action: 'validate_credentials',
      actionLabel: 'Validate Credentials'
    },
    {
      title: 'System Status',
      description: 'Check if there are any reported system outages',
      action: 'check_system_status',
      actionLabel: 'Check Status'
    }
  ],
  connection: [
    {
      title: 'Network Connectivity',
      description: 'Verify basic internet connectivity',
      action: 'check_network',
      actionLabel: 'Check Network'
    },
    {
      title: 'Firewall Settings',
      description: 'Check if firewall is blocking connections',
      action: 'check_firewall',
      actionLabel: 'Check Firewall'
    },
    {
      title: 'API Endpoints',
      description: 'Verify API endpoints are correct',
      action: 'check_endpoints',
      actionLabel: 'Verify Endpoints'
    }
  ],
  authentication: [
    {
      title: 'API Key Validation',
      description: 'Verify that your API key is valid and not expired',
      action: 'validate_api_key',
      actionLabel: 'Validate Key'
    },
    {
      title: 'Permissions',
      description: 'Check if your API key has the necessary permissions',
      action: 'check_permissions',
      actionLabel: 'Check Permissions'
    },
    {
      title: 'Rate Limiting',
      description: 'Check if you have hit API rate limits',
      action: 'check_rate_limits',
      actionLabel: 'Check Rate Limits'
    }
  ],
  transaction: [
    {
      title: 'Transaction Status',
      description: 'Check the current status of the transaction',
      action: 'check_transaction_status',
      actionLabel: 'Check Status'
    },
    {
      title: 'Account Balance',
      description: 'Verify sufficient funds for the transaction',
      action: 'check_balance',
      actionLabel: 'Check Balance'
    },
    {
      title: 'Transaction Limits',
      description: 'Check if transaction limits have been exceeded',
      action: 'check_limits',
      actionLabel: 'Check Limits'
    }
  ]
};

export default function TroubleshootingWizard({
  isOpen,
  onClose,
  errorType = 'integration',
  errorMessage,
  errorCode
}: TroubleshootingWizardProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);
  
  const steps = TROUBLESHOOTING_STEPS[errorType] || TROUBLESHOOTING_STEPS.integration;
  
  // Reset the wizard when the error type changes
  useEffect(() => {
    setCurrentStep(0);
    setResults({});
  }, [errorType]);
  
  if (!isOpen) return null;
  
  const handleAction = async (action: string) => {
    setIsRunning(true);
    
    try {
      // API call to run the diagnostic action
      const response = await apiRequest('POST', '/api/admin/diagnostics', {
        action,
        errorType,
        errorCode
      });
      
      const result = await response.json();
      
      // Update results with the response
      setResults(prev => ({
        ...prev,
        [action]: result
      }));
      
      // Show success toast
      toast({
        title: 'Diagnostic Complete',
        description: result.message || 'Diagnostic step completed successfully',
        variant: result.success ? 'default' : 'destructive'
      });
      
    } catch (error: any) {
      // Show error toast
      toast({
        title: 'Diagnostic Failed',
        description: error.message || 'Failed to run diagnostic step',
        variant: 'destructive'
      });
      
      // Record the error
      setResults(prev => ({
        ...prev,
        [action]: { success: false, message: error.message }
      }));
    } finally {
      setIsRunning(false);
    }
  };
  
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const getCurrentStepResult = () => {
    const step = steps[currentStep];
    return results[step.action];
  };
  
  const renderStepResult = () => {
    const result = getCurrentStepResult();
    
    if (!result) return null;
    
    return (
      <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex items-start">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          )}
          <div>
            <h4 className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.success ? 'Success' : 'Issue Detected'}
            </h4>
            <p className="text-sm text-gray-600">{result.message}</p>
            {result.details && (
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            )}
            {result.recommendation && (
              <div className="mt-2 text-sm border-t border-gray-200 pt-2">
                <strong>Recommendation:</strong> {result.recommendation}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Troubleshooting Wizard: {errorType.charAt(0).toUpperCase() + errorType.slice(1)} Issue
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              &times;
            </Button>
          </div>
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                <div>
                  <h3 className="font-medium text-amber-700">Error Details</h3>
                  <p className="text-sm text-amber-600">{errorMessage}</p>
                  {errorCode && <p className="text-xs text-amber-500 mt-1">Error Code: {errorCode}</p>}
                </div>
              </div>
            </div>
          )}
          
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < currentStep 
                        ? 'bg-primary text-white' 
                        : index === currentStep 
                          ? 'bg-primary-light border-2 border-primary text-primary' 
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className={`h-1 w-16 sm:w-32 ${
                        index < currentStep ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <div key={index} className={`text-xs ${index === currentStep ? 'text-primary font-medium' : 'text-gray-500'}`}>
                  {step.title}
                </div>
              ))}
            </div>
          </div>
          
          {/* Current step content */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600 mb-4">
              {steps[currentStep].description}
            </p>
            
            <Button
              onClick={() => handleAction(steps[currentStep].action)}
              disabled={isRunning}
              className="flex items-center"
            >
              {isRunning ? 'Running...' : steps[currentStep].actionLabel}
              {!isRunning && <HelpCircle className="ml-2 h-4 w-4" />}
            </Button>
            
            {renderStepResult()}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ArrowLeftCircle className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                Step {currentStep + 1} of {steps.length}
              </span>
              
              {currentStep < steps.length - 1 ? (
                <Button 
                  onClick={goToNextStep} 
                  className="flex items-center"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={onClose}
                  variant="default"
                >
                  Finish
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}