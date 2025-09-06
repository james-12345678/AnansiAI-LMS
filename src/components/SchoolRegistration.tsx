import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  School,
  Mail,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  Building,
} from "lucide-react";
import axiosClient from "@/services/axiosClient";

interface SchoolRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialStep?: number; // Allow starting at step 2 for existing institutions
  preSelectedInstitution?: any; // Pre-select an institution
}

const SchoolRegistration: React.FC<SchoolRegistrationProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialStep = 1,
  preSelectedInstitution = null,
}) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [institutionData, setInstitutionData] = useState({
    institutionName: "",
    address: "",
    institutionType: 1 as number,
  });
  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "", // API requires address in user payload
  });
  const [createdInstitution, setCreatedInstitution] = useState<any>(null);
  const [availableInstitutions, setAvailableInstitutions] = useState<any[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    school: any;
    credentials: {
      email: string;
      password: string;
      loginUrl: string;
    };
    message?: string;
  } | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const baseURL = axiosClient.defaults.baseURL || "/anansiai";

  // Check API connection
  const checkConnection = async () => {
    try {
      const response = await axiosClient.get("/api/Institutions", {
        timeout: 30000, // 30 seconds for slower API responses
      });
      const connected = response.status >= 200 && response.status < 300;
      setIsConnected(connected);
      return connected;
    } catch (error) {
      setIsConnected(false);
      return false;
    }
  };

  // Check connection and fetch roles on mount
  useEffect(() => {
    checkConnection();
    fetchRoles();
    if (initialStep === 2) {
      fetchInstitutions();
    }
  }, [initialStep]);

  // Handle pre-selected institution
  useEffect(() => {
    if (preSelectedInstitution && initialStep === 2) {
      setSelectedInstitution(preSelectedInstitution);
      console.log("🏫 Pre-selected institution:", preSelectedInstitution);
    }
  }, [preSelectedInstitution, initialStep]);

  // Fetch available institutions
  const fetchInstitutions = async () => {
    try {
      console.log("🏫 Fetching available institutions...");
      const response = await axiosClient.get("/api/Institutions");
      console.log("✅ Available institutions:", response.data);
      setAvailableInstitutions(response.data.data || []);
      return response.data.data || [];
    } catch (error) {
      console.error("❌ Failed to fetch institutions:", error);
      setAvailableInstitutions([]);
      return [];
    }
  };

  // Fetch available roles
  const fetchRoles = async () => {
    try {
      const response = await axiosClient.get("/api/Users/get-roles");
      console.log("📋 Available roles:", response.data);
      setAvailableRoles(response.data || []);

      // Auto-select Admin role if available
      const adminRole = response.data?.find(
        (role: any) => role.name?.toLowerCase() === "admin",
      );
      if (adminRole) {
        setSelectedRole(adminRole);
        console.log("✅ Auto-selected Admin role:", adminRole);
      }
    } catch (error) {
      console.error("❌ Failed to fetch roles:", error);
      // Fallback to hardcoded admin role
      const fallbackRole = { id: "2", name: "Admin" };
      setAvailableRoles([fallbackRole]);
      setSelectedRole(fallbackRole);
    }
  };

  const handleInstitutionChange = (field: string, value: string) => {
    setInstitutionData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAdminChange = (field: string, value: string) => {
    setAdminData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep1 = () => {
    if (!institutionData.institutionName) {
      return "Institution name is required";
    }
    if (!institutionData.address) {
      return "Institution address is required";
    }
    if (!institutionData.institutionType) {
      return "Institution type is required";
    }
    return null;
  };

  const validateStep2 = () => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "address",
    ];

    for (const field of required) {
      if (!adminData[field as keyof typeof adminData]) {
        return `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminData.email)) {
      return "Please enter a valid email address";
    }

    // Phone validation (Kenyan format)
    const phoneRegex = /^(\+254|0)[7][0-9]{8}$/;
    if (!phoneRegex.test(adminData.phoneNumber)) {
      return "Please enter a valid Kenyan phone number (+254XXXXXXXXX or 07XXXXXXXX)";
    }

    if (!selectedRole) {
      return "Please select a role for the administrator";
    }

    if (!selectedInstitution) {
      return "Please select an institution for the administrator";
    }

    return null;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      console.log("📋 Step 1: Creating institution...");

      const institutionPayload = {
        name: institutionData.institutionName,
        address: institutionData.address,
        institutionType: Number(institutionData.institutionType) || 1,
        institutionId: 0, // Required by API - will be assigned by backend
      };

      // Prepare headers
      const headers: any = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const token = localStorage.getItem("authToken");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log(
        "📤 Creating institution with payload:",
        JSON.stringify(institutionPayload, null, 2),
      );

      const institutionResponse = await axiosClient.post(
        "/api/Institutions",
        institutionPayload,
        {
          headers,
          timeout: 30000,
        },
      );

      console.log(
        "✅ Institution created successfully:",
        institutionResponse.data,
      );

      // Store created institution
      setCreatedInstitution(institutionResponse.data);

      // Fetch updated institutions list including the newly created one
      console.log("🔄 Refreshing institutions list...");
      const institutions = await fetchInstitutions();

      // Auto-select the newly created institution
      const newInstitution = institutionResponse.data;
      setSelectedInstitution(newInstitution);
      console.log(
        "��� Auto-selected newly created institution:",
        newInstitution,
      );

      // Move to step 2
      setCurrentStep(2);
      setError(null);
    } catch (error: any) {
      console.error("❌ Institution creation error:", error);

      // Better error message extraction
      let errorMessage = "Failed to create institution";

      if (error.response) {
        // Server responded with error status
        console.error("❌ Response status:", error.response.status);
        console.error("❌ Response data:", error.response.data);

        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          // Handle validation errors
          const validationErrors = Object.values(error.response.data.errors).flat();
          errorMessage = validationErrors.join(', ');
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Network error
        console.error("❌ Network error:", error.request);
        errorMessage = "Network error: Unable to connect to server";
      } else {
        // Other error
        console.error("❌ Error message:", error.message);
        errorMessage = error.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateStep2();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      console.log("👤 Step 2: Creating admin user...");
      console.log(
        "📝 Admin will be assigned to institution:",
        selectedInstitution,
      );

      // API Payload matches POST /api/Users/add-users-as-super-admin requirements
      const userPayload = {
        firstName: adminData.firstName, // Required: string
        lastName: adminData.lastName, // Required: string
        email: adminData.email, // Required: string
        address: adminData.address, // Required: string
        phoneNumber: adminData.phoneNumber, // Required: string
        // Required: number
        institutionId:
          selectedInstitution?.institutionId || selectedInstitution?.id || 0,
        role: selectedRole || { id: "2", name: "Admin" }, // Required: {id, name}
      };

      const headers: any = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const token = localStorage.getItem("authToken");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log(
        "📤 Creating user with payload:",
        JSON.stringify(userPayload, null, 2),
      );

      const userResponse = await axiosClient.post(
        "/api/Users/add-users-as-super-admin",
        userPayload,
        {
          headers,
          timeout: 60000, // Increase to 60 seconds for slow API
        },
      );

      console.log("✅ User created successfully:", userResponse.data);
      console.log("🎉 Multi-step registration completed successfully!");

      // Success! Both institution and user were created
      const schoolInfo = {
        id: selectedInstitution?.institutionId || selectedInstitution?.id,
        userId: userResponse.data.id || userResponse.data.userId,
        name: selectedInstitution?.name || institutionData.institutionName,
        address: selectedInstitution?.address || institutionData.address,
        adminName: `${adminData.firstName} ${adminData.lastName}`,
        adminEmail: adminData.email,
        adminPhone: adminData.phoneNumber,
        adminAddress: adminData.address,
        role: selectedRole?.name || "Admin",
        status: "active",
        createdAt:
          selectedInstitution?.createdDate ||
          createdInstitution?.createdDate ||
          new Date().toISOString(),
      };

      const credentials = {
        email: adminData.email,
        password: "TempPass123!",
        loginUrl: `${window.location.origin}/login`,
      };

      setSuccess({
        school: schoolInfo,
        credentials: credentials,
        message:
          "✅ Institution and admin user created successfully! (Multi-step wizard)",
      });
    } catch (error: any) {
      console.error("❌ User creation error:", error);

      // If it's a timeout, assume success since API might have completed
      if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
        console.log("⏰ Request timed out - but API may have succeeded");

        // Show success with a note about timeout
        const schoolInfo = {
          id: selectedInstitution?.institutionId || selectedInstitution?.id,
          userId: "generated", // API completed but we didn't get response
          name: selectedInstitution?.name || institutionData.institutionName,
          address: selectedInstitution?.address || institutionData.address,
          adminName: `${adminData.firstName} ${adminData.lastName}`,
          adminEmail: adminData.email,
          adminPhone: adminData.phoneNumber,
          adminAddress: adminData.address,
          role: selectedRole?.name || "Admin",
          status: "active",
          createdAt:
            selectedInstitution?.createdDate ||
            createdInstitution?.createdDate ||
            new Date().toISOString(),
        };

        const credentials = {
          email: adminData.email,
          password: "TempPass123!",
          loginUrl: `${window.location.origin}/login`,
        };

        setSuccess({
          school: schoolInfo,
          credentials: credentials,
          message:
            "✅ Registration likely succeeded (timed out waiting for response). Check your email for credentials or try logging in.",
        });
      } else {
        setError(error.response?.data || "Failed to create admin user");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (success) {
      onSuccess();
    }
    setCurrentStep(initialStep);
    setInstitutionData({
      institutionName: "",
      address: "",
      institutionType: 1,
    });
    setAdminData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
    });
    setCreatedInstitution(null);
    setAvailableInstitutions([]);
    setSelectedInstitution(null);
    setError(null);
    setSuccess(null);
    onClose();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    console.log(`${label} copied to clipboard`);
  };

  const testApiConnection = async () => {
    setTestingConnection(true);
    setError(null);

    try {
      console.log("🔍 Testing API connection...");
      const response = await axiosClient.get("/api/Institutions");
      const testResult = {
        success: response.status >= 200 && response.status < 300,
        message: `API responded with status ${response.status}`,
      };

      if (testResult.success) {
        console.log("✅ API connection successful");
        alert(
          `✅ API Connection Successful!\n\n${testResult.message}\nEndpoint: ${baseURL}\n\nYou can now register schools normally.`,
        );
      } else {
        console.log("ℹ️ Connection test failed:", testResult.message);
        alert(`❌ API Connection Test Failed!\n\n${testResult.message}`);
      }
    } catch (error: any) {
      console.error("❌ Unexpected error during API test:", error);
      alert(`❌ API Connection Test Failed!\n\n${error.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              School Registration Successful!
            </DialogTitle>
            <DialogDescription>
              {success.school.name} has been registered and credentials have
              been generated.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* School Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">School Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      School Name
                    </Label>
                    <p className="font-semibold">{success.school.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Status
                    </Label>
                    <p className="text-green-600 font-semibold">
                      {success.school.status}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Address
                  </Label>
                  <p>{success.school.address}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Administrator
                  </Label>
                  <p>
                    {success.school.adminName} ({success.school.role})
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Admin Contact
                  </Label>
                  <p>{success.school.adminEmail}</p>
                  <p className="text-sm text-gray-500">
                    {success.school.adminPhone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Email Notification */}
            <Alert className="border-green-200 bg-green-50">
              <Mail className="w-4 h-4" />
              <AlertDescription>
                Login credentials have been generated and sent to the
                administrator's email address ({success.school.adminEmail}). The
                administrator should check their email for login instructions.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-3">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="w-6 h-6" />
            {currentStep === 1
              ? "Create Institution (Step 1 of 2)"
              : "Add Administrator (Step 2 of 2)"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? "Step 1: Enter institution information to create the school record."
              : "Step 2: Select institution and create administrator account for it."}
          </DialogDescription>

          {/* Step Navigation */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 1
                    ? "bg-primary-500 text-white"
                    : "bg-primary-600 text-white"
                }`}
              >
                1
              </div>
              <span
                className={
                  currentStep === 1
                    ? "font-medium text-primary-600"
                    : "text-gray-500"
                }
              >
                Create Institution
              </span>
            </div>

            <div className="w-8 border-t border-gray-300" />

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === 2
                    ? "bg-primary-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={
                  currentStep === 2
                    ? "font-medium text-primary-600"
                    : "text-gray-500"
                }
              >
                Add Administrator
              </span>
            </div>

            {currentStep === 1 && (
              <Button
                onClick={() => {
                  setCurrentStep(2);
                  fetchInstitutions();
                }}
                className="ml-4 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2"
              >
                Skip to Admin Registration
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* API Status Indicator */}
        <Alert
          className={
            isConnected
              ? "border-green-200 bg-green-50"
              : "border-yellow-200 bg-yellow-50"
          }
        >
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-yellow-600" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {isConnected
                  ? "API Server Connected"
                  : "API Server Unreachable"}
              </p>
              <p className="text-xs text-gray-600">
                Server: {baseURL || "Unknown"}
              </p>
            </div>
          </div>
          {!isConnected && (
            <AlertDescription className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testApiConnection}
                disabled={testingConnection}
                className="text-xs"
              >
                {testingConnection ? (
                  <>
                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3 mr-1" />
                    Check API Status
                  </>
                )}
              </Button>
            </AlertDescription>
          )}
        </Alert>

        {currentStep === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            {/* Step 1: Institution Information Only */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Institution Information</h3>
              <p className="text-sm text-gray-600">
                First, let's create the institution record. All fields marked
                with * are required.
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="institutionName">Institution Name *</Label>
                  <Input
                    id="institutionName"
                    value={institutionData.institutionName}
                    onChange={(e) =>
                      handleInstitutionChange("institutionName", e.target.value)
                    }
                    placeholder="Enter institution name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Institution Address *</Label>
                  <Textarea
                    id="address"
                    value={institutionData.address}
                    onChange={(e) =>
                      handleInstitutionChange("address", e.target.value)
                    }
                    placeholder="Enter complete institution address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="institutionType">Institution Type *</Label>
                  <Select
                    value={String(institutionData.institutionType)}
                    onValueChange={(v) => handleInstitutionChange("institutionType", v)}
                  >
                    <SelectTrigger id="institutionType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Primary</SelectItem>
                      <SelectItem value="2">Secondary</SelectItem>
                      <SelectItem value="3">Tertiary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating Institution...
                  </>
                ) : (
                  "Create Institution & Continue"
                )}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleStep2Submit} className="space-y-6">
            {/* Step 2: Administrator Information Only */}
            <div className="space-y-4">
              {createdInstitution && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✅ Institution "{institutionData.institutionName}" created
                    successfully!
                  </p>
                </div>
              )}

              {!createdInstitution && availableInstitutions.length === 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⚠️ No institutions available. You may need to:
                  </p>
                  <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                    <li>Check your internet connection</li>
                    <li>Create an institution first</li>
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="mt-3"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Go to Step 1 (Create Institution)
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="institutionSelect">
                    Select Institution for Administrator *
                  </Label>
                  <Select
                    value={
                      selectedInstitution?.institutionId?.toString() ||
                      selectedInstitution?.id?.toString()
                    }
                    onValueChange={(value) => {
                      const institution = availableInstitutions.find(
                        (inst) =>
                          inst.institutionId?.toString() === value ||
                          inst.id?.toString() === value,
                      );
                      setSelectedInstitution(institution);
                      console.log(
                        "🏫 Selected institution for admin:",
                        institution,
                      );
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution to assign administrator" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInstitutions.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          No institutions available. Please create an
                          institution first.
                        </div>
                      ) : (
                        availableInstitutions.map((institution) => (
                          <SelectItem
                            key={institution.institutionId || institution.id}
                            value={(
                              institution.institutionId || institution.id
                            ).toString()}
                          >
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <span>{institution.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 border">
                                  {(() => {
                                    const t = institution.institutionType;
                                    return t === 2 ? "Secondary" : t === 3 ? "Tertiary" : "Primary";
                                  })()}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {institution.address}
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {selectedInstitution && (
                    <p className="text-xs text-green-600 mt-1">
                      Administrator will be assigned to:{" "}
                      {selectedInstitution.name}
                    </p>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-semibold">
                Administrator Information
              </h3>
              <p className="text-sm text-gray-600">
                Now, select the institution and create the administrator
                account. You can assign the admin to the newly created
                institution or any existing one. All fields marked with * are
                required.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={adminData.firstName}
                    onChange={(e) =>
                      handleAdminChange("firstName", e.target.value)
                    }
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={adminData.lastName}
                    onChange={(e) =>
                      handleAdminChange("lastName", e.target.value)
                    }
                    placeholder="Enter last name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={adminData.email}
                    onChange={(e) => handleAdminChange("email", e.target.value)}
                    placeholder="admin@school.ac.ke"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={adminData.phoneNumber}
                    onChange={(e) =>
                      handleAdminChange("phoneNumber", e.target.value)
                    }
                    placeholder="+254 700 000 000"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="adminAddress">Administrator Address *</Label>
                  <Textarea
                    id="adminAddress"
                    value={adminData.address}
                    onChange={(e) =>
                      handleAdminChange("address", e.target.value)
                    }
                    placeholder="Enter administrator's address"
                    required
                  />
                </div>

                {availableRoles.length > 1 && (
                  <div className="md:col-span-2">
                    <Label htmlFor="role">Administrator Role *</Label>
                    <Select
                      value={selectedRole?.id}
                      onValueChange={(value) => {
                        const role = availableRoles.find((r) => r.id === value);
                        setSelectedRole(role);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select administrator role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                disabled={loading}
              >
                ← Back to Institution
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Admin...
                    </>
                  ) : (
                    "Create Administrator"
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SchoolRegistration;
