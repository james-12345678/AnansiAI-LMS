import { apiWithFallback } from "./apiWithFallback";
import type { AuthResponse, User } from "./api";
import { apiClient } from "./api";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  userRole: string | null;
  schoolId: string | null;
  loading: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    userRole: null,
    schoolId: null,
    loading: false,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    const token = localStorage.getItem("anansi_token");
    const userRole = localStorage.getItem("userRole");
    const schoolId = localStorage.getItem("schoolId");
    const userData = localStorage.getItem("userData");

    if (token && userRole) {
      this.state = {
        isAuthenticated: true,
        user: userData ? JSON.parse(userData) : null,
        userRole,
        schoolId,
        loading: false,
      };
    }
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState(): AuthState {
    return { ...this.state };
  }

  async schoolLogin(userId: string, password: string) {
    try {
      this.state.loading = true;
      this.notifyListeners();

      const response = await apiWithFallback.login(userId, password);

      if (response.success) {
        const { user, school } = response.data;

        this.state = {
          isAuthenticated: true,
          user,
          userRole: user.role.toUpperCase(),
          schoolId: school?.id || user.schoolId,
          loading: false,
        };

        // Store in localStorage
        localStorage.setItem("userData", JSON.stringify(user));
        localStorage.setItem("userRole", user.role.toUpperCase());
        if (school) {
          localStorage.setItem("schoolId", school.id);
          localStorage.setItem("schoolData", JSON.stringify(school));
        }

        this.notifyListeners();
        return { success: true, user, school };
      } else {
        this.state.loading = false;
        this.notifyListeners();
        return { success: false, error: response.error || "Login failed" };
      }
    } catch (error) {
      this.state.loading = false;
      this.notifyListeners();
      return { success: false, error: "Network error occurred" };
    }
  }

  async superAdminLogin(loginId: string, password: string) {
    try {
      this.state.loading = true;
      this.notifyListeners();

      const response = await apiWithFallback.superAdminLogin(loginId, password);

      if (response.success) {
        const { user } = response.data;

        this.state = {
          isAuthenticated: true,
          user,
          userRole: "SUPER_ADMIN",
          schoolId: null,
          loading: false,
        };

        // Store in localStorage
        localStorage.setItem("userData", JSON.stringify(user));
        localStorage.setItem("userRole", "SUPER_ADMIN");
        localStorage.setItem("superAdminId", user.id);

        this.notifyListeners();
        return { success: true, user };
      } else {
        this.state.loading = false;
        this.notifyListeners();
        return { success: false, error: response.error || "Login failed" };
      }
    } catch (error) {
      this.state.loading = false;
      this.notifyListeners();
      return { success: false, error: "Network error occurred" };
    }
  }

  logout() {
    // Clear API client token
    apiClient.logout();

    // Clear all localStorage
    localStorage.removeItem("anansi_token");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("schoolId");
    localStorage.removeItem("schoolData");
    localStorage.removeItem("superAdminId");

    // Reset state
    this.state = {
      isAuthenticated: false,
      user: null,
      userRole: null,
      schoolId: null,
      loading: false,
    };

    this.notifyListeners();
  }

  async resetPassword(email: string) {
    try {
      const response = await apiWithFallback.resetPassword(email);
      return response;
    } catch (error) {
      return { success: false, error: "Failed to send reset email" };
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await apiClient.changePassword(
        currentPassword,
        newPassword,
      );
      return response;
    } catch (error) {
      return { success: false, error: "Failed to change password" };
    }
  }

  getRedirectPath(): string {
    const { userRole } = this.state;

    switch (userRole) {
      case "SUPER_ADMIN":
        return "/super-admin-dashboard";
      case "ADMIN":
        return "/admin-dashboard";
      case "TEACHER":
        return "/teacher-dashboard";
      case "STUDENT":
        return "/student-dashboard";
      default:
        return "/login";
    }
  }
}

export const authService = AuthService.getInstance();
