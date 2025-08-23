import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeftRight, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Package
} from "lucide-react";
import { authService } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TransferForm from "@/components/transfer-form";

interface Asset {
  id: number;
  asset_id: string;
  asset_name: string;
  description: string | null;
  category: string;
  serial_number: string;
  model: string | null;
  manufacturer: string | null;
  purchase_date: string | null;
  purchase_cost: number | null;
  warranty_expiry: string | null;
  current_location: string;
  assigned_department: string;
  assigned_user_id: number | null;
  status: string;
  condition: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface AssetTransfer {
  id: number;
  asset: Asset;
  fromUserId: number | null;
  toUserId: number | null;
  fromDepartment: string;
  toDepartment: string;
  fromLocation: string;
  toLocation: string;
  reason: string;
  status: "pending" | "approved" | "completed" | "rejected";
  requestedById: number;
  approvedById: number | null;
  completedAt: string | null;
  created_at: string;
  updated_at: string;
}

interface TransfersResponse {
  transfers: AssetTransfer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function Transfers() {
  const [page, setPage] = useState(1);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const limit = 20;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = authService.getUser();

  const { data, isLoading } = useQuery<TransfersResponse>({
    queryKey: ["/api/transfers", { page, limit }],
  });

  const approveTransferMutation = useMutation({
    mutationFn: async (transferId: number) => {
      return apiRequest("PUT", `/api/transfers/${transferId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Transfer Approved",
        description: "The asset transfer has been approved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve transfer.",
        variant: "destructive",
      });
    }
  });

  const completeTransferMutation = useMutation({
    mutationFn: async (transferId: number) => {
      return apiRequest("PUT", `/api/transfers/${transferId}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Transfer Completed",
        description: "The transfer has been marked as completed and asset updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete transfer.",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pending", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-700" },
      approved: { label: "Approved", variant: "default" as const, className: "bg-blue-100 text-blue-700" },
      completed: { label: "Completed", variant: "default" as const, className: "bg-green-100 text-green-700" },
      rejected: { label: "Rejected", variant: "destructive" as const, className: "bg-red-100 text-red-700" }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const canApproveTransfer = (transfer: AssetTransfer) => {
    return user && 
           ["admin", "asset_manager", "department_head"].includes(user.role) &&
           transfer.status === "pending" &&
           transfer.requestedById !== user.id;
  };

  const canCompleteTransfer = (transfer: AssetTransfer) => {
    return user && ["admin", "asset_manager", "department_head"].includes(user.role) && transfer.status === "approved";
  };

  const handleApproveTransfer = (transferId: number) => {
    approveTransferMutation.mutate(transferId);
  };

  const handleCompleteTransfer = (transferId: number) => {
    completeTransferMutation.mutate(transferId);
  };

  const handleTransferSuccess = () => {
    setIsTransferFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Asset Transfers</h2>
            <p className="text-gray-600 mt-1">Manage asset transfers between departments and locations</p>
          </div>
          <Dialog open={isTransferFormOpen} onOpenChange={setIsTransferFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-jsc-blue hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Request Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request Asset Transfer</DialogTitle>
                <DialogDescription>
                  Submit a request to transfer an asset to a different location or department.
                </DialogDescription>
              </DialogHeader>
              <TransferForm onSuccess={handleTransferSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transfers</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {data?.pagination.total || 0}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <ArrowLeftRight className="h-6 w-6 text-jsc-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {data?.transfers.filter(t => t.status === "pending").length || 0}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {data?.transfers.filter(t => t.status === "approved").length || 0}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {data?.transfers.filter(t => t.status === "completed").length || 0}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transfers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : data && data.transfers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>From Department</TableHead>
                    <TableHead>To Department</TableHead>
                    <TableHead>From Location</TableHead>
                    <TableHead>To Location</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transfers.map((transfer) => (
                    <TableRow key={transfer.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium">{transfer.asset.asset_name}</div>
                        <div className="text-sm text-gray-500">ID: {transfer.asset.asset_id}</div>
                        <div className="text-sm text-gray-500">Serial: {transfer.asset.serial_number}</div>
                      </TableCell>
                      <TableCell className="capitalize">{transfer.fromDepartment}</TableCell>
                      <TableCell className="capitalize">{transfer.toDepartment}</TableCell>
                      <TableCell>{transfer.fromLocation}</TableCell>
                      <TableCell>{transfer.toLocation}</TableCell>
                      <TableCell className="max-w-48 truncate" title={transfer.reason}>
                        {transfer.reason}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transfer.status)}
                          {getStatusBadge(transfer.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(transfer.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canApproveTransfer(transfer) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveTransfer(transfer.id)}
                              disabled={approveTransferMutation.isPending}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {canCompleteTransfer(transfer) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCompleteTransfer(transfer.id)}
                              disabled={completeTransferMutation.isPending}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ArrowLeftRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers found</h3>
              <p className="text-gray-600 mb-4">
                No asset transfer requests have been made yet.
              </p>
              <Dialog open={isTransferFormOpen} onOpenChange={setIsTransferFormOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-jsc-blue hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Request Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Request Asset Transfer</DialogTitle>
                    <DialogDescription>
                      Submit a request to transfer an asset to a different location or department.
                    </DialogDescription>
                  </DialogHeader>
                  <TransferForm onSuccess={handleTransferSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, data.pagination.total)} of {data.pagination.total} transfers
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                {[...Array(Math.min(5, data.pagination.totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={pageNum === page ? "bg-jsc-blue hover:bg-blue-700" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
                  disabled={page === data.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}