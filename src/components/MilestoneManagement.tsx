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
  Target,
  Filter,
  BookOpen,
  Calendar,
} from "lucide-react";
import {
  Milestone,
  Curriculum,
  Subject,
  MilestoneFormData,
  MilestoneFilter,
  TERM_OPTIONS,
} from "@/types/curriculum";
import { AdminApiService } from "@/services/adminApiService";
import { useToast } from "@/hooks/use-toast";

interface MilestoneManagementProps {
  onMilestoneChange?: () => void;
}

const MilestoneManagement: React.FC<MilestoneManagementProps> = ({
  onMilestoneChange,
}) => {
  const { toast } = useToast();
  const adminApiService = AdminApiService.getInstance();

  // Helper function to extract curriculum info from term name
  const extractCurriculumFromTermName = (termName: string) => {
    const match = termName.match(/^\[([^\]]+)\]/);
    if (match) {
      const curriculumCode = match[1];
      return {
        curriculumCode,
        cleanTermName: termName.replace(/^\[[^\]]+\]\s*/, ""),
        hasPrefix: true,
      };
    }
    return {
      curriculumCode: null,
      cleanTermName: termName,
      hasPrefix: false,
    };
  };

  // Helper function to get terms for a specific curriculum
  const getTermsForCurriculum = (curriculumId: string) => {
    const curriculum = curriculums.find((c) => c.id === curriculumId);
    if (!curriculum) return [];

    return terms.filter((term) => {
      const termInfo = extractCurriculumFromTermName(term.termName);
      return termInfo.hasPrefix && (termInfo.curriculumCode === curriculum.code || termInfo.curriculumCode === curriculum.name);
    });
    };

  // Helper function to get term name from term ID
  const getTermNameById = (termId: string) => {
    const term = terms.find((t) => t.termId.toString() === termId);
    if (!term) return `Term ID: ${termId}`;

    const termInfo = extractCurriculumFromTermName(term.termName);
    return termInfo.cleanTermName;
  };

  // State management
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [relations, setRelations] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null,
  );
  const [filter, setFilter] = useState<MilestoneFilter>({});

  // Form state
  const [formData, setFormData] = useState<MilestoneFormData>({
    curriculumId: "",
    subjectId: "",
    term: "",
    milestone: "",
  });

  // Load data on mount
  useEffect(() => {
    loadMilestones();
    loadCurriculums();
    loadSubjects();
    loadRelations();
    loadTerms();
  }, []);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading milestones from API...");
      const apiMilestones = await adminApiService.getMilestones();

      // Convert API format to component format
      const convertedMilestones: Milestone[] = apiMilestones.map(
        (milestone) => ({
          id: milestone.milestoneId.toString(),
          curriculumId: milestone.curriculumId.toString(),
          subjectId: milestone.subjectId.toString(),
          term: milestone.termId.toString(), // You may want to fetch term names
          milestone: milestone.description,
          isActive: !milestone.isDeleted,
          createdAt: milestone.modifiedDate || new Date().toISOString(),
          updatedAt: milestone.modifiedDate || new Date().toISOString(),
        }),
      );

      setMilestones(convertedMilestones);
      console.log("✅ Loaded milestones from API:", convertedMilestones.length);
    } catch (error) {
      console.error("❌ Error loading milestones from API:", error);

      // Show specific error message for connection issues
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("Network Error") ||
          error.message.includes("Mixed Content") ||
          error.message.includes("timeout"));

      toast({
        variant: "destructive",
        title: "Error Loading Milestones",
        description: isConnectionError
          ? "Unable to connect to API server. Check connection and try again."
          : "Failed to load milestones from API",
      });

      // Don't set empty array on error - leave existing data if any
      if (milestones.length === 0) {
        setMilestones([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCurriculums = async () => {
    try {
      console.log("🔄 Loading curriculums from API for milestones...");
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
        "✅ Loaded curriculums from API for milestones:",
        convertedCurriculums.length,
      );
    } catch (error) {
      console.error("❌ Error loading curriculums from API:", error);
      setCurriculums([]);
    }
  };

  const loadSubjects = async () => {
    try {
      console.log("🔄 Loading subjects from API for milestones...");
      const apiSubjects = await adminApiService.getSubjects();

      // Convert API format to component format
      const convertedSubjects: Subject[] = apiSubjects.map((subj) => ({
        id: subj.subjectId.toString(),
        name: subj.subjectName, // API uses subjectName instead of name
        description: subj.description,
        // No subject codes on front-end; show full names only
        code: undefined,
        isActive: !subj.isDeleted,
        createdAt: subj.modifiedDate || new Date().toISOString(),
        updatedAt: subj.modifiedDate || new Date().toISOString(),
      }));

      setSubjects(convertedSubjects);
      console.log(
        "✅ Loaded subjects from API for milestones:",
        convertedSubjects.length,
      );
    } catch (error) {
      console.error("❌ Error loading subjects from API:", error);
      setSubjects([]);
    }
  };

  const loadRelations = async () => {
    try {
      console.log(
        "🔄 Building relations from API subject data for milestones...",
      );

      // Create relations from the subjects data we already have
      // Each subject contains a curriculumId, so we can build the relations
      const apiSubjects = await adminApiService.getSubjects();

      const apiRelations = apiSubjects
        .filter((subj) => subj.curriculumId) // Only subjects with curriculum assignments
        .map((subj, index) => ({
          id: `r${subj.subjectId}`,
          subjectId: subj.subjectId.toString(),
          curriculumId: subj.curriculumId.toString(),
          createdAt: subj.modifiedDate || new Date().toISOString(),
        }));

      setRelations(apiRelations);
      console.log(
        "✅ Built relations from API data for milestones:",
        apiRelations.length,
      );
    } catch (error) {
      console.error("❌ Error loading relations:", error);
      // Fall back to empty relations if API fails
      setRelations([]);
    }
  };

  const loadTerms = async () => {
    try {
      console.log("🔄 Loading terms from API for milestones...");
      const apiTerms = await adminApiService.getTerms();
      setTerms(apiTerms);
      console.log("✅ Loaded terms from API for milestones:", apiTerms.length);

      // If no terms exist, create default terms
      if (apiTerms.length === 0) {
        console.log("🔄 No terms found, creating default terms...");
        await createDefaultTerms();
      }
    } catch (error) {
      console.error("❌ Error loading terms:", error);
      // Try to create default terms if loading fails
      console.log("🔄 Creating default terms due to load error...");
      await createDefaultTerms();
    }
  };

  const createDefaultTerms = async () => {
    const defaultTerms = [
      { termName: "Term 1", institutionId: 1 },
      { termName: "Term 2", institutionId: 1 },
      { termName: "Term 3", institutionId: 1 },
      { termName: "Quarter 1", institutionId: 1 },
      { termName: "Quarter 2", institutionId: 1 },
      { termName: "Quarter 3", institutionId: 1 },
      { termName: "Quarter 4", institutionId: 1 },
      { termName: "Semester 1", institutionId: 1 },
      { termName: "Semester 2", institutionId: 1 },
      { termName: "Full Year", institutionId: 1 },
    ];

    try {
      const createdTerms = [];
      for (const termData of defaultTerms) {
        try {
          const createdTerm = await adminApiService.createTerm(termData);
          createdTerms.push(createdTerm);
          console.log(`✅ Created term: ${termData.termName}`);
        } catch (error) {
          console.log(
            `⚠️ Term ${termData.termName} might already exist, skipping...`,
          );
        }
      }

      // Reload terms after creation
      const allTerms = await adminApiService.getTerms();
      setTerms(allTerms);
      console.log("✅ Default terms created and loaded:", allTerms.length);
    } catch (error) {
      console.error("❌ Error creating default terms:", error);
    }
  };

  const handleAdd = async () => {
    if (
      !formData.curriculumId ||
      !formData.subjectId ||
      !formData.term ||
      !formData.milestone.trim()
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "All fields are required",
      });
      return;
    }

    // Check for duplicates
    const duplicate = milestones.find(
      (m) =>
        m.curriculumId === formData.curriculumId &&
        m.subjectId === formData.subjectId &&
        m.term === formData.term,
    );
    if (duplicate) {
      toast({
        variant: "destructive",
        title: "Duplicate Milestone",
        description:
          "A milestone for this curriculum, subject, and term already exists",
      });
      return;
    }

    try {
      console.log("🔄 Creating milestone via API...");

      // Get real term ID from loaded terms
      const getTermId = (termName: string): number => {
        const foundTerm = terms.find((term) => term.termName === termName);
        if (foundTerm) {
          return foundTerm.termId;
        }

        console.warn(
          `⚠️ Term "${termName}" not found in loaded terms, using fallback ID 1`,
        );
        return 1; // Fallback if term not found
      };

      const createData = {
        description: formData.milestone,
        curriculumId: parseInt(formData.curriculumId),
        subjectId: parseInt(formData.subjectId),
        termId: getTermId(formData.term),
        institutionId: 1, // Default institution ID - you may want to make this configurable
      };

      console.log("📤 API Payload for milestone:", createData);
      const createdMilestone =
        await adminApiService.createMilestone(createData);
      console.log("✅ Milestone created successfully:", createdMilestone);

      // Reload milestones to get the latest data from API
      await loadMilestones();

      setIsAddDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Milestone created successfully",
      });

      onMilestoneChange?.();
    } catch (error) {
      console.error("❌ Error creating milestone:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create milestone. Please try again.",
      });
    }
  };

  const handleEdit = async () => {
    if (
      !selectedMilestone ||
      !formData.curriculumId ||
      !formData.subjectId ||
      !formData.term ||
      !formData.milestone.trim()
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "All fields are required",
      });
      return;
    }

    // Check for duplicates (excluding current item)
    const duplicate = milestones.find(
      (m) =>
        m.id !== selectedMilestone.id &&
        m.curriculumId === formData.curriculumId &&
        m.subjectId === formData.subjectId &&
        m.term === formData.term,
    );
    if (duplicate) {
      toast({
        variant: "destructive",
        title: "Duplicate Milestone",
        description:
          "A milestone for this curriculum, subject, and term already exists",
      });
      return;
    }

    const updatedMilestone: Milestone = {
      ...selectedMilestone,
      curriculumId: formData.curriculumId,
      subjectId: formData.subjectId,
      term: formData.term,
      milestone: formData.milestone,
      updatedAt: new Date().toISOString(),
    };

    setMilestones(
      milestones.map((m) =>
        m.id === selectedMilestone.id ? updatedMilestone : m,
      ),
    );
    setIsEditDialogOpen(false);
    setSelectedMilestone(null);
    resetForm();

    toast({
      title: "Success",
      description: "Milestone updated successfully",
    });

    onMilestoneChange?.();
  };

  const handleDelete = async () => {
    if (!selectedMilestone) return;

    setMilestones(milestones.filter((m) => m.id !== selectedMilestone.id));
    setIsDeleteDialogOpen(false);
    setSelectedMilestone(null);

    toast({
      title: "Success",
      description: "Milestone deleted successfully",
    });

    onMilestoneChange?.();
  };

  const resetForm = () => {
    setFormData({
      curriculumId: "",
      subjectId: "",
      term: "",
      milestone: "",
    });
  };

  const openAddDialog = () => {
    console.log("🔥 MilestoneManagement: Opening add dialog");
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setFormData({
      curriculumId: milestone.curriculumId,
      subjectId: milestone.subjectId,
      term: milestone.term,
      milestone: milestone.milestone,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsDeleteDialogOpen(true);
  };

  const toggleStatus = (milestone: Milestone) => {
    const updated = {
      ...milestone,
      isActive: !milestone.isActive,
      updatedAt: new Date().toISOString(),
    };

    setMilestones(milestones.map((m) => (m.id === milestone.id ? updated : m)));

    toast({
      title: "Success",
      description: `Milestone ${updated.isActive ? "activated" : "deactivated"} successfully`,
    });

    onMilestoneChange?.();
  };

  // Get curriculum and subject names for display
  const getCurriculumName = (id: string) =>
    curriculums.find((c) => c.id === id)?.name || "Unknown";
  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name || "Unknown";

  // Filter milestones
  const filteredMilestones = milestones.filter((milestone) => {
    const matchesSearch =
      !filter.search ||
      milestone.milestone.toLowerCase().includes(filter.search.toLowerCase()) ||
      getCurriculumName(milestone.curriculumId)
        .toLowerCase()
        .includes(filter.search.toLowerCase()) ||
      getSubjectName(milestone.subjectId)
        .toLowerCase()
        .includes(filter.search.toLowerCase()) ||
      milestone.term.toLowerCase().includes(filter.search.toLowerCase());

    const matchesCurriculum =
      !filter.curriculumId || milestone.curriculumId === filter.curriculumId;
    const matchesSubject =
      !filter.subjectId || milestone.subjectId === filter.subjectId;
    const matchesTerm = !filter.term || milestone.term === filter.term;

    return matchesSearch && matchesCurriculum && matchesSubject && matchesTerm;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Milestone Management
          </h3>
          <p className="text-gray-600">
            Define what content is to be covered in subjects during terms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => openAddDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Milestone
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Search Milestones</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search milestones..."
                  value={filter.search || ""}
                  onChange={(e) =>
                    setFilter({ ...filter, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div>
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
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={filter.subjectId || "all"}
                onValueChange={(value) =>
                  setFilter({
                    ...filter,
                    subjectId: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects
                    .filter((s) => s.isActive)
                    .map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="term">Term</Label>
              <Select
                value={filter.term || "all"}
                onValueChange={(value) =>
                  setFilter({
                    ...filter,
                    term: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {terms.map((term) => (
                    <SelectItem key={term.termId} value={term.termName}>
                      {term.termName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Milestones ({filteredMilestones.length})
          </CardTitle>
          <CardDescription>
            Content coverage milestones organized by curriculum, subject, and
            term
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
                  <TableHead>Curriculum</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Milestone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMilestones.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      No milestones found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMilestones.map((milestone) => (
                    <TableRow key={milestone.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {
                            curriculums.find(
                              (c) => c.id === milestone.curriculumId,
                            )?.name
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {getSubjectName(milestone.subjectId)}
                      </TableCell>
                                            <TableCell>
                        <Badge variant="secondary">{getTermNameById(milestone.term)}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="truncate" title={milestone.milestone}>
                          {milestone.milestone}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={milestone.isActive ? "default" : "secondary"}
                          className={
                            milestone.isActive
                              ? "bg-green-100 text-green-700"
                              : ""
                          }
                        >
                          {milestone.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(milestone.createdAt).toLocaleDateString()}
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
                              onClick={() => openViewDialog(milestone)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(milestone)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleStatus(milestone)}
                            >
                              {milestone.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(milestone)}
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
            <DialogTitle>Add New Milestone</DialogTitle>
            <DialogDescription>
              Define content coverage for a specific curriculum, subject, and
              term
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="curriculum">Curriculum *</Label>
                <Select
                  value={formData.curriculumId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, curriculumId: value })
                  }
                >
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subjectId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.curriculumId ? (
                      subjects
                        .filter((s) => {
                          // Only show subjects assigned to the selected curriculum
                          const isAssignedToCurriculum = relations.some(
                            (r) =>
                              r.subjectId === s.id &&
                              r.curriculumId === formData.curriculumId,
                          );
                          return s.isActive && isAssignedToCurriculum;
                        })
                        .map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-curriculum" disabled>
                        Please select a curriculum first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {formData.curriculumId &&
                  subjects.filter((s) => {
                    const isAssignedToCurriculum = relations.some(
                      (r) =>
                        r.subjectId === s.id &&
                        r.curriculumId === formData.curriculumId,
                    );
                    return s.isActive && isAssignedToCurriculum;
                  }).length === 0 && (
                    <p className="text-sm text-orange-600 mt-2">
                      ⚠️ No subjects found for this curriculum. Please add
                      subjects to this curriculum first.
                    </p>
                  )}
              </div>
            </div>
            <div>
              <Label htmlFor="term">Term/Duration *</Label>
              <Select
                value={formData.term}
                onValueChange={(value) =>
                  setFormData({ ...formData, term: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select term/duration" />
                </SelectTrigger>
                <SelectContent>
                  {formData.curriculumId ? (
                    getTermsForCurriculum(formData.curriculumId).map((term) => {
                      const termInfo = extractCurriculumFromTermName(
                        term.termName,
                      );
                      return (
                        <SelectItem key={term.termId} value={term.termName}>
                          {termInfo.cleanTermName}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-curriculum" disabled>
                      Please select a curriculum first
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formData.curriculumId &&
                getTermsForCurriculum(formData.curriculumId).length === 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    ⚠️ No terms found for this curriculum. Please add terms to
                    this curriculum first.
                  </p>
                )}
            </div>
            <div>
              <Label htmlFor="milestone">Milestone Content *</Label>
              <Textarea
                id="milestone"
                value={formData.milestone}
                onChange={(e) =>
                  setFormData({ ...formData, milestone: e.target.value })
                }
                placeholder="Describe what content should be covered during this term..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Create Milestone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>Update milestone information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-curriculum">Curriculum *</Label>
                <Select
                  value={formData.curriculumId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, curriculumId: value })
                  }
                >
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="edit-subject">Subject *</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subjectId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.curriculumId ? (
                      subjects
                        .filter((s) => {
                          // Only show subjects assigned to the selected curriculum
                          const isAssignedToCurriculum = relations.some(
                            (r) =>
                              r.subjectId === s.id &&
                              r.curriculumId === formData.curriculumId,
                          );
                          return s.isActive && isAssignedToCurriculum;
                        })
                        .map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-curriculum" disabled>
                        Please select a curriculum first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-term">Term/Duration *</Label>
              <Select
                value={formData.term}
                onValueChange={(value) =>
                  setFormData({ ...formData, term: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select term/duration" />
                </SelectTrigger>
                <SelectContent>
                  {formData.curriculumId ? (
                    getTermsForCurriculum(formData.curriculumId).map((term) => {
                      const termInfo = extractCurriculumFromTermName(
                        term.termName,
                      );
                      return (
                        <SelectItem key={term.termId} value={term.termName}>
                          {termInfo.cleanTermName}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-curriculum" disabled>
                      Please select a curriculum first
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-milestone">Milestone Content *</Label>
              <Textarea
                id="edit-milestone"
                value={formData.milestone}
                onChange={(e) =>
                  setFormData({ ...formData, milestone: e.target.value })
                }
                placeholder="Describe what content should be covered during this term..."
                rows={4}
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
            <Button onClick={handleEdit}>Update Milestone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Milestone Details</DialogTitle>
            <DialogDescription>View milestone information</DialogDescription>
          </DialogHeader>
          {selectedMilestone && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Curriculum</Label>
                  <p className="text-sm font-medium">
                    {getCurriculumName(selectedMilestone.curriculumId)}
                  </p>
                </div>
                <div>
                  <Label>Subject</Label>
                  <p className="text-sm font-medium">
                    {getSubjectName(selectedMilestone.subjectId)}
                  </p>
                </div>
              </div>
              <div>
                                <Label>Term</Label>
                <Badge variant="secondary">{getTermNameById(selectedMilestone.term)}</Badge>
              </div>
              <div>
                <Label>Milestone Content</Label>
                <p className="text-sm border rounded p-3 bg-gray-50">
                  {selectedMilestone.milestone}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge
                    variant={
                      selectedMilestone.isActive ? "default" : "secondary"
                    }
                    className={
                      selectedMilestone.isActive
                        ? "bg-green-100 text-green-700"
                        : ""
                    }
                  >
                    {selectedMilestone.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm">
                    {new Date(selectedMilestone.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p className="text-sm">
                  {new Date(selectedMilestone.updatedAt).toLocaleDateString()}
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
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this milestone? This action cannot
              be undone.
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

export default MilestoneManagement;
