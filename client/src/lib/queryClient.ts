import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Enhanced error handling
async function throwIfResNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || JSON.stringify(errorData);
    } catch {
      try {
        errorMessage = await res.text();
      } catch {
        // Use default statusText
      }
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

// Auth headers with type safety
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('jsc_auth_token');
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add content type only when needed (added in apiRequest when body exists)
  return headers;
}

// Enhanced API request function
export async function apiRequest<T = unknown>(
  method: string,
  url: string,
  data?: unknown,
): Promise<T> {
  const headers = getAuthHeaders();
  const config: RequestInit = {
    method,
    headers,
    credentials: 'include', // For cookies if using them
  };

  if (data) {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(data);
  }

  const res = await fetch(url, config);
  await throwIfResNotOk(res);
  return res.json();
}



// Update the QueryFnOptions and createQueryFn
type QueryFnOptions = {
  unauthorizedBehavior?: "returnNull" | "throw"; // Made optional with ?
};

export const createQueryFn = <T>(options: QueryFnOptions = {}): QueryFunction<T> => {
  const { unauthorizedBehavior = "throw" } = options; // Default value
  
  return async ({ queryKey, signal }) => {
    const url = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    
    if (typeof url !== 'string') {
      throw new Error('Query key must be a string or array with string as first element');
    }

    const res = await fetch(url, {
      headers: getAuthHeaders(),
      signal
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null as T;
    }

    await throwIfResNotOk(res);
    return res.json() as Promise<T>;
  };
};

// Configured query client with better defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: createQueryFn(), // Now works without parameters
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.startsWith('401:')) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// Utility functions for common operations
export const QueryUtils = {
  fetchWithAuth: async <T>(url: string): Promise<T> => {
    const res = await fetch(url, { headers: getAuthHeaders() });
    await throwIfResNotOk(res);
    return res.json();
  },
  
  postWithAuth: async <T>(url: string, data: unknown): Promise<T> => {
    return apiRequest<T>('POST', url, data);
  },
  
  putWithAuth: async <T>(url: string, data: unknown): Promise<T> => {
    return apiRequest<T>('PUT', url, data);
  },
  
  deleteWithAuth: async (url: string): Promise<void> => {
    await apiRequest('DELETE', url);
  }
};