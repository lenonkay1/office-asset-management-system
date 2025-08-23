import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Wrench, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Package,
  Eye
} from "lucide-react";
import { authService } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { QueryUtils } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface MaintenanceSchedule {
  id: number;
  asset: Asset;
  title: string;
  description: string | null;
  scheduledDate: string;
  completedDate: string | null;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  performedBy: string | null;
  cost: number | null;
  notes: string | null;
  createdById: number;
  created_at: string;
  updated_at: string;
}

interface MaintenanceResponse {
  maintenances: MaintenanceSchedule[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface MaintenanceFormData {
  asset_id: string;
  title: string;
  description: string;
  scheduledDate: string;
}

export default function Maintenance() {
  const [page, setPage] = useState(1);
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [isCompleteFormOpen, setIsCompleteFormOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceSchedule | null>(null);
  const [formData, setFormData] = useState<MaintenanceFormData>({
    asset_id: "",
    title: "",
    description: "",
    scheduledDate: ""
  });
  const [completeFormData, setCompleteFormData] = useState({
    notes: "",
    cost: "",
    performedBy: ""
  });
  const limit = 20;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const user = authService.getUser();

  const { data, isLoading } = useQuery<MaintenanceResponse>({
    queryKey: ["/api/maintenance", { page, limit }],
  });

  // Load assets for scheduling dropdown
  type AssetOption = { id: number; asset_id: string; asset_name: string; serial_number: string | null };
  const { data: assetsForSelect } = useQuery<{ assets: AssetOption[] }>({
    queryKey: ["/api/assets?limit=1000"],
    queryFn: async () => {
      const res = await QueryUtils.fetchWithAuth<{ assets: AssetOption[] }>("/api/assets?limit=1000");
      return res;
    }
  });

  const { data: overdueMaintenances } = useQuery({
    queryKey: ["/api/dashboard/overdue-maintenances"],
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: async (data: MaintenanceFormData) => {
      const payload = {
        asset_id: parseInt(data.asset_id, 10),
        title: data.title,
        description: data.description || null,
        scheduledDate: new Date(data.scheduledDate)
      };
      return apiRequest("POST", "/api/maintenance", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/overdue-maintenances"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast({
        title: "Maintenance Scheduled",
        description: "The maintenance has been scheduled successfully.",
      });
      setIsScheduleFormOpen(false);
      setFormData({ asset_id: "", title: "", description: "", scheduledDate: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule maintenance.",
        variant: "destructive",
      });
    }
  });

  const completeMaintenanceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/maintenance/${id}/complete`, {
        notes: completeFormData.notes || null,
        cost: completeFormData.cost ? parseFloat(completeFormData.cost) : null,
        performedBy: completeFormData.performedBy || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/overdue-maintenances"] });
      toast({
        title: "Maintenance Completed",
        description: "The maintenance has been marked as completed.",
      });
      setIsCompleteFormOpen(false);
      setSelectedMaintenance(null);
      setCompleteFormData({ notes: "", cost: "", performedBy: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete maintenance.",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status: string, scheduledDate: string) => {
    const isOverdue = status === "scheduled" && new Date(scheduledDate) < new Date();
    
    if (isOverdue) {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-700">
          Overdue
        </Badge>
      );
    }

    const statusMap = {
      scheduled: { label: "Scheduled", variant: "secondary" as const, className: "bg-blue-100 text-blue-700" },
      in_progress: { label: "In Progress", variant: "default" as const, className: "bg-yellow-100 text-yellow-700" },
      completed: { label: "Completed", variant: "default" as const, className: "bg-green-100 text-green-700" },
      cancelled: { label: "Cancelled", variant: "outline" as const, className: "bg-gray-100 text-gray-700" }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.scheduled;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string, scheduledDate: string) => {
    const isOverdue = status === "scheduled" && new Date(scheduledDate) < new Date();
    
    if (isOverdue) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }

    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "in_progress":
        return <Wrench className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const canManageMaintenance = () => {
    return user && ["admin", "asset_manager"].includes(user.role);
  };

  const handleScheduleMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    createMaintenanceMutation.mutate(formData);
  };

  const handleCompleteMaintenance = (maintenance: MaintenanceSchedule) => {
    setSelectedMaintenance(maintenance);
    setIsCompleteFormOpen(true);
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaintenance) {
      completeMaintenanceMutation.mutate(selectedMaintenance.id);
    }
  };

  const getScheduledCount = () => data?.maintenances.filter(m => m.status === "scheduled").length || 0;
  const getInProgressCount = () => data?.maintenances.filter(m => m.status === "in_progress").length || 0;
  const getCompletedCount = () => data?.maintenances.filter(m => m.status === "completed").length || 0;
  const getOverdueCount = () => {
    return data?.maintenances.filter(m => 
      m.status === "scheduled" && new Date(m.scheduledDate) < new Date()
    ).length || 0;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Maintenance Management</h2>
            <p className="text-gray-600 mt-1">Schedule and track asset maintenance activities</p>
          </div>
          {canManageMaintenance() && (
            <Dialog open={isScheduleFormOpen} onOpenChange={setIsScheduleFormOpen}>
              <DialogTrigger asChild>
                <Button className="bg-jsc-blue hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Maintenance</DialogTitle>
                  <DialogDescription>
                    Create a new maintenance schedule for an asset.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleScheduleMaintenance} className="space-y-4">
                  <div>
                    <Label htmlFor="asset_id">Asset</Label>
                    <Select
                      value={formData.asset_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, asset_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {(assetsForSelect?.assets || []).map(a => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.asset_id} • {a.asset_name}{a.serial_number ? ` (SN: ${a.serial_number})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Maintenance Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Quarterly cleaning, Hardware upgrade"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of maintenance work"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsScheduleFormOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-jsc-blue hover:bg-blue-700"
                      disabled={createMaintenanceMutation.isPending}
                    >
                      Schedule
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scheduled</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {data?.pagination.total || 0}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-jsc-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {getOverdueCount()}
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {getInProgressCount()}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Wrench className="h-6 w-6 text-yellow-600" />
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
                  {getCompletedCount()}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Schedule</CardTitle>
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
          ) : data && data.maintenances.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.maintenances.map((maintenance) => (
                    <TableRow key={maintenance.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium">{maintenance.asset.asset_name}</div>
                        <div className="text-sm text-gray-500">ID: {maintenance.asset.asset_id}</div>
                        <div className="text-sm text-gray-500">Serial: {maintenance.asset.serial_number}</div>
                      </TableCell>
                      <TableCell className="font-medium">{maintenance.title}</TableCell>
                      <TableCell className="max-w-48 truncate" title={maintenance.description || ""}>
                        {maintenance.description || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(maintenance.scheduledDate).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(maintenance.status, maintenance.scheduledDate)}
                          {getStatusBadge(maintenance.status, maintenance.scheduledDate)}
                        </div>
                      </TableCell>
                      <TableCell>{maintenance.performedBy || "-"}</TableCell>
                      <TableCell>
                        {maintenance.cost ? `KES ${maintenance.cost.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canManageMaintenance() && maintenance.status === "scheduled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCompleteMaintenance(maintenance)}
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
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance scheduled</h3>
              <p className="text-gray-600 mb-4">
                No maintenance activities have been scheduled yet.
              </p>
              {canManageMaintenance() && (
                <Dialog open={isScheduleFormOpen} onOpenChange={setIsScheduleFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-jsc-blue hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Maintenance
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule Maintenance</DialogTitle>
                      <DialogDescription>
                        Create a new maintenance schedule for an asset.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleScheduleMaintenance} className="space-y-4">
                      <div>
                        <Label htmlFor="asset_id">Asset</Label>
                        <Select
                          value={formData.asset_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, asset_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an asset" />
                          </SelectTrigger>
                          <SelectContent>
                            {(assetsForSelect?.assets || []).map(a => (
                              <SelectItem key={a.id} value={String(a.id)}>
                                {a.asset_id} • {a.asset_name}{a.serial_number ? ` (SN: ${a.serial_number})` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="title">Maintenance Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Quarterly cleaning, Hardware upgrade"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Detailed description of maintenance work"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="scheduledDate">Scheduled Date</Label>
                        <Input
                          id="scheduledDate"
                          type="datetime-local"
                          value={formData.scheduledDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsScheduleFormOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-jsc-blue hover:bg-blue-700"
                          disabled={createMaintenanceMutation.isPending}
                        >
                          Schedule
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, data.pagination.total)} of {data.pagination.total} schedules
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

      {/* Complete Maintenance Dialog */}
      <Dialog open={isCompleteFormOpen} onOpenChange={setIsCompleteFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Maintenance</DialogTitle>
            <DialogDescription>
              Mark this maintenance as completed and provide details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompleteSubmit} className="space-y-4">
            <div>
              <Label htmlFor="performedBy">Performed By</Label>
              <Input
                id="performedBy"
                value={completeFormData.performedBy}
                onChange={(e) => setCompleteFormData(prev => ({ ...prev, performedBy: e.target.value }))}
                placeholder="Name of person/team who performed maintenance"
                required
              />
            </div>
            <div>
              <Label htmlFor="cost">Cost (KES)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={completeFormData.cost}
                onChange={(e) => setCompleteFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={completeFormData.notes}
                onChange={(e) => setCompleteFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the maintenance work"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCompleteFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={completeMaintenanceMutation.isPending}
              >
                Complete Maintenance
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}