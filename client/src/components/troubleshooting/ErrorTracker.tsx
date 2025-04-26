import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Filter, 
  Info, 
  RefreshCcw, 
  Server, 
  ShieldAlert, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SystemLog {
  id: number;
  action: string;
  component?: string;
  userId?: number;
  details?: {
    level?: 'info' | 'warning' | 'error' | 'critical';
    source?: 'client' | 'server' | 'api';
    seen?: boolean;
    message?: string;
    method?: string;
    path?: string;
    statusCode?: number;
  };
  createdAt: string;
}

const severityIcons = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  error: <ShieldAlert className="h-4 w-4 text-red-500" />,
  critical: <AlertCircle className="h-4 w-4 text-purple-600" />
};

const sourceColors = {
  client: 'bg-green-100 text-green-800',
  server: 'bg-blue-100 text-blue-800',
  api: 'bg-purple-100 text-purple-800'
};

export default function ErrorTracker() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  
  const { data: errorLogs, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/logs'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/logs');
        const data = await res.json();
        return data.errors || [];
      } catch (err) {
        console.error('Failed to fetch error logs:', err);
        return [];
      }
    }
  });
  
  const totalPages = errorLogs ? Math.ceil(errorLogs.length / PAGE_SIZE) : 0;
  
  const filteredLogs = errorLogs?.filter((log: SystemLog) => {
    if (activeTab === 'all') return true;
    return log.details?.level === activeTab;
  });
  
  const paginatedLogs = filteredLogs?.slice(
    (currentPage - 1) * PAGE_SIZE, 
    currentPage * PAGE_SIZE
  );
  
  const handleMarkAllSeen = async () => {
    try {
      await apiRequest('POST', '/api/logs/mark-all-seen');
      toast({
        title: 'Success',
        description: 'All errors have been marked as seen',
        variant: 'default',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to mark errors as seen',
        variant: 'destructive',
      });
    }
  };
  
  const getActionDescription = (action: string) => {
    switch(action) {
      case 'API_REQUEST':
        return 'API Request';
      case 'SYSTEM_ERROR':
        return 'System Error';
      case 'AUTH_FAILURE':
        return 'Authentication Failure';
      case 'TRANSACTION_ERROR':
        return 'Transaction Error';
      default:
        return action.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
  };
  
  useEffect(() => {
    // Reset to page 1 when filter changes
    setCurrentPage(1);
  }, [activeTab]);
  
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Error Tracker</CardTitle>
            <CardDescription>
              Monitor and troubleshoot system errors and events
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-1"
            >
              <RefreshCcw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllSeen}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              <span>Mark All Seen</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6 pt-2">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-1">
              <Info className="h-4 w-4" />
              <span>Info</span>
            </TabsTrigger>
            <TabsTrigger value="warning" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              <span>Warning</span>
            </TabsTrigger>
            <TabsTrigger value="error" className="flex items-center gap-1">
              <ShieldAlert className="h-4 w-4" />
              <span>Error</span>
            </TabsTrigger>
            <TabsTrigger value="critical" className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>Critical</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
      
      <CardContent className="pt-4 px-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin w-8 h-8 border-4 border-t-primary rounded-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mx-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load error logs. Please refresh and try again.
            </AlertDescription>
          </Alert>
        ) : !paginatedLogs?.length ? (
          <div className="text-center py-12 text-gray-500">
            <Server className="h-10 w-10 mb-2 mx-auto text-gray-400" />
            <p className="text-lg font-medium">No errors found</p>
            <p className="text-sm">The system appears to be running smoothly</p>
          </div>
        ) : (
          <div className="space-y-0 pb-2">
            {paginatedLogs.map((log: SystemLog) => (
              <div key={log.id} className="px-6 py-3 border-b last:border-0 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {severityIcons[log.details?.level || 'info']}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-800">{getActionDescription(log.action)}</h3>
                        <Badge variant="outline" className={log.details?.source ? sourceColors[log.details.source] : ''}>
                          {log.details?.source || 'system'}
                        </Badge>
                        {log.details?.seen === false && (
                          <Badge className="bg-blue-500 text-white">New</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {log.details?.message || 'No additional details'}
                      </p>
                      
                      {log.details?.method && log.details?.path && (
                        <div className="mt-2 text-xs bg-gray-100 p-1 px-2 rounded font-mono">
                          {log.details.method} {log.details.path} 
                          {log.details.statusCode && (
                            <span className={`ml-1 px-1 py-0.5 rounded ${
                              log.details.statusCode >= 400 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {log.details.statusCode}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                        
                        {log.component && (
                          <>
                            <Separator orientation="vertical" className="mx-2 h-3" />
                            <Server className="h-3 w-3 mr-1" />
                            <span>{log.component}</span>
                          </>
                        )}
                        
                        {log.userId && (
                          <>
                            <Separator orientation="vertical" className="mx-2 h-3" />
                            <span>User ID: {log.userId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Dismiss</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 pt-4">
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t flex justify-between">
        <div className="text-sm text-gray-500 flex items-center">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          <span>Showing {filteredLogs?.length || 0} events</span>
        </div>
        
        <div className="flex space-x-4">
          {['info', 'warning', 'error', 'critical'].map(severity => (
            <div key={severity} className="flex items-center gap-1 text-sm">
              {severityIcons[severity as keyof typeof severityIcons]}
              <span className="capitalize">{severity}</span>
              <Badge variant="outline" className="ml-1 px-2 py-0">
                {errorLogs?.filter((log: SystemLog) => log.details?.level === severity).length || 0}
              </Badge>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}