// server/utils.ts
import { Response } from 'express';

// Utility functions that are commonly needed
export const handleError = (res: Response, error: any, message = 'Internal server error') => {
  console.error('Error:', error);
  res.status(500).json({ 
    message,
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
};

export const validateRequiredFields = (body: any, requiredFields: string[]): string[] => {
  const missingFields: string[] = [];
  requiredFields.forEach(field => {
    if (!body[field] || body[field].toString().trim() === '') {
      missingFields.push(field);
    }
  });
  return missingFields;
};

// server/utils.ts - Add this function
export const formatAssetToDb = (apiAsset: any) => {
  return {
    asset_id: apiAsset.asset_id || generateAssetId(),
    asset_name: apiAsset.asset_name,
    description: apiAsset.description || null,
    category: apiAsset.category,
    serial_number: apiAsset.serial_number || '',
    model: apiAsset.model || null,
    manufacturer: apiAsset.manufacturer || null,
    purchase_date: apiAsset.purchase_date ? new Date(apiAsset.purchase_date) : null,
    purchase_cost: apiAsset.purchase_cost || null,
    warranty_expiry: apiAsset.warranty_expiry ? new Date(apiAsset.warranty_expiry) : null,
    current_location: apiAsset.current_location,
    assigned_department: apiAsset.assigned_department,
    assigned_user_id: apiAsset.assigned_user_id || null,
    status: apiAsset.status || 'active',
    condition: apiAsset.condition || 'good',
    notes: apiAsset.notes || null
  };
};

// Make sure you also have the generateAssetId function:
export const generateAssetId = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  return `JSC-${timestamp}`;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};


// Default export for backward compatibility
export default {
  handleError,
  validateRequiredFields,
  generateAssetId,
  formatDate
};