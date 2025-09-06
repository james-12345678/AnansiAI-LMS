import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Calendar,
  Mail,
  Phone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCheck,
  UserX,
  Download,
} from "lucide-react";
import axiosClient from "@/services/axiosClient";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  schoolName?: string;
  schoolCode?: string;
  county?: string;
  institutionId?: string | number | null;
  isActive: boolean;
  lastLogin?: string;
  createdDate?: string;
  photoUrl?: string;
}

interface UsersManagementProps {
  onShowMessage?: (message: any) => void;
  refreshTrigger?: number; // Trigger to refresh users when value changes
}

const UsersManagement: React.FC<UsersManagementProps> = ({ onShowMessage, refreshTrigger }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Watch for refresh trigger changes to refresh users list
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log("🔄 Refresh trigger activated, fetching users...");
      fetchUsers();
    }
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("👥 Fetching users from API...");

      // First try to get all students (which might include all users)
      let allUsersData = [];

      try {
        console.log("🔍 Trying to fetch all students (might include all users)...");
        const studentsResponse = await axiosClient.get("/api/Users/students");
        console.log("📚 Students response:", studentsResponse.data);
        if (studentsResponse.data && Array.isArray(studentsResponse.data)) {
          allUsersData = studentsResponse.data;
        }
      } catch (error) {
        console.warn("⚠️ Students endpoint failed:", error.message);
      }

      // Also try to get all users from general endpoint
      try {
        console.log("🔍 Trying to fetch all users from general endpoint...");
        const allUsersResponse = await axiosClient.get("/api/Users");
        console.log("👥 All users response:", allUsersResponse.data);
        if (allUsersResponse.data && Array.isArray(allUsersResponse.data)) {
          allUsersData = [...allUsersData, ...allUsersResponse.data];
        }
      } catch (error) {
        console.warn("⚠️ General users endpoint failed:", error.message);
      }

      // Fetch users from the correct roles as per API documentation
      const validRoles = ["Admin", "Teacher", "Student"];

      const roleRequests = validRoles.map((role) =>
        axiosClient
          .get(`/api/Users/get-users-by-role?roleName=${role}`)
          .then(response => {
            console.log(`✅ Fetched ${role} users:`, response.data);
            return response;
          })
          .catch((error) => {
            console.warn(`⚠️ Failed to fetch ${role} users:`, error.response?.status, error.message);
            return { data: [] };
          }),
      );

      const responses = await Promise.all(roleRequests);
      console.log("✅ Users API responses:");
      responses.forEach((response, index) => {
        const role = validRoles[index];
        console.log(`📋 ${role} users:`, response.data);
        if (response.data && Array.isArray(response.data)) {
          console.log(`   Count: ${response.data.length}`);
          response.data.forEach((user, userIndex) => {
            console.log(`   👤 ${role} User ${userIndex + 1} COMPLETE STRUCTURE:`, user);
            console.log(`   🔍 ${role} User ${userIndex + 1} FIELD ANALYSIS:`, {
              // ID fields
              id: user.id,
              userId: user.userId,
              Id: user.Id,
              UserId: user.UserId,
              // Name fields
              firstName: user.firstName,
              lastName: user.lastName,
              fullName: user.fullName,
              name: user.name,
              userName: user.userName,
              normalizedUserName: user.normalizedUserName,
              // Contact fields
              email: user.email,
              phoneNumber: user.phoneNumber,
              // Role fields
              role: user.role,
              roleName: user.roleName,
              // Institution fields
              institutionId: user.institutionId,
              InstitutionId: user.InstitutionId,
              institutionName: user.institutionName,
              schoolId: user.schoolId,
              SchoolId: user.SchoolId,
              schoolName: user.schoolName,
              // All available fields
              allFieldNames: Object.keys(user)
            });
          });
        }
      });

      // Combine all user data from different sources
      const roleUsersData = responses.reduce((acc, response) => {
        // Handle different possible response structures
        let userData = response.data;

        // If response.data is already an array, use it directly
        if (Array.isArray(userData)) {
          return acc.concat(userData);
        }

        // If response.data has a 'data' property, use that
        if (userData && userData.data && Array.isArray(userData.data)) {
          return acc.concat(userData.data);
        }

        // If response.data is a single object, wrap it in an array
        if (userData && typeof userData === "object") {
          return acc.concat([userData]);
        }

        // If nothing valid, skip this response
        return acc;
      }, []);

      // Combine students data with role-based data
      const combinedUsersData = [...allUsersData, ...roleUsersData];

      // Deduplicate users by email or id
      const uniqueUsers = combinedUsersData.reduce((acc, user) => {
        const key = user.email || user.id || JSON.stringify(user);
        if (!acc.has(key)) {
          acc.set(key, user);
        }
        return acc;
      }, new Map());

      const finalUsersData = Array.from(uniqueUsers.values());
      console.log(`📊 Combined ${combinedUsersData.length} users, deduplicated to ${finalUsersData.length} unique users`);

      // Transform API data to match UI expectations
      const transformedUsers = Array.isArray(finalUsersData)
        ? finalUsersData.map((user, index) => {
            // Ensure user is an object to prevent errors
            if (!user || typeof user !== 'object') {
              console.warn(`⚠️ Invalid user data at index ${index}:`, user);
              return null;
            }

            console.log(`🔍 Transforming user ${index + 1}:`, {
              email: user.email,
              availableFields: Object.keys(user || {}),
              userIdFound: user.userId,
              role: user.role,
              isStudent: user.role === 'Student',
              rawUserData: user // Log full user object to see actual field names
            });

            // Special debugging for students since they're having issues
            if (user.role === 'Student') {
              console.log(`👨‍🎓 STUDENT USER ${index + 1} DETAILED DEBUG:`, {
                hasFirstName: !!user.firstName,
                hasLastName: !!user.lastName,
                hasFullName: !!user.fullName,
                firstNameValue: user.firstName,
                lastNameValue: user.lastName,
                fullNameValue: user.fullName,
                userIdValue: user.userId,
                emailValue: user.email,
                allFields: Object.keys(user)
              });
            }

            try {
              // Extract name fields with comprehensive fallbacks based on API documentation
              // The API docs show firstName and lastName as the standard fields
              const firstName = user.firstName || user.first_name || user.FirstName ||
                               user.firstname || user.given_name || user.givenName || "";
              const lastName = user.lastName || user.last_name || user.LastName ||
                              user.lastname || user.family_name || user.familyName || user.surname || "";
              const fullNameDirect = user.fullName || user.full_name || user.name || user.Name ||
                                   user.displayName || user.userName || user.username || user.normalizedUserName || "";

              console.log(`📝 Name extraction for user ${index + 1}:`, {
                firstName,
                lastName,
                fullNameDirect,
                originalFields: {
                  firstName: user.firstName,
                  lastName: user.lastName,
                  fullName: user.fullName,
                  name: user.name,
                  normalizedUserName: user.normalizedUserName,
                  userName: user.userName
                },
                allAvailableFields: Object.keys(user).filter(key =>
                  key.toLowerCase().includes('name') ||
                  key.toLowerCase().includes('first') ||
                  key.toLowerCase().includes('last')
                )
              });

              // Extract email safely
              const email = user.email || user.Email || user.emailAddress || "";

              // Extract phone safely
              const phoneNumber = user.phoneNumber || user.phone_number || user.Phone || user.PhoneNumber || "";

              // Extract role with multiple fallbacks
              let roleName = "Unknown";
              if (typeof user.role === 'string') {
                // Role is directly a string like "Admin"
                roleName = user.role;
              } else if (user.role?.name) {
                // Role is an object with name property
                roleName = user.role.name;
              } else if (user.roleName) {
                roleName = user.roleName;
              } else if (user.roles && Array.isArray(user.roles) && user.roles[0]?.name) {
                roleName = user.roles[0].name;
              } else if (user.Role) {
                roleName = user.Role;
              }

              // Construct full name safely with extensive fallbacks
              let fullName = "Unknown User";

              // Priority 1: Use direct full name if available
              if (fullNameDirect && fullNameDirect.trim()) {
                fullName = fullNameDirect.trim();
                console.log(`✅ Using direct full name: "${fullName}" ${user.role === 'Student' ? '(STUDENT)' : ''}`);
              }
              // Priority 2: Construct from firstName and lastName
              else if (firstName && lastName) {
                fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
                console.log(`✅ Constructed name from firstName + lastName: "${fullName}"`);
              }
              // Priority 3: Use just firstName if available
              else if (firstName && firstName.trim()) {
                fullName = firstName.trim();
                console.log(`✅ Using firstName only: "${fullName}"`);
              }
              // Priority 4: Use just lastName if available
              else if (lastName && lastName.trim()) {
                fullName = lastName.trim();
                console.log(`✅ Using lastName only: "${fullName}"`);
              }
              // Priority 5: Try userName or normalizedUserName
              else if (user.userName && user.userName.trim()) {
                fullName = user.userName.trim();
                console.log(`✅ Using userName: "${fullName}"`);
              }
              else if (user.normalizedUserName && user.normalizedUserName.trim()) {
                fullName = user.normalizedUserName.trim();
                console.log(`✅ Using normalizedUserName: "${fullName}"`);
              }
              // Priority 6: Extract name from email
              else if (email && email.includes('@')) {
                const emailUsername = email.split('@')[0];
                if (emailUsername && emailUsername.trim()) {
                  // Convert email username to a more readable format
                  fullName = emailUsername.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  console.log(`✅ Using email-based name: "${fullName}" from "${emailUsername}"`);
                }
              }

              // If still "Unknown User", log detailed debug info
              if (fullName === "Unknown User") {
                console.error(`❌ COULD NOT EXTRACT NAME for user ${index + 1}:`, {
                  fullNameDirect,
                  firstName,
                  lastName,
                  email,
                  userName: user.userName,
                  normalizedUserName: user.normalizedUserName,
                  allNameRelatedFields: Object.keys(user).filter(key =>
                    key.toLowerCase().includes('name') ||
                    key.toLowerCase().includes('first') ||
                    key.toLowerCase().includes('last') ||
                    key.toLowerCase().includes('user')
                  ),
                  completeUserObject: user
                });
              }

              // Extract institution info safely with comprehensive fallbacks
              const schoolName = user.schoolName || user.institutionName || user.institution?.name ||
                                user.SchoolName || user.InstitutionName || user.InstitutionName ||
                                user.schoolname || user.institutionname || "N/A";

              console.log(`🏷️ User ${email || index} role:`, roleName, 'Raw role data:', user.role || user.roles);

              // Extract ID with comprehensive fallbacks - ASP.NET Identity typically uses "id"
              // But also check for userId, email, or other unique identifiers
              const userId = user.id || user.Id || user.userId || user.UserId ||
                           user.appUserId || user.AppUserId || user.normalizedUserName ||
                           user.userName || email || `user-${Date.now()}-${index}`;

              // Extract institution/school ID with comprehensive fallbacks
              const institutionId = user.institutionId || user.InstitutionId || user.schoolId || user.SchoolId ||
                                  user.institution_id || user.Institution_Id || user.school_id || user.School_Id || null;

              console.log(`🔍 User ${email || index} field extraction:`, {
                extractedId: userId,
                extractedInstitutionId: institutionId,
                allFields: Object.keys(user || {}),
                primaryIdField: user.id,
                userIdField: user.userId,
                normalizedUserNameField: user.normalizedUserName,
                userNameField: user.userName,
                institutionFieldsChecked: {
                  institutionId: user.institutionId,
                  InstitutionId: user.InstitutionId,
                  schoolId: user.schoolId,
                  SchoolId: user.SchoolId
                }
              });

              const transformedUser = {
                id: userId,
                firstName: firstName,
                lastName: lastName,
                fullName: fullName,
                email: email || "N/A",
                phoneNumber: phoneNumber || "N/A",
                role: roleName,
                schoolName: schoolName,
                schoolCode: user.schoolCode || user.SchoolCode || "N/A",
                county: user.county || user.County || "N/A",
                institutionId: institutionId, // Add institutionId to the returned object
                isActive: user.isActive !== undefined ? Boolean(user.isActive) : true,
                lastLogin: user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : "Never",
                createdDate: user.createdDate || user.createdAt || user.CreatedAt || new Date().toISOString(),
                photoUrl: user.photoUrl || user.ProfilePicture || "",
              };

              // Debug final transformed user, especially for students
              if (user.role === 'Student') {
                console.log(`👨‍🎓 FINAL TRANSFORMED STUDENT ${index + 1}:`, transformedUser);
              }

              return transformedUser;
            } catch (error) {
              console.error(`❌ Error transforming user ${index}:`, error, user);
              return {
                id: String(index + 1),
                firstName: "",
                lastName: "",
                fullName: "Data Error",
                email: "error@example.com",
                phoneNumber: "N/A",
                role: "Unknown",
                schoolName: "N/A",
                schoolCode: "N/A",
                county: "N/A",
                isActive: false,
                lastLogin: "Never",
                createdDate: new Date().toISOString(),
                photoUrl: "",
              };
            }
          }).filter(Boolean)
        : [];

      setUsers(transformedUsers);
      console.log(
        `✅ Successfully loaded ${transformedUsers.length} users from API`,
      );

      onShowMessage?.({
        id: Date.now().toString(),
        type: "success",
        priority: "medium",
        title: "Users Loaded",
        message: `✅ Loaded ${transformedUsers.length} users from API`,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Failed to fetch users:", error);
      setError("Failed to load users");
      setUsers([]);

      onShowMessage?.({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "API Error",
        message: `❌ Failed to load users: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      console.log(`🗑️ Attempting to delete user ${selectedUser.id}`);

      // The API doesn't have a delete endpoint, so we show an error message
      console.warn("⚠️ Delete endpoint not available in API");

      setIsDeleteDialogOpen(false);
      setSelectedUser(null);

      onShowMessage?.({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Delete Not Available",
        message:
          "User deletion is not supported by the current API. Contact system administrator to add a DELETE /api/Users/{id} endpoint.",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Failed to delete user:", error);

      onShowMessage?.({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Deletion Failed",
        message: error.response?.data?.message || "Failed to delete user",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    setLoading(true);
    try {
      const newStatus = !user.isActive;
      console.log(
        `🔄 Attempting to toggle user ${user.id} status to ${newStatus ? "active" : "inactive"}`,
      );

      // The API doesn't have a status update endpoint, so we show an error message
      console.warn("⚠️ Status update endpoint not available in API");

      onShowMessage?.({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Status Update Not Available",
        message:
          "User status updates are not supported by the current API. Contact system administrator to add a PUT /api/Users/{id}/status endpoint.",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Failed to update user status:", error);
      onShowMessage?.({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Update Failed",
        message:
          error.response?.data?.message || "Failed to update user status",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const openView = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleExportUsers = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Name,Email,Phone,Role,School,Status,Last Login\n" +
      filteredUsers
        .map(
          (user) =>
            `"${user.fullName}","${user.email}","${user.phoneNumber}","${user.role}","${user.schoolName}","${user.isActive ? "Active" : "Inactive"}","${user.lastLogin}"`,
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `anansiai_users_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onShowMessage?.({
      id: Date.now().toString(),
      type: "success",
      priority: "medium",
      title: "Export Complete",
      message: `Successfully exported ${filteredUsers.length} users to CSV file.`,
      timestamp: new Date().toISOString(),
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "all" ||
      user.role.toLowerCase().includes(filterRole.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getRoleColor = (role: string) => {
    if (!role || typeof role !== 'string') {
      return "bg-gray-100 text-gray-800";
    }

    switch (role.toLowerCase()) {
      case "admin":
      case "administrator":
        return "bg-blue-100 text-blue-800";
      case "teacher":
      case "instructor":
        return "bg-green-100 text-green-800";
      case "student":
        return "bg-yellow-100 text-yellow-800";
      case "unknown":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Users Management</h3>
          <p className="text-gray-600">
            Manage all system users across institutions. View, edit, and manage
            user accounts and permissions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportUsers}
            disabled={loading || filteredUsers.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or school..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div>
                <Label htmlFor="role-filter">Role</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            Manage users and assign permissions across institutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-500">No users found</p>
                        <p className="text-xs text-gray-400">
                          Check browser console for API response details
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchUsers}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Users
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log("🔍 Current users state:", users);
                              console.log("🔍 Filtered users:", filteredUsers);
                              console.log("🔍 Search term:", searchTerm);
                              console.log("🔍 Role filter:", filterRole);
                              console.log("🔍 Status filter:", filterStatus);
                            }}
                          >
                            Debug Info
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              console.log("🧪 Testing individual API endpoints...");
                              for (const role of ["Admin", "Teacher", "Student"]) {
                                try {
                                  const response = await axiosClient.get(`/api/Users/get-users-by-role?roleName=${role}`);
                                  console.log(`✅ ${role} endpoint response:`, response.data);
                                  if (response.data && response.data.length > 0) {
                                    const firstUser = response.data[0];
                                    console.log(`🔍 ${role} user fields:`, Object.keys(firstUser));
                                    console.log(`🔍 ${role} user ID field:`, firstUser.id || firstUser.Id || firstUser.userId || firstUser.UserId || 'NOT FOUND');
                                    console.log(`🔍 ${role} user institution field:`, firstUser.institutionId || firstUser.InstitutionId || firstUser.schoolId || firstUser.SchoolId || 'NOT FOUND');
                                    console.log(`🔍 ${role} complete first user:`, firstUser);
                                  }
                                } catch (error) {
                                  console.error(`❌ ${role} endpoint failed:`, error);
                                }
                              }
                            }}
                          >
                            Test APIs
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoUrl} />
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {(() => {
                                try {
                                  if (!user.fullName || user.fullName === "Unknown User" || user.fullName === "Data Error") {
                                    return "?";
                                  }
                                  const initials = user.fullName
                                    .split(" ")
                                    .filter(n => n && n.length > 0)
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase();
                                  return initials || "?";
                                } catch {
                                  return "?";
                                }
                              })()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {user.fullName}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                            {user.phoneNumber && user.phoneNumber !== "N/A" && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Phone className="w-3 h-3" />
                                {user.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {user.schoolName === "N/A" ? (
                              <span className="text-gray-400 italic">
                                Institution not specified
                              </span>
                            ) : (
                              user.schoolName
                            )}
                          </p>
                          {(user.schoolCode !== "N/A" || user.county !== "N/A") && (
                            <p className="text-xs text-gray-600">
                              {user.schoolCode !== "N/A" ? user.schoolCode : ""}
                              {user.schoolCode !== "N/A" && user.county !== "N/A" ? " • " : ""}
                              {user.county !== "N/A" ? user.county : ""}
                            </p>
                          )}
                          {user.institutionId && (
                            <p className="text-xs text-gray-500">
                              ID: {user.institutionId}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.isActive)}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {user.lastLogin}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openView(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled
                              className="text-gray-400"
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Status Toggle (Not Available)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled
                              className="text-gray-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete (Not Available)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    if (pageNum > totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.photoUrl} />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {selectedUser.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-lg">
                    {selectedUser.fullName}
                  </h4>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Email
                  </Label>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Phone
                  </Label>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedUser.phoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    School
                  </Label>
                  <p>{selectedUser.schoolName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    County
                  </Label>
                  <p>{selectedUser.county}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Institution ID
                  </Label>
                  <p>{selectedUser.institutionId || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge className={getStatusColor(selectedUser.isActive)}>
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Last Login
                  </Label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {selectedUser.lastLogin}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedUser?.fullName}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
