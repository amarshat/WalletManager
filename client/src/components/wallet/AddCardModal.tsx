import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InsertCard } from '@shared/schema';

// Test cards imported from CSV
const testCards = {
  Visa: [
    { number: '4000000000002719', type: 'A', status: 'COMPLETED' },
    { number: '4000000000002503', type: 'C', status: 'PENDING → Y → COMPLETED' },
    { number: '4000000000002370', type: 'C', status: 'PENDING → N → COMPLETED' },
    { number: '4000000000002420', type: 'C', status: 'PENDING → U → COMPLETED' },
    { number: '4000000000002446', type: 'Error', status: 'N/A' },
    { number: '4000000000002560', type: 'N/A', status: 'FAILED' },
    { number: '4000000000002925', type: 'N', status: 'COMPLETED' },
    { number: '4000000000002537', type: 'R', status: 'COMPLETED' },
    { number: '4000000000002990', type: 'U', status: 'COMPLETED' },
    { number: '4000000000002701', type: 'Y', status: 'COMPLETED' },
  ],
  Mastercard: [
    { number: '5200000000002482', type: 'A', status: 'COMPLETED' },
    { number: '5200000000002490', type: 'C', status: 'PENDING → N → COMPLETED' },
    { number: '5200000000002151', type: 'C', status: 'PENDING → Y → COMPLETED' },
    { number: '5200000000002664', type: 'C', status: 'PENDING → U → COMPLETED' },
    { number: '5200000000002037', type: 'Error', status: 'N/A' },
    { number: '5200000000002508', type: 'N/A', status: 'FAILED' },
    { number: '5200000000002276', type: 'N', status: 'COMPLETED' },
    { number: '5200000000002185', type: 'R', status: 'COMPLETED' },
    { number: '5200000000002409', type: 'U', status: 'COMPLETED' },
    { number: '5200000000002235', type: 'Y', status: 'COMPLETED' },
  ],
  'American Express': [
    { number: '340000000002872', type: 'A', status: 'COMPLETED' },
    { number: '340000000002534', type: 'C', status: 'PENDING → Y → COMPLETED' },
    { number: '340000000002237', type: 'C', status: 'PENDING → N → COMPLETED' },
    { number: '340000000002484', type: 'C', status: 'PENDING → U → COMPLETED' },
    { number: '340000000002732', type: 'Error', status: 'N/A' },
    { number: '340000000002948', type: 'N/A', status: 'FAILED' },
    { number: '340000000002096', type: 'N', status: 'COMPLETED' },
    { number: '340000000002062', type: 'R', status: 'COMPLETED' },
    { number: '340000000002468', type: 'U', status: 'COMPLETED' },
    { number: '340000000002708', type: 'Y', status: 'COMPLETED' },
  ],
};

// Function to determine color based on 3DS result type
const getStatusColor = (type: string) => {
  switch (type) {
    case 'A':
    case 'Y':
      return 'text-green-600';
    case 'N':
    case 'R':
      return 'text-red-600';
    case 'C':
      return 'text-blue-600';
    case 'U':
      return 'text-amber-600';
    case 'Error':
    case 'N/A':
      return 'text-gray-500';
    default:
      return 'text-gray-700';
  }
};

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCardModal({ isOpen, onClose }: AddCardModalProps) {
  const { toast } = useToast();
  const [cardType, setCardType] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [useTestCard, setUseTestCard] = useState(false);
  const [selectedTestCardNetwork, setSelectedTestCardNetwork] = useState('');
  const [selectedTestCard, setSelectedTestCard] = useState('');

  // Generate future years for expiry
  const currentYear = new Date().getFullYear();
  const futureYears = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString());
  
  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCardType('');
      setCardNumber('');
      setExpiryMonth('');
      setExpiryYear('');
      setCvv('');
      setCardholderName('');
      setIsDefault(false);
      setUseTestCard(false);
      setSelectedTestCardNetwork('');
      setSelectedTestCard('');
    }
  }, [isOpen]);

  // Apply test card when selected
  useEffect(() => {
    if (useTestCard && selectedTestCardNetwork && selectedTestCard) {
      const network = selectedTestCardNetwork as keyof typeof testCards;
      const card = testCards[network].find(c => c.number === selectedTestCard);
      
      if (card) {
        setCardNumber(card.number);
        setCardType(selectedTestCardNetwork);
        // Set default expiry date to next year, current month
        const currentDate = new Date();
        setExpiryMonth((currentDate.getMonth() + 1).toString().padStart(2, '0'));
        setExpiryYear((currentDate.getFullYear() + 1).toString());
        // Set a default CVV
        setCvv(network === 'American Express' ? '1234' : '123');
        
        // For demo purposes, set cardholder name based on card type
        setCardholderName(`Test ${network} ${card.type}`);
      }
    }
  }, [useTestCard, selectedTestCardNetwork, selectedTestCard]);

  const addCardMutation = useMutation({
    mutationFn: async (cardData: Omit<InsertCard, 'userId'>) => {
      const res = await apiRequest('POST', '/api/cards', cardData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Card Added",
        description: "Your card has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cards'] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!cardType || !cardNumber || !expiryMonth || !expiryYear || !cvv || !cardholderName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    // Get card last 4 digits
    const last4 = cardNumber.slice(-4);
    
    addCardMutation.mutate({
      cardType,
      last4,
      expiryMonth,
      expiryYear,
      cardholderName,
      isDefault,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Payment Card</DialogTitle>
          <DialogDescription>
            Add a credit or debit card to your account.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="useTestCard"
              checked={useTestCard}
              onCheckedChange={(checked) => {
                setUseTestCard(checked as boolean);
                if (!checked) {
                  setSelectedTestCardNetwork('');
                  setSelectedTestCard('');
                }
              }}
            />
            <label 
              htmlFor="useTestCard" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Use Test Card
            </label>
          </div>
          
          {useTestCard && (
            <div className="space-y-4 border rounded-md p-4 bg-slate-50">
              <div className="space-y-2">
                <Label htmlFor="testCardNetwork">Card Network</Label>
                <Select 
                  value={selectedTestCardNetwork} 
                  onValueChange={setSelectedTestCardNetwork}
                >
                  <SelectTrigger id="testCardNetwork">
                    <SelectValue placeholder="Select card network" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(testCards).map((network) => (
                      <SelectItem key={network} value={network}>
                        {network}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedTestCardNetwork && (
                <div className="space-y-2">
                  <Label htmlFor="testCard">Test Card</Label>
                  <Select 
                    value={selectedTestCard} 
                    onValueChange={setSelectedTestCard}
                  >
                    <SelectTrigger id="testCard">
                      <SelectValue placeholder="Select test card" />
                    </SelectTrigger>
                    <SelectContent>
                      {testCards[selectedTestCardNetwork as keyof typeof testCards].map((card) => (
                        <SelectItem key={card.number} value={card.number}>
                          <div className="flex flex-col">
                            <span>{card.number}</span>
                            <span className={`text-xs ${getStatusColor(card.type)}`}>
                              3DS: {card.type} - {card.status}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cardType">Card Type</Label>
            <Select value={cardType} onValueChange={setCardType} disabled={useTestCard}>
              <SelectTrigger id="cardType">
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VISA">Visa</SelectItem>
                <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                <SelectItem value="AMEX">American Express</SelectItem>
                <SelectItem value="DISCOVER">Discover</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
              placeholder="1234 5678 9012 3456"
              disabled={useTestCard}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Month</Label>
              <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                <SelectTrigger id="expiryMonth">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    return (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Year</Label>
              <Select value={expiryYear} onValueChange={setExpiryYear}>
                <SelectTrigger id="expiryYear">
                  <SelectValue placeholder="YYYY" />
                </SelectTrigger>
                <SelectContent>
                  {futureYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Full name on card"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setIsDefault(checked as boolean)}
            />
            <label 
              htmlFor="isDefault" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Make this my default payment method
            </label>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addCardMutation.isPending}
              className="gap-2"
            >
              {addCardMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding Card...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Add Card
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}