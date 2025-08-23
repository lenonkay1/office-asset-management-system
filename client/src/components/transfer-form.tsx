// import { useState, useEffect } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2, Search } from "lucide-react";
// import { apiRequest } from "@/lib/queryClient";
// import { authService } from "@/lib/auth";
// import { useToast } from "@/hooks/use-toast";

// interface Asset {
//   id: number;
//   assetId: string;
//   name: string;
//   currentLocation: string;
//   assignedDepartment: string;
//   status: string;
// }

// interface TransferFormData {
//   assetId: number;
//   toDepartment: string;
//   toLocation: string;
//   reason: string;
// }

// interface TransferFormProps {
//   onSuccess: () => void;
//   onCancel?: () => void;
// }

// const departments = [
//   { value: "legal", label: "Legal Department" },
//   { value: "it", label: "IT Department" },
//   { value: "admin", label: "Administration" },
//   { value: "finance", label: "Finance Department" },
//   { value: "hr", label: "Human Resources" },
//   { value: "registry", label: "Registry" },
//   { value: "library", label: "Law Library" }
// ];

// export default function TransferForm({ onSuccess, onCancel }: TransferFormProps) {
//   const [formData, setFormData] = useState<TransferFormData>({
//     assetId: 0,
//     toDepartment: "",
//     toLocation: "",
//     reason: ""
//   });
//   const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
//   const [assetSearch, setAssetSearch] = useState("");
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const { toast } = useToast();
//   const user = authService.getUser();

//   const { data: assets, isLoading: assetsLoading } = useQuery<Asset[]>({
//     queryKey: ["/api/assets/search", { q: assetSearch }],
//     enabled: assetSearch.length >= 2,
//   });

//   const createTransferMutation = useMutation({
//     mutationFn: async (data: TransferFormData) => {
//       if (!selectedAsset) throw new Error("No asset selected");
      
//       const payload = {
//         assetId: data.assetId,
//         fromDepartment: selectedAsset.assignedDepartment,
//         toDepartment: data.toDepartment,
//         fromLocation: selectedAsset.currentLocation,
//         toLocation: data.toLocation,
//         reason: data.reason
//       };
      
//       const response = await apiRequest("POST", "/api/transfers", payload);
//       return response.json();
//     },
//     onSuccess: () => {
//       toast({
//         title: "Transfer Requested",
//         description: "The asset transfer request has been submitted successfully.",
//       });
//       onSuccess();
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create transfer request.",
//         variant: "destructive",
//       });
//     }
//   });

//   const handleChange = (field: keyof TransferFormData, value: string | number) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: "" }));
//     }
//   };

//   const handleAssetSelect = (asset: Asset) => {
//     setSelectedAsset(asset);
//     setFormData(prev => ({ ...prev, assetId: asset.id }));
//     setAssetSearch(`${asset.assetId} - ${asset.name}`);
//     if (errors.assetId) {
//       setErrors(prev => ({ ...prev, assetId: "" }));
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};

//     if (!selectedAsset) {
//       newErrors.assetId = "Please select an asset";
//     }

//     if (!formData.toDepartment) {
//       newErrors.toDepartment = "Destination department is required";
//     }

//     if (!formData.toLocation.trim()) {
//       newErrors.toLocation = "Destination location is required";
//     }

//     if (!formData.reason.trim()) {
//       newErrors.reason = "Transfer reason is required";
//     }

//     if (selectedAsset && formData.toDepartment === selectedAsset.assignedDepartment) {
//       newErrors.toDepartment = "Cannot transfer to the same department";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     createTransferMutation.mutate(formData);
//   };

//   const getDepartmentLabel = (value: string) => {
//     const dept = departments.find(d => d.value === value);
//     return dept ? dept.label : value;
//   };

//   return (
//     <div className="space-y-6">
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Asset Selection */}
//         <div>
//           <Label htmlFor="assetSearch">Select Asset *</Label>
//           <div className="relative mt-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
//             <Input
//               id="assetSearch"
//               value={assetSearch}
//               onChange={(e) => setAssetSearch(e.target.value)}
//               placeholder="Search by asset ID or name..."
//               className="pl-10"
//               disabled={createTransferMutation.isPending}
//             />
//           </div>
          
//           {/* Asset Search Results */}
//           {assetSearch.length >= 2 && assets && assets.length > 0 && !selectedAsset && (
//             <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
//               {assets.map((asset) => (
//                 <div
//                   key={asset.id}
//                   onClick={() => handleAssetSelect(asset)}
//                   className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
//                 >
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <p className="font-medium text-gray-900">{asset.assetId} - {asset.name}</p>
//                       <p className="text-sm text-gray-600">
//                         {getDepartmentLabel(asset.assignedDepartment)} • {asset.currentLocation}
//                       </p>
//                     </div>
//                     <span className={`text-xs px-2 py-1 rounded-full ${
//                       asset.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
//                     }`}>
//                       {asset.status}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {assetSearch.length >= 2 && assets && assets.length === 0 && !assetsLoading && (
//             <p className="text-sm text-gray-600 mt-2">No assets found matching your search.</p>
//           )}

//           {errors.assetId && (
//             <p className="text-sm text-red-600 mt-1">{errors.assetId}</p>
//           )}
//         </div>

//         {/* Current Asset Info */}
//         {selectedAsset && (
//           <div className="bg-blue-50 p-4 rounded-lg">
//             <h4 className="font-medium text-gray-900 mb-2">Selected Asset</h4>
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <span className="text-gray-600">Asset ID:</span>
//                 <span className="ml-2 font-medium">{selectedAsset.assetId}</span>
//               </div>
//               <div>
//                 <span className="text-gray-600">Name:</span>
//                 <span className="ml-2 font-medium">{selectedAsset.name}</span>
//               </div>
//               <div>
//                 <span className="text-gray-600">Current Department:</span>
//                 <span className="ml-2 font-medium">{getDepartmentLabel(selectedAsset.assignedDepartment)}</span>
//               </div>
//               <div>
//                 <span className="text-gray-600">Current Location:</span>
//                 <span className="ml-2 font-medium">{selectedAsset.currentLocation}</span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Transfer Details */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <Label htmlFor="toDepartment">Destination Department *</Label>
//             <Select
//               value={formData.toDepartment}
//               onValueChange={(value) => handleChange("toDepartment", value)}
//               disabled={createTransferMutation.isPending}
//             >
//               <SelectTrigger className="mt-1">
//                 <SelectValue placeholder="Select destination department" />
//               </SelectTrigger>
//               <SelectContent>
//                 {departments.map((department) => (
//                   <SelectItem
//                     key={department.value}
//                     value={department.value}
//                     disabled={selectedAsset?.assignedDepartment === department.value}
//                   >
//                     {department.label}
//                     {selectedAsset?.assignedDepartment === department.value && " (Current)"}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {errors.toDepartment && (
//               <p className="text-sm text-red-600 mt-1">{errors.toDepartment}</p>
//             )}
//           </div>

//           <div>
//             <Label htmlFor="toLocation">Destination Location *</Label>
//             <Input
//               id="toLocation"
//               value={formData.toLocation}
//               onChange={(e) => handleChange("toLocation", e.target.value)}
//               placeholder="Room/Floor/Building"
//               className="mt-1"
//               disabled={createTransferMutation.isPending}
//             />
//             {errors.toLocation && (
//               <p className="text-sm text-red-600 mt-1">{errors.toLocation}</p>
//             )}
//           </div>
//         </div>

//         {/* Reason */}
//         <div>
//           <Label htmlFor="reason">Reason for Transfer *</Label>
//           <Textarea
//             id="reason"
//             value={formData.reason}
//             onChange={(e) => handleChange("reason", e.target.value)}
//             placeholder="Please provide a reason for this transfer request..."
//             className="mt-1"
//             rows={3}
//             disabled={createTransferMutation.isPending}
//           />
//           {errors.reason && (
//             <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
//           )}
//         </div>

//         {/* Note */}
//         <Alert>
//           <AlertDescription>
//             Transfer requests require approval from an asset manager or department head before the asset can be moved.
//           </AlertDescription>
//         </Alert>

//         {/* Form Actions */}
//         <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
//           {onCancel && (
//             <Button
//               type="button"
//               variant="outline"
//               onClick={onCancel}
//               disabled={createTransferMutation.isPending}
//             >
//               Cancel
//             </Button>
//           )}
//           <Button
//             type="submit"
//             className="bg-jsc-blue hover:bg-blue-700"
//             disabled={createTransferMutation.isPending}
//           >
//             {createTransferMutation.isPending && (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             )}
//             Submit Transfer Request
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }


import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { QueryUtils } from "@/lib/queryClient";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: number;
  asset_id: string;
  asset_name: string;
  current_location: string;
  assigned_department: string;
  status: string;
  serial_number?: string;
  model?: string;
}

interface TransferFormData {
  asset_id: number; // Changed from assetId
  toDepartment: string;
  toLocation: string;
  reason: string;
}

interface TransferFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

const departments = [
  { value: "legal", label: "Legal Department" },
  { value: "it", label: "IT Department" },
  { value: "admin", label: "Administration" },
  { value: "finance", label: "Finance Department" },
  { value: "hr", label: "Human Resources" },
  { value: "registry", label: "Registry" },
  { value: "library", label: "Law Library" }
];

export default function TransferForm({ onSuccess, onCancel }: TransferFormProps) {
  const [formData, setFormData] = useState<TransferFormData>({
    asset_id: 0, // Changed from assetId
    toDepartment: "",
    toLocation: "",
    reason: ""
  });
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetSearch, setAssetSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const user = authService.getUser();

  // Load assets for dropdown selection
  const { data: assetsForSelect } = useQuery<{ assets: Asset[] }>({
    queryKey: ["/api/assets?limit=1000"],
    queryFn: async () => QueryUtils.fetchWithAuth<{ assets: Asset[] }>("/api/assets?limit=1000"),
  });

  const createTransferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      if (!selectedAsset) throw new Error("No asset selected");
      
      const payload = {
        asset_id: data.asset_id, // Changed from assetId
        fromDepartment: selectedAsset.assigned_department,
        toDepartment: data.toDepartment,
        fromLocation: selectedAsset.current_location,
        toLocation: data.toLocation,
        reason: data.reason,
        requestedById: user?.id
      };
      
      return apiRequest("POST", "/api/transfers", payload);
    },
    onSuccess: () => {
      toast({
        title: "Transfer Requested",
        description: "The asset transfer request has been submitted successfully.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create transfer request.",
        variant: "destructive",
      });
    }
  });

  const handleChange = (field: keyof TransferFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData(prev => ({ ...prev, asset_id: asset.id })); // Changed from assetId
    setAssetSearch(`${asset.asset_id} - ${asset.asset_name}`);
    if (errors.asset_id) { // Changed from assetId
      setErrors(prev => ({ ...prev, asset_id: "" })); // Changed from assetId
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedAsset) {
      newErrors.asset_id = "Please select an asset"; // Changed from assetId
    }

    if (!formData.toDepartment) {
      newErrors.toDepartment = "Destination department is required";
    }

    if (!formData.toLocation.trim()) {
      newErrors.toLocation = "Destination location is required";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Transfer reason is required";
    }

    if (selectedAsset && formData.toDepartment === selectedAsset.assigned_department) {
      newErrors.toDepartment = "Cannot transfer to the same department";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    createTransferMutation.mutate(formData);
  };

  const getDepartmentLabel = (value: string) => {
    const dept = departments.find(d => d.value === value);
    return dept ? dept.label : value;
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Asset Selection (Dropdown) */}
        <div>
          <Label htmlFor="assetSelect">Select Asset *</Label>
          <Select
            value={formData.asset_id ? String(formData.asset_id) : ""}
            onValueChange={(value) => {
              const id = parseInt(value, 10);
              const asset = (assetsForSelect?.assets || []).find(a => a.id === id) || null;
              if (asset) {
                handleAssetSelect(asset);
              }
            }}
            disabled={createTransferMutation.isPending}
          >
            <SelectTrigger id="assetSelect" className="mt-1">
              <SelectValue placeholder="Select an asset" />
            </SelectTrigger>
            <SelectContent>
              {(assetsForSelect?.assets || []).map((asset) => (
                <SelectItem key={asset.id} value={String(asset.id)}>
                  {asset.asset_id} • {asset.asset_name}{asset.serial_number ? ` (SN: ${asset.serial_number})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.asset_id && (
            <p className="text-sm text-red-600 mt-1">{errors.asset_id}</p>
          )}
        </div>

        {/* Current Asset Info */}
        {selectedAsset && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Selected Asset</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Asset ID:</span>
                <span className="ml-2 font-medium">{selectedAsset.asset_id}</span>
              </div>
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{selectedAsset.asset_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Serial Number:</span>
                <span className="ml-2 font-medium">{selectedAsset.serial_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Model:</span>
                <span className="ml-2 font-medium">{selectedAsset.model || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Department:</span>
                <span className="ml-2 font-medium">{getDepartmentLabel(selectedAsset.assigned_department)}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Location:</span>
                <span className="ml-2 font-medium">{selectedAsset.current_location}</span>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="toDepartment">Destination Department *</Label>
            <Select
              value={formData.toDepartment}
              onValueChange={(value) => handleChange("toDepartment", value)}
              disabled={createTransferMutation.isPending}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select destination department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem
                    key={department.value}
                    value={department.value}
                    disabled={selectedAsset?.assigned_department === department.value}
                  >
                    {department.label}
                    {selectedAsset?.assigned_department === department.value && " (Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.toDepartment && (
              <p className="text-sm text-red-600 mt-1">{errors.toDepartment}</p>
            )}
          </div>

          <div>
            <Label htmlFor="toLocation">Destination Location *</Label>
            <Input
              id="toLocation"
              value={formData.toLocation}
              onChange={(e) => handleChange("toLocation", e.target.value)}
              placeholder="Room/Floor/Building"
              className="mt-1"
              disabled={createTransferMutation.isPending}
            />
            {errors.toLocation && (
              <p className="text-sm text-red-600 mt-1">{errors.toLocation}</p>
            )}
          </div>
        </div>

        {/* Reason */}
        <div>
          <Label htmlFor="reason">Reason for Transfer *</Label>
          <Textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            placeholder="Please provide a reason for this transfer request..."
            className="mt-1"
            rows={3}
            disabled={createTransferMutation.isPending}
          />
          {errors.reason && (
            <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
          )}
        </div>

        {/* Note */}
        <Alert>
          <AlertDescription>
            Transfer requests require approval from an asset manager or department head before the asset can be moved.
          </AlertDescription>
        </Alert>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={createTransferMutation.isPending}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="bg-jsc-blue hover:bg-blue-700"
            disabled={createTransferMutation.isPending}
          >
            {createTransferMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Transfer Request
          </Button>
        </div>
      </form>
    </div>
  );
}