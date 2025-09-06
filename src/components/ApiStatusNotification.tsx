import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Wifi, WifiOff, RefreshCw, CheckCircle } from "lucide-react";
import axiosClient from "@/services/axiosClient";

const ApiStatusNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownConnected, setHasShownConnected] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const baseURL = axiosClient.defaults.baseURL || "/anansiai";

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

  // Show notification when connection status changes
  useEffect(() => {
    if (!isConnected) {
      // Always show when disconnected
      setIsVisible(true);
    } else if (!hasShownConnected) {
      // Show once when first connected
      setIsVisible(true);
      setHasShownConnected(true);
      // Auto-hide connected notification after 3 seconds
      setTimeout(() => setIsVisible(false), 3000);
    }
  }, [isConnected, hasShownConnected]);

  const handleRetry = async () => {
    setRetrying(true);
    await checkConnection();
    setTimeout(() => setRetrying(false), 1000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md">
      <Alert
        className={`border-2 shadow-lg ${
          isConnected
            ? "border-green-200 bg-green-50"
            : "border-yellow-200 bg-yellow-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {isConnected ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-yellow-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-sm">
                  {isConnected
                    ? "✅ API Server Connected"
                    : "⚠️ API Server Unreachable"}
                </p>
                <p className="text-xs text-gray-600">
                  {isConnected
                    ? `Connected to ${baseURL}`
                    : `Cannot reach ${baseURL}`}
                </p>
                {!isConnected && (
                  <p className="text-xs text-gray-600">
                    📱 Using mock data for seamless experience
                  </p>
                )}
                {!isConnected && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRetry}
                      disabled={retrying}
                      className="text-xs"
                    >
                      {retrying ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default ApiStatusNotification;
