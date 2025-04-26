import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  BadgeAlert,
  CheckCircle2,
  Eye,
  RefreshCcw,
  Filter,
  XCircle,
  Loader2
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export default function ErrorTracker() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<string | null>(null);
  
  const { data: errorLogs, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/error-events'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/error-events');
      const data = await res.json();
      return data.errors || [];
    },
  });
  
  const { mutate: markAsSeen, isPending: isMarkingAsSeen } = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/admin/error-events/${id}/seen`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Error marked as seen',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/error-events'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark error as seen',
        variant: 'destructive',
      });
    }
  });
  
  const { mutate: markAllAsSeen, isPending: isMarkingAllSeen } = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/error-events/mark-all-seen');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'All errors marked as seen',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/error-events'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark all errors as seen',
        variant: 'destructive',
      });
    }
  });
  
  const filteredLogs = errorLogs?.filter((log: SystemLog) => {
    if (selectedTab === 'all') {
      return true;
    } else if (selectedTab === 'unseen') {
      return log.details?.seen === false;
    } else if (selectedTab === 'critical') {
      return log.details?.level === 'critical';
    } else if (selectedTab === 'errors') {
      return log.details?.level === 'error';
    } else if (selectedTab === 'warnings') {
      return log.details?.level === 'warning';
    }
    return true;
  }).filter((log: SystemLog) => {
    // Apply additional filters
    if (filterLevel && log.details?.level !== filterLevel) {
      return false;
    }
    if (filterSource && log.details?.source !== filterSource) {
      return false;
    }
    return true;
  }) || [];
  
  // Calculate pagination
  const logsPerPage = 10;
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);
  
  const handleRefresh = () => {
    refetch();
  };
  
  const handleMarkAsSeen = (id: number) => {
    markAsSeen(id);
  };
  
  const handleMarkAllAsSeen = () => {
    markAllAsSeen();
  };
  
  const getLevelBadge = (level?: string) => {
    if (!level) return null;
    
    switch (level) {
      case 'critical':
        return <Badge variant="destructive" className="gap-1 flex items-center"><BadgeAlert className="h-3 w-3" /> Critical</Badge>;
      case 'error':
        return <Badge variant="destructive" className="gap-1 flex items-center"><AlertCircle className="h-3 w-3" /> Error</Badge>;
      case 'warning':
        return <Badge variant="outline" className="gap-1 flex items-center bg-orange-100 text-orange-700 border-orange-200"><AlertTriangle className="h-3 w-3" /> Warning</Badge>;
      case 'info':
        return <Badge variant="secondary" className="gap-1 flex items-center"><Info className="h-3 w-3" /> Info</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };
  
  const getSourceBadge = (source?: string) => {
    if (!source) return null;
    
    switch (source) {
      case 'client':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Client</Badge>;
      case 'server':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Server</Badge>;
      case 'api':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">API</Badge>;
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };
  
  const renderTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Error & Event Tracker</CardTitle>
            <CardDescription>
              Monitor and manage system errors and events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <div className="font-medium text-sm mb-1">Error Level</div>
                  <div className="space-y-1">
                    <DropdownMenuItem 
                      onClick={() => setFilterLevel(null)}
                      className="gap-2"
                    >
                      <CheckCircle2 className={`h-4 w-4 ${filterLevel === null ? 'opacity-100' : 'opacity-0'}`} />
                      <span>All Levels</span>
                    </DropdownMenuItem>
                    {['critical', 'error', 'warning', 'info'].map(level => (
                      <DropdownMenuItem 
                        key={level}
                        onClick={() => setFilterLevel(level)}
                        className="gap-2"
                      >
                        <CheckCircle2 className={`h-4 w-4 ${filterLevel === level ? 'opacity-100' : 'opacity-0'}`} />
                        <span className="capitalize">{level}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </div>
                <div className="p-2 border-t">
                  <div className="font-medium text-sm mb-1">Source</div>
                  <div className="space-y-1">
                    <DropdownMenuItem 
                      onClick={() => setFilterSource(null)}
                      className="gap-2"
                    >
                      <CheckCircle2 className={`h-4 w-4 ${filterSource === null ? 'opacity-100' : 'opacity-0'}`} />
                      <span>All Sources</span>
                    </DropdownMenuItem>
                    {['client', 'server', 'api'].map(source => (
                      <DropdownMenuItem 
                        key={source}
                        onClick={() => setFilterSource(source)}
                        className="gap-2"
                      >
                        <CheckCircle2 className={`h-4 w-4 ${filterSource === source ? 'opacity-100' : 'opacity-0'}`} />
                        <span className="capitalize">{source}</span>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              <span>Refresh</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="default" 
              className="h-8 gap-1"
              onClick={handleMarkAllAsSeen}
              disabled={isMarkingAllSeen || isLoading}
            >
              <Eye className="h-4 w-4" />
              <span>Mark All Seen</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <div className="px-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all" className="text-xs">
              All Events
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-px">
                {errorLogs?.length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="unseen" className="text-xs">
              Unseen
              <span className="ml-1.5 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-px">
                {errorLogs?.filter((log: SystemLog) => log.details?.seen === false).length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="critical" className="text-xs">
              Critical
              <span className="ml-1.5 text-xs bg-red-100 text-red-800 rounded-full px-2 py-px">
                {errorLogs?.filter((log: SystemLog) => log.details?.level === 'critical').length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="errors" className="text-xs">
              Errors
              <span className="ml-1.5 text-xs bg-red-100 text-red-800 rounded-full px-2 py-px">
                {errorLogs?.filter((log: SystemLog) => log.details?.level === 'error').length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="warnings" className="text-xs">
              Warnings
              <span className="ml-1.5 text-xs bg-orange-100 text-orange-800 rounded-full px-2 py-px">
                {errorLogs?.filter((log: SystemLog) => log.details?.level === 'warning').length || 0}
              </span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab} className="m-0">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-gray-500">Loading error logs...</p>
                </div>
              </div>
            ) : paginatedLogs.length === 0 ? (
              <div className="border rounded-md bg-gray-50 p-8 text-center">
                <div className="flex justify-center mb-3">
                  <div className="rounded-full bg-gray-100 p-3">
                    <CheckCircle2 className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No logs found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {filterLevel || filterSource ? 
                    "No logs match your current filter criteria. Try changing your filters or check back later." : 
                    "There are no error logs to display at this time. Check back later or adjust the filters."}
                </p>
                {(filterLevel || filterSource) && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setFilterLevel(null);
                      setFilterSource(null);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[450px] border rounded-md">
                <div className="space-y-1 p-1">
                  {paginatedLogs.map((log: SystemLog) => (
                    <div 
                      key={log.id}
                      className={`p-3 rounded-md border text-sm ${
                        log.details?.seen ? 'bg-white' : 'bg-blue-50 border-blue-200'
                      } ${log.id === selectedLogId ? 'ring-2 ring-primary' : ''}
                      hover:bg-gray-50 cursor-pointer transition-colors`}
                      onClick={() => setSelectedLogId(log.id === selectedLogId ? null : log.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-2">
                          {getLevelIcon(log.details?.level)}
                          <div>
                            <div className="font-medium">
                              {log.action}
                              {!log.details?.seen && (
                                <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">New</Badge>
                              )}
                            </div>
                            <div className="text-gray-500 text-xs mt-0.5">
                              {renderTimestamp(log.createdAt)}
                              {log.component && <span> • {log.component}</span>}
                              {log.details?.statusCode && (
                                <span> • Status: {log.details.statusCode}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          {getLevelBadge(log.details?.level)}
                          {getSourceBadge(log.details?.source)}
                        </div>
                      </div>
                      
                      {log.id === selectedLogId && (
                        <div className="mt-3 border-t pt-3">
                          <div className="flex justify-between mb-2">
                            <div className="text-xs text-gray-500">
                              {log.details?.method && log.details.path && (
                                <div className="mb-1">
                                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">
                                    {log.details.method} {log.details.path}
                                  </span>
                                </div>
                              )}
                            </div>
                            {!log.details?.seen && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsSeen(log.id);
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Mark as Seen
                              </Button>
                            )}
                          </div>
                          
                          {log.details?.message && (
                            <div className="bg-gray-50 border rounded-md p-2 text-xs mt-2">
                              <div className="font-medium mb-1">Message:</div>
                              <div className="text-gray-700">{log.details.message}</div>
                            </div>
                          )}
                          
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="bg-gray-50 border rounded-md p-2 text-xs mt-2">
                              <div className="font-medium mb-1">Details:</div>
                              <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-gray-700">
                                {JSON.stringify(
                                  Object.fromEntries(
                                    Object.entries(log.details)
                                      .filter(([key]) => !['level', 'source', 'seen', 'message', 'method', 'path'].includes(key))
                                  ), 
                                  null, 2
                                )}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + logsPerPage, filteredLogs.length)} of {filteredLogs.length} items
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <CardContent className="pt-0 pb-4 text-xs text-gray-500 border-t mt-6 p-4">
        <div className="flex justify-between">
          <div>
            All system events and errors are logged and can be filtered by severity and source.
          </div>
          <div>
            Last refreshed: {new Date().toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getLevelIcon(level?: string) {
  if (!level) return <Info className="h-5 w-5 text-gray-400" />;
  
  switch (level) {
    case 'critical':
      return <BadgeAlert className="h-5 w-5 text-red-600" />;
    case 'error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <Info className="h-5 w-5 text-gray-400" />;
  }
}