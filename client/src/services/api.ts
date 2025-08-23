// client/src/services/api.ts

export interface AssetsResponse {
  assets: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export async function fetchAssets(page?: number, limit?: number, filters?: any): Promise<AssetsResponse> {
  try {
    const token = localStorage.getItem('jsc_auth_token');
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    
    // Add filter parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const url = `/api/assets${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/login';
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to fetch assets");
    }

    const data = await res.json();
    
    // Transform the response to match what your component expects
    if (Array.isArray(data)) {
      // If backend returns just an array
      return {
        assets: data,
        pagination: {
          total: data.length,
          page: page || 1,
          limit: limit || 20,
          total_pages: Math.ceil(data.length / (limit || 20))
        }
      };
    } else if (data.assets && data.pagination) {
      // If backend returns the correct structure already
      return data;
    } else if (data.assets) {
      // If backend returns { assets: [] } without pagination
      return {
        assets: data.assets,
        pagination: {
          total: data.assets.length,
          page: page || 1,
          limit: limit || 20,
          total_pages: Math.ceil(data.assets.length / (limit || 20))
        }
      };
    } else {
      // Fallback for any other response format
      return {
        assets: [],
        pagination: {
          total: 0,
          page: page || 1,
          limit: limit || 20,
          total_pages: 0
        }
      };
    }
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
}

// Keep your existing createAsset function but update field names
export async function createAsset(asset: {
  asset_name: string;
  category: string;
  status: string;
  description?: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  current_location: string;
  assigned_department: string;
}) {
  try {
    const token = localStorage.getItem('jsc_auth_token');
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch("/api/assets", {
      method: "POST",
      headers,
      body: JSON.stringify(asset),
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/login';
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to create asset");
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating asset:", error);
    throw error;
  }
}

// Additional utility functions you might need
export async function updateAsset(id: number, updates: Partial<{
  asset_name: string;
  description: string;
  status: string;
  current_location: string;
  assigned_department: string;
}>) {
  try {
    const token = localStorage.getItem('jsc_auth_token');
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`/api/assets/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/login';
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to update asset");
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating asset:", error);
    throw error;
  }
}

export async function deleteAsset(id: number) {
  try {
    const token = localStorage.getItem('jsc_auth_token');
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`/api/assets/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/login';
        throw new Error("Unauthorized");
      }
      throw new Error("Failed to delete asset");
    }

    return await res.json();
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw error;
  }
}