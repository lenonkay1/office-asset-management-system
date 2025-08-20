import { useQuery } from "@tanstack/react-query";
import { fetchAssets } from "@/services/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Asset {
  id: number;
  asset_id: string;
  asset_name: string;
  description?: string;
  category: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  purchase_date?: string;
  purchase_cost?: number;
  warranty_expiry?: string;
  current_location: string;
  assigned_department: string;
  assigned_user_id?: number;
  status: string;
  condition: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

function AssetsPage() {
  const { data, isLoading, error } = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: fetchAssets,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">Error loading assets</p>;
  }

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Assets</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Condition</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-mono text-sm">{asset.asset_id}</TableCell>
                  <TableCell className="font-medium">{asset.asset_name}</TableCell>
                  <TableCell className="capitalize">{asset.category.replace('_', ' ')}</TableCell>
                  <TableCell>{asset.current_location}</TableCell>
                  <TableCell>
                    <Badge variant={asset.status === "active" ? "default" : "secondary"}>
                      {asset.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {asset.condition}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No assets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default AssetsPage;