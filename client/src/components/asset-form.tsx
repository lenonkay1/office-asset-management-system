import { useState, useEffect } from "react";
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

interface AssetFormData {
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  purchaseDate: string;
  purchaseCost: string;
  warrantyExpiry: string;
  currentLocation: string;
  assignedDepartment: string;
  condition: string;
  notes: string;
}

interface AssetFormProps {
  initialData?: Partial<AssetFormData>;
  onSubmit: (data: AssetFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  submitLabel?: string;
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

export default function AssetForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  title = "Asset Information",
  submitLabel = "Save Asset"
}: AssetFormProps) {
  const [formData, setFormData] = useState<AssetFormData>({
    ...initialFormData,
    ...initialData
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleReset = () => {
    setFormData({ ...initialFormData, ...initialData });
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {initialData ? "Update the asset information below" : "Fill in the details to register a new asset"}
        </p>
      </div>

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
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} disabled={isLoading}>
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select value={formData.condition} onValueChange={(value) => handleChange("condition", value)} disabled={isLoading}>
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
            {errors.currentLocation && (
              <p className="text-sm text-red-600 mt-1">{errors.currentLocation}</p>
            )}
          </div>

          <div>
            <Label htmlFor="assignedDepartment">Assigned Department *</Label>
            <Select value={formData.assignedDepartment} onValueChange={(value) => handleChange("assignedDepartment", value)} disabled={isLoading}>
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            className="bg-jsc-blue hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
