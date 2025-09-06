import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Info,
} from "lucide-react";
import MixedContentHelper from "@/services/mixedContentHelper";

interface MixedContentResolverProps {
  onResolved?: () => void;
}

const MixedContentResolver: React.FC<MixedContentResolverProps> = ({
  onResolved,
}) => {
  const [helper] = useState(() => MixedContentHelper.getInstance());
  const [isTestingHttps, setIsTestingHttps] = useState(false);
  const [httpsTestResult, setHttpsTestResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const hasMixedContentIssue = helper.hasMixedContentIssue();
  const solutions = helper.getAvailableSolutions();

  const testHttpsConnection = async () => {
    setIsTestingHttps(true);
    try {
      const result = await helper.testHttpsApi();
      setHttpsTestResult(result);

      if (result.success) {
        // If HTTPS works, update axios client and notify parent
        console.log(
          "✅ HTTPS API connection successful! Updating configuration...",
        );

        // Force a page reload to use the new HTTPS configuration
        if (onResolved) {
          onResolved();
        }

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      setHttpsTestResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsTestingHttps(false);
    }
  };

  const enableDemoMode = () => {
    helper.setDemoMode(true);
    if (onResolved) {
      onResolved();
    }
  };

  if (!hasMixedContentIssue) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <div>
              <strong>Mixed Content Security Error</strong>
              <p className="text-sm mt-1">
                Your app is on HTTPS but trying to connect to an HTTP API, which
                browsers block for security.
              </p>
            </div>
            <Badge variant="destructive" className="ml-4">
              <Shield className="w-3 h-3 mr-1" />
              Security Block
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Connection Problem Details
          </CardTitle>
          <CardDescription>
            Understanding the mixed content security restriction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle className="h-4 w-4" />
                Your Application
              </div>
              <div className="text-sm text-green-600 mt-1">
                {window.location.origin} (HTTPS ✓)
              </div>
            </div>

            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-red-700 font-medium">
                <XCircle className="h-4 w-4" />
                API Server
              </div>
              <div className="text-sm text-red-600 mt-1">
                http://13.60.98.134/anansiai (HTTP ✗)
              </div>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              <strong>Why this happens:</strong> Modern browsers prevent HTTPS
              pages from making requests to HTTP servers to protect against
              man-in-the-middle attacks.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Solutions</CardTitle>
          <CardDescription>
            Choose the best option for your situation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Option 1: Test HTTPS */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">1. Try HTTPS API Connection</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Test if your API server supports HTTPS
                </p>
                {httpsTestResult && (
                  <div
                    className={`text-sm mt-2 ${httpsTestResult.success ? "text-green-600" : "text-red-600"}`}
                  >
                    {httpsTestResult.success ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        HTTPS API connection successful! Page will reload...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        HTTPS failed: {httpsTestResult.error}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Button
                onClick={testHttpsConnection}
                disabled={isTestingHttps}
                variant="outline"
                size="sm"
              >
                {isTestingHttps ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                {isTestingHttps ? "Testing..." : "Test HTTPS"}
              </Button>
            </div>
          </div>

          {/* Option 2: Server Configuration */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">2. Configure SSL on API Server</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Install SSL certificate on 13.60.98.134 (Recommended for
                  production)
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://letsencrypt.org/getting-started/",
                    "_blank",
                  )
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                SSL Guide
              </Button>
            </div>
          </div>

          {/* Option 3: Demo Mode */}
          <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">3. Continue with Demo Mode</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Use sample data for testing (API features will be limited)
                </p>
              </div>
              <Button
                onClick={enableDemoMode}
                variant="outline"
                size="sm"
                className="border-yellow-300 hover:bg-yellow-100"
              >
                Enable Demo Mode
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MixedContentResolver;
