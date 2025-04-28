import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Camera, 
  Shield, 
  AlertCircle, 
  Info,
  UserCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ActivateWalletFlowProps {
  onSuccess: () => void;
}

type VerificationStep = 
  | "welcome" 
  | "identity" 
  | "document" 
  | "selfie" 
  | "processing" 
  | "complete";

export default function ActivateWalletFlow({ onSuccess }: ActivateWalletFlowProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<VerificationStep>("welcome");
  const [selectedDocType, setSelectedDocType] = useState<string>("passport");
  const [progress, setProgress] = useState(0);
  
  const steps = [
    { id: "welcome", label: "Welcome" },
    { id: "identity", label: "Identity" },
    { id: "document", label: "Document" },
    { id: "selfie", label: "Selfie" },
    { id: "processing", label: "Processing" },
    { id: "complete", label: "Complete" }
  ];
  
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progressPercentage = (currentStepIndex / (steps.length - 1)) * 100;
  
  const goToNextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as VerificationStep);
    }
  };
  
  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as VerificationStep);
    }
  };
  
  const simulateDocumentScan = () => {
    setIsLoading(true);
    // Simulate upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsLoading(false);
        goToNextStep();
      }
    }, 500);
  };
  
  const simulateSelfieScan = () => {
    setIsLoading(true);
    // Simulate upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsLoading(false);
        goToNextStep();
        
        // When selfie is complete, start "processing" simulation
        simulateProcessing();
      }
    }, 300);
  };
  
  const simulateProcessing = () => {
    setIsLoading(true);
    // Simulate processing time
    setTimeout(() => {
      setIsLoading(false);
      goToNextStep();
    }, 3000);
  };
  
  const handleActivateWallet = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/wallet/initialize");
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Wallet Activated",
          description: "Your wallet has been verified and activated successfully.",
        });
        onSuccess();
      } else {
        throw new Error(data.error || "Failed to activate wallet");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to activate wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl">Activate Your Wallet</CardTitle>
            <CardDescription>
              Complete the verification process to get full access to your PaySage digital wallet.
            </CardDescription>
          </div>
          {currentStep !== "welcome" && currentStep !== "complete" && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Shield className="w-4 h-4 mr-1" />
              <span>Secure verification by Jumio</span>
            </div>
          )}
        </div>
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Step {currentStepIndex} of {steps.length - 1}</span>
              <span>{steps[currentStepIndex].label}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-6 space-y-4">
        {currentStep === "welcome" && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Verification Required</AlertTitle>
              <AlertDescription>
                To comply with financial regulations, we need to verify your identity before activating your wallet.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <UserCheck className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-center">Identity Verification</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Verify your identity with official documents
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Camera className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-center">Quick Selfie</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Take a selfie to confirm your identity
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-medium text-center">Secure Process</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Your data is encrypted and securely processed
                </p>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button onClick={() => goToNextStep()} className="w-full md:w-auto">
                Start Verification <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === "identity" && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Select Identification Document</AlertTitle>
              <AlertDescription>
                Choose a government-issued photo ID to verify your identity.
              </AlertDescription>
            </Alert>
            
            <Tabs
              defaultValue="passport"
              className="w-full"
              value={selectedDocType}
              onValueChange={setSelectedDocType}
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="passport">Passport</TabsTrigger>
                <TabsTrigger value="driver">Driver's License</TabsTrigger>
                <TabsTrigger value="national">National ID</TabsTrigger>
              </TabsList>
              
              <TabsContent value="passport" className="mt-4">
                <div className="border p-4 rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Passport Requirements:</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Must be valid and not expired</li>
                    <li>All corners visible in the photo</li>
                    <li>All text must be clearly readable</li>
                    <li>No glare or shadows on the document</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="driver" className="mt-4">
                <div className="border p-4 rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Driver's License Requirements:</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Both front and back of license required</li>
                    <li>Must be valid and not expired</li>
                    <li>Photo must be clearly visible</li>
                    <li>All details must be readable</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="national" className="mt-4">
                <div className="border p-4 rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">National ID Requirements:</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Both sides of the ID card required</li>
                    <li>Must be government issued</li>
                    <li>Must include your photo</li>
                    <li>All security features must be visible</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => goToPreviousStep()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => goToNextStep()}>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === "document" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">
                {selectedDocType === "passport" ? "Scan Your Passport" :
                 selectedDocType === "driver" ? "Scan Your Driver's License" :
                 "Scan Your National ID"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Position your document within the frame and ensure all details are clearly visible
              </p>
              
              {isLoading ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-6 w-6 mr-2" />
                    <span>Scanning document...</span>
                  </div>
                  <Progress value={progress} className="h-2 max-w-xs mx-auto" />
                </div>
              ) : (
                <Button onClick={simulateDocumentScan} className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="mr-2 h-4 w-4" /> 
                  {selectedDocType === "driver" || selectedDocType === "national" 
                    ? "Scan Front Side" 
                    : "Scan Document"}
                </Button>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => goToPreviousStep()} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === "selfie" && (
          <div className="space-y-4">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Take a Selfie</AlertTitle>
              <AlertDescription className="text-blue-700">
                We'll compare this with your document photo to verify your identity.
              </AlertDescription>
            </Alert>
            
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30">
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              
              <h3 className="font-medium mb-2">Selfie Guidelines:</h3>
              <ul className="text-sm text-muted-foreground mb-4 inline-block text-left">
                <li>• Ensure your face is well-lit</li>
                <li>• Look directly at the camera</li>
                <li>• Remove glasses and face coverings</li>
                <li>• Neutral expression recommended</li>
              </ul>
              
              {isLoading ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-6 w-6 mr-2" />
                    <span>Processing image...</span>
                  </div>
                  <Progress value={progress} className="h-2 max-w-xs mx-auto" />
                </div>
              ) : (
                <Button onClick={simulateSelfieScan} className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="mr-2 h-4 w-4" /> Take Selfie
                </Button>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => goToPreviousStep()} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === "processing" && (
          <div className="space-y-6 p-4 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <h3 className="text-lg font-medium">Verifying Your Identity</h3>
            <div className="max-w-md mx-auto">
              <ul className="text-sm space-y-2 text-left">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <span>Document authenticity check</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <span>Biometric verification</span>
                </li>
                <li className="flex items-center">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin mr-2" />
                  <span>Identity validation</span>
                </li>
                <li className="flex items-center text-muted-foreground">
                  <div className="h-4 w-4 mr-2"></div>
                  <span>Fraud detection analysis</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              This process usually takes less than a minute. Please don't close this window.
            </p>
          </div>
        )}
        
        {currentStep === "complete" && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-medium">Verification Successful!</h3>
              <p className="text-muted-foreground mt-1">
                Your identity has been verified. You can now activate your wallet.
              </p>
            </div>
            
            <Button 
              onClick={handleActivateWallet} 
              disabled={isLoading} 
              className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                "Activate My Wallet"
              )}
            </Button>
          </div>
        )}
      </CardContent>
      
      {currentStep === "welcome" && (
        <CardFooter className="text-center text-sm text-muted-foreground">
          Your data is securely processed and protected according to our privacy policy.
        </CardFooter>
      )}
    </Card>
  );
}