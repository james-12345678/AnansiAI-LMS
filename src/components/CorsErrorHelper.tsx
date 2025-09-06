import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axiosClient from "@/services/axiosClient";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ExternalLink,
  Copy,
  Shield,
  Server,
  CheckCircle,
} from "lucide-react";

interface CorsErrorHelperProps {
  isVisible: boolean;
  onClose: () => void;
}

const CorsErrorHelper: React.FC<CorsErrorHelperProps> = ({
  isVisible,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isVisible) return null;

  const frontendUrl = window.location.origin;
  const apiUrl = axiosClient.defaults.baseURL || "/anansiai";
  const isMixedContent =
    frontendUrl.startsWith("https:") && apiUrl.startsWith("http:");

  const corsCode = `builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("${frontendUrl}")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

app.UseCors("AllowFrontend");`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(corsCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Alert className="border-red-200 bg-red-50 rounded-t-lg rounded-b-none border-b-0">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 text-lg">
            {isMixedContent
              ? "🔒 Mixed Content & CORS Error"
              : "🌐 CORS Configuration Required"}
          </AlertTitle>
          <AlertDescription className="text-red-700 mt-2">
            Your browser is blocking API requests due to security restrictions.
          </AlertDescription>
        </Alert>

        <div className="p-6 space-y-6">
          {/* Problem Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              What's happening?
            </h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>Frontend:</strong> {frontendUrl} (HTTPS)
              </p>
              <p>
                <strong>API Server:</strong> {apiUrl} (HTTP)
              </p>
              {isMixedContent && (
                <p className="text-red-600 font-medium">
                  ❌ Browsers block HTTPS sites from calling HTTP APIs (Mixed
                  Content)
                </p>
              )}
              <p className="text-red-600 font-medium">
                ❌ API server doesn't allow requests from this domain (CORS)
              </p>
            </div>
          </div>

          {/* Quick Solutions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              🛠️ Solutions (Choose One):
            </h3>

            {isMixedContent && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Option 1: Allow Mixed Content (Quick Fix)
                </h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Click the 🔒 lock icon in your browser address bar</li>
                  <li>Select "Site settings" or "Permissions"</li>
                  <li>Change "Insecure content" from "Block" to "Allow"</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            )}

            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Server className="w-4 h-4 text-green-600" />
                Option 2: Configure CORS on Your .NET API (Recommended)
              </h4>
              <p className="text-sm mb-3">
                Add this code to your .NET API's Program.cs or Startup.cs:
              </p>

              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                <pre>{corsCode}</pre>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Code
                    </>
                  )}
                </Button>

                <Button
                  onClick={() =>
                    window.open(
                      "https://docs.microsoft.com/en-us/aspnet/core/security/cors",
                      "_blank",
                    )
                  }
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  CORS Docs
                </Button>
              </div>
            </div>

            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Option 3: Use HTTPS for API (Production Ready)
              </h4>
              <p className="text-sm">
                Configure SSL certificate for your API server and change the API
                URL to:
                <code className="bg-gray-200 px-1 rounded ml-1">
                  https://13.60.38.213/anansiai
                </code>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry Connection
            </Button>
            <Button onClick={onClose}>Continue with Error</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorsErrorHelper;
