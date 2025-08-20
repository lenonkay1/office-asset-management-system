// import { useState } from "react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useLocation } from "wouter";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
// import { Loader2, ArrowLeft } from "lucide-react";
// import { apiRequest } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";

// interface AssetFormData {
//   name: string;
//   description: string;
//   category: string;
//   serialNumber: string;
//   model: string;
//   manufacturer: string;
//   purchaseDate: string;
//   purchaseCost: string;
//   warrantyExpiry: string;
//   currentLocation: string;
//   assignedDepartment: string;
//   condition: string;
//   notes: string;
// }

// const initialFormData: AssetFormData = {
//   name: "",
//   description: "",
//   category: "",
//   serialNumber: "",
//   model: "",
//   manufacturer: "",
//   purchaseDate: "",
//   purchaseCost: "",
//   warrantyExpiry: "",
//   currentLocation: "",
//   assignedDepartment: "",
//   condition: "good",
//   notes: ""
// };

// const categories = [
//   { value: "computers", label: "Computers & IT Equipment" },
//   { value: "printers", label: "Printers & Peripherals" },
//   { value: "furniture", label: "Office Furniture" },
//   { value: "legal_materials", label: "Legal Reference Materials" },
//   { value: "other", label: "Other Equipment" }
// ];

// const departments = [
//   { value: "legal", label: "Legal Department" },
//   { value: "it", label: "IT Department" },
//   { value: "admin", label: "Administration" },
//   { value: "finance", label: "Finance Department" },
//   { value: "hr", label: "Human Resources" },
//   { value: "registry", label: "Registry" },
//   { value: "library", label: "Law Library" }
// ];

// const conditions = [
//   { value: "excellent", label: "Excellent" },
//   { value: "good", label: "Good" },
//   { value: "fair", label: "Fair" },
//   { value: "poor", label: "Poor" }
// ];

// export default function AddAsset() {
//   const [, setLocation] = useLocation();
//   const [formData, setFormData] = useState<AssetFormData>(initialFormData);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const queryClient = useQueryClient();
//   const { toast } = useToast();

//   const createAssetMutation = useMutation({
//     mutationFn: async (data: AssetFormData) => {
//       const payload = {
//         ...data,
//         purchaseCost: data.purchaseCost ? parseFloat(data.purchaseCost) : undefined,
//         purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
//         warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
//       };
      
//       const response = await apiRequest("POST", "/api/assets", payload);
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/dashboard/categories"] });
      
//       toast({
//         title: "Asset Created",
//         description: "The asset has been successfully registered.",
//       });
      
//       setLocation("/assets");
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create asset.",
//         variant: "destructive",
//       });
//     }
//   });

//   const handleChange = (field: keyof AssetFormData, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     if (errors[field]) {
//       setErrors(prev => ({ ...prev, [field]: "" }));
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Asset name is required";
//     }

//     if (!formData.category) {
//       newErrors.category = "Category is required";
//     }

//     if (!formData.currentLocation.trim()) {
//       newErrors.currentLocation = "Location is required";
//     }

//     if (!formData.assignedDepartment) {
//       newErrors.assignedDepartment = "Department is required";
//     }

//     if (formData.purchaseCost && isNaN(parseFloat(formData.purchaseCost))) {
//       newErrors.purchaseCost = "Purchase cost must be a valid number";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     createAssetMutation.mutate(formData);
//   };

//   const handleReset = () => {
//     setFormData(initialFormData);
//     setErrors({});
//   };

//   return (
//     <div>
//       {/* Header */}
//       <div className="mb-8">
//         <div className="flex items-center space-x-4">
//           <Button
//             variant="ghost"
//             onClick={() => setLocation("/assets")}
//             className="hover:bg-gray-100"
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Assets
//           </Button>
//         </div>
//         <div className="mt-4">
//           <h2 className="text-2xl font-semibold text-gray-900">Register New Asset</h2>
//           <p className="text-gray-600 mt-1">Add a new Asset</p>
//         </div>
//       </div>

//       {/* Form */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Asset Information</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Basic Information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <Label htmlFor="name">Asset Name *</Label>
//                 <Input
//                   id="name"
//                   value={formData.name}
//                   onChange={(e) => handleChange("name", e.target.value)}
//                   placeholder="Enter asset name"
//                   className="mt-1"
//                 />
//                 {errors.name && (
//                   <p className="text-sm text-red-600 mt-1">{errors.name}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="category">Category *</Label>
//                 <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
//                   <SelectTrigger className="mt-1">
//                     <SelectValue placeholder="Select category" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {categories.map((category) => (
//                       <SelectItem key={category.value} value={category.value}>
//                         {category.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.category && (
//                   <p className="text-sm text-red-600 mt-1">{errors.category}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="serialNumber">Serial Number</Label>
//                 <Input
//                   id="serialNumber"
//                   value={formData.serialNumber}
//                   onChange={(e) => handleChange("serialNumber", e.target.value)}
//                   placeholder="Enter serial number"
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="model">Model</Label>
//                 <Input
//                   id="model"
//                   value={formData.model}
//                   onChange={(e) => handleChange("model", e.target.value)}
//                   placeholder="Enter model"
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="manufacturer">Manufacturer</Label>
//                 <Input
//                   id="manufacturer"
//                   value={formData.manufacturer}
//                   onChange={(e) => handleChange("manufacturer", e.target.value)}
//                   placeholder="Enter manufacturer"
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="condition">Condition</Label>
//                 <Select value={formData.condition} onValueChange={(value) => handleChange("condition", value)}>
//                   <SelectTrigger className="mt-1">
//                     <SelectValue placeholder="Select condition" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {conditions.map((condition) => (
//                       <SelectItem key={condition.value} value={condition.value}>
//                         {condition.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Purchase Information */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <Label htmlFor="purchaseDate">Purchase Date</Label>
//                 <Input
//                   id="purchaseDate"
//                   type="date"
//                   value={formData.purchaseDate}
//                   onChange={(e) => handleChange("purchaseDate", e.target.value)}
//                   className="mt-1"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="purchaseCost">Purchase Cost (KES)</Label>
//                 <Input
//                   id="purchaseCost"
//                   type="number"
//                   step="0.01"
//                   value={formData.purchaseCost}
//                   onChange={(e) => handleChange("purchaseCost", e.target.value)}
//                   placeholder="0.00"
//                   className="mt-1"
//                 />
//                 {errors.purchaseCost && (
//                   <p className="text-sm text-red-600 mt-1">{errors.purchaseCost}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
//                 <Input
//                   id="warrantyExpiry"
//                   type="date"
//                   value={formData.warrantyExpiry}
//                   onChange={(e) => handleChange("warrantyExpiry", e.target.value)}
//                   className="mt-1"
//                 />
//               </div>
//             </div>

//             {/* Location Information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <Label htmlFor="currentLocation">Current Location *</Label>
//                 <Input
//                   id="currentLocation"
//                   value={formData.currentLocation}
//                   onChange={(e) => handleChange("currentLocation", e.target.value)}
//                   placeholder="Room/Floor/Building"
//                   className="mt-1"
//                 />
//                 {errors.currentLocation && (
//                   <p className="text-sm text-red-600 mt-1">{errors.currentLocation}</p>
//                 )}
//               </div>

//               <div>
//                 <Label htmlFor="assignedDepartment">Assigned Department *</Label>
//                 <Select value={formData.assignedDepartment} onValueChange={(value) => handleChange("assignedDepartment", value)}>
//                   <SelectTrigger className="mt-1">
//                     <SelectValue placeholder="Select department" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {departments.map((department) => (
//                       <SelectItem key={department.value} value={department.value}>
//                         {department.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.assignedDepartment && (
//                   <p className="text-sm text-red-600 mt-1">{errors.assignedDepartment}</p>
//                 )}
//               </div>
//             </div>

//             {/* Description and Notes */}
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Textarea
//                   id="description"
//                   value={formData.description}
//                   onChange={(e) => handleChange("description", e.target.value)}
//                   placeholder="Additional details about the asset"
//                   className="mt-1"
//                   rows={3}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="notes">Notes</Label>
//                 <Textarea
//                   id="notes"
//                   value={formData.notes}
//                   onChange={(e) => handleChange("notes", e.target.value)}
//                   placeholder="Internal notes (optional)"
//                   className="mt-1"
//                   rows={2}
//                 />
//               </div>
//             </div>

//             {/* Form Actions */}
//             <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleReset}
//                 disabled={createAssetMutation.isPending}
//               >
//                 Reset Form
//               </Button>
//               <Button
//                 type="submit"
//                 className="bg-jsc-blue hover:bg-blue-700"
//                 disabled={createAssetMutation.isPending}
//               >
//                 {createAssetMutation.isPending && (
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 )}
//                 Register Asset
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AssetFormData {
  name: string;               // maps to asset_name in DB
  description: string;
  category: string;
  serialNumber: string;       // maps to serial_number
  model: string;
  manufacturer: string;
  purchaseDate: string;       // maps to purchase_date
  purchaseCost: string;       // maps to purchase_cost
  warrantyExpiry: string;     // maps to warranty_expiry
  currentLocation: string;    // maps to current_location
  assignedDepartment: string; // maps to assigned_department
  condition: string;
  notes: string;
}

const initialFormData: AssetFormData = {
  name: "",
  description: "",
  category: "",
  serialNumber: "",
  model: "",
  manufacturer: "",
  purchaseDate: "",
  purchaseCost: "",
  warrantyExpiry: "",
  currentLocation: "",
  assignedDepartment: "",
  condition: "good",
  notes: ""
};

const categories = [
  { value: "computers", label: "Computers & IT Equipment" },
  { value: "printers", label: "Printers & Peripherals" },
  { value: "furniture", label: "Office Furniture" },
  { value: "legal_materials", label: "Legal Reference Materials" },
  { value: "other", label: "Other Equipment" }
];

const departments = [
  { value: "legal", label: "Legal Department" },
  { value: "it", label: "IT Department" },
  { value: "admin", label: "Administration" },
  { value: "finance", label: "Finance Department" },
  { value: "hr", label: "Human Resources" },
  { value: "registry", label: "Registry" },
  { value: "library", label: "Law Library" }
];

const conditions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" }
];

export default function AddAsset() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<AssetFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      // ✅ remap fields to match DB columns
      const payload = {
        asset_name: data.name,
        description: data.description,
        category: data.category,
        serial_number: data.serialNumber,
        model: data.model,
        manufacturer: data.manufacturer,
        purchase_date: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        purchase_cost: data.purchaseCost ? parseFloat(data.purchaseCost) : undefined,
        warranty_expiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : undefined,
        current_location: data.currentLocation,
        assigned_department: data.assignedDepartment,
        condition: data.condition,
        notes: data.notes,
      };

      const response = await apiRequest("POST", "/api/assets", payload);
      return response; // not response.json()

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/categories"] });

      toast({
        title: "Asset Created",
        description: "The asset has been successfully registered.",
      });

      setLocation("/assets");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create asset.",
        variant: "destructive",
      });
    }
  });

  const handleChange = (field: keyof AssetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Asset name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.currentLocation.trim()) {
      newErrors.currentLocation = "Location is required";
    }

    if (!formData.assignedDepartment) {
      newErrors.assignedDepartment = "Department is required";
    }

    if (formData.purchaseCost && isNaN(parseFloat(formData.purchaseCost))) {
      newErrors.purchaseCost = "Purchase cost must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createAssetMutation.mutate(formData);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/assets")}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
        </div>
        <div className="mt-4">
          <h2 className="text-2xl font-semibold text-gray-900">Register New Asset</h2>
          <p className="text-gray-600 mt-1">Add a new Asset</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Asset Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter asset name"
                  className="mt-1"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange("serialNumber", e.target.value)}
                  placeholder="Enter serial number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleChange("model", e.target.value)}
                  placeholder="Enter model"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleChange("manufacturer", e.target.value)}
                  placeholder="Enter manufacturer"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => handleChange("condition", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Purchase Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleChange("purchaseDate", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="purchaseCost">Purchase Cost (KES)</Label>
                <Input
                  id="purchaseCost"
                  type="number"
                  step="0.01"
                  value={formData.purchaseCost}
                  onChange={(e) => handleChange("purchaseCost", e.target.value)}
                  placeholder="0.00"
                  className="mt-1"
                />
                {errors.purchaseCost && (
                  <p className="text-sm text-red-600 mt-1">{errors.purchaseCost}</p>
                )}
              </div>

              <div>
                <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                <Input
                  id="warrantyExpiry"
                  type="date"
                  value={formData.warrantyExpiry}
                  onChange={(e) => handleChange("warrantyExpiry", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="currentLocation">Current Location *</Label>
                <Input
                  id="currentLocation"
                  value={formData.currentLocation}
                  onChange={(e) => handleChange("currentLocation", e.target.value)}
                  placeholder="Room/Floor/Building"
                  className="mt-1"
                />
                {errors.currentLocation && (
                  <p className="text-sm text-red-600 mt-1">{errors.currentLocation}</p>
                )}
              </div>

              <div>
                <Label htmlFor="assignedDepartment">Assigned Department *</Label>
                <Select
                  value={formData.assignedDepartment}
                  onValueChange={(value) => handleChange("assignedDepartment", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.value} value={department.value}>
                        {department.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignedDepartment && (
                  <p className="text-sm text-red-600 mt-1">{errors.assignedDepartment}</p>
                )}
              </div>
            </div>

            {/* Description and Notes */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Additional details about the asset"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Internal notes (optional)"
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={createAssetMutation.isPending}
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                className="bg-jsc-blue hover:bg-blue-700"
                disabled={createAssetMutation.isPending}
              >
                {createAssetMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Register Asset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
