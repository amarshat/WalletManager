import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, RefreshCw, Search, Filter, DownloadCloud, AlertCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import TroubleshootingWizard from './TroubleshootingWizard';

interface ErrorLog {
  id: number;
  timestamp: string;
  errorType: string;
  errorCode?: string;
  message: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  userId?: number;
  details?: Record<string, any>;
  resolution?: string;
}

// Error type to severity mapping
const ERROR_SEVERITY_MAP: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  'connection': 'medium',
  'validation': 'low',
  'authentication': 'high',
  'authorization': 'high',
  'integration': 'high',
  'transaction': 'critical',
  'system': 'critical',
  'database': 'critical',
};

// Severity to color mapping
const SEVERITY_COLOR_MAP: Record<string, string> = {
  'low': 'bg-blue-100 text-blue-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-orange-100 text-orange-800',
  'critical': 'bg-red-100 text-red-800',
};

// Status to color mapping
const STATUS_COLOR_MAP: Record<string, string> = {
  'new': 'bg-purple-100 text-purple-800',
  'investigating': 'bg-amber-100 text-amber-800',
  'resolved': 'bg-green-100 text-green-800',
  'ignored': 'bg-gray-100 text-gray-800',
};

export default function ErrorLoggingDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [tabValue, setTabValue] = useState('all');
  const [isTroubleshootingOpen, setIsTroubleshootingOpen] = useState(false);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  
  const itemsPerPage = 10;
  
  // Fetch error logs
  const { data: errorLogs = [], isLoading, error, refetch } = useQuery<ErrorLog[]>({
    queryKey: ['/api/admin/error-logs'],
  });
  
  // Filter and paginate logs
  const filteredLogs = errorLogs.filter(log => {
    // Text search
    const matchesSearch = 
      searchQuery === '' || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.errorCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.component.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Severity filter
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    
    // Tab filter
    const matchesTab = 
      tabValue === 'all' || 
      (tabValue === 'critical' && log.severity === 'critical') ||
      (tabValue === 'unresolved' && log.status !== 'resolved') ||
      (tabValue === 'recent' && new Date(log.timestamp).getTime() > Date.now() - (24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesSeverity && matchesStatus && matchesTab;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  
  // Stats calculation
  const criticalCount = errorLogs.filter(log => log.severity === 'critical').length;
  const unresolvedCount = errorLogs.filter(log => log.status !== 'resolved').length;
  const lastDayCount = errorLogs.filter(log => {
    const logTime = new Date(log.timestamp).getTime();
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return logTime > dayAgo;
  }).length;
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSeverity, filterStatus, tabValue]);
  
  const handleExportLogs = () => {
    // Create CSV content
    const headers = ['ID', 'Timestamp', 'Error Type', 'Error Code', 'Message', 'Component', 'Severity', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.id,
        log.timestamp,
        log.errorType,
        log.errorCode || '',
        `"${log.message.replace(/"/g, '""')}"`, // Escape quotes in CSV
        log.component,
        log.severity,
        log.status
      ].join(','))
    ].join('\\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `error-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleOpenTroubleshooting = (log: ErrorLog) => {
    setSelectedError(log);
    setIsTroubleshootingOpen(true);
  };
  
  const getErrorTypeFromLog = (log: ErrorLog): 'integration' | 'connection' | 'authentication' | 'transaction' => {
    // Map error types to the types expected by the troubleshooting wizard
    switch (log.errorType) {
      case 'integration':
      case 'api':
      case 'external':
        return 'integration';
      case 'network':
      case 'connection':
      case 'timeout':
        return 'connection';
      case 'auth':
      case 'authentication':
      case 'authorization':
        return 'authentication';
      case 'transaction':
      case 'payment':
      case 'transfer':
        return 'transaction';
      default:
        // Default fallback
        return 'integration';
    }
  };
  
  // Format timestamp to readable date and time
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Error Logging Dashboard</h1>
          <p className="text-gray-600">
            Monitor and troubleshoot system errors in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExportLogs} className="flex items-center">
            <DownloadCloud className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Critical Errors</CardTitle>
            <CardDescription>Highest priority issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <div className="text-3xl font-bold">{criticalCount}</div>
                <div className="text-sm text-gray-500">
                  {criticalCount === 0 ? 'No critical issues' : `${criticalCount} need${criticalCount === 1 ? 's' : ''} attention`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Unresolved Errors</CardTitle>
            <CardDescription>Pending investigation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mr-3" />
              <div>
                <div className="text-3xl font-bold">{unresolvedCount}</div>
                <div className="text-sm text-gray-500">
                  {unresolvedCount === 0 ? 'All issues resolved' : `${unresolvedCount} unresolved issue${unresolvedCount === 1 ? '' : 's'}`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Last 24 Hours</CardTitle>
            <CardDescription>Recent error activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-3xl font-bold">{lastDayCount}</div>
                <div className="text-sm text-gray-500">
                  {lastDayCount === 0 ? 'No recent errors' : `${lastDayCount} error${lastDayCount === 1 ? '' : 's'} in 24h`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs and Filters */}
      <div className="flex flex-col space-y-4">
        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Errors</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
            <TabsTrigger value="recent">Last 24 Hours</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by message, code, or component..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500 mr-2">Filter:</span>
            </div>
            
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Error Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
                <p className="mt-2 text-gray-500">Loading error logs...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <p className="mt-2 text-red-600">Failed to load error logs</p>
                <Button variant="outline" onClick={() => refetch()} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          ) : paginatedLogs.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-6 w-6 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {filteredLogs.length === 0 
                    ? 'No error logs found' 
                    : 'No errors match your current filters'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Error Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {log.errorType}
                        {log.errorCode && <span className="ml-1 text-xs text-gray-500">({log.errorCode})</span>}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.message}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {log.component}
                      </TableCell>
                      <TableCell>
                        <Badge className={SEVERITY_COLOR_MAP[log.severity]}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLOR_MAP[log.status]}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenTroubleshooting(log)}
                        >
                          Troubleshoot
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {filteredLogs.length > itemsPerPage && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      
      {/* Troubleshooting Wizard */}
      {selectedError && (
        <TroubleshootingWizard 
          isOpen={isTroubleshootingOpen} 
          onClose={() => setIsTroubleshootingOpen(false)}
          errorType={getErrorTypeFromLog(selectedError)}
          errorMessage={selectedError.message}
          errorCode={selectedError.errorCode}
        />
      )}
    </div>
  );
}