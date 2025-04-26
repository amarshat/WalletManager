import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  ChevronUp, 
  ChevronDown, 
  RefreshCw,
  AlertCircle,
  InfoIcon,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ErrorEvent {
  id: number;
  message: string;
  details: {
    level: 'info' | 'warning' | 'error' | 'critical';
    source: 'client' | 'server' | 'api';
    component?: string;
    timestamp: string;
    seen?: boolean;
  };
  createdAt: string;
}

export default function ErrorTracker() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewErrors, setHasNewErrors] = useState(false);
  
  // Load errors on mount
  useEffect(() => {
    fetchErrors();
    
    // Set up polling for new errors
    const interval = setInterval(() => {
      fetchErrors(true);
    }, 30000); // Check for new errors every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch errors from the API
  const fetchErrors = async (silent = false) => {
    if (!silent) setIsLoading(true);
    
    try {
      const response = await apiRequest('GET', '/api/logs?limit=10');
      const data = await response.json();
      
      if (data.errors && Array.isArray(data.errors)) {
        // Check if there are any new unseen errors
        const newUnseen = data.errors.some((error: ErrorEvent) => !error.details.seen);
        
        if (newUnseen && errors.length > 0) {
          setHasNewErrors(true);
          if (!isOpen) {
            toast({
              title: 'New errors detected',
              description: 'There are new errors that require your attention.',
              variant: 'destructive'
            });
          }
        }
        
        setErrors(data.errors);
      }
    } catch (error) {
      console.error('Error fetching errors:', error);
      if (!silent) {
        toast({
          title: 'Error',
          description: 'Failed to fetch error events.',
          variant: 'destructive'
        });
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };
  
  // Mark all errors as seen
  const markAllAsSeen = async () => {
    try {
      await apiRequest('POST', '/api/logs/mark-all-seen');
      setHasNewErrors(false);
      fetchErrors();
      
      toast({
        title: 'Success',
        description: 'All errors marked as seen.',
      });
    } catch (error) {
      console.error('Error marking errors as seen:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark errors as seen.',
        variant: 'destructive'
      });
    }
  };
  
  // Get level badge color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'error':
        return 'bg-red-400 text-white hover:bg-red-500';
      case 'warning':
        return 'bg-amber-400 text-amber-950 hover:bg-amber-500';
      case 'info':
        return 'bg-blue-400 text-blue-950 hover:bg-blue-500';
      default:
        return 'bg-gray-400 text-gray-950 hover:bg-gray-500';
    }
  };
  
  // Get source badge color
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'client':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'server':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'api':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  // Get level icon
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <InfoIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // If no errors, don't render anything
  if (errors.length === 0 && !isOpen) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Collapsed state - just show icon */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasNewErrors(false);
          }}
          className="flex items-center space-x-2 bg-white shadow-lg border rounded-full px-4 py-2 hover:bg-gray-50 transition-all"
        >
          <AlertTriangle className={`h-5 w-5 ${hasNewErrors ? 'text-red-500 animate-pulse' : 'text-amber-500'}`} />
          <span className="font-medium">{errors.length} Errors</span>
          {hasNewErrors && (
            <Badge variant="destructive" className="ml-1 text-[10px] h-5 animate-pulse">
              NEW
            </Badge>
          )}
        </button>
      )}
      
      {/* Expanded state - show error list */}
      {isOpen && (
        <div className="bg-white shadow-xl border rounded-lg w-[380px] transition-all overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b p-3 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium">Error Tracker</h3>
              {hasNewErrors && (
                <Badge variant="destructive" className="animate-pulse text-[10px] h-5">NEW</Badge>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => fetchErrors()}
                className="p-1 hover:bg-gray-200 rounded-md text-gray-500"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }}
                className="p-1 hover:bg-gray-200 rounded-md text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Main content - error list */}
          <div className={`overflow-y-auto transition-all ${isExpanded ? 'max-h-[500px]' : 'max-h-[300px]'}`}>
            {errors.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p>No errors to display!</p>
                <p className="text-sm mt-1">The system is running smoothly.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {errors.map((error) => (
                  <li 
                    key={error.id} 
                    className={`p-3 text-sm hover:bg-gray-50 ${!error.details.seen ? 'bg-amber-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center space-x-2">
                        {getLevelIcon(error.details.level)}
                        <span className="font-medium">{error.message}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Badge className={getLevelColor(error.details.level)}>
                          {error.details.level}
                        </Badge>
                        <Badge className={getSourceColor(error.details.source)}>
                          {error.details.source}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <div>
                        {error.details.component && (
                          <span className="mr-2">
                            Component: <span className="font-mono">{error.details.component}</span>
                          </span>
                        )}
                      </div>
                      <div>{formatDate(error.createdAt)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t p-2 flex items-center justify-between bg-gray-50">
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsSeen}
              disabled={errors.length === 0 || errors.every(e => e.details.seen)}
            >
              Mark All as Seen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Expand
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}