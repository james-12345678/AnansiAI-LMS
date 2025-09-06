// Mixed Content Helper - Handles HTTPS -> HTTP API connection issues
// Provides fallback mechanisms for production deployments with mixed content restrictions

export interface MixedContentSolution {
  type: "proxy" | "fallback" | "https";
  url: string;
  description: string;
  available: boolean;
}

export class MixedContentHelper {
  private static instance: MixedContentHelper;

  static getInstance(): MixedContentHelper {
    if (!MixedContentHelper.instance) {
      MixedContentHelper.instance = new MixedContentHelper();
    }
    return MixedContentHelper.instance;
  }

  // Check if current environment has mixed content issues
  hasMixedContentIssue(): boolean {
    const isHttps = window.location.protocol === "https:";
    const apiUrl = import.meta.env.VITE_API_URL || "/anansiai";
    const apiIsHttp = apiUrl.startsWith("http://");

    return isHttps && apiIsHttp;
  }

  // Get available solutions for mixed content
  getAvailableSolutions(): MixedContentSolution[] {
    const solutions: MixedContentSolution[] = [
      {
        type: "proxy",
        url: `${window.location.origin}/anansiai`,
        description:
          "Use same-origin proxy (/anansiai via Vite) to avoid mixed content",
        available: true,
      },
      {
        type: "proxy",
        url: `${window.location.origin}/api-proxy`,
        description:
          "Use server-side proxy to forward requests (requires backend implementation)",
        available: false, // Would need backend proxy setup
      },
      {
        type: "fallback",
        url: "demo-mode",
        description: "Use demo mode with sample data (for testing only)",
        available: true,
      },
    ];

    return solutions;
  }

  // Attempt to resolve mixed content by testing HTTPS version
  async testHttpsApi(): Promise<{ success: boolean; error?: string }> {
    try {
      const httpsUrl = `${window.location.origin}/anansiai/api/Institutions`;

      const response = await fetch(httpsUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // Don't include credentials for CORS preflight
        mode: "cors",
      });

      if (response.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: `HTTPS API returned ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "HTTPS API connection failed",
      };
    }
  }

  // Create a fallback axios instance that tries HTTPS first
  async createFallbackClient() {
    const { default: axios } = await import("axios");

    // Test if HTTPS version works
    const httpsTest = await this.testHttpsApi();

    const baseURL = `${window.location.origin}/anansiai`;

    console.log(`🔄 Mixed Content Helper: Using ${baseURL}`);

    if (!httpsTest.success && this.hasMixedContentIssue()) {
      console.warn("⚠️ Mixed Content Issue: HTTPS page cannot access HTTP API");
      console.warn(
        "💡 Consider: 1) Configure SSL on API server, 2) Use HTTP deployment for development",
      );
    }

    const client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Add auth interceptor
    client.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return client;
  }

  // Generate user-friendly error message for mixed content
  getMixedContentErrorMessage(): string {
    if (!this.hasMixedContentIssue()) {
      return "No mixed content issue detected.";
    }

    return `
🚫 Mixed Content Security Error

Your application is running on HTTPS but trying to connect to an HTTP API, which browsers block for security.

Quick Solutions:
1. 🔄 Use same-origin proxy at /anansiai (configured in Vite)
2. 🔧 Configure SSL certificate on your API server

Technical Details:
• App URL: ${window.location.origin} (HTTPS)
• API URL: ${import.meta.env.VITE_API_URL || "/anansiai"}
• Issue: Browser blocks HTTPS → HTTP requests if calling absolute HTTP URLs
    `.trim();
  }

  // Check if demo mode should be enabled
  shouldUseDemoMode(): boolean {
    return (
      this.hasMixedContentIssue() &&
      localStorage.getItem("forceDemoMode") === "true"
    );
  }

  // Enable/disable demo mode
  setDemoMode(enabled: boolean): void {
    if (enabled) {
      localStorage.setItem("forceDemoMode", "true");
      console.log("📱 Demo mode enabled - using sample data");
    } else {
      localStorage.removeItem("forceDemoMode");
      console.log("🌐 Demo mode disabled - attempting real API connection");
    }
  }
}

export default MixedContentHelper;
