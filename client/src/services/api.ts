// client/src/services/api.ts
export async function fetchAssets() {
  try {
    const token = localStorage.getItem('jsc_auth_token');
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch("/api/assets", {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      throw new Error("Failed to fetch assets");
    }

    const data = await res.json();
    return data.assets || data; // Handle both paginated and direct response
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
}

// (Optional) Add more API calls later, e.g. createAsset, updateAsset, deleteAsset
export async function createAsset(asset: {
  name: string;
  category: string;
  status: string;
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
        return;
      }
      throw new Error("Failed to create asset");
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating asset:", error);
    throw error;
  }
}
