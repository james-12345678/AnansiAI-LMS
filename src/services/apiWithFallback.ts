// API Service with Development Fallback
// This wrapper automatically falls back to mock data when the API is unavailable

import { apiClient, type ApiResponse } from "./api";
import { MockApiService } from "./mockData";

const IS_DEVELOPMENT =
  import.meta.env.VITE_ENVIRONMENT === "development" || import.meta.env.DEV;

// Check if we're in a cloud environment (Builder.io, Fly.dev, etc.)
const IS_CLOUD_ENVIRONMENT =
  import.meta.env.VITE_FORCE_CLOUD_MODE === "true" ||
  (!import.meta.env.VITE_FORCE_BACKEND &&
    (window.location.hostname.includes("builder.codes") ||
      window.location.hostname.includes("fly.dev") ||
      window.location.hostname.includes("netlify.app") ||
      window.location.hostname.includes("vercel.app") ||
      import.meta.env.VITE_API_URL?.includes("api-not-available")));

// Helper to determine if we should use fallback
let useFallback = IS_CLOUD_ENVIRONMENT; // Start with fallback in cloud
let fallbackWarningShown = false;

const showFallbackWarning = () => {
  if (!fallbackWarningShown && IS_DEVELOPMENT) {
    if (IS_CLOUD_ENVIRONMENT) {
      console.info("🌐 Cloud Environment Detected");
      console.info("🧪 Using comprehensive mock data for development");
      console.info("✨ All features available with realistic sample data");
      console.info("🚀 Perfect for testing and development!");
    } else {
      console.warn("🔄 API Fallback Mode Activated");
      console.warn("📡 Backend API server is not available");
      console.warn("🧪 Using mock data for development");
      console.warn("💡 Start your backend server to use real API calls");
    }
    fallbackWarningShown = true;
  }
};

// Generic wrapper function
async function withFallback<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  fallbackCall: () => Promise<ApiResponse<T>>,
  operationName: string = "API operation",
): Promise<ApiResponse<T>> {
  // In cloud environments, use fallback immediately
  if (IS_CLOUD_ENVIRONMENT && IS_DEVELOPMENT) {
    showFallbackWarning();
    return fallbackCall();
  }

  // If we already know to use fallback, skip API call
  if (useFallback && IS_DEVELOPMENT) {
    showFallbackWarning();
    return fallbackCall();
  }

  try {
    return await apiCall();
  } catch (error) {
    if (IS_DEVELOPMENT) {
      // More specific error messages
      if (error?.message?.includes("Network Error")) {
        console.warn(
          `🌐 ${operationName}: Backend API not available in cloud environment, using mock data`,
        );
      } else {
        console.warn(
          `⚠️ ${operationName} failed, falling back to mock data:`,
          error,
        );
      }
      useFallback = true; // Remember for future calls
      showFallbackWarning();
      return fallbackCall();
    } else {
      // In production, throw the error normally
      throw error;
    }
  }
}

// Enhanced API client with fallback
export const apiWithFallback = {
  // Authentication
  async login(userId: string, password: string) {
    return withFallback(
      () => apiClient.login(userId, password),
      () => MockApiService.login(userId, password),
      "Login",
    );
  },

  async superAdminLogin(loginId: string, password: string) {
    return withFallback(
      () => apiClient.superAdminLogin(loginId, password),
      () => MockApiService.superAdminLogin(loginId, password),
      "Super Admin Login",
    );
  },

  async resetPassword(email: string) {
    return withFallback(
      () => apiClient.resetPassword(email),
      () => MockApiService.resetPassword(email),
      "Password Reset",
    );
  },

  // Data fetching
  async getSchools() {
    return withFallback(
      () => apiClient.getSchools(),
      () => MockApiService.getSchools(),
      "Get Schools",
    );
  },

  async getSystemStats() {
    return withFallback(
      () => apiClient.getSystemStats(),
      () => MockApiService.getSystemStats(),
      "Get System Stats",
    );
  },

  async getSuperAdminInfo() {
    return withFallback(
      () => apiClient.getSuperAdminInfo(),
      () => MockApiService.getSuperAdminInfo(),
      "Get Super Admin Info",
    );
  },

  async getSystemAlerts() {
    return withFallback(
      () => apiClient.getSystemAlerts(),
      () => MockApiService.getSystemAlerts(),
      "Get System Alerts",
    );
  },

  async getNotifications() {
    return withFallback(
      () => apiClient.getNotifications(),
      () => MockApiService.getNotifications(),
      "Get Notifications",
    );
  },

  async registerSchool(schoolData: any) {
    return withFallback(
      () => apiClient.registerSchool(schoolData),
      () => MockApiService.registerSchool(schoolData),
      "Register School",
    );
  },

  // Student Dashboard Methods
  async getStudentDashboard() {
    return withFallback(
      () => apiClient.getStudentDashboard(),
      () => MockApiService.getStudentDashboard(),
      "Get Student Dashboard",
    );
  },

  async getCourseLessons(courseId: string) {
    return withFallback(
      () => apiClient.getCourseLessons(courseId),
      () => MockApiService.getCourseLessons(courseId),
      "Get Course Lessons",
    );
  },

  async getCourseDiscussion(courseId: string) {
    return withFallback(
      () => apiClient.getCourseDiscussion(courseId),
      () => MockApiService.getCourseDiscussion(courseId),
      "Get Course Discussion",
    );
  },

  async markNotificationAsRead(notificationId: string) {
    return withFallback(
      () => apiClient.markNotificationAsRead(notificationId),
      () => MockApiService.markNotificationAsRead(notificationId),
      "Mark Notification as Read",
    );
  },

  async markAllNotificationsAsRead() {
    return withFallback(
      () => apiClient.markAllNotificationsAsRead(),
      () => MockApiService.markAllNotificationsAsRead(),
      "Mark All Notifications as Read",
    );
  },

  // Utility methods
  logout() {
    return apiClient.logout();
  },

  // Reset fallback mode (useful for retrying real API)
  resetFallbackMode() {
    useFallback = false;
    fallbackWarningShown = false;
    console.info("🔄 API fallback mode reset - will retry real API calls");
  },

  // Check if currently using fallback
  isUsingFallback() {
    return useFallback;
  },
};

// Export for backward compatibility
export { apiClient };
export default apiWithFallback;
