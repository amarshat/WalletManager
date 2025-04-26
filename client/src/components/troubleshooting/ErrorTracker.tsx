import { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, Info, FileText, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';

interface ErrorEvent {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  component: string;
  source: 'client' | 'server' | 'api';
  details?: Record<string, any>;
  stackTrace?: string;
  url?: string;
  userId?: number;
  seen: boolean;
}

export default function ErrorTracker() {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isVisible, setIsVisible] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [isPolling, setIsPolling] = useState(true);
  
  // Polling for new errors
  useEffect(() => {
    if (!isPolling) return;
    
    const fetchErrors = async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/error-events?limit=10');
        const data = await response.json();
        
        // Update errors
        setErrors(data);
        
        // Count unseen errors
        const newUnseenCount = data.filter((error: ErrorEvent) => !error.seen).length;
        setUnseenCount(newUnseenCount);
        
      } catch (error) {
        console.error('Failed to fetch errors:', error);
      }
    };
    
    // Initial fetch
    fetchErrors();
    
    // Set up polling
    const intervalId = setInterval(fetchErrors, 15000); // Poll every 15 seconds
    
    return () => clearInterval(intervalId);
  }, [isPolling]);
  
  // Mark errors as seen
  const markAsSeen = async (errorId: string) => {
    try {
      await apiRequest('POST', `/api/admin/error-events/${errorId}/seen`);
      
      // Update local state
      setErrors(prev => 
        prev.map(error => 
          error.id === errorId ? { ...error, seen: true } : error
        )
      );
      
      // Update unseen count
      setUnseenCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Failed to mark error as seen:', error);
    }
  };
  
  // Mark all errors as seen
  const markAllAsSeen = async () => {
    try {
      await apiRequest('POST', '/api/admin/error-events/mark-all-seen');
      
      // Update local state
      setErrors(prev => prev.map(error => ({ ...error, seen: true })));
      setUnseenCount(0);
      
    } catch (error) {
      console.error('Failed to mark all errors as seen:', error);
    }
  };
  
  // Toggle expanded state for an error
  const toggleExpanded = (errorId: string) => {
    setExpanded(prev => ({
      ...prev,
      [errorId]: !prev[errorId]
    }));
    
    // Mark as seen when expanded
    if (!expanded[errorId]) {
      markAsSeen(errorId);
    }
  };
  
  // Get icon based on error level
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Get badge color based on error level
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="flex items-center bg-red-500 hover:bg-red-600 text-white"
          size="sm"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Error Tracker {unseenCount > 0 && `(${unseenCount})`}
        </Button>
      </div>
    );
  }
  
  return (
    <div 
      className={`fixed ${minimized ? 'bottom-4 right-4 w-auto' : 'bottom-0 right-0 w-96'} z-50 transition-all duration-200 ease-in-out`}
    >
      {minimized ? (
        <Button
          onClick={() => setMinimized(false)}
          className="flex items-center bg-red-500 hover:bg-red-600 text-white"
          size="sm"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Error Tracker {unseenCount > 0 && `(${unseenCount})`}
        </Button>
      ) : (
        <Card className="shadow-lg border-t-4 border-t-red-500">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-md font-semibold flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                Error Tracker
                {unseenCount > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {unseenCount} new
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center space-x-1">
                {isPolling ? (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsPolling(false)}
                    title="Pause updates"
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsPolling(true)}
                    title="Resume updates"
                  >
                    <Loader2 className="h-3 w-3" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setMinimized(true)}
                  title="Minimize"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsVisible(false)}
                  title="Close"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {errors.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No errors recorded</p>
              </div>
            ) : (
              <>
                <div className="border-b border-gray-200 px-4 py-2 flex justify-between items-center bg-gray-50">
                  <span className="text-xs text-gray-500">
                    Showing recent errors
                  </span>
                  {unseenCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-7 py-0"
                      onClick={markAllAsSeen}
                    >
                      Mark all as seen
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="divide-y divide-gray-100">
                    {errors.map((error) => (
                      <div 
                        key={error.id} 
                        className={`py-2 px-4 ${error.seen ? '' : 'bg-gray-50'}`}
                      >
                        <div 
                          className="flex items-start cursor-pointer"
                          onClick={() => toggleExpanded(error.id)}
                        >
                          <div className="mr-2 mt-0.5">
                            {expanded[error.id] ? (
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="mr-2 mt-0.5">
                            {getLevelIcon(error.level)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className={`text-sm font-medium truncate pr-2 ${!error.seen ? 'text-gray-900' : 'text-gray-700'}`}>
                                {error.message}
                              </p>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatTimestamp(error.timestamp)}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              <Badge className={`text-xs px-1 py-0 h-4 mr-2 ${getLevelBadgeColor(error.level)}`}>
                                {error.level}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {error.component}
                              </span>
                              {error.source && (
                                <Badge variant="outline" className="ml-2 text-xs px-1 py-0 h-4">
                                  {error.source}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded details */}
                        {expanded[error.id] && (
                          <div className="pl-10 mt-2 space-y-2">
                            {error.details && (
                              <div className="text-xs">
                                <div className="font-semibold text-gray-700 mb-1">Details:</div>
                                <pre className="bg-gray-50 p-2 rounded text-gray-700 overflow-auto max-h-20">
                                  {JSON.stringify(error.details, null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            {error.stackTrace && (
                              <div className="text-xs">
                                <div className="font-semibold text-gray-700 mb-1">Stack Trace:</div>
                                <pre className="bg-gray-50 p-2 rounded text-gray-700 overflow-auto max-h-32 whitespace-pre-wrap">
                                  {error.stackTrace}
                                </pre>
                              </div>
                            )}
                            
                            {error.url && (
                              <div className="text-xs">
                                <span className="font-semibold text-gray-700">URL: </span>
                                <span className="text-gray-600">{error.url}</span>
                              </div>
                            )}
                            
                            {error.userId && (
                              <div className="text-xs">
                                <span className="font-semibold text-gray-700">User ID: </span>
                                <span className="text-gray-600">{error.userId}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-end pt-1">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-7"
                                onClick={() => {
                                  // Copy to clipboard
                                  const errorText = `Error: ${error.message}
Level: ${error.level}
Component: ${error.component}
Timestamp: ${error.timestamp}
Details: ${JSON.stringify(error.details || {})}
Stack Trace: ${error.stackTrace || ''}
`;
                                  navigator.clipboard.writeText(errorText);
                                }}
                              >
                                Copy Details
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}