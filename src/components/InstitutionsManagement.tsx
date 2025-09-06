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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import {
  School,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  Search,
  Calendar,
  MapPin,
  Building,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axiosClient from "@/services/axiosClient";
import SchoolRegistration from "./SchoolRegistration";

interface Institution {
  institutionId?: number;
  id?: number;
  name: string;
  address: string;
  institutionType?: number;
  createdDate?: string;
  modifiedDate?: string;
  createdBy?: string;
  modifiedBy?: string;
  isDeleted?: boolean;
}

interface InstitutionsManagementProps {
  onShowMessage?: (message: any) => void;
}

const InstitutionsManagement: React.FC<InstitutionsManagementProps> = ({
  onShowMessage,
}) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdminRegistrationOpen, setIsAdminRegistrationOpen] = useState(false);
  const [isFullRegistrationOpen, setIsFullRegistrationOpen] = useState(false);

  // Form states
  const [editingInstitution, setEditingInstitution] =
    useState<Institution | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    institutionType: 1 as number,
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🏫 Fetching institutions...");
      const response = await axiosClient.get("/api/Institutions");
      console.log("✅ Institutions fetched:", response.data);
      setInstitutions(response.data.data || []);
    } catch (error: any) {
      console.error("❌ Failed to fetch institutions:", error);
      setError("Failed to load institutions");
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstitution) return;

    setLoading(true);
    try {
      const institutionId =
        editingInstitution.institutionId || editingInstitution.id;
      const payload = {
        name: formData.name,
        address: formData.address,
        institutionType: Number(formData.institutionType) || 1,
        modifiedBy: "super-admin",
        isDeleted: false,
        institutionId: institutionId,
      };

      console.log(`📝 Updating institution ${institutionId}:`, payload);
      const response = await axiosClient.put(
        `/api/Institutions/${institutionId}`,
        payload,
      );
      console.log("✅ Institution updated:", response.data);

      await fetchInstitutions(); // Refresh list
      setIsEditDialogOpen(false);
      setEditingInstitution(null);
      setFormData({ name: "", address: "" });

      onShowMessage?.({
        id: Date.now().toString(),
        type: "success",
        priority: "medium",
        title: "Institution Updated",
        message: `${formData.name} has been updated successfully.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Failed to update institution:", error);
      onShowMessage?.({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Update Failed",
        message:
          error.response?.data?.message || "Failed to update institution",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingInstitution) return;

    setLoading(true);
    try {
      const institutionId =
        editingInstitution.institutionId || editingInstitution.id;
      console.log(`🗑️ Deleting institution ${institutionId}`);
      await axiosClient.delete(`/api/Institutions/${institutionId}`);
      console.log("✅ Institution deleted");

      await fetchInstitutions(); // Refresh list
      setIsDeleteDialogOpen(false);
      setEditingInstitution(null);

      onShowMessage?.({
        id: Date.now().toString(),
        type: "success",
        priority: "medium",
        title: "Institution Deleted",
        message: `${editingInstitution.name} has been deleted successfully.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Failed to delete institution:", error);
      onShowMessage?.({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Deletion Failed",
        message:
          error.response?.data?.message || "Failed to delete institution",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (institution: Institution) => {
    setEditingInstitution(institution);
    setFormData({
      name: institution.name,
      address: institution.address,
      institutionType: institution.institutionType || 1,
    });
    setIsEditDialogOpen(true);
  };

  const openDelete = (institution: Institution) => {
    setEditingInstitution(institution);
    setIsDeleteDialogOpen(true);
  };

  const openAddAdmin = (institution: Institution) => {
    setEditingInstitution(institution);
    setIsAdminRegistrationOpen(true);
  };

  const filteredInstitutions = institutions.filter(
    (institution) =>
      institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.address.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInstitutions = filteredInstitutions.slice(
    startIndex,
    endIndex,
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Institutions Management
          </h3>
          <p className="text-gray-600">
            Manage all educational institutions and their administrators. Create
            institutions and assign administrators through the multistep
            registration process.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchInstitutions}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {/* Add New Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsFullRegistrationOpen(true)}>
                <Building className="mr-2 h-4 w-4" />
                Institution (with Admin)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (institutions.length > 0) {
                    setIsAdminRegistrationOpen(true);
                  } else {
                    // Always allow access - the registration form will handle institution selection
                    setIsAdminRegistrationOpen(true);
                  }
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Administrator Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search institutions</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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

      {/* Institutions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Institutions ({filteredInstitutions.length})
          </CardTitle>
          <CardDescription>
            Manage institutions and assign administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading institutions...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredInstitutions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <School className="w-8 h-8 text-gray-400" />
                        <p className="text-gray-500">No institutions found</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsFullRegistrationOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Institution
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInstitutions.map((institution) => (
                    <TableRow key={institution.institutionId || institution.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4 text-blue-600" />
                          {institution.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {institution.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {(() => {
                            const t = institution.institutionType;
                            return t === 2 ? "Secondary" : t === 3 ? "Tertiary" : "Primary";
                          })()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {institution.createdDate
                            ? new Date(
                                institution.createdDate,
                              ).toLocaleDateString()
                            : "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {institution.createdBy || "System"}
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
                            <DropdownMenuItem
                              onClick={() => openAddAdmin(institution)}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Add Administrator
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openEdit(institution)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Institution
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDelete(institution)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Institution
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
                {Math.min(endIndex, filteredInstitutions.length)} of{" "}
                {filteredInstitutions.length} institutions
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

      {/* Edit Institution Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Institution</DialogTitle>
            <DialogDescription>
              Update the institution information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Institution Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter institution name"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address *</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter complete address"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Institution Type *</Label>
              <Select
                value={String(formData.institutionType)}
                onValueChange={(v) => setFormData({ ...formData, institutionType: Number(v) })}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Primary</SelectItem>
                  <SelectItem value="2">Secondary</SelectItem>
                  <SelectItem value="3">Tertiary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Institution"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Institution</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{editingInstitution?.name}"? This
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
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Institution Registration Modal (Steps 1 & 2) */}
      <SchoolRegistration
        isOpen={isFullRegistrationOpen}
        onClose={() => {
          setIsFullRegistrationOpen(false);
        }}
        onSuccess={() => {
          setIsFullRegistrationOpen(false);
          fetchInstitutions(); // Refresh the institutions list
          onShowMessage?.({
            id: Date.now().toString(),
            type: "success",
            priority: "medium",
            title: "Institution & Administrator Created",
            message:
              "Institution and administrator have been successfully created.",
            timestamp: new Date().toISOString(),
          });
        }}
        initialStep={1} // Start from Step 1
      />

      {/* Admin Registration Modal (Step 2 Only) */}
      <SchoolRegistration
        isOpen={isAdminRegistrationOpen}
        onClose={() => {
          setIsAdminRegistrationOpen(false);
          setEditingInstitution(null);
        }}
        onSuccess={() => {
          setIsAdminRegistrationOpen(false);
          setEditingInstitution(null);
          onShowMessage?.({
            id: Date.now().toString(),
            type: "success",
            priority: "medium",
            title: "Administrator Added",
            message: `Administrator has been successfully added to ${editingInstitution?.name}.`,
            timestamp: new Date().toISOString(),
          });
        }}
        initialStep={2} // Skip directly to admin registration
        preSelectedInstitution={editingInstitution}
      />
    </div>
  );
};

export default InstitutionsManagement;
