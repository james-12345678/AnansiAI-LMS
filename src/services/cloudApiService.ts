// Cloud-Optimized API Service
// This service immediately returns mock data without any network calls
// Perfect for cloud development environments like Builder.io, Fly.dev, etc.

import { MockApiService } from "./mockData";
import type { ApiResponse } from "./api";

const IS_CLOUD_ENVIRONMENT =
  import.meta.env.VITE_FORCE_CLOUD_MODE === "true" ||
  (!import.meta.env.VITE_FORCE_BACKEND &&
    typeof window !== "undefined" &&
    (window.location.hostname.includes("builder.codes") ||
      window.location.hostname.includes("fly.dev") ||
      window.location.hostname.includes("netlify.app") ||
      window.location.hostname.includes("vercel.app") ||
      import.meta.env.VITE_API_URL?.includes("api-not-available")));

class CloudApiService {
  private hasLoggedCloudMode = false;

  private logCloudMode() {
    if (!this.hasLoggedCloudMode) {
      console.info("🌐 Cloud Development Mode Active");
      console.info("✨ Using premium mock data - Zero network calls");
      console.info("🚀 Perfect for development and testing!");
      this.hasLoggedCloudMode = true;
    }
  }

  async login(userId: string, password: string) {
    this.logCloudMode();
    return MockApiService.login(userId, password);
  }

  async superAdminLogin(loginId: string, password: string) {
    this.logCloudMode();
    return MockApiService.superAdminLogin(loginId, password);
  }

  async getSchools() {
    this.logCloudMode();
    return MockApiService.getSchools();
  }

  async getSystemStats() {
    this.logCloudMode();
    return MockApiService.getSystemStats();
  }

  async getSuperAdminInfo() {
    this.logCloudMode();
    return MockApiService.getSuperAdminInfo();
  }

  async getSystemAlerts() {
    this.logCloudMode();
    return MockApiService.getSystemAlerts();
  }

  async getNotifications() {
    this.logCloudMode();
    return MockApiService.getNotifications();
  }

  async registerSchool(schoolData: any) {
    this.logCloudMode();
    return MockApiService.registerSchool(schoolData);
  }

  async resetPassword(email: string) {
    this.logCloudMode();
    return MockApiService.resetPassword(email);
  }

  // Student Dashboard Methods
  async getStudentDashboard() {
    this.logCloudMode();
    return MockApiService.getStudentDashboard();
  }

  async getCourseLessons(courseId: string) {
    this.logCloudMode();
    return MockApiService.getCourseLessons(courseId);
  }

  async getCourseDiscussion(courseId: string) {
    this.logCloudMode();
    return MockApiService.getCourseDiscussion(courseId);
  }

  async markNotificationAsRead(notificationId: string) {
    this.logCloudMode();
    return MockApiService.markNotificationAsRead(notificationId);
  }

  async markAllNotificationsAsRead() {
    this.logCloudMode();
    return MockApiService.markAllNotificationsAsRead();
  }

  logout() {
    // No-op for cloud mode
    return Promise.resolve();
  }

  // Utility methods
  resetFallbackMode() {
    // No-op for cloud mode
  }

  isUsingFallback() {
    return true; // Always using "fallback" (mock data) in cloud mode
  }
}

// Export singleton for cloud environments, otherwise use regular apiWithFallback
export const cloudApiService = new CloudApiService();

// Auto-detect and export appropriate service
export const autoApiService = IS_CLOUD_ENVIRONMENT ? cloudApiService : null;
