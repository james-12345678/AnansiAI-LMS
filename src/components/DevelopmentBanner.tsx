import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  X,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  AlertTriangle,
  Shield,
} from "lucide-react";
import axiosClient from "@/services/axiosClient";
import CorsErrorHelper from "./CorsErrorHelper";

const DevelopmentBanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [showCorsHelper, setShowCorsHelper] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const baseURL = axiosClient.defaults.baseURL;
  const isProduction = process.env.NODE_ENV === "production";
  const isSecure = window.location.protocol === "https:";

  // Check if user is authenticated as super admin
  const isAuthenticated = !!localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");
  const isOnSuperAdminPages = location.pathname.includes("super-admin");

  const checkConnection = async () => {
    try {
      const response = await axiosClient.get("/api/Institutions", {
        timeout: 45000,
      });
      const connected = response.status >= 200 && response.status < 300;
      setIsConnected(connected);
      return connected;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  };

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Auto-hide banner in production after 5 seconds
  useEffect(() => {
    if (isProduction) {
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isProduction]);

  if (!isVisible) return null;

  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: isProduction ? Cloud : Server,
        status: isProduction ? "🚀 Live API Connected" : "🔧 Backend Connected",
        description: `Connected to ${baseURL}`,
        badge: isProduction ? "Production" : "Development",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
      };
    } else {
      const isHttpApi = typeof baseURL === "string" && baseURL.startsWith("http:");
      const mixedContentWarning = isSecure && isHttpApi ? " (HTTPS->HTTP blocked)" : "";
      return {
        icon: WifiOff,
        status: "❌ API Connection Failed",
        description: `Cannot connect to ${baseURL}${mixedContentWarning}`,
        badge: isSecure && isHttpApi ? "Mixed Content" : "Connection Error",
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <Alert className={`mb-4 ${statusInfo.bgColor}`}>
        <StatusIcon className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between -translate-y-0.5">
          <div className="flex items-center gap-4">
            <span className="font-medium">{statusInfo.status}</span>
            <div className="flex items-center gap-2">
              <span>{statusInfo.description}</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium bg-blue-200 text-blue-800`}
              >
                {statusInfo.badge}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isConnected && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCorsHelper(true)}
                  className="h-6 px-2 text-red-600 hover:text-red-700"
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Fix CORS
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkConnection}
                  className="h-6 px-2 text-blue-600 hover:text-blue-700"
                >
                  <Wifi className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </>
            )}

            {/* Super Admin Access Button */}
            {!isAuthenticated && !isOnSuperAdminPages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login") }
                className="h-6 px-2 text-purple-600 hover:text-purple-700"
              >
                <Shield className="w-3 h-3 mr-1" />
                Super Admin
              </Button>
            )}

            {isAuthenticated && userRole === "superadmin" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/super-admin-dashboard")}
                className="h-6 px-2 text-green-600 hover:text-green-700"
              >
                <Shield className="w-3 h-3 mr-1" />
                Dashboard
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      <CorsErrorHelper
        isVisible={showCorsHelper}
        onClose={() => setShowCorsHelper(false)}
      />
    </>
  );
};

export default DevelopmentBanner;
