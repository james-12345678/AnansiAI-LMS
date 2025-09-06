import React, { useState, useEffect } from "react";
import { adminApiService } from "@/services/adminApiService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Edit,
  Search,
  RefreshCw,
  UserPlus,
  AlertCircle,
} from "lucide-react";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName?: string;
}

interface Level {
  levelId: number;
  levelName: string;
  subjectId: number;
  subject?: {
    subjectName: string;
  };
  maxStudents: number;
  levelStudents?: LevelStudent[];
}

interface LevelStudent {
  levelId: number;
  studentId: string;
  enrolledAt: string;
  status: number;
  level?: Level;
}

interface Institution {
  institutionId: number;
  name: string;
}

const StudentLevelAssignment: React.FC = () => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [assignments, setAssignments] = useState<LevelStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [editingAssignment, setEditingAssignment] = useState<LevelStudent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedInstitution) {
      loadLevelsByInstitution(parseInt(selectedInstitution));
    }
  }, [selectedInstitution]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [studentsData, institutionsData] = await Promise.all([
        adminApiService.getUsersByRole("Student"),
        adminApiService.getInstitutions(),
      ]);

      setStudents(studentsData.map(student => ({
        ...student,
        fullName: `${student.firstName} ${student.lastName}`
      })));
      setInstitutions(institutionsData);

      if (institutionsData.length > 0) {
        setSelectedInstitution(institutionsData[0].institutionId.toString());
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast({
        title: "Error",
        description: "Failed to load initial data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLevelsByInstitution = async (institutionId: number) => {
    try {
      const levelsData = await adminApiService.getLevelsByInstitution(institutionId);
      setLevels(levelsData);
      
      // Load assignments for all levels
      const allAssignments: LevelStudent[] = [];
      for (const level of levelsData) {
        try {
          const levelStudents = await adminApiService.getStudentsByLevel(level.levelId);
          allAssignments.push(...levelStudents);
        } catch (error) {
          console.warn(`Could not load students for level ${level.levelId}:`, error);
        }
      }
      setAssignments(allAssignments);
    } catch (error) {
      console.error("Error loading levels:", error);
      toast({
        title: "Error",
        description: "Failed to load levels. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent || !selectedLevel) {
      toast({
        title: "Validation Error",
        description: "Please select both a student and a level.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await adminApiService.assignStudentToLevel({
        studentId: selectedStudent,
        levelId: parseInt(selectedLevel),
      });

      toast({
        title: "Success",
        description: "Student assigned to level successfully.",
      });

      // Refresh assignments
      if (selectedInstitution) {
        await loadLevelsByInstitution(parseInt(selectedInstitution));
      }

      setAssignDialogOpen(false);
      setSelectedStudent("");
      setSelectedLevel("");
    } catch (error) {
      console.error("Error assigning student:", error);
      toast({
        title: "Error",
        description: "Failed to assign student to level. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignment: LevelStudent) => {
    try {
      setLoading(true);
      // Note: We need the assignment ID from the API response
      // For now, we'll use a combination of studentId and levelId
      await adminApiService.removeStudentFromLevel(assignment.levelId);

      toast({
        title: "Success",
        description: "Student removed from level successfully.",
      });

      // Refresh assignments
      if (selectedInstitution) {
        await loadLevelsByInstitution(parseInt(selectedInstitution));
      }
    } catch (error) {
      console.error("Error removing assignment:", error);
      toast({
        title: "Error",
        description: "Failed to remove student from level. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.fullName || `${student.firstName} ${student.lastName}` : studentId;
  };

  const getLevelName = (levelId: number) => {
    const level = levels.find(l => l.levelId === levelId);
    return level ? `${level.levelName} (${level.subject?.subjectName || 'Unknown Subject'})` : `Level ${levelId}`;
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="default">Active</Badge>;
      case 0:
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const studentName = getStudentName(assignment.studentId).toLowerCase();
    const levelName = getLevelName(assignment.levelId).toLowerCase();
    return studentName.includes(searchTerm.toLowerCase()) || 
           levelName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Student Level Assignments</h3>
          <p className="text-gray-600">Manage student assignments to academic levels</p>
        </div>
        <Button onClick={() => setAssignDialogOpen(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Assign Student to Level
        </Button>
      </div>

      {/* Institution Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Institution Selection
          </CardTitle>
          <CardDescription>
            Select an institution to view and manage student level assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Select
                value={selectedInstitution}
                onValueChange={setSelectedInstitution}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select institution..." />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((institution) => (
                    <SelectItem
                      key={institution.institutionId}
                      value={institution.institutionId.toString()}
                    >
                      {institution.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search Assignments</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by student or level..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => selectedInstitution && loadLevelsByInstitution(parseInt(selectedInstitution))}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Levels</p>
                <p className="text-2xl font-bold text-gray-900">{levels.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => a.status === 1).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
          <CardDescription>
            View and manage all student level assignments for the selected institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {assignments.length === 0 
                  ? "No students have been assigned to levels yet."
                  : "No assignments match your search criteria."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment, index) => (
                  <TableRow key={`${assignment.studentId}-${assignment.levelId}-${index}`}>
                    <TableCell className="font-medium">
                      {getStudentName(assignment.studentId)}
                    </TableCell>
                    <TableCell>{getLevelName(assignment.levelId)}</TableCell>
                    <TableCell>
                      {new Date(assignment.enrolledAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAssignment(assignment);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Student Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Student to Level</DialogTitle>
            <DialogDescription>
              Select a student and level to create a new assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="student">Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.fullName || `${student.firstName} ${student.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="level">Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level..." />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.levelId} value={level.levelId.toString()}>
                      {level.levelName} ({level.subject?.subjectName || 'Unknown Subject'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignStudent} disabled={loading}>
              {loading ? "Assigning..." : "Assign Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentLevelAssignment;
