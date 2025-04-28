import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useBrand } from "@/hooks/use-brand";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Edit, Users, ScrollText, CreditCard } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { User } from "@shared/schema";
import AdminTransferModal from "@/components/modals/AdminTransferModal";

export default function AdminDashboard() {
  const { brand } = useBrand();
  const { toast } = useToast();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  
  // Fetch customers (non-admin users)
  const { 
    data: users,
    isLoading,
    error,
    refetch
  } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Fetch logs with small limit for dashboard overview
  const { 
    data: logs,
    isLoading: isLoadingLogs,
  } = useQuery({
    queryKey: ["/api/logs?limit=5"],
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  // Table columns for customer list
  const customerColumns = [
    {
      key: "fullName",
      header: "Name",
      cell: (user: User) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
              {user.fullName.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2)}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-neutral-900">{user.fullName}</div>
            <div className="text-sm text-neutral-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: "username",
      header: "Username",
      cell: (user: User) => (
        <span className="text-sm text-neutral-700">{user.username}</span>
      )
    },
    {
      key: "country",
      header: "Country",
      cell: (user: User) => (
        <span className="text-sm text-neutral-700">{user.country || "N/A"}</span>
      )
    },
    {
      key: "defaultCurrency",
      header: "Default Currency",
      cell: (user: User) => (
        <span className="text-sm text-neutral-700">{user.defaultCurrency}</span>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (user: User) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Active
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (user: User) => (
        <div className="text-right">
          <Button variant="link" className="text-primary hover:text-primary-dark">Edit</Button>
          <Button variant="link" className="text-error hover:text-red-700">Delete</Button>
        </div>
      )
    }
  ];
  
  // Table columns for logs
  const logColumns = [
    {
      key: "timestamp",
      header: "Timestamp",
      cell: (log: any) => (
        <span className="text-sm text-neutral-500 font-mono">
          {new Date(log.timestamp).toLocaleString()}
        </span>
      )
    },
    {
      key: "user",
      header: "User",
      cell: (log: any) => {
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
      cell: (log: any) => (
        <span className="text-sm text-neutral-700">{log.action}</span>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (log: any) => {
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
      cell: () => (
        <div className="text-right">
          <Button variant="link" className="text-primary hover:text-primary-dark">View</Button>
        </div>
      )
    }
  ];
  
  return (
    <AdminLayout>
      {/* Brand Settings Card */}
      <Card className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-secondary">Brand Settings</h2>
          <Link href="/admin/brand-settings">
            <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
              <Edit className="mr-1 w-4 h-4" />
              Edit
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-neutral-600 mb-1">Brand Name</h3>
              <p className="text-neutral-800">{brand?.name || "PaySage"}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-neutral-600 mb-1">Brand Tagline</h3>
              <p className="text-neutral-800">{brand?.tagline || "Your Digital Wallet Solution"}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-neutral-600 mb-1">Wallet Auth Key</h3>
              <div className="flex items-center">
                <div className="bg-neutral-100 p-2 rounded flex-1 text-neutral-500">
                  •••••••••••••••••••••••••••
                </div>
                <Button variant="ghost" size="icon" className="ml-2 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-neutral-600 mb-2">Brand Logo</h3>
            <div className="border border-dashed border-neutral-300 rounded-lg p-4 flex flex-col items-center justify-center">
              <img 
                src={brand?.logo || "https://www.paysafe.com/fileadmin/templates/img/layout/ps-logo.svg"} 
                alt="Brand Logo" 
                className="h-12 mb-4" 
              />
              <Link href="/admin/brand-settings">
                <Button variant="outline" size="sm">
                  Change Logo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Customers Overview Card */}
      <Card className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <CardContent className="p-0">
          <div className="p-4 md:p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary">Customers</h2>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => setTransferModalOpen(true)}
                >
                  <CreditCard className="mr-1 w-4 h-4" />
                  Admin Transfer
                </Button>
                <Link href="/admin/manage-customers">
                  <Button className="flex items-center">
                    <Users className="mr-1 w-4 h-4" />
                    Manage Customers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div>
            {isLoading ? (
              <div className="p-8 text-center">Loading customers...</div>
            ) : (
              <DataTable
                data={users || []}
                columns={customerColumns}
                searchable={false}
                pagination={users?.length ? {
                  totalItems: users.length,
                  itemsPerPage: 10,
                  currentPage: 1,
                  onPageChange: () => {}
                } : undefined}
              />
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* System Logs Card */}
      <Card className="bg-white rounded-lg shadow overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 md:p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-secondary">System Logs</h2>
              <Link href="/admin/system-logs">
                <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
                  <ScrollText className="mr-1 w-4 h-4" />
                  View All Logs
                </Button>
              </Link>
            </div>
          </div>
          
          <div>
            {isLoadingLogs ? (
              <div className="p-8 text-center">Loading logs...</div>
            ) : (
              <DataTable
                data={logs || []}
                columns={logColumns}
                searchable={false}
              />
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Admin Transfer Modal */}
      <AdminTransferModal
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
      />
    </AdminLayout>
  );
}
