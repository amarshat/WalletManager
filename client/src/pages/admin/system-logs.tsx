import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { SystemLog } from "@shared/schema";
import { FileDown, Info } from "lucide-react";
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SystemLogs() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [activeTab, setActiveTab] = useState("request");
  
  // Fetch logs with pagination
  const { 
    data: logs,
    isLoading,
    error
  } = useQuery<SystemLog[]>({
    queryKey: [`/api/logs?limit=${limit}&offset=${(page - 1) * limit}`],
  });
  
  // Fetch users for log display
  const { 
    data: users,
  } = useQuery({
    queryKey: ["/api/users"],
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching logs",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  const openLogDetails = (log: SystemLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };
  
  // Format JSON for display
  const formatJSON = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };
  
  // Export logs as JSON file
  const exportLogs = () => {
    if (!logs?.length) return;
    
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `paysafe_logs_${format(new Date(), 'yyyy-MM-dd')}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: "Logs exported",
        description: "System logs have been exported as JSON",
      });
    } catch (e) {
      toast({
        title: "Export failed",
        description: "Could not export logs",
        variant: "destructive",
      });
    }
  };
  
  // Logs table columns
  const columns = [
    {
      key: "timestamp",
      header: "Timestamp",
      cell: (log: SystemLog) => (
        <span className="text-sm text-neutral-500 font-mono">
          {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
        </span>
      )
    },
    {
      key: "userId",
      header: "User",
      cell: (log: SystemLog) => {
        const user = users?.find(u => u.id === log.userId);
        return (
          <span className="text-sm text-neutral-700">
            {user ? user.username : log.userId || 'System'}
          </span>
        );
      }
    },
    {
      key: "action",
      header: "Action",
      cell: (log: SystemLog) => (
        <span className="text-sm text-neutral-700">{log.action}</span>
      )
    },
    {
      key: "statusCode",
      header: "Status",
      cell: (log: SystemLog) => {
        const isSuccess = !log.statusCode || log.statusCode < 400;
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isSuccess ? `Success (${log.statusCode || 200})` : `Error (${log.statusCode})`}
          </span>
        );
      }
    },
    {
      key: "details",
      header: "Details",
      cell: (log: SystemLog) => (
        <div className="text-right">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={() => openLogDetails(log)}
          >
            <Info className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      )
    }
  ];
  
  return (
    <AdminLayout 
      title="System Logs" 
      description="View detailed system events and API interactions"
    >
      <Card className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 md:p-6 border-b border-neutral-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-secondary">System Logs</h2>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={exportLogs}
              disabled={!logs?.length}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Logs
            </Button>
          </div>
        </div>
        
        <div>
          {isLoading ? (
            <div className="p-8 text-center">Loading logs...</div>
          ) : !logs?.length ? (
            <div className="p-8 text-center text-neutral-500">No logs found</div>
          ) : (
            <DataTable
              data={logs}
              columns={columns}
              searchable={true}
              searchPlaceholder="Search logs..."
              pagination={{
                totalItems: 100, // This would typically come from an API count
                itemsPerPage: limit,
                currentPage: page,
                onPageChange: setPage
              }}
            />
          )}
        </div>
      </Card>
      
      {/* Log Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-neutral-500">Timestamp</p>
                  <p className="font-mono">{format(new Date(selectedLog.timestamp), 'yyyy-MM-dd HH:mm:ss')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Action</p>
                  <p>{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">User</p>
                  <p>{users?.find(u => u.id === selectedLog.userId)?.username || selectedLog.userId || 'System'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Status Code</p>
                  <p className={selectedLog.statusCode && selectedLog.statusCode >= 400 ? 'text-error' : 'text-green-600'}>
                    {selectedLog.statusCode || 200}
                  </p>
                </div>
              </div>
              
              <Tabs defaultValue="request" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="request">Request Data</TabsTrigger>
                  <TabsTrigger value="response">Response Data</TabsTrigger>
                </TabsList>
                
                <TabsContent value="request">
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <pre className="text-xs font-mono">
                      {selectedLog.requestData ? formatJSON(selectedLog.requestData) : 'No request data available'}
                    </pre>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="response">
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                    <pre className="text-xs font-mono">
                      {selectedLog.responseData ? formatJSON(selectedLog.responseData) : 'No response data available'}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
