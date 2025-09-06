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
  Calendar,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import { AdminApiService } from "@/services/adminApiService";
import { useToast } from "@/hooks/use-toast";

interface Term {
  termId: number;
  termName: string;
  institutionId: number;
  modifiedDate?: string;
  createdBy?: string;
  modifiedBy?: string;
  isDeleted?: boolean;
}

interface TermFormData {
  termName: string;
  curriculumId: string;
}

interface TermFilter {
  search?: string;
}

interface TermManagementProps {
  onTermChange?: () => void;
}

const TermManagement: React.FC<TermManagementProps> = ({ onTermChange }) => {
  const { toast } = useToast();
  const adminApiService = AdminApiService.getInstance();

  // Helper function to extract curriculum info from term name
  const extractCurriculumFromTermName = (termName: string) => {
    const match = termName.match(/^\[([^\]]+)\]/);
    if (match) {
      const curriculumCode = match[1];

      if (curriculums.length === 0) {
        // Curriculums not loaded yet
        return {
          curriculumCode,
          curriculumName: "Loading...",
          curriculumId: null,
          cleanTermName: termName.replace(/^\[[^\]]+\]\s*/, ""),
          hasPrefix: true,
        };
      }

      const curriculum = curriculums.find((c) => c.code === curriculumCode || c.name === curriculumCode);
      return {
        curriculumCode,
        curriculumName: curriculum?.name || `Unknown (${curriculumCode})`,
        curriculumId: curriculum?.id || null,
        cleanTermName: termName.replace(/^\[[^\]]+\]\s*/, ""),
        hasPrefix: true,
      };
    }
    // Legacy term without curriculum prefix
    return {
      curriculumCode: "LEGACY",
      curriculumName: "Legacy Term",
      curriculumId: null,
      cleanTermName: termName,
      hasPrefix: false,
    };
  };

  // State management
  const [terms, setTerms] = useState<Term[]>([]);
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [filter, setFilter] = useState<TermFilter>({});

  // Form state
  const [formData, setFormData] = useState<TermFormData>({
    termName: "",
    curriculumId: "",
  });

  // Load data on mount
  useEffect(() => {
    loadCurriculums().then(() => {
      loadTerms();
    });
  }, []);

  const loadTerms = async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading terms from API...");
      const apiTerms = await adminApiService.getTerms();
      setTerms(apiTerms);
      console.log("✅ Loaded terms from API:", apiTerms.length);
    } catch (error) {
      console.error("❌ Error loading terms from API:", error);

      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("Network Error") ||
          error.message.includes("Mixed Content") ||
          error.message.includes("timeout"));

      toast({
        variant: "destructive",
        title: "Error Loading Terms",
        description: isConnectionError
          ? "Unable to connect to API server. Check connection and try again."
          : "Failed to load terms from API",
      });

      if (terms.length === 0) {
        setTerms([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCurriculums = async () => {
    try {
      console.log("🔄 Loading curriculums from API for terms...");
      const apiCurriculums = await adminApiService.getCurriculums();

      // Convert API format to component format
      const convertedCurriculums = apiCurriculums.map((curr) => ({
        id: curr.curriculumId.toString(),
        name: curr.name,
        description: curr.description,
        code: undefined,
        isActive: !curr.isDeleted,
        createdAt: curr.modifiedDate || new Date().toISOString(),
        updatedAt: curr.modifiedDate || new Date().toISOString(),
      }));

      setCurriculums(convertedCurriculums);
      console.log(
        "✅ Loaded curriculums from API for terms:",
        convertedCurriculums.length,
      );
    } catch (error) {
      console.error("❌ Error loading curriculums from API:", error);
      setCurriculums([]);
    }
  };

  const handleAdd = async () => {
    if (!formData.termName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Term name is required",
      });
      return;
    }

    if (!formData.curriculumId) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a curriculum for this term",
      });
      return;
    }

    // Get curriculum for validation and prefix
    const selectedCurriculum = curriculums.find(
      (c) => c.id === formData.curriculumId,
    );

    // Check for duplicates within the same curriculum
    const duplicate = terms.find((t) => {
      const termCurriculumInfo = extractCurriculumFromTermName(t.termName);
      return (
        termCurriculumInfo.cleanTermName.toLowerCase() ===
          formData.termName.toLowerCase() &&
        (termCurriculumInfo.curriculumCode === selectedCurriculum?.code || termCurriculumInfo.curriculumCode === selectedCurriculum?.name)
      );
    });

    if (duplicate) {
      toast({
        variant: "destructive",
        title: "Duplicate Term",
        description: "A term with this name already exists in this curriculum",
      });
      return;
    }

    try {
      console.log("🔄 Creating term via API...");

      // Create curriculum prefix for term name
      const curriculumPrefix = selectedCurriculum
        ? `[${selectedCurriculum.name}]`
        : `[CUR${formData.curriculumId}]`;

      const createData = {
        termName: `${curriculumPrefix} ${formData.termName}`, // Include curriculum context in name
        institutionId: 1, // Backend will determine the actual institution from auth
      };

      console.log("📤 API Payload for term:", createData);
      const createdTerm = await adminApiService.createTerm(createData);
      console.log("✅ Term created successfully:", createdTerm);

      // Reload terms to get the latest data from API
      await loadTerms();

      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Term created successfully",
      });

      onTermChange?.();
    } catch (error) {
      console.error("�� Error creating term:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create term. Please try again.",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedTerm || !formData.termName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Term name is required",
      });
      return;
    }

    // Check for duplicates within the same curriculum (excluding current item)
    const selectedCurriculum = curriculums.find(
      (c) => c.id === formData.curriculumId,
    );

    const duplicate = terms.find((t) => {
      if (t.termId === selectedTerm.termId) return false; // Exclude current item

      const termCurriculumInfo = extractCurriculumFromTermName(t.termName);
      return (
        termCurriculumInfo.cleanTermName.toLowerCase() ===
          formData.termName.toLowerCase() &&
        (termCurriculumInfo.curriculumCode === selectedCurriculum?.code || termCurriculumInfo.curriculumCode === selectedCurriculum?.name)
      );
    });

    if (duplicate) {
      toast({
        variant: "destructive",
        title: "Duplicate Term",
        description: "A term with this name already exists in this curriculum",
      });
      return;
    }

    try {
      console.log("🔄 Updating term via API...");

      // Get curriculum name for context
      const selectedCurriculum = curriculums.find(
        (c) => c.id === formData.curriculumId,
      );
      const curriculumPrefix = selectedCurriculum
        ? `[${selectedCurriculum.name}]`
        : `[CUR${formData.curriculumId}]`;

      const updateData = {
        termName: `${curriculumPrefix} ${formData.termName}`, // Include curriculum context in name
        institutionId: 1, // Backend determines institution from auth
      };

      const updatedTerm = await adminApiService.updateTerm(
        selectedTerm.termId,
        updateData,
      );
      console.log("✅ Term updated successfully:", updatedTerm);

      // Reload terms to get the latest data from API
      await loadTerms();

      setIsEditDialogOpen(false);
      setSelectedTerm(null);
      resetForm();

      toast({
        title: "Success",
        description: "Term updated successfully",
      });

      onTermChange?.();
    } catch (error) {
      console.error("❌ Error updating term:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update term. Please try again.",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedTerm) return;

    try {
      console.log("🔄 Deleting term via API...");

      await adminApiService.deleteTerm(selectedTerm.termId);
      console.log("✅ Term deleted successfully");

      // Reload terms to get the latest data from API
      await loadTerms();

      setIsDeleteDialogOpen(false);
      setSelectedTerm(null);

      toast({
        title: "Success",
        description: "Term deleted successfully",
      });

      onTermChange?.();
    } catch (error) {
      console.error("❌ Error deleting term:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete term. Please try again.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      termName: "",
      curriculumId: "",
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (term: Term) => {
    setSelectedTerm(term);
    const curriculumInfo = extractCurriculumFromTermName(term.termName);

    // Find curriculum by code, fall back to first available curriculum if not found
    let curriculumId = curriculumInfo.curriculumId;
    if (!curriculumId && curriculums.length > 0) {
      // Try to find by code first
      const foundCurriculum = curriculums.find(
        (c) => c.code === curriculumInfo.curriculumCode || c.name === curriculumInfo.curriculumCode,
      );
      curriculumId = foundCurriculum?.id || curriculums[0]?.id || "";
    }

    setFormData({
      termName: curriculumInfo.cleanTermName, // Use clean term name in form
      curriculumId: curriculumId || "",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (term: Term) => {
    setSelectedTerm(term);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (term: Term) => {
    setSelectedTerm(term);
    setIsDeleteDialogOpen(true);
  };

  // Filter terms
  const filteredTerms = terms.filter((term) => {
    const curriculumInfo = extractCurriculumFromTermName(term.termName);
    const matchesSearch =
      !filter.search ||
      term.termName.toLowerCase().includes(filter.search.toLowerCase()) ||
      curriculumInfo.cleanTermName
        .toLowerCase()
        .includes(filter.search.toLowerCase()) ||
      curriculumInfo.curriculumName
        .toLowerCase()
        .includes(filter.search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Term Management</h3>
          <p className="text-gray-600">
            Manage academic terms and time periods for your institution
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
            Add Term
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
              <Label htmlFor="search">Search Terms</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by term name..."
                  value={filter.search || ""}
                  onChange={(e) =>
                    setFilter({ ...filter, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Terms ({filteredTerms.length})
          </CardTitle>
          <CardDescription>
            Academic terms and time periods used throughout the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : curriculums.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No curriculums found. Please create curriculums first.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Term Name</TableHead>
                  <TableHead>Curriculum</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTerms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No terms found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTerms.map((term) => {
                    const curriculumInfo = extractCurriculumFromTermName(
                      term.termName,
                    );
                    return (
                      <TableRow key={term.termId}>
                        <TableCell className="font-medium">
                          {curriculumInfo.cleanTermName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              curriculumInfo.curriculumName === "Legacy Term"
                                ? "secondary"
                                : curriculumInfo.curriculumName === "Loading..."
                                  ? "secondary"
                                  : curriculumInfo.curriculumName.startsWith(
                                        "Unknown",
                                      )
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {curriculumInfo.curriculumName}
                          </Badge>
                        </TableCell>
                        <TableCell>{term.createdBy || "System"}</TableCell>
                        <TableCell>
                          {term.modifiedDate
                            ? new Date(term.modifiedDate).toLocaleDateString()
                            : "Not modified"}
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
                                onClick={() => openViewDialog(term)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(term)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(term)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
            <DialogTitle>Add New Term</DialogTitle>
            <DialogDescription>
              Create a new academic term or time period
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Term Name *</Label>
              <Input
                id="name"
                value={formData.termName}
                onChange={(e) =>
                  setFormData({ ...formData, termName: e.target.value })
                }
                placeholder="Enter term name (e.g., Term 1, Quarter 1, Semester 1)"
              />
            </div>
            <div>
              <Label htmlFor="curriculum">Curriculum *</Label>
              {curriculums.length === 0 ? (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 mt-2">
                  ⚠️ No curriculums available. Please create curriculums first
                  before adding terms.
                </div>
              ) : (
                <Select
                  value={formData.curriculumId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, curriculumId: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select curriculum" />
                  </SelectTrigger>
                  <SelectContent>
                    {curriculums
                      .filter((c) => c.isActive)
                      .map((curriculum) => (
                        <SelectItem key={curriculum.id} value={curriculum.id}>
                          {curriculum.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Create Term</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Term</DialogTitle>
            <DialogDescription>Update term information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Term Name *</Label>
              <Input
                id="edit-name"
                value={formData.termName}
                onChange={(e) =>
                  setFormData({ ...formData, termName: e.target.value })
                }
                placeholder="Enter term name"
              />
            </div>
            <div>
              <Label htmlFor="edit-curriculum">Curriculum *</Label>
              <Select
                value={formData.curriculumId}
                onValueChange={(value) =>
                  setFormData({ ...formData, curriculumId: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select curriculum" />
                </SelectTrigger>
                <SelectContent>
                  {curriculums
                    .filter((c) => c.isActive)
                    .map((curriculum) => (
                      <SelectItem key={curriculum.id} value={curriculum.id}>
                        {curriculum.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Term</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Term Details</DialogTitle>
            <DialogDescription>View term information</DialogDescription>
          </DialogHeader>
          {selectedTerm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Term Name</Label>
                  <p className="text-sm font-medium">
                    {
                      extractCurriculumFromTermName(selectedTerm.termName)
                        .cleanTermName
                    }
                  </p>
                </div>
                <div>
                  <Label>Curriculum</Label>
                  <p className="text-sm font-medium">
                    {
                      extractCurriculumFromTermName(selectedTerm.termName)
                        .curriculumName
                    }
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created By</Label>
                  <p className="text-sm">
                    {selectedTerm.createdBy || "System"}
                  </p>
                </div>
                <div>
                  <Label>Last Modified</Label>
                  <p className="text-sm">
                    {selectedTerm.modifiedDate
                      ? new Date(selectedTerm.modifiedDate).toLocaleDateString()
                      : "Not modified"}
                  </p>
                </div>
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
            <AlertDialogTitle>Delete Term</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTerm?.termName}"? This
              action cannot be undone and may affect milestones and goals that
              reference this term.
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

export default TermManagement;
