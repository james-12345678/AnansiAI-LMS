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
  Link,
} from "lucide-react";
import {
  Subject,
  Curriculum,
  SubjectFormData,
  SubjectFilter,
  SubjectCurriculumRelation,
} from "@/types/curriculum";
import { AdminApiService } from "@/services/adminApiService";
import { useToast } from "@/hooks/use-toast";

interface SubjectManagementProps {
  onSubjectChange?: () => void;
}

const SubjectManagement: React.FC<SubjectManagementProps> = ({
  onSubjectChange,
}) => {
  const { toast } = useToast();
  const adminApiService = AdminApiService.getInstance();

  // State management
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [relations, setRelations] = useState<SubjectCurriculumRelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRelationDialogOpen, setIsRelationDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [filter, setFilter] = useState<SubjectFilter>({});

  // Form state
  const [formData, setFormData] = useState<SubjectFormData>({
    name: "",
    description: "",
    curriculumIds: [], // Single curriculum selection via dropdown
  });

  // Load data on mount
  useEffect(() => {
    const initializeData = async () => {
      await loadSubjects();
      await loadCurriculums();
      await loadRelations(); // Now this will run after curriculums are loaded
    };
    initializeData();

    // Listen for global subject changes so this component can refresh automatically
    const handler = async () => {
      console.log('📣 subjects:changed event received, reloading curriculums and subjects...');
      // Ensure curriculums are fresh before building relations
      await loadCurriculums();
      await loadSubjects();
      await loadRelations();
    };
    window.addEventListener('subjects:changed', handler as EventListener);
    return () => {
      window.removeEventListener('subjects:changed', handler as EventListener);
    };
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading subjects from API...");

      // Get institution ID from JWT token
      let institutionId: number | null = null;
      const token = localStorage.getItem("anansi_token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          institutionId = payload.institutionId;
          console.log("�� Using institutionId from token:", institutionId);
        } catch (error) {
          console.warn("⚠️ Could not extract institutionId from token:", error);
        }
      }

      // Use institution-specific endpoint if available, otherwise fallback to general endpoint
      const apiSubjects = institutionId
        ? await adminApiService.getSubjectsByInstitution(institutionId)
        : await adminApiService.getSubjects();

      console.log("🔍 Raw API subjects response:", apiSubjects);
      if (apiSubjects.length > 0) {
        console.log("🔍 First subject structure:", apiSubjects[0]);
        console.log("🔍 Available fields:", Object.keys(apiSubjects[0]));
        console.log("🔍 All subjects:", apiSubjects);
      }

      // Fetch full subject details in parallel (subject endpoint) so we capture curriculumId assigned by backend
      console.log("🔄 Fetching full subject details in parallel to obtain curriculumId where available...");
      const subjectDetailsPromises = apiSubjects.map((s: any) =>
        adminApiService.getSubject(s.subjectId).then((full) => ({ status: 'fulfilled', value: full })).catch((err) => ({ status: 'rejected', reason: err, value: s }))
      );
      const settled = await Promise.all(subjectDetailsPromises);

      const convertedSubjects: Subject[] = settled.map((res: any, idx: number) => {
        const raw = apiSubjects[idx];
        const full = res.status === 'fulfilled' ? res.value : res.value; // if rejected we stored original raw as value
        const subj = full || raw;
        return {
          id: subj.subjectId.toString(),
          name: subj.subjectName || subj.name || 'Unknown Subject',
          description: subj.description || '',
          code: undefined,
          isActive: subj.isDeleted !== undefined ? !subj.isDeleted : true,
          createdAt: subj.modifiedDate || new Date().toISOString(),
          updatedAt: subj.modifiedDate || new Date().toISOString(),
          // curriculumId may be present on full subject or raw item
          curriculumId: (subj as any).curriculumId || (subj as any).curriculum?.curriculumId || undefined,
        } as Subject;
      });

      setSubjects(convertedSubjects);
      console.log("✅ Loaded subjects from API (with detailed fetch):", convertedSubjects.length);
    } catch (error) {
      console.error("❌ Error loading subjects from API:", error);

      // Show specific error message for connection issues
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("Network Error") ||
          error.message.includes("Mixed Content") ||
          error.message.includes("timeout"));

      toast({
        variant: "destructive",
        title: "Error Loading Subjects",
        description: isConnectionError
          ? "Unable to connect to API server. Check connection and try again."
          : "Failed to load subjects from API",
      });

      // Don't set empty array on error - leave existing data if any
      if (subjects.length === 0) {
        setSubjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCurriculums = async () => {
    try {
      console.log("🔄 Loading curriculums from API for subjects...");
      const apiCurriculums = await adminApiService.getCurriculums();

      // Convert API format to component format
      const convertedCurriculums: Curriculum[] = apiCurriculums.map((curr) => ({
        id: curr.curriculumId.toString(),
        name: curr.name,
        description: curr.description,
        // Do not use curriculum codes on the front-end — only use full names
        code: undefined,
        isActive: !curr.isDeleted,
        createdAt: curr.modifiedDate || new Date().toISOString(),
        updatedAt: curr.modifiedDate || new Date().toISOString(),
      }));

      setCurriculums(convertedCurriculums);
      console.log(
        "✅ Loaded curriculums from API for subjects:",
        convertedCurriculums.length,
      );
    } catch (error) {
      console.error("❌ Error loading curriculums from API:", error);
      setCurriculums([]);
    }
  };

  const loadRelations = async () => {
    try {
      console.log("🔄 Building relations from API subject data...");

      // Get institution ID from JWT token
      let institutionId: number | null = null;
      const token = localStorage.getItem("anansi_token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          institutionId = payload.institutionId;
          console.log("🏢 Using institutionId from token for relations:", institutionId);
        } catch (error) {
          console.warn("⚠️ Could not extract institutionId from token:", error);
        }
      }

      // Create relations from the subjects data we already have
      // Each subject contains a curriculumId, so we can build the relations
      const apiSubjects = institutionId
        ? await adminApiService.getSubjectsByInstitution(institutionId)
        : await adminApiService.getSubjects();

      console.log("🔍 Building relations from full subject data...");

      // Fetch latest curriculums directly to avoid relying on potentially stale state
      const apiCurriculums = await adminApiService.getCurriculums();
      const convertedCurriculums = apiCurriculums.map((c) => ({
        id: c.curriculumId.toString(),
        name: c.name,
        code: undefined,
      }));

      // Create relations using the full subject data that includes curriculum info
      const apiRelations: SubjectCurriculumRelation[] = [];

      for (const subj of apiSubjects) {
        try {
          const subjectCurriculumId = subj.curriculumId || subj.curriculum?.curriculumId;
          if (subjectCurriculumId) {
            const matchingCurriculum = convertedCurriculums.find(
              (c) => c.id === subjectCurriculumId.toString(),
            );

            if (matchingCurriculum) {
              apiRelations.push({
                id: `r${subj.subjectId}`,
                subjectId: subj.subjectId.toString(),
                curriculumId: subjectCurriculumId.toString(),
                createdAt: subj.modifiedDate || new Date().toISOString(),
              });
              console.log(`✅ Created relation: Subject ${subj.subjectName || subj.name} -> Curriculum ${matchingCurriculum.name}`);
            }
          }
        } catch (error) {
          console.warn(`⚠️ Could not build relation for subject ${subj.subjectId}:`, error);
        }
      }

      setRelations(apiRelations);
      console.log("✅ Built relations from API data:", apiRelations.length);
    } catch (error) {
      console.error("❌ Error loading relations:", error);
      // Fall back to empty relations if API fails
      setRelations([]);
    }
  };

  const getSubjectCurriculums = (subjectId: string, subjectObj?: Subject): Curriculum[] => {
    // Prefer relations if available
    const subjectRelations = relations.filter((r) => r.subjectId === subjectId);
    const fromRelations = curriculums.filter((c) =>
      subjectRelations.some((r) => r.curriculumId === c.id),
    );
    if (fromRelations.length > 0) return fromRelations;

    // Fallback: use curriculumId present on the subject object or raw subjects state
    const subj = subjectObj || subjects.find((s) => s.id === subjectId);
    const currId = (subj as any)?.curriculumId?.toString();
    if (currId) {
      const found = curriculums.find((c) => c.id === currId);
      return found ? [found] : [];
    }

    return [];
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Subject name is required",
      });
      return;
    }

    if (!formData.curriculumIds || formData.curriculumIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a curriculum for this subject",
      });
      return;
    }

    // Check for duplicates
    const duplicate = subjects.find(
      (s) => s.name.toLowerCase() === formData.name.toLowerCase(),
    );
    if (duplicate) {
      toast({
        variant: "destructive",
        title: "Duplicate Subject",
        description: "A subject with this name already exists",
      });
      return;
    }

    try {
      console.log("🔄 Creating subject via API...");

      // Get institution ID from JWT token
      let institutionId = 1; // Default fallback
      const token = localStorage.getItem("anansi_token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          institutionId = payload.institutionId || 1;
          console.log("🏢 Using institutionId from token for subject creation:", institutionId);
        } catch (error) {
          console.warn("⚠️ Could not extract institutionId from token, using default:", error);
        }
      }

      // Note: API only supports one curriculum per subject, using the first selected
      const curriculumId = parseInt(formData.curriculumIds[0]);

      const createData = {
        institutionId: institutionId,
        subjectName: formData.name,
        description: formData.description,
        isActive: true,
        curriculumId: curriculumId,
      };

      const createdSubject = await adminApiService.createSubject(createData);

      console.log("✅ Subject created successfully:", createdSubject);

      // Reload subjects and related data to get the latest data from API
      await loadSubjects();
      // Refresh curriculums and relations so curriculum assignments are shown immediately
      await loadCurriculums();
      await loadRelations();

      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Subject created successfully",
      });

      onSubjectChange?.();
    } catch (error) {
      console.error("❌ Error creating subject:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create subject. Please try again.",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedSubject || !formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Subject name is required",
      });
      return;
    }

    // Check for duplicates (excluding current item)
    const duplicate = subjects.find(
      (s) =>
        s.id !== selectedSubject.id &&
        s.name.toLowerCase() === formData.name.toLowerCase(),
    );
    if (duplicate) {
      toast({
        variant: "destructive",
        title: "Duplicate Subject",
        description: "A subject with this name already exists",
      });
      return;
    }

    try {
      console.log("🔄 Updating subject via API...");

      // Note: API only supports one curriculum per subject, using the first selected
      const curriculumId = parseInt(formData.curriculumIds?.[0] || "1");

      const updateData = {
        subjectName: formData.name,
        description: formData.description,
        isActive: true,
        curriculumId: curriculumId,
      };

      const subjectId = parseInt(selectedSubject.id);
      const updatedSubject = await adminApiService.updateSubject(
        subjectId,
        updateData,
      );

      console.log("✅ Subject updated successfully:", updatedSubject);

      // Reload subjects and related data to get the latest data from API
      await loadSubjects();
      // Refresh curriculums and relations so curriculum assignments are shown immediately
      await loadCurriculums();
      await loadRelations();

      setIsEditDialogOpen(false);
      setSelectedSubject(null);
      resetForm();

      toast({
        title: "Success",
        description: "Subject updated successfully",
      });

      onSubjectChange?.();
    } catch (error) {
      console.error("❌ Error updating subject:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update subject. Please try again.",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;

    try {
      console.log("🔄 Deleting subject via API...");

      const subjectId = parseInt(selectedSubject.id);
      await adminApiService.deleteSubject(subjectId);

      console.log("✅ Subject deleted successfully");

      // Reload subjects and related data to get the latest data from API
      await loadSubjects();
      // Refresh curriculums and relations so curriculum assignments are shown immediately
      await loadCurriculums();
      await loadRelations();

      setIsDeleteDialogOpen(false);
      setSelectedSubject(null);

      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });

      onSubjectChange?.();
    } catch (error) {
      console.error("❌ Error deleting subject:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete subject. Please try again.",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      curriculumIds: [],
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    const subjectCurriculums = getSubjectCurriculums(subject.id, subject);
    setFormData({
      name: subject.name,
      description: subject.description || "",
      curriculumIds: subjectCurriculums.map((c) => c.id),
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  const openRelationDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsRelationDialogOpen(true);
  };

  const toggleStatus = (subject: Subject) => {
    const updated = {
      ...subject,
      isActive: !subject.isActive,
      updatedAt: new Date().toISOString(),
    };

    setSubjects(subjects.map((s) => (s.id === subject.id ? updated : s)));

    toast({
      title: "Success",
      description: `Subject ${updated.isActive ? "activated" : "deactivated"} successfully`,
    });

    onSubjectChange?.();
  };

  // Filter subjects
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      !filter.search ||
      subject.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      subject.description
        ?.toLowerCase()
        .includes(filter.search.toLowerCase());

    const matchesStatus =
      filter.isActive === undefined || subject.isActive === filter.isActive;

    const matchesCurriculum =
      !filter.curriculumId ||
      getSubjectCurriculums(subject.id, subject).some(
        (c) => c.id === filter.curriculumId,
      );

    return matchesSearch && matchesStatus && matchesCurriculum;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Subject Management
          </h3>
          <p className="text-gray-600">
            Manage subjects and their curriculum relationships
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
            Add Subject
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
              <Label htmlFor="search">Search Subjects</Label>
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
              <Label htmlFor="curriculum">Curriculum</Label>
              <Select
                value={filter.curriculumId || "all"}
                onValueChange={(value) =>
                  setFilter({
                    ...filter,
                    curriculumId: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Curriculums</SelectItem>
                  {curriculums.map((curriculum) => (
                    <SelectItem key={curriculum.id} value={curriculum.id}>
                      {curriculum.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subjects ({filteredSubjects.length})
          </CardTitle>
          <CardDescription>
            Manage subjects and their curriculum assignments
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
                  <TableHead>Curriculum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No subjects found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubjects.map((subject) => {
                    const subjectCurriculums = getSubjectCurriculums(subject.id, subject);
                    return (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">
                          {subject.name}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {subject.description || "No description"}
                        </TableCell>
                        <TableCell>
                          {subjectCurriculums.length === 0 ? (
                            <span className="text-gray-500 text-xs">
                              No assignment
                            </span>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {subjectCurriculums[0].name}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={subject.isActive ? "default" : "secondary"}
                            className={
                              subject.isActive
                                ? "bg-green-100 text-green-700"
                                : ""
                            }
                          >
                            {subject.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(subject.createdAt).toLocaleDateString()}
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
                                onClick={() => openViewDialog(subject)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(subject)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openRelationDialog(subject)}
                              >
                                <Link className="w-4 h-4 mr-2" />
                                Manage Curriculums
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => toggleStatus(subject)}
                              >
                                {subject.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(subject)}
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
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>
              Create a new subject and assign it to curriculums
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter subject name"
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
                placeholder="Enter subject description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="curriculum">Select Curriculum *</Label>
              {curriculums.length === 0 ? (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 mt-2">
                  ⚠️ No curriculums available. Please create curriculums first
                  before adding subjects.
                </div>
              ) : (
                <Select
                  value={(formData.curriculumIds || [])[0] || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      curriculumIds: value ? [value] : [],
                    })
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
            <Button onClick={handleAdd}>Create Subject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Update subject information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Subject Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter subject name"
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
                placeholder="Enter subject description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-curriculum">Select Curriculum *</Label>
              <Select
                value={(formData.curriculumIds || [])[0] || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    curriculumIds: value ? [value] : [],
                  })
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
            <Button onClick={handleEdit}>Update Subject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subject Details</DialogTitle>
            <DialogDescription>View subject information</DialogDescription>
          </DialogHeader>
          {selectedSubject && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium">{selectedSubject.name}</p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">
                  {selectedSubject.description || "No description provided"}
                </p>
              </div>
              <div>
                <Label>Assigned Curriculum</Label>
                <div className="mt-1">
                  {getSubjectCurriculums(selectedSubject.id, selectedSubject).length === 0 ? (
                    <span className="text-gray-500 text-sm">
                      No curriculum assignment
                    </span>
                  ) : (
                    <Badge variant="secondary">
                      {getSubjectCurriculums(selectedSubject.id, selectedSubject)[0].name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge
                    variant={selectedSubject.isActive ? "default" : "secondary"}
                    className={
                      selectedSubject.isActive
                        ? "bg-green-100 text-green-700"
                        : ""
                    }
                  >
                    {selectedSubject.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">
                    {new Date(selectedSubject.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm">
                  {new Date(selectedSubject.updatedAt).toLocaleDateString()}
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
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSubject?.name}"? This
              action cannot be undone and will affect all associated milestones
              and goals.
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

      {/* Curriculum Relations Dialog */}
      <Dialog
        open={isRelationDialogOpen}
        onOpenChange={setIsRelationDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Curriculum Assignment</DialogTitle>
            <DialogDescription>
              {selectedSubject?.name} - Update curriculum assignment
            </DialogDescription>
          </DialogHeader>
          {selectedSubject && (
            <div className="space-y-4">
              <div>
                <Label>Current Assignment</Label>
                <div className="mt-1">
                  {getSubjectCurriculums(selectedSubject.id, selectedSubject).length === 0 ? (
                    <span className="text-gray-500 text-sm">
                      No curriculum assignment
                    </span>
                  ) : (
                    <Badge variant="default">
                      {getSubjectCurriculums(selectedSubject.id, selectedSubject)[0].name}
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <Label>Available Curriculums</Label>
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                  {curriculums.map((curriculum) => {
                    const isAssigned = getSubjectCurriculums(
                      selectedSubject.id,
                      selectedSubject,
                    ).some((c) => c.id === curriculum.id);
                    return (
                      <div
                        key={curriculum.id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <p className="font-medium">{curriculum.name}</p>
                                                  </div>
                        <Badge
                          variant={isAssigned ? "default" : "outline"}
                          className={
                            isAssigned ? "bg-green-100 text-green-700" : ""
                          }
                        >
                          {isAssigned ? "Assigned" : "Available"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsRelationDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedSubject) {
                  openEditDialog(selectedSubject);
                  setIsRelationDialogOpen(false);
                }
              }}
            >
              Edit Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectManagement;
