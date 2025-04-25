import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, Download } from "lucide-react";
import Papa from "papaparse";

interface BulkTransferModalProps {
  open: boolean;
  onClose: () => void;
  currencyCode: string;
}

interface TransferItem {
  recipientUsername: string;
  amount: number;
  currencyCode: string;
  note?: string;
}

export default function BulkTransferModal({
  open,
  onClose,
  currencyCode,
}: BulkTransferModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<TransferItem[]>([]);
  const [isValidData, setIsValidData] = useState(false);

  const bulkTransferMutation = useMutation({
    mutationFn: async (data: { transfers: TransferItem[] }) => {
      const res = await apiRequest("POST", "/api/transactions/bulk", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      const successCount = data.results.length;
      const errorCount = data.errors.length;
      
      if (errorCount === 0) {
        toast({
          title: "Bulk transfer successful",
          description: `All ${successCount} transfers completed successfully`,
        });
      } else {
        toast({
          title: "Bulk transfer completed with issues",
          description: `${successCount} transfers succeeded, ${errorCount} failed`,
          variant: "destructive",
        });
      }
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Bulk transfer failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedTransfers = results.data.map((row: any) => {
            if (!row.recipientUsername || !row.amount) {
              throw new Error("Missing required fields");
            }
            
            return {
              recipientUsername: row.recipientUsername,
              amount: Math.round(parseFloat(row.amount) * 100), // Convert to cents
              currencyCode: row.currencyCode || currencyCode,
              note: row.note || undefined
            };
          });
          
          setParsedData(parsedTransfers);
          setIsValidData(parsedTransfers.length > 0);
          
          toast({
            title: "CSV parsed successfully",
            description: `Found ${parsedTransfers.length} transfers to process`
          });
        } catch (error) {
          console.error("Error parsing CSV:", error);
          setParsedData([]);
          setIsValidData(false);
          
          toast({
            title: "Invalid CSV format",
            description: "Please ensure your CSV has the correct format",
            variant: "destructive"
          });
        }
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        setParsedData([]);
        setIsValidData(false);
        
        toast({
          title: "Failed to parse CSV",
          description: error.message,
          variant: "destructive"
        });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidData || parsedData.length === 0) {
      toast({
        title: "No valid transfers",
        description: "Please upload a valid CSV file with transfer data",
        variant: "destructive",
      });
      return;
    }
    
    bulkTransferMutation.mutate({
      transfers: parsedData
    });
  };

  const downloadTemplate = () => {
    const csvContent = "recipientUsername,amount,currencyCode,note\njsmith,100.00,USD,Payment for services\nmdavis,50.00,USD,Monthly subscription";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bulk_transfer_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setIsValidData(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Transfer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="mb-4">
            <p className="text-sm text-neutral-600 mb-2">
              Upload a CSV file with the following columns: recipientUsername, amount, currencyCode, note
            </p>
            <div 
              className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <CloudUpload className="mx-auto h-12 w-12 text-neutral-400 mb-2" />
              <p className="text-sm text-neutral-600 mb-2">
                {file ? file.name : "Drag and drop your CSV file here"}
              </p>
              <p className="text-xs text-neutral-500">or</p>
              <Button
                type="button"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('file-upload')?.click();
                }}
              >
                Browse Files
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <Label>Template</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center"
                onClick={downloadTemplate}
              >
                <Download className="h-4 w-4 mr-1" />
                Download template
              </Button>
            </div>
            <div className="bg-neutral-100 p-3 rounded-md mt-2">
              <p className="text-xs font-mono">recipientUsername,amount,currencyCode,note</p>
              <p className="text-xs font-mono">jsmith,100.00,USD,Payment for services</p>
              <p className="text-xs font-mono">mdavis,50.00,USD,Monthly subscription</p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={bulkTransferMutation.isPending || !isValidData}
            >
              {bulkTransferMutation.isPending ? "Processing..." : "Process Transfers"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
