// AnansiAI Platform API Service Layer

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/anansiai";

const IS_DEVELOPMENT =
  import.meta.env.VITE_ENVIRONMENT === "development" || import.meta.env.DEV;

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  county: string;
  subcounty: string;
  ward: string;
  students: number;
  teachers: number;
  status: "active" | "maintenance" | "inactive" | "pending";
  performance: number;
  aiAccuracy: number;
  lastSync: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  establishedYear: number;
  type: "primary" | "secondary" | "mixed";
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin" | "superadmin";
  schoolId: string;
  status: "active" | "inactive" | "suspended";
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student extends User {
  role: "student";
  grade: string;
  overallProgress: number;
  courses: string[];
}

export interface Teacher extends User {
  role: "teacher";
  subjects: string[];
  classes: string[];
}

export interface AdminUser extends User {
  role: "admin";
  permissions: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
  school?: School;
}

export interface SystemStats {
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  avgPerformance: number;
  systemUptime: number;
  dataStorage: number;
  activeUsers: number;
  dailyLogins: number;
}

export interface SystemAlert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  school?: string;
  time: string;
  priority: "high" | "medium" | "low";
  actionRequired: boolean;
}

export interface Notification {
  id: string;
  type: "system" | "school" | "performance" | "security" | "maintenance";
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: "high" | "medium" | "low";
}

export interface SuperAdminInfo {
  name: string;
  id: string;
  role: string;
  avatar?: string;
  lastLogin: string;
  region: string;
  permissions: string[];
}

// API Client Class
class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("anansi_token");

    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 45000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add authorization token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        console.error(`API Error (${error.config?.url}):`, error);

        // Handle authentication errors
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = "/login";
        }

        return Promise.reject(error);
      },
    );
  }

  private async request<T>(
    endpoint: string,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.request<ApiResponse<T>>({
        url: endpoint,
        ...config,
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      // In development, provide helpful error messages
      if (IS_DEVELOPMENT && !axiosError.response) {
        console.warn(
          `🚧 Development Mode: API server not available at ${API_BASE_URL}`,
        );
        console.warn(
          "💡 Tip: Start your backend API server or use mock data fallback",
        );

        throw new Error(
          `API server unavailable at ${API_BASE_URL}. ` +
            `Please start your backend server or check the VITE_API_URL environment variable.`,
        );
      }

      // Handle network errors (no response from server)
      if (!axiosError.response) {
        throw new Error("Network error - server may be unavailable");
      }

      // Handle HTTP error responses
      const errorData = axiosError.response.data as any;
      throw new Error(
        errorData?.message ||
          errorData?.error ||
          `HTTP error! status: ${axiosError.response.status}`,
      );
    }
  }

  // Authentication Methods
  async login(
    userId: string,
    password: string,
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>("/Auth/login", {
      method: "POST",
      data: { email: userId, password },
    });

    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem("anansi_token", this.token);

      // Update axios instance with new token
      this.axiosInstance.defaults.headers.Authorization = `Bearer ${this.token}`;
    }

    return response;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem("anansi_token");

    // Remove authorization header from axios instance
    delete this.axiosInstance.defaults.headers.Authorization;
  }

  // School Management Methods (Super Admin)
  async getSchools(): Promise<ApiResponse<School[]>> {
    return this.request<School[]>("/schools");
  }

  async getSchool(schoolId: string): Promise<ApiResponse<School>> {
    return this.request<School>(`/schools/${schoolId}`);
  }

  async createSchool(
    schoolData: Partial<School>,
  ): Promise<ApiResponse<School>> {
    return this.request<School>("/schools", {
      method: "POST",
      data: schoolData,
    });
  }

  async updateSchool(
    schoolId: string,
    updates: Partial<School>,
  ): Promise<ApiResponse<School>> {
    return this.request<School>(`/schools/${schoolId}`, {
      method: "PUT",
      data: updates,
    });
  }

  async deleteSchool(
    schoolId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/schools/${schoolId}`, {
      method: "DELETE",
    });
  }

  // User Management Methods
  async getUsers(schoolId?: string): Promise<ApiResponse<User[]>> {
    const endpoint = schoolId ? `/schools/${schoolId}/users` : "/users";
    return this.request<User[]>(endpoint);
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`);
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>("/users", {
      method: "POST",
      data: userData,
    });
  }

  async updateUser(
    userId: string,
    updates: Partial<User>,
  ): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`, {
      method: "PUT",
      data: updates,
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/users/${userId}`, {
      method: "DELETE",
    });
  }

  // Student-specific Methods
  async getStudents(schoolId: string): Promise<ApiResponse<Student[]>> {
    return this.request<Student[]>(`/schools/${schoolId}/students`);
  }

  async getStudentProgress(studentId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/students/${studentId}/progress`);
  }

  // Student Dashboard Methods
  async getStudentDashboard(): Promise<ApiResponse<any>> {
    return this.request<any>("/students/dashboard");
  }

  async getCourseLessons(courseId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/students/courses/${courseId}/lessons`);
  }

  async getCourseDiscussion(courseId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/students/courses/${courseId}/discussion`);
  }

  async markNotificationAsRead(
    notificationId: string,
  ): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(
      `/students/notifications/${notificationId}/read`,
      {
        method: "POST",
      },
    );
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<boolean>> {
    return this.request<boolean>("/students/notifications/read-all", {
      method: "POST",
    });
  }

  // Teacher-specific Methods
  async getTeachers(schoolId: string): Promise<ApiResponse<Teacher[]>> {
    return this.request<Teacher[]>(`/schools/${schoolId}/teachers`);
  }

  async getTeacherClasses(teacherId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/teachers/${teacherId}/classes`);
  }

  // Analytics Methods
  async getSchoolAnalytics(schoolId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/schools/${schoolId}/analytics`);
  }

  async getPlatformAnalytics(): Promise<ApiResponse<any>> {
    return this.request<any>("/analytics/platform");
  }

  // AI Management Methods
  async getAIOverrides(schoolId?: string): Promise<ApiResponse<any[]>> {
    const endpoint = schoolId
      ? `/schools/${schoolId}/ai-overrides`
      : "/ai-overrides";
    return this.request<any[]>(endpoint);
  }

  async approveAIOverride(
    overrideId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      `/ai-overrides/${overrideId}/approve`,
      {
        method: "POST",
      },
    );
  }

  async rejectAIOverride(
    overrideId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      `/ai-overrides/${overrideId}/reject`,
      {
        method: "POST",
      },
    );
  }

  // System Health Methods
  async getSystemStatus(): Promise<ApiResponse<any>> {
    return this.request<any>("/system/status");
  }

  async getSystemMetrics(): Promise<ApiResponse<any>> {
    return this.request<any>("/system/metrics");
  }

  // Super Admin Specific Methods
  async getSuperAdminInfo(): Promise<ApiResponse<SuperAdminInfo>> {
    return this.request<SuperAdminInfo>("/super-admin/profile");
  }

  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    return this.request<SystemStats>("/super-admin/stats");
  }

  async getSystemAlerts(): Promise<ApiResponse<SystemAlert[]>> {
    return this.request<SystemAlert[]>("/super-admin/alerts");
  }

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.request<Notification[]>("/api/notifications");
  }

  async markNotificationRead(
    notificationId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      `/notifications/${notificationId}/read`,
      {
        method: "PUT",
      },
    );
  }

  async resolveAlert(
    alertId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(
      `/super-admin/alerts/${alertId}/resolve`,
      {
        method: "PUT",
      },
    );
  }

  // School Registration with Admin Creation
  async registerSchool(schoolData: {
    name: string;
    code: string;
    county: string;
    subcounty: string;
    ward: string;
    type: "primary" | "secondary" | "mixed";
    adminName: string;
    adminEmail: string;
    adminPhone?: string;
    establishedYear: number;
  }): Promise<
    ApiResponse<{
      school: School;
      adminCredentials: { loginId: string; password: string };
    }>
  > {
    return this.request<{
      school: School;
      adminCredentials: { loginId: string; password: string };
    }>("/schools", {
      method: "POST",
      data: schoolData,
    });
  }

  // Super Admin Login (using regular Auth/login with admin credentials)
  async superAdminLogin(
    loginId: string,
    password: string,
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>("/Auth/login", {
      method: "POST",
      data: { email: loginId, password },
    });

    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem("anansi_token", this.token);
      localStorage.setItem("userRole", "SUPER_ADMIN");
      localStorage.setItem("superAdminId", response.data.user.id);
    }

    return response;
  }

  // Password reset
  async resetPassword(
    email: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      data: { email },
    });
  }

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>("/auth/change-password", {
      method: "PUT",
      data: { currentPassword, newPassword },
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Utility functions
export const handleApiError = (error: any) => {
  console.error("API Error:", error);

  if (
    error.message?.includes("401") ||
    error.message?.includes("Unauthorized")
  ) {
    // Redirect to login
    apiClient.logout();
    window.location.href = "/login";
  }

  return error.message || "An unexpected error occurred";
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("anansi_token");
};

export default apiClient;
