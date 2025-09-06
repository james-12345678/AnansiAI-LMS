import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { apiService } from "@/services/apiService";

const ApiDiagnostics: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const currentConfig = apiService.getConfig();
  const currentUrl = currentConfig.getBaseURL();
  const isConnected = currentConfig.isBackendAvailable();

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await apiService.testCurrentConfiguration();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: "❌ Test failed with unexpected error",
      });
    } finally {
      setTesting(false);
    }
  };

  const updateApiUrl = () => {
    if (customUrl.trim()) {
      try {
        apiService.updateApiUrl(customUrl.trim());
        setTestResult({
          success: true,
          message: `✅ API URL updated to: ${customUrl.trim()}`,
        });
        // Auto-test the new configuration
        setTimeout(testConnection, 1000);
      } catch (error) {
        setTestResult({
          success: false,
          message: "❌ Failed to update API URL",
        });
      }
    }
  };

  const suggestedUrls = [
    "http://13.60.98.134/anansiai/api",
    "https://13.60.98.134/anansiai/api",
    "http://localhost:5001/api",
    "https://localhost:5001/api",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          API Diagnostics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            API Configuration Diagnostics
          </DialogTitle>
          <DialogDescription>
            Debug and configure API connection settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>API URL:</Label>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {currentUrl}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <Label>Connection Status:</Label>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Disconnected</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Protocol:</Label>
                <span className="text-sm">
                  {currentUrl.startsWith("https") ? "HTTPS" : "HTTP"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Label>Frontend Protocol:</Label>
                <span className="text-sm">{window.location.protocol}</span>
              </div>
            </CardContent>
          </Card>

          {/* Protocol Warning */}
          {window.location.protocol === "https:" &&
            currentUrl.startsWith("http://") && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Protocol Mismatch Detected!</strong>
                  <br />
                  Your frontend is HTTPS but API is HTTP. Browsers block HTTP
                  requests from HTTPS pages. Try using HTTPS for the API URL.
                </AlertDescription>
              </Alert>
            )}

          {/* Connection Test */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connection Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={testConnection}
                disabled={testing}
                className="w-full"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Test Current Configuration
                  </>
                )}
              </Button>

              {testResult && (
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  <AlertDescription>{testResult.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Manual Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manual Configuration</CardTitle>
              <CardDescription>
                Try different API URLs to find the correct configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customUrl">Custom API URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="customUrl"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://your-api-server.com/api"
                    className="flex-1"
                  />
                  <Button
                    onClick={updateApiUrl}
                    disabled={!customUrl.trim()}
                    variant="outline"
                  >
                    Update
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quick Options:</Label>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedUrls.map((url) => (
                    <Button
                      key={url}
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomUrl(url)}
                      className="justify-start text-xs"
                    >
                      {url}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Troubleshooting Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>1. Protocol Issues:</strong> Use HTTPS for API if
                  frontend is HTTPS
                </p>
                <p>
                  <strong>2. CORS Problems:</strong> Check if API server allows
                  requests from your domain
                </p>
                <p>
                  <strong>3. Network Issues:</strong> Verify the server is
                  running and accessible
                </p>
                <p>
                  <strong>4. Port Issues:</strong> Ensure the correct port is
                  specified in the API URL
                </p>
                <p>
                  <strong>5. Firewall:</strong> Check if requests are being
                  blocked by firewall
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiDiagnostics;
