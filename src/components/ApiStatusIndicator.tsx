// API Status Indicator - Shows real-time API connection status
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Wifi, WifiOff, RefreshCw, Server, Cloud } from "lucide-react";
import axiosClient from "@/services/axiosClient";

interface ApiStatusIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export function ApiStatusIndicator({
  showDetails = true,
  className = "",
}: ApiStatusIndicatorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const baseURL = axiosClient.defaults.baseURL || "/anansiai";
  const isProduction = process.env.NODE_ENV === "production";

  const checkConnection = async () => {
    try {
      const response = await axiosClient.get("/api/Institutions", {
        timeout: 45000,
      });
      const connected = response.status >= 200 && response.status < 300;
      setIsConnected(connected);
      setLastChecked(new Date().toISOString());
      return connected;
    } catch (error) {
      setIsConnected(false);
      setLastChecked(new Date().toISOString());
      return false;
    }
  };

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const handleRefresh = async () => {
    setIsChecking(true);
    await checkConnection();
    setIsChecking(false);
  };

  const getStatusText = () => {
    if (isConnected) {
      return isProduction ? "Live API" : "Backend Connected";
    }
    return isProduction ? "API Offline" : "Using Mock Data";
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="w-3 h-3 animate-spin" />;
    }
    if (isConnected) {
      return isProduction ? (
        <Cloud className="w-3 h-3" />
      ) : (
        <Server className="w-3 h-3" />
      );
    }
    return <WifiOff className="w-3 h-3" />;
  };

  const getStatusVariant = ():
    | "default"
    | "secondary"
    | "destructive"
    | "outline" => {
    if (isConnected) {
      return isProduction ? "default" : "secondary";
    }
    return isProduction ? "destructive" : "outline";
  };

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getStatusVariant()} className={className}>
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm space-y-1">
              <p>
                <strong>Status:</strong> {getStatusText()}
              </p>
              <p>
                <strong>API URL:</strong> {baseURL}
              </p>
              <p>
                <strong>Last Checked:</strong>{" "}
                {lastChecked
                  ? new Date(lastChecked).toLocaleTimeString()
                  : "Never"}
              </p>
              <p>
                <strong>Mode:</strong>{" "}
                {isProduction ? "Production" : "Development"}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={getStatusVariant()}>
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>

      {showDetails && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>•</span>
          <span>{baseURL}</span>
          <span>•</span>
          <span>
            Updated{" "}
            {lastChecked ? new Date(lastChecked).toLocaleTimeString() : "Never"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isChecking}
            className="h-6 px-2"
          >
            <RefreshCw
              className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      )}
    </div>
  );
}

// Compact version for headers
export function ApiStatusBadge({ className = "" }: { className?: string }) {
  return <ApiStatusIndicator showDetails={false} className={className} />;
}

// Real-time connection monitor
export function ApiConnectionMonitor() {
  const [isConnected, setIsConnected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const baseURL = axiosClient.defaults.baseURL || "/anansiai";
  const isProduction = process.env.NODE_ENV === "production";

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

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show alert if connection is lost in production
    if (isProduction && !isConnected) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isProduction]);

  if (!showAlert) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground p-3 rounded-lg shadow-lg">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4" />
        <span className="text-sm font-medium">API Connection Lost</span>
      </div>
      <p className="text-xs mt-1">
        Cannot reach {baseURL}. Some features may be limited.
      </p>
    </div>
  );
}
