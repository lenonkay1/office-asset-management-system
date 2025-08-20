import { queryClient } from "./queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

class AuthService {
  private tokenKey = "jsc_auth_token";
  private userKey = "jsc_user";

  // === Token Management ===
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // === User Management ===
  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log("AuthService: Token =", token ? "exists" : "missing");
    return !!token;
  }

  hasRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  }

  // === Auth Actions ===
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Login failed");
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.token);
    this.setUser(data.user);

    return data;
  }

  async register(userData: any): Promise<User> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();
    return data.user;
  }

  logout(): void {
    this.removeToken();
    queryClient.clear();
    window.location.href = "/login";
  }

  // === Fetch Current User ===
  async getCurrentUser(): Promise<User | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
        }
        return null;
      }

      const data = await response.json();
      this.setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  // === Generic Authenticated Fetch ===
  async authFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    return response.json();
  }
}

export const authService = new AuthService();
export type { User, AuthResponse };
