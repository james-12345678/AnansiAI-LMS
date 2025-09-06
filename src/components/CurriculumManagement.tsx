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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  BookOpen,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import {
  Curriculum,
  CurriculumFormData,
  CurriculumFilter,
  COMMON_CURRICULUMS,
} from "@/types/curriculum";
import { AdminApiService } from "@/services/adminApiService";
import { useToast } from "@/hooks/use-toast";

interface CurriculumManagementProps {
  onCurriculumChange?: () => void;
}

const CurriculumManagement: React.FC<CurriculumManagementProps> = ({
  onCurriculumChange,
}) => {
  const { toast } = useToast();
  const adminApiService = AdminApiService.getInstance();

  // State management
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<Curriculum | null>(null);
  const [filter, setFilter] = useState<CurriculumFilter>({});

  // Form state
  const [formData, setFormData] = useState<CurriculumFormData>({
    name: "",
    description: "",
  });

  // Load curriculums on mount
  useEffect(() => {
    loadCurriculums();
  }, []);

  const loadCurriculums = async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading curriculums from API...");
      const apiCurriculums = await adminApiService.getCurriculums();

      // Convert API format to component format
      const convertedCurriculums: Curriculum[] = apiCurriculums.map((curr) => ({
        id: curr.curriculumId.toString(),
        name: curr.name,
        description: curr.description,
        // Do not use/derive curriculum codes on front-end; show full names only
        code: undefined,
        isActive: !curr.isDeleted,
        createdAt: curr.createdDate || new Date().toISOString(),
        updatedAt: curr.modifiedDate || new Date().toISOString(),
      }));

      setCurriculums(convertedCurriculums);
      console.log(
        "✅ Loaded curriculums from API:",
        convertedCurriculums.length,
      );
    } catch (error) {
      console.error("❌ Error loading curriculums from API:", error);

      // Show specific error message for connection issues
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("Network Error") ||
          error.message.includes("Mixed Content") ||
          error.message.includes("timeout"));

      toast({
        variant: "destructive",
        title: "Error Loading Curriculums",
        description: isConnectionError
          ? "Unable to connect to API server. Check connection and try again."
          : "Failed to load curriculums from API",
      });

      // Don't set empty array on error - leave existing data if any
      if (curriculums.length === 0) {
        setCurriculums([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Curriculum name is required",
      });
      return;
    }

    // Check for duplicates
    const duplicate = curriculums.find(
      (c) => c.name.toLowerCase() === formData.name.toLowerCase(),
    );
    if (duplicate) {
      toast({
        variant: "destructive",
        title: "Duplicate Curriculum",
        description: "A curriculum with this name already exists",
      });
      return;
    }

    try {
      console.log("🔄 Creating curriculum via API...");

      const createData = {
        name: formData.name,
        description: formData.description,
      };

      const createdCurriculum =
        await adminApiService.createCurriculum(createData);

      console.log("✅ Curriculum created successfully:", createdCurriculum);

      // Reload curriculums to get the latest data
      await loadCurriculums();

      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Curriculum created successfully",
      });

      onCurriculumChange?.();
    } catch (error) {
      console.error("❌ Error creating curriculum:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create curriculum. Please try again.",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedCurriculum || !formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Curriculum name is required",
      });
      return;
    }

    // Check for duplicates (excluding current item)
    const duplicate = curriculums.find(
      (c) =>
        c.id !== selectedCurriculum.id &&
        c.name.toLowerCase() === formData.name.toLowerCase(),
    );
    if (duplicate) {
      toast({
        variant: "destructive",
        title: "Duplicate Curriculum",
        description: "A curriculum with this name already exists",
      });
      return;
    }

    try {
      console.log("🔄 Updating curriculum via API...");

      const updateData = {
        name: formData.name,
        description: formData.description,
      };

      const curriculumId = parseInt(selectedCurriculum.id);
      const updatedCurriculum = await adminApiService.updateCurriculum(
        curriculumId,
        updateData,
      );

      console.log("✅ Curriculum updated successfully:", updatedCurriculum);

      // Reload curriculums to get the latest data
      await loadCurriculums();

      setIsEditDialogOpen(false);
      setSelectedCurriculum(null);
      resetForm();

      toast({
        title: "Success",
        description: "Curriculum updated successfully",
      });

      onCurriculumChange?.();
    } catch (error) {
      console.error("❌ Error updating curriculum:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update curriculum. Please try again.",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCurriculum) return;

    try {
      console.log("🔄 Deleting curriculum via API...");

      const curriculumId = parseInt(selectedCurriculum.id);
      await adminApiService.deleteCurriculum(curriculumId);

      console.log("✅ Curriculum deleted successfully");

      // Reload curriculums to get the latest data
      await loadCurriculums();

      setIsDeleteDialogOpen(false);
      setSelectedCurriculum(null);

      toast({
        title: "Success",
        description: "Curriculum deleted successfully",
      });

      onCurriculumChange?.();
    } catch (error) {
      console.error("❌ Error deleting curriculum:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete curriculum. Please try again.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setFormData({
      name: curriculum.name,
      description: curriculum.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setIsDeleteDialogOpen(true);
  };

  const toggleStatus = (curriculum: Curriculum) => {
    const updated = {
      ...curriculum,
      isActive: !curriculum.isActive,
      updatedAt: new Date().toISOString(),
    };

    setCurriculums(
      curriculums.map((c) => (c.id === curriculum.id ? updated : c)),
    );

    toast({
      title: "Success",
      description: `Curriculum ${updated.isActive ? "activated" : "deactivated"} successfully`,
    });

    onCurriculumChange?.();
  };

  // Filter curriculums
  const filteredCurriculums = curriculums.filter((curriculum) => {
    const matchesSearch =
      !filter.search ||
      curriculum.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      curriculum.description
        ?.toLowerCase()
        .includes(filter.search.toLowerCase()) ||
      false;

    const matchesStatus =
      filter.isActive === undefined || curriculum.isActive === filter.isActive;

    return matchesSearch && matchesStatus;
  });

  const handleCommonCurriculumSelect = (value: string) => {
    if (value === "Other") {
      // Allow custom input
      setFormData({ ...formData, name: "" });
    } else {
      setFormData({ ...formData, name: value });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Curriculum Management
          </h3>
          <p className="text-gray-600">
            Manage education systems and curriculum types
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Curriculum
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Curriculums</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={filter.search || ""}
                  onChange={(e) =>
                    setFilter({ ...filter, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status">Status</Label>
              <Select
                value={
                  filter.isActive === undefined
                    ? "all"
                    : filter.isActive
                      ? "active"
                      : "inactive"
                }
                onValueChange={(value) =>
                  setFilter({
                    ...filter,
                    isActive: value === "all" ? undefined : value === "active",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Curriculums Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Curriculums ({filteredCurriculums.length})
          </CardTitle>
          <CardDescription>
            Manage curriculum types and education systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCurriculums.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No curriculums found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCurriculums.map((curriculum) => (
                    <TableRow key={curriculum.id}>
                      <TableCell className="font-medium">
                        {curriculum.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{curriculum.name}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {curriculum.description || "No description"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            curriculum.isActive ? "default" : "secondary"
                          }
                          className={
                            curriculum.isActive
                              ? "bg-green-100 text-green-700"
                              : ""
                          }
                        >
                          {curriculum.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(curriculum.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openViewDialog(curriculum)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(curriculum)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleStatus(curriculum)}
                            >
                              {curriculum.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(curriculum)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Curriculum</DialogTitle>
            <DialogDescription>
              Create a new curriculum system for your institution
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="common-curriculum">
                Common Curriculum Systems
              </Label>
              <Select onValueChange={handleCommonCurriculumSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a common curriculum or choose 'Other' for custom" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CURRICULUMS.map((curriculum) => (
                    <SelectItem key={curriculum} value={curriculum}>
                      {curriculum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Curriculum Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter curriculum name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter curriculum description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Create Curriculum</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Curriculum</DialogTitle>
            <DialogDescription>Update curriculum information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Curriculum Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter curriculum name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter curriculum description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Curriculum</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Curriculum Details</DialogTitle>
            <DialogDescription>View curriculum information</DialogDescription>
          </DialogHeader>
          {selectedCurriculum && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium">
                    {selectedCurriculum.name}
                  </p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">
                  {selectedCurriculum.description || "No description provided"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge
                    variant={
                      selectedCurriculum.isActive ? "default" : "secondary"
                    }
                    className={
                      selectedCurriculum.isActive
                        ? "bg-green-100 text-green-700"
                        : ""
                    }
                  >
                    {selectedCurriculum.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">
                    {new Date(
                      selectedCurriculum.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm">
                  {new Date(selectedCurriculum.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Curriculum</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCurriculum?.name}"? This
              action cannot be undone and will affect all associated subjects,
              milestones, and goals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CurriculumManagement;
