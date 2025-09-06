import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Key,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Settings,
  Clock,
  UserCheck,
  UserX,
  Building,
  Globe,
  FileText,
  Download,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Info,
  Bell,
  Camera,
  Smartphone,
  Laptop,
  Monitor,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Types for school security management
interface SchoolSecurityConfig {
  id: string;
  schoolId: string;
  schoolName: string;
  dataIsolation: boolean;
  encryptionEnabled: boolean;
  auditLogging: boolean;
  multiFactorAuth: boolean;
  sessionTimeout: number; // minutes
  passwordPolicy: PasswordPolicy;
  accessControls: AccessControl[];
  dataRetention: DataRetentionPolicy;
  gdprCompliance: GDPRSettings;
  networkSecurity: NetworkSecuritySettings;
  lastUpdated: string;
  updatedBy: string;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiration: number; // days
  preventReuse: number; // number of previous passwords
}

interface AccessControl {
  id: string;
  role: string;
  permissions: string[];
  restrictions: string[];
  ipWhitelist?: string[];
  timeRestrictions?: {
    allowedHours: string;
    allowedDays: string[];
  };
}

interface DataRetentionPolicy {
  studentDataRetention: number; // years
  logRetention: number; // years
  backupRetention: number; // years
  automaticDeletion: boolean;
  exportBeforeDeletion: boolean;
}

interface GDPRSettings {
  enabled: boolean;
  consentRequired: boolean;
  rightToForgotten: boolean;
  dataPortability: boolean;
  privacyNoticeUrl: string;
  dpoContact: string;
}

interface NetworkSecuritySettings {
  sslRequired: boolean;
  ipRestriction: boolean;
  allowedIPs: string[];
  vpnRequired: boolean;
  geoRestriction: boolean;
  allowedCountries: string[];
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type:
    | "login"
    | "logout"
    | "access_denied"
    | "data_access"
    | "config_change"
    | "suspicious_activity";
  severity: "low" | "medium" | "high" | "critical";
  userId: string;
  userName: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  notes?: string;
}

interface SchoolUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "suspended" | "pending" | "inactive";
  lastLogin: string;
  failedAttempts: number;
  mfaEnabled: boolean;
  permissions: string[];
  createdAt: string;
  lastActivity: string;
  devices: UserDevice[];
}

interface UserDevice {
  id: string;
  deviceType: "mobile" | "tablet" | "desktop" | "laptop";
  deviceName: string;
  lastUsed: string;
  ipAddress: string;
  location: string;
  trusted: boolean;
}

interface SchoolSecurityManagerProps {
  schoolId: string;
  userRole: string;
  className?: string;
}

export function SchoolSecurityManager({
  schoolId,
  userRole,
  className,
}: SchoolSecurityManagerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [securityConfig, setSecurityConfig] =
    useState<SchoolSecurityConfig | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [schoolUsers, setSchoolUsers] = useState<SchoolUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(
    null,
  );

  // Check if user has admin permissions
  const isSchoolAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  useEffect(() => {
    loadSecurityData();
  }, [schoolId]);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be API calls
      setSecurityConfig(mockSecurityConfig);
      setSecurityEvents(mockSecurityEvents);
      setSchoolUsers(mockSchoolUsers);
    } catch (error) {
      console.error("Failed to load security data:", error);
    }
    setLoading(false);
  };

  const handleUpdateSecurityConfig = async (
    config: Partial<SchoolSecurityConfig>,
  ) => {
    try {
      // In a real app, this would be an API call
      if (securityConfig) {
        setSecurityConfig({
          ...securityConfig,
          ...config,
          lastUpdated: new Date().toISOString(),
          updatedBy: "Current User", // Would be actual user
        });
      }
    } catch (error) {
      console.error("Failed to update security config:", error);
    }
  };

  const handleResolveSecurityEvent = async (eventId: string, notes: string) => {
    try {
      setSecurityEvents((events) =>
        events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                resolved: true,
                resolvedBy: "Current User",
                resolvedAt: new Date().toISOString(),
                notes,
              }
            : event,
        ),
      );
    } catch (error) {
      console.error("Failed to resolve security event:", error);
    }
  };

  const getSecurityScore = () => {
    if (!securityConfig) return 0;
    let score = 0;
    if (securityConfig.dataIsolation) score += 20;
    if (securityConfig.encryptionEnabled) score += 20;
    if (securityConfig.auditLogging) score += 15;
    if (securityConfig.multiFactorAuth) score += 20;
    if (securityConfig.passwordPolicy.minLength >= 8) score += 10;
    if (securityConfig.gdprCompliance.enabled) score += 15;
    return score;
  };

  const getEventSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Smartphone className="h-4 w-4" />;
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      case "laptop":
        return <Laptop className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const filteredUsers = schoolUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const unresolvedEvents = securityEvents.filter((event) => !event.resolved);
  const criticalEvents = unresolvedEvents.filter(
    (event) => event.severity === "critical",
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-medium text-gray-600">
            Loading Security Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isSchoolAdmin) {
    return (
      <Alert className="m-6">
        <Shield className="h-4 w-4" />
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          You don't have permission to access the school security management
          dashboard. Only school administrators can view this information.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            School Security Center
          </h2>
          <p className="text-muted-foreground">
            Manage security settings and monitor activity for{" "}
            {securityConfig?.schoolName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Building className="h-3 w-3 mr-1" />
            School ID: {schoolId}
          </Badge>
          <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Security Settings
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Score
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getSecurityScore()}%</div>
            <Progress value={getSecurityScore()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {getSecurityScore() >= 80
                ? "Excellent"
                : getSecurityScore() >= 60
                  ? "Good"
                  : "Needs Improvement"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schoolUsers.filter((u) => u.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {schoolUsers.length} total users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Events
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unresolvedEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalEvents.length} critical events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityConfig?.gdprCompliance.enabled ? "GDPR" : "Basic"}
            </div>
            <p className="text-xs text-muted-foreground">
              Data protection level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalEvents.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            Critical Security Events
          </AlertTitle>
          <AlertDescription className="text-red-700">
            You have {criticalEvents.length} critical security events that
            require immediate attention.
            <Button
              variant="link"
              className="p-0 h-auto text-red-700 underline ml-1"
            >
              Review now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users & Access</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Security Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Isolation</span>
                  <Badge
                    variant={
                      securityConfig?.dataIsolation ? "default" : "destructive"
                    }
                  >
                    {securityConfig?.dataIsolation ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Encryption</span>
                  <Badge
                    variant={
                      securityConfig?.encryptionEnabled
                        ? "default"
                        : "destructive"
                    }
                  >
                    {securityConfig?.encryptionEnabled ? "AES-256" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Multi-Factor Auth</span>
                  <Badge
                    variant={
                      securityConfig?.multiFactorAuth ? "default" : "secondary"
                    }
                  >
                    {securityConfig?.multiFactorAuth ? "Required" : "Optional"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audit Logging</span>
                  <Badge
                    variant={
                      securityConfig?.auditLogging ? "default" : "destructive"
                    }
                  >
                    {securityConfig?.auditLogging ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">GDPR Compliance</span>
                  <Badge
                    variant={
                      securityConfig?.gdprCompliance.enabled
                        ? "default"
                        : "secondary"
                    }
                  >
                    {securityConfig?.gdprCompliance.enabled
                      ? "Compliant"
                      : "Basic"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>Recent Security Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {securityEvents.slice(0, 10).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start space-x-3 p-2 rounded-lg bg-gray-50"
                      >
                        <div className="flex-shrink-0">
                          {event.type === "login" && (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          )}
                          {event.type === "logout" && (
                            <UserX className="h-4 w-4 text-gray-600" />
                          )}
                          {event.type === "access_denied" && (
                            <Shield className="h-4 w-4 text-red-600" />
                          )}
                          {event.type === "suspicious_activity" && (
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {event.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {event.userName} •{" "}
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          className={getEventSeverityColor(event.severity)}
                        >
                          {event.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users & Access Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TEACHER">Teacher</SelectItem>
                <SelectItem value="STUDENT">Student</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <div className="text-sm text-muted-foreground">
                Total: {schoolUsers.length} users • Active:{" "}
                {schoolUsers.filter((u) => u.status === "active").length}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>MFA</TableHead>
                    <TableHead>Devices</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.mfaEnabled ? "default" : "secondary"}
                        >
                          {user.mfaEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {user.devices.slice(0, 3).map((device) => (
                            <div key={device.id} title={device.deviceName}>
                              {getDeviceIcon(device.deviceType)}
                            </div>
                          ))}
                          {user.devices.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{user.devices.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Event Log</CardTitle>
              <div className="text-sm text-muted-foreground">
                Monitor all security-related activities in your school system
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(event.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {event.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getEventSeverityColor(event.severity)}
                        >
                          {event.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.userName}</p>
                          <p className="text-xs text-gray-500">
                            {event.userId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {event.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={event.resolved ? "default" : "destructive"}
                        >
                          {event.resolved ? "Resolved" : "Open"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!event.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedEvent(event)}
                          >
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>GDPR Compliance</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Data protection and privacy compliance status
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>GDPR Enabled</span>
                  <Switch checked={securityConfig?.gdprCompliance.enabled} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Consent Required</span>
                  <Switch
                    checked={securityConfig?.gdprCompliance.consentRequired}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Right to be Forgotten</span>
                  <Switch
                    checked={securityConfig?.gdprCompliance.rightToForgotten}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Data Portability</span>
                  <Switch
                    checked={securityConfig?.gdprCompliance.dataPortability}
                  />
                </div>
                <div className="space-y-2">
                  <Label>DPO Contact</Label>
                  <Input
                    value={securityConfig?.gdprCompliance.dpoContact}
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Retention</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Manage how long data is kept in the system
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Student Data</span>
                  <span className="font-medium">
                    {securityConfig?.dataRetention.studentDataRetention} years
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audit Logs</span>
                  <span className="font-medium">
                    {securityConfig?.dataRetention.logRetention} years
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Backups</span>
                  <span className="font-medium">
                    {securityConfig?.dataRetention.backupRetention} years
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Automatic Deletion</span>
                  <Switch
                    checked={securityConfig?.dataRetention.automaticDeletion}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Export Before Deletion</span>
                  <Switch
                    checked={securityConfig?.dataRetention.exportBeforeDeletion}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <div className="text-sm text-muted-foreground">
                Configure security settings for your school
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Core Security Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Data Isolation</Label>
                      <p className="text-xs text-muted-foreground">
                        Ensure your school's data is completely isolated
                      </p>
                    </div>
                    <Switch
                      checked={securityConfig?.dataIsolation}
                      onCheckedChange={(checked) =>
                        handleUpdateSecurityConfig({ dataIsolation: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>End-to-End Encryption</Label>
                      <p className="text-xs text-muted-foreground">
                        Encrypt all data with AES-256
                      </p>
                    </div>
                    <Switch
                      checked={securityConfig?.encryptionEnabled}
                      onCheckedChange={(checked) =>
                        handleUpdateSecurityConfig({
                          encryptionEnabled: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Multi-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">
                        Require MFA for all users
                      </p>
                    </div>
                    <Switch
                      checked={securityConfig?.multiFactorAuth}
                      onCheckedChange={(checked) =>
                        handleUpdateSecurityConfig({ multiFactorAuth: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Audit Logging</Label>
                      <p className="text-xs text-muted-foreground">
                        Log all security events
                      </p>
                    </div>
                    <Switch
                      checked={securityConfig?.auditLogging}
                      onCheckedChange={(checked) =>
                        handleUpdateSecurityConfig({ auditLogging: checked })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <Input
                      type="number"
                      value={securityConfig?.sessionTimeout}
                      onChange={(e) =>
                        handleUpdateSecurityConfig({
                          sessionTimeout: parseInt(e.target.value) || 30,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label>Password Policy</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={
                            securityConfig?.passwordPolicy.requireUppercase
                          }
                          className="rounded"
                          aria-label="Require uppercase letters"
                        />
                        <span className="text-sm">
                          Require uppercase letters
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={
                            securityConfig?.passwordPolicy.requireNumbers
                          }
                          className="rounded"
                          aria-label="Require numbers"
                        />
                        <span className="text-sm">Require numbers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={
                            securityConfig?.passwordPolicy.requireSpecialChars
                          }
                          className="rounded"
                          aria-label="Require special characters"
                        />
                        <span className="text-sm">
                          Require special characters
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Event Resolution Dialog */}
      {selectedEvent && (
        <Dialog
          open={!!selectedEvent}
          onOpenChange={() => setSelectedEvent(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Security Event</DialogTitle>
              <DialogDescription>
                Review and resolve the security event below
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Event Details</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedEvent.description}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    User: {selectedEvent.userName} • Time:{" "}
                    {new Date(selectedEvent.timestamp).toLocaleString()} • IP:{" "}
                    {selectedEvent.ipAddress}
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="resolution-notes">Resolution Notes</Label>
                <Textarea
                  id="resolution-notes"
                  placeholder="Describe how this event was resolved..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleResolveSecurityEvent(
                    selectedEvent.id,
                    "Event resolved by admin",
                  );
                  setSelectedEvent(null);
                }}
              >
                Mark as Resolved
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Mock data for demonstration
const mockSecurityConfig: SchoolSecurityConfig = {
  id: "config_1",
  schoolId: "school_001",
  schoolName: "Nairobi Academy",
  dataIsolation: true,
  encryptionEnabled: true,
  auditLogging: true,
  multiFactorAuth: true,
  sessionTimeout: 30,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiration: 90,
    preventReuse: 5,
  },
  accessControls: [],
  dataRetention: {
    studentDataRetention: 7,
    logRetention: 3,
    backupRetention: 5,
    automaticDeletion: true,
    exportBeforeDeletion: true,
  },
  gdprCompliance: {
    enabled: true,
    consentRequired: true,
    rightToForgotten: true,
    dataPortability: true,
    privacyNoticeUrl: "https://school.edu/privacy",
    dpoContact: "dpo@nairobiacademy.ac.ke",
  },
  networkSecurity: {
    sslRequired: true,
    ipRestriction: false,
    allowedIPs: [],
    vpnRequired: false,
    geoRestriction: false,
    allowedCountries: [],
  },
  lastUpdated: "2024-01-15T10:30:00Z",
  updatedBy: "Dr. Sarah Johnson",
};

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "event_1",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: "suspicious_activity",
    severity: "high",
    userId: "user_123",
    userName: "Alex Thompson",
    description: "Multiple failed login attempts from unusual location",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    location: "Nairobi, Kenya",
    resolved: false,
  },
  {
    id: "event_2",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: "access_denied",
    severity: "medium",
    userId: "user_456",
    userName: "Emma Johnson",
    description: "Attempted access to restricted administrative area",
    ipAddress: "10.0.1.50",
    userAgent: "Mozilla/5.0...",
    location: "Nairobi, Kenya",
    resolved: true,
    resolvedBy: "System Admin",
    resolvedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const mockSchoolUsers: SchoolUser[] = [
  {
    id: "user_1",
    name: "Dr. Sarah Johnson",
    email: "admin@nairobiacademy.ac.ke",
    role: "ADMIN",
    status: "active",
    lastLogin: "2 hours ago",
    failedAttempts: 0,
    mfaEnabled: true,
    permissions: ["admin", "manage_users", "view_reports"],
    createdAt: "2023-01-15T10:30:00Z",
    lastActivity: "5 minutes ago",
    devices: [
      {
        id: "device_1",
        deviceType: "laptop",
        deviceName: "MacBook Pro",
        lastUsed: "5 minutes ago",
        ipAddress: "10.0.1.100",
        location: "Nairobi, Kenya",
        trusted: true,
      },
    ],
  },
  {
    id: "user_2",
    name: "John Kimani",
    email: "j.kimani@nairobiacademy.ac.ke",
    role: "TEACHER",
    status: "active",
    lastLogin: "1 day ago",
    failedAttempts: 0,
    mfaEnabled: true,
    permissions: ["teach", "view_students", "create_content"],
    createdAt: "2023-02-01T08:00:00Z",
    lastActivity: "3 hours ago",
    devices: [
      {
        id: "device_2",
        deviceType: "mobile",
        deviceName: "iPhone 14",
        lastUsed: "3 hours ago",
        ipAddress: "10.0.1.150",
        location: "Nairobi, Kenya",
        trusted: true,
      },
    ],
  },
];
