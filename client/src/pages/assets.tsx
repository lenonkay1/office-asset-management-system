import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { QueryUtils } from "../lib/queryClient";

type Asset = {
  id: number;
  asset_id: string;
  asset_name: string;
  description: string | null;
  category: string;
  serial_number: string;
  model: string | null;
  manufacturer: string | null;
  current_location: string;
  assigned_department: string;
  assigned_user_id: number | null;
  status: string;
  condition: string | null;
  created_at: string;
  updated_at: string;
  next_maintenance_date?: string | null;
  last_transfer_at?: string | null;
};

// In your fetchAssets function - use full URL
const fetchAssets = async (): Promise<Asset[]> => {
  const response = await fetch("http://localhost:5000/api/assets", { // ← Add full URL
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jsc_auth_token')}`
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", response.status, response.statusText, errorText);
    throw new Error(`Failed to fetch assets: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.assets || data; // Handle both response formats
};

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyAsset, setHistoryAsset] = useState<Asset | null>(null);

  const {
    data: assets,
    isLoading,
    error,
  } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: fetchAssets,
  });

  // Filtered assets based on search + category + status
  const filteredAssets = assets?.filter((asset) => {
    const matchesSearch =
      asset.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      asset.asset_id.toLowerCase().includes(search.toLowerCase()) ||
      asset.serial_number.toLowerCase().includes(search.toLowerCase()) ||
      asset.current_location.toLowerCase().includes(search.toLowerCase()) ||
      asset.assigned_department.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || asset.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" || asset.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "maintenance":
        return "secondary";
      case "retired":
        return "destructive";
      case "disposed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      computers: "Computers",
      printers: "Printers", 
      furniture: "Furniture",
      legal_materials: "Legal Materials",
      other: "Other"
    };
    return categoryMap[category] || category.replaceAll("_", " ");
  };

  // Load transfer history when dialog is open and an asset is selected
  const { data: historyItems } = useQuery({
    queryKey: ["/api/transfers/asset", historyAsset?.id],
    queryFn: async () => {
      if (!historyAsset) return [];
      return QueryUtils.fetchWithAuth(`/api/transfers/asset/${historyAsset.id}?limit=50`);
    },
    enabled: historyOpen && !!historyAsset?.id,
  });

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Assets Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 flex-wrap">
            <Input
              placeholder="Search by name, ID, serial, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {assets &&
                  Array.from(new Set(assets.map((a) => a.category))).map(
                    (cat) => (
                      <SelectItem key={cat} value={cat}>
                        {formatCategoryName(cat)}
                      </SelectItem>
                    )
                  )}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Serial #</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : error ? (
            <p className="text-red-500">Error fetching assets: {error.message}</p>
          ) : filteredAssets && filteredAssets.length === 0 ? (
            <p className="text-gray-500">No assets found matching your criteria</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Serial #</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets?.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">
                      {asset.asset_id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {asset.asset_name}
                      {asset.model && (
                        <div className="text-xs text-gray-500 mt-1">
                          {asset.manufacturer} {asset.model}
                        </div>
                      )}
                      {asset.status === 'maintenance' && asset.next_maintenance_date && (
                        <div className="text-xs text-orange-600 mt-1">
                          Scheduled: {new Date(asset.next_maintenance_date).toLocaleString()}
                        </div>
                      )}
                      {asset.last_transfer_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          Last moved: {new Date(asset.last_transfer_at).toLocaleDateString()}
                        </div>
                      )}
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setHistoryAsset(asset);
                            setHistoryOpen(true);
                          }}
                        >
                          View history
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {asset.serial_number || "N/A"}
                    </TableCell>
                    <TableCell>
                      {formatCategoryName(asset.category)}
                    </TableCell>
                    <TableCell>{asset.current_location}</TableCell>
                    <TableCell>{asset.assigned_department}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(asset.status)}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer History</DialogTitle>
            <DialogDescription>
              {historyAsset ? `${historyAsset.asset_id} • ${historyAsset.asset_name}` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {!historyItems || (Array.isArray(historyItems) && historyItems.length === 0) ? (
              <p className="text-sm text-gray-600">No transfer history found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From Dept</TableHead>
                    <TableHead>To Dept</TableHead>
                    <TableHead>From Loc</TableHead>
                    <TableHead>To Loc</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(historyItems as any[]).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="capitalize">{item.from_department || '-'}</TableCell>
                      <TableCell className="capitalize">{item.to_department || '-'}</TableCell>
                      <TableCell>{item.from_location || '-'}</TableCell>
                      <TableCell>{item.to_location || '-'}</TableCell>
                      <TableCell className="capitalize">{item.status}</TableCell>
                      <TableCell>{new Date(item.completed_at || item.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
