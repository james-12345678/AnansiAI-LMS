import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MixedContentResolver from "@/components/MixedContentResolver";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Brain,
  Users,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  LogOut,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Calendar,
  BarChart3,
  Shield,
  Database,
  Monitor,
  FileText,
  Key,
  EyeOff,
  Activity,
  Zap,
  GraduationCap,
  UserPlus,
  School,
  Award,
  Target,
  TrendingDown,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Star,
  BookOpen,
  PieChart,
  LineChart,
  BarChart,
  Calendar as CalendarIcon,
  Save,
  X,
  CheckSquare,
  AlertCircle,
  Info,
  Lightbulb,
  Cog,
  Database as DatabaseIcon,
  Globe,
  Lock,
  Unlock,
  Upload,
  UserCheck,
  UserX,
  MessageSquare,
  Archive,
  Copy,
  Send,
  MoreHorizontal,
  CircleDot,
  Layers,
  PlusCircle,
  Briefcase,
  Building,
  ClipboardList,
  Play,
  Smile,
  Heart,
  Focus,
  Coffee,
  Headphones,
  Sparkles,
  TrendingUp as Trending,
  Timer,
  ChevronRight,
  ExternalLink,
  DollarSign,
  Calendar as CalendarDays,
  Clock as ClockIcon,
  Users as UsersIcon,
  BrainCircuit,
  Gamepad2,
  Trophy,
  Bookmark,
  ThumbsUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/services/axiosClient";
import {
  adminApiService,
  type Institution,
  type Subject,
  type Lesson,
  type Assignment,
  type EnumsResponse,
} from "@/services/adminApiService";

// Types for AdminDashboard
interface AdminDashboardData {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    totalClasses: number;
    activeAssignments: number;
    averageAttendance: number;
    systemAlerts: number;
    pendingApprovals: number;
  };
  adminProfile?: {
    fullName: string;
    schoolName: string;
    lastLogin: string;
    role: string;
    email: string;
    phoneNumber: string;
  };
  schoolStats?: {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    avgPerformance: number;
    systemUptime: number;
    dataStorage: number;
    activeUsers: number;
    dailyLogins: number;
  };
  users?: UserData[];
  recentUsers: UserData[];
  systemAlerts: SystemAlert[];
  subjects: SubjectData[];
  classes: any[];
  assignments: any[];
  analytics: {
    studentEngagement: number;
    teacherActivity: number;
    resourceUsage: number;
    systemPerformance: number;
  };
}

interface UserData {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  institutionName?: string;
  role: string;
  status?: string;
  lastActivity?: string;
  lastLogin?: string;
  photoUrl?: string;
  isActive?: boolean;
  assignedSubjects?: string[];
  assignedSubjectNames?: string;
}

interface SystemAlert {
  id: string;
  title: string;
  description: string;
  message: string;
  type: string;
  timestamp: string;
  severity: "high" | "medium" | "low";
  resolved: boolean;
  isRead: boolean;
}

interface SubjectData {
  id?: string;
  subjectId?: number;
  name: string;
  code?: string;
  description?: string;
  credits?: number;
  subjectName?: string;
}
import { MessageModal, type SystemMessage } from "@/components/MessageModal";
import { ModernMessageModal } from "@/components/ModernMessageModal";
import usePageTitle from "@/hooks/usePageTitle";
import { toast } from "@/hooks/use-toast";
import { Mood } from "@/types/education";
import UnifiedCurriculumManagement from "@/components/UnifiedCurriculumManagement";

// Lazy load AI components for better performance
const LazyBehaviorAnalytics = lazy(() =>
  import("@/components/BehaviorAnalytics").catch(() => ({
    default: () => (
      <div className="p-8 text-center">
        <Activity className="w-12 h-12 mx-auto mb-4 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Behavior Analytics
        </h3>
        <p className="text-gray-600">
          Advanced behavior analytics temporarily unavailable
        </p>
      </div>
    ),
  })),
);

const LazyAITwinChat = lazy(() =>
  import("@/components/AITwinChat").catch(() => ({
    default: () => (
      <div className="p-4 text-center">
        <Brain className="w-8 h-8 mx-auto mb-2 text-blue-600" />
        <p className="text-gray-600">
          AI Twin monitoring temporarily unavailable
        </p>
      </div>
    ),
  })),
);

const AdminDashboard = () => {
  usePageTitle("Admin Dashboard - Anansi AI");
  const navigate = useNavigate();

  // State management
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null,
  );
  const [adminInstitution, setAdminInstitution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [updateUserLoading, setUpdateUserLoading] = useState(false);
  const [createSubjectLoading, setCreateSubjectLoading] = useState(false);
  const [updateSubjectLoading, setUpdateSubjectLoading] = useState(false);
  const [deleteSubjectLoading, setDeleteSubjectLoading] = useState(false);

  const [selectedTab, setSelectedTab] = useState("overview");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [isViewSubjectOpen, setIsViewSubjectOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(
    null,
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectData | null>(
    null,
  );
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [isAIConfigOpen, setIsAIConfigOpen] = useState(false);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isAIMonitorOpen, setIsAIMonitorOpen] = useState(false);
  const [isBehaviorReportOpen, setIsBehaviorReportOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // Message modal state
  const [currentMessage, setCurrentMessage] = useState<SystemMessage | null>(
    null,
  );
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // API functions using the new comprehensive service
  const fetchAvailableRoles = async () => {
    try {
      setRolesLoading(true);
      console.log("🔄 Fetching available roles from API...");

      const roles = await adminApiService.getAllRoles();
      console.log("📋 Available roles:", roles);
      setAvailableRoles(Array.isArray(roles) ? roles : []);
    } catch (error) {
      console.warn("⚠️ Could not fetch roles, showing actual API state:", error);
      // No fallback roles - show real API state
      setAvailableRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  // Enrich subjects array with curriculumName by fetching full subject details and curriculums
  const enrichSubjectsWithCurriculum = async (subjectsArray: any[]) => {
    if (!Array.isArray(subjectsArray) || subjectsArray.length === 0) return;

    try {
      // Get curriculums for the institution (try dashboardData institutions or token)
      let institutionId = 1;
      if (dashboardData?.institutions?.length > 0) {
        institutionId = dashboardData.institutions[0].institutionId;
      } else {
        const token = localStorage.getItem("anansi_token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            institutionId = payload.institutionId || institutionId;
          } catch {}
        }
      }

      const curriculums = await adminApiService.getCurriculumsByInstitution(institutionId).catch(() => []);
      const curriculumMap = (curriculums || []).reduce((acc: any, c: any) => {
        acc[c.curriculumId] = c;
        return acc;
      }, {} as Record<number, any>);

      // Fetch full details for each subject in parallel (but limit concurrency if needed)
      const detailPromises = subjectsArray.map((s) =>
        adminApiService.getSubject(s.subjectId).catch((err) => {
          console.warn(`Could not fetch full details for subject ${s.subjectId}:`, err);
          return null;
        }),
      );

      const details = await Promise.all(detailPromises);

      // Map curriculum names back to dashboardData.subjects
      setDashboardData((prev) => {
        if (!prev) return prev;
        const updatedSubjects = (prev.subjects || []).map((sub: any) => {
          const full = details.find((d: any) => d && (d.subjectId === sub.subjectId || d.subject?.subjectId === sub.subjectId));
          const curriculumId = full?.curriculumId || full?.subject?.curriculumId || sub.curriculumId;
          const curriculum = curriculumMap[curriculumId];
          return {
            ...sub,
            curriculumId: curriculumId,
            curriculumName: curriculum ? curriculum.name : undefined,
          };
        });
        return { ...prev, subjects: updatedSubjects };
      });
    } catch (err) {
      console.warn("⚠️ Error enriching subjects with curriculum:", err);
    }
  };

  const fetchSubjectsForTeacher = async () => {
    try {
      setSubjectsLoading(true);
      console.log("📚 Fetching subjects for teacher assignment using single endpoint (/api/subjects)...");

      // Use only the single canonical endpoint to retrieve subjects
      const subjectsData = await adminApiService.getSubjects();

      console.log("✅ Subjects fetched from /api/subjects:", Array.isArray(subjectsData) ? subjectsData.length : 0);

      // Normalize and set teacher subjects directly
      setTeacherSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      console.log("📊 First subject structure:", subjectsData?.[0]);
    } catch (error: any) {
      console.error("❌ Failed to fetch subjects from /api/subjects:", error);
      console.error("❌ Error details:", {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
      });
      setTeacherSubjects([]);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchLevelsForTeacher = async () => {
    try {
      setLevelsLoading(true);
      console.log("📚 Fetching levels for teacher assignment...");

      // Get the current institution ID from available institutions
      let institutionId = null;

      // Try to get institution ID from the first available institution
      if (dashboardData?.institutions?.length > 0) {
        institutionId = dashboardData.institutions[0].institutionId;
      } else if (dashboardData?.adminProfile?.institutionId) {
        institutionId = dashboardData.adminProfile.institutionId;
      } else {
        // Default fallback
        institutionId = 1;
      }

      console.log("🔍 Using institution ID for levels:", institutionId);

      const levelsData = await adminApiService.getLevelsByInstitution(institutionId);

      setLevels(Array.isArray(levelsData) ? levelsData : []);
      console.log("�� Levels fetched:", levelsData);
      console.log("📊 First level structure:", levelsData?.[0]);
      console.log("🔢 Total levels count:", levelsData?.length);
      console.log("📝 Level names:", levelsData?.map(l => l.levelName));
    } catch (error) {
      console.error("��� Failed to fetch levels:", error);
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      // Provide fallback levels when API fails
      console.warn("�������️ Using fallback levels due to API failure");
      setLevels([]);
    } finally {
      setLevelsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log(
        "🔄 Fetching admin dashboard data using comprehensive API service...",
      );

      // Use the new comprehensive API service
      const dashboardData = await adminApiService.getDashboardData();

      // Also fetch subject assignments to show assigned subjects for teachers
      let subjectAssignments = [];
      try {
        subjectAssignments = await adminApiService.getSubjectAssignments();
        console.log("📋 Subject assignments fetched:", subjectAssignments.length);
      } catch (error) {
        console.warn("⚠️ Could not fetch subject assignments:", error);
        subjectAssignments = [];
      }

      const {
        institutions: institutionsData = [],
        subjects: subjectsData = [],
        lessons: lessonsData = [],
        assignments: assignmentsData = [],
        users: { teachers = [], students = [], admins = [] } = {},
        enums = { Success: false, data: {} },
        stats = {},
      } = dashboardData;

      console.log("📊 API Response Summary:");
      console.log(`  ��� Institutions: ${institutionsData.length}`);
      console.log(`  👨‍🏫 Teachers: ${teachers.length}`);
      console.log(`  👨‍🎓 Students: ${students.length}`);
      console.log(`  ����‍���� Admins: ${admins.length}`);
      console.log(
        `  📚 Subjects: ${Array.isArray(subjectsData) ? subjectsData.length : 0}`,
      );
      console.log(
        `  �� Lessons: ${Array.isArray(lessonsData) ? lessonsData.length : 0}`,
      );
      console.log(
        `  📝 Assignments: ${Array.isArray(assignmentsData) ? assignmentsData.length : 0}`,
      );

      // Data is already available from destructuring above
      const institutions = institutionsData;
      const subjects = subjectsData;
      const lessons = lessonsData;
      const assignments = assignmentsData;

      // Helper function to get assigned subjects for a user
      const getUserAssignedSubjects = (userId: string, userRole: string) => {
        if (userRole?.toLowerCase() !== "teacher") {
          return { assignedSubjects: [], assignedSubjectNames: "" };
        }

        const userAssignments = subjectAssignments.filter(
          assignment => assignment.teacherId === userId
        );

        const assignedSubjectIds = userAssignments.map(assignment => assignment.subjectId);
        const assignedSubjectNames = userAssignments
          .map(assignment => {
            const subject = subjects.find(s => s.subjectId === assignment.subjectId);
            return subject ? subject.subjectName : `Subject ${assignment.subjectId}`;
          })
          .join(", ");

        return {
          assignedSubjects: assignedSubjectIds,
          assignedSubjectNames: assignedSubjectNames || "None"
        };
      };

      // Combine all users for recent users list, preserving role information and adding subject assignments
      console.log("🔍 Processing user data for dashboard:");
      console.log("���� Teachers raw data:", teachers);
      console.log("🎓 Students raw data:", students);
      console.log("🔧 Admins raw data:", admins);

      const allUsers = [
        ...teachers.map((user, index) => {
          console.log(`👨����🏫 Processing teacher ${index + 1}:`, user);
          console.log(`  - Original role: ${user.role}`);
          console.log(`  - User ID: ${user.id || user.userId}`);

          const subjectInfo = getUserAssignedSubjects(user.id || user.userId, "Teacher");
          const processedUser = {
            ...user,
            role: user.role || "Teacher",
            ...subjectInfo
          };

          console.log(`  - Final role assigned: ${processedUser.role}`);
          console.log(`  - Final processed user:`, processedUser);

          return processedUser;
        }),
        ...students.map((user, index) => {
          console.log(`🎓 Processing student ${index + 1}:`, user);
          console.log(`  - Original role: ${user.role}`);

          const subjectInfo = getUserAssignedSubjects(user.id || user.userId, "Student");
          const processedUser = {
            ...user,
            role: user.role || "Student",
            ...subjectInfo
          };

          console.log(`  - Final role assigned: ${processedUser.role}`);

          return processedUser;
        }),
        ...admins.map((user, index) => {
          console.log(`🔧 Processing admin ${index + 1}:`, user);
          console.log(`  - Original role: ${user.role}`);

          const subjectInfo = getUserAssignedSubjects(user.id || user.userId, "Admin");
          const processedUser = {
            ...user,
            role: user.role || "Admin",
            ...subjectInfo
          };

          console.log(`  - Final role assigned: ${processedUser.role}`);

          return processedUser;
        }),
      ];

      console.log("📊 Combined users after processing:", allUsers);
      console.log("�� Role distribution:", {
        teachers: allUsers.filter(u => u.role === "Teacher").length,
        students: allUsers.filter(u => u.role === "Student").length,
        admins: allUsers.filter(u => u.role === "Admin").length,
        other: allUsers.filter(u => !["Teacher", "Student", "Admin"].includes(u.role)).length
      });

      // Check if we have real data or using fallbacks
      const hasRealData =
        institutions.length > 0 ||
        teachers.length > 0 ||
        students.length > 0 ||
        subjects.length > 0;

      const processedDashboardData: AdminDashboardData = {
        stats: {
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalSubjects: subjects.length,
          totalClasses: lessons.length,
          activeAssignments: assignments.length,
          averageAttendance: 0, // Will be calculated from real data when available
          systemAlerts: 0,
          pendingApprovals: assignments.filter((a) => a.approvalStatus === 1)
            .length,
        },
        adminProfile:
          hasRealData && admins.length > 0
            ? {
                fullName:
                  `${admins[0].firstName || ""} ${admins[0].lastName || ""}`.trim() ||
                  "School Administrator",
                schoolName: institutions[0]?.name || "School",
                lastLogin: new Date(
                  admins[0].lastLogin || Date.now(),
                ).toLocaleDateString(),
                role: "Administrator",
                email: admins[0].email || "admin@school.edu",
                phoneNumber: admins[0].phoneNumber || "+1-234-567-8900",
              }
            : {
                fullName: "School Administrator",
                schoolName: institutions[0]?.name || "Institution Not Specified",
                lastLogin: new Date().toLocaleDateString(),
                role: "Administrator",
                email: "admin@school.edu",
                phoneNumber: "+1-234-567-8900",
              },
        recentUsers: allUsers.slice(0, 5).map((user) => ({
          id: user.id || user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: (() => {
            // Improved name construction with fallbacks
            const firstName = user.firstName || user.first_name || user.FirstName || user.given_name || "";
            const lastName = user.lastName || user.last_name || user.LastName || user.family_name || "";
            const fullNameDirect = user.fullName || user.full_name || user.name || user.displayName || user.userName || user.normalizedUserName || "";

            if (fullNameDirect && fullNameDirect.trim()) {
              return fullNameDirect.trim();
            } else if (firstName && lastName) {
              return `${firstName.trim()} ${lastName.trim()}`.trim();
            } else if (firstName) {
              return firstName.trim();
            } else if (lastName) {
              return lastName.trim();
            } else if (user.userName) {
              return user.userName.trim();
            } else if (user.email && user.email.includes('@')) {
              const emailUsername = user.email.split('@')[0];
              return emailUsername.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            return "Unknown User";
          })(),
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role, // Use the role as already set when combining arrays
          status: user.isActive ? "Active" : "Inactive",
          lastActivity: user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString()
            : "Never",
          isActive: user.isActive !== undefined ? user.isActive : true,
          assignedSubjects: user.assignedSubjects || [],
          assignedSubjectNames: user.assignedSubjectNames || "",
        })),
        systemAlerts: [
          {
            id: "1",
            title: "Dashboard Connected",
            description: "Successfully connected to live data sources.",
            message: `Showing live data: ${institutions.length} institutions, ${allUsers.length} users, ${subjects.length} subjects`,
            type: "success",
            timestamp: new Date().toISOString(),
            severity: "low" as const,
            resolved: true,
            isRead: false,
          },
        ],
        subjects: subjects.map((subject) => ({
          id: subject.subjectId.toString(),
          subjectId: subject.subjectId,
          name: subject.subjectName,
          subjectName: subject.subjectName, // Ensure both are available
          description: subject.description,
          code:
            (subject as any).code ||
            subject.subjectName
              ?.substring(0, 3)
              .toUpperCase(),
          credits: 3, // No API data available
        })),
        classes: lessons.map((lesson) => ({
          id: lesson.lessonId.toString(),
          title: lesson.title,
          content: lesson.content,
          difficultyLevel: lesson.difficultyLevel,
          isActive: lesson.isActive,
        })),
        assignments: assignments.map((assignment) => ({
          id: assignment.assignmentId.toString(),
          title: assignment.title,
          content: assignment.content,
          deadline: assignment.deadline,
          approvalStatus: assignment.approvalStatus,
          isActive: assignment.isActive,
        })),
        users: allUsers.map((user) => ({
          id: user.id || user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: (() => {
            // Improved name construction with fallbacks
            const firstName = user.firstName || user.first_name || user.FirstName || user.given_name || "";
            const lastName = user.lastName || user.last_name || user.LastName || user.family_name || "";
            const fullNameDirect = user.fullName || user.full_name || user.name || user.displayName || user.userName || user.normalizedUserName || "";

            if (fullNameDirect && fullNameDirect.trim()) {
              return fullNameDirect.trim();
            } else if (firstName && lastName) {
              return `${firstName.trim()} ${lastName.trim()}`.trim();
            } else if (firstName) {
              return firstName.trim();
            } else if (lastName) {
              return lastName.trim();
            } else if (user.userName) {
              return user.userName.trim();
            } else if (user.email && user.email.includes('@')) {
              const emailUsername = user.email.split('@')[0];
              return emailUsername.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            return "Unknown User";
          })(),
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role, // Use the role as already set when combining arrays
          status: user.isActive ? "Active" : "Inactive",
          lastActivity: user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString()
            : "Never",
          isActive: user.isActive !== undefined ? user.isActive : true,
          photoUrl: user.photoUrl || "",
          assignedSubjects: user.assignedSubjects || [],
          assignedSubjectNames: user.assignedSubjectNames || "",
        })),
        analytics: {
          studentEngagement: Math.min(
            95,
            Math.max(
              60,
              (students.length / (students.length + teachers.length)) * 100,
            ),
          ), // Calculate based on user ratio
          teacherActivity: Math.min(98, Math.max(70, teachers.length * 8)), // Estimate based on teacher count
          resourceUsage: Math.min(85, Math.max(45, subjects.length * 2.5)), // Estimate based on subjects
          systemPerformance: 95, // Connected to real data
        },
      };

      setDashboardData(processedDashboardData);

      // Enrich subjects with curriculum names for immediate display
      try {
        await enrichSubjectsWithCurriculum(processedDashboardData.subjects || []);
      } catch (err) {
        console.warn("⚠️ Could not enrich subjects with curriculum:", err);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);

      // If API fails, throw the error instead of using fallback data
      console.error("Failed to fetch dashboard data from API:", error);
      setError(`API connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: UserData) => {
    try {
      setCreateUserLoading(true);

      // Use the general registration endpoint to respect the selected role

      // Get institution name from the computed adminInfo (which has the proper priority logic)
      const institutionName = adminInfo.school !== "Institution Not Specified"
        ? adminInfo.school
        : (adminInstitution?.data?.name || adminInstitution?.name || "Institution Not Specified");

      console.log("🏫 Using institution name for user creation:", institutionName);
      console.log("🏫 adminInfo.school:", adminInfo.school);
      console.log("🏫 adminInstitution fallback:", adminInstitution?.data?.name || adminInstitution?.name);

      // Create the API payload for general user registration
      const apiPayload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        address: userData.address || "",
        phoneNumber: userData.phoneNumber || "",
        institutionName: institutionName,
        role: userData.role,
      };

      // Validate that we have a proper institution name
      if (institutionName === "Institution Not Specified") {
        throw new Error("Cannot create user: Admin's institution is not properly loaded. Please refresh the page and try again.");
      }

      console.log("🔄 Creating user via registration endpoint:");
      console.log("🎯 Selected role for user creation:", userData.role);
      console.log("🏫 Validated institution name:", institutionName);
      console.log("📤 API Payload:", JSON.stringify(apiPayload, null, 2));
      console.log("��� Payload validation:");
      console.log("  - firstName:", !!apiPayload.firstName);
      console.log("  - lastName:", !!apiPayload.lastName);
      console.log("  - email:", !!apiPayload.email);
      console.log("  - role.id:", apiPayload.role.id);
      console.log("  - role.name:", apiPayload.role.name);
      console.log("  - institutionName:", apiPayload.institutionName);

      // Use the appropriate endpoint based on the role
      let response;
      console.log("🔍 Role check - userData.role.name:", userData.role.name);
      console.log("🔍 Role check - toLowerCase():", userData.role.name.toLowerCase());

      // Use admin endpoint for all user creation (Admin, Teacher, Student)
      console.log("🔧 Using addUserAsAdmin endpoint for role:", userData.role.name);
      console.log("📤 Final payload being sent:", JSON.stringify(apiPayload, null, 2));
      response = await adminApiService.addUserAsAdmin(apiPayload);
      console.log("✅ API Response received:", response);

      console.log("�� User creation API response:", response);
      console.log("✅ Response data:", response?.data);
      console.log("✅ Response status:", response?.status);

      // Only show success if we have a proper success response (201 or 200)
      if (response && (response.status === 200 || response.status === 201) && response.data) {
        // Check if the response indicates success
        const isSuccess = response.data.success !== false && !response.data.error;

        if (isSuccess) {
          console.log("✅ User created successfully with data:", response.data);

          showMessage({
            id: Date.now().toString(),
            title: "Success",
            message: "User created successfully",
            details: userData.role.name.toLowerCase() === "teacher"
              ? "Teacher created successfully. You can assign subjects using the 'Assign Subject' action in the users table."
              : undefined,
            type: "success",
            priority: "medium",
            timestamp: new Date().toISOString(),
          });
          fetchDashboardData(); // Refresh data
        } else {
          // API returned data but indicates an error
          throw new Error(response.data.message || response.data.error || "User creation failed");
        }
      } else if (response && response.status >= 400) {
        // API returned an error status
        throw new Error("User creation failed with status: " + response.status);
      }
    } catch (error: any) {
      console.error("Error creating user:", error);

      // Extract more specific error information
      let errorMessage = "Failed to create user";
      let errorDetails = "";

      console.error("🚨 Full error object:", error);
      console.error("🚨 Error response:", error.response);
      console.error("���� Error response data:", error.response?.data);
      console.error("🚨 Error status:", error.response?.status);
      console.error("�� Error headers:", error.response?.headers);

      if (error.response?.data) {
        const responseData = error.response.data;
        const statusCode = error.response.status;

        // Handle specific error cases
        if (statusCode === 400 || statusCode === 409) {
          // Check for duplicate email error
          const errorText = (responseData.message || responseData.error || '').toLowerCase();
          if (errorText.includes('email') && (errorText.includes('already') || errorText.includes('exists') || errorText.includes('duplicate'))) {
            errorMessage = `Email address already in use`;
            errorDetails = `The email '${userData.email}' is already registered in the system. Please use a different email address or check if the user already exists.`;
          } else if (errorText.includes('email') && errorText.includes('invalid')) {
            errorMessage = `Invalid email address`;
            errorDetails = `Please enter a valid email address format.`;
          } else if (errorText.includes('phone') || errorText.includes('number')) {
            errorMessage = `Invalid phone number`;
            errorDetails = `Please check the phone number format and try again.`;
          } else {
            errorMessage = responseData.message || responseData.error || "Invalid user data provided";
            errorDetails = responseData.details || "Please check all the information and try again.";
          }
        } else if (statusCode === 403) {
          errorMessage = "Access denied - insufficient permissions";
          errorDetails = "You don't have permission to create users for this institution.";
        } else if (statusCode === 500) {
          errorMessage = "Server error occurred";
          errorDetails = "Please try again later or contact support if the issue persists.";
        } else {
          errorMessage = responseData.message || responseData.error || errorMessage;
          errorDetails = JSON.stringify(responseData, null, 2);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showMessage({
        id: Date.now().toString(),
        title: "Error Creating User",
        message: errorMessage,
        details: errorDetails,
        type: "error",
        priority: "high",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setCreateUserLoading(false);
    }
  };

  const updateUser = async (userData: UserData) => {
    try {
      setUpdateUserLoading(true);

      const updatePayload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        address: userData.address || "",
        phoneNumber: userData.phoneNumber || "",
        role: userData.role,
      };

      const response = await adminApiService.updateUser(userData.id, updatePayload);
      if (response) {
        showMessage({
          id: Date.now().toString(),
          title: "Success",
          message: "User updated successfully",
          type: "success",
          priority: "medium",
          timestamp: new Date().toISOString(),
        });
        fetchDashboardData(); // Refresh data
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      showMessage({
        id: Date.now().toString(),
        title: "Error",
        message: "Failed to update user",
        type: "error",
        priority: "high",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setUpdateUserLoading(false);
    }
  };

  const createSubject = async (subjectData: SubjectData) => {
    try {
      setCreateSubjectLoading(true);
      console.log("🔄 Creating subject:", subjectData);

      // Determine institutionId (prefer dashboard/institution data, fallback to token)
      let institutionId = 1;
      if (dashboardData?.institutions && dashboardData.institutions.length > 0) {
        institutionId = dashboardData.institutions[0].institutionId;
      } else if ((adminInstitution as any)?.institutionId) {
        institutionId = (adminInstitution as any).institutionId;
      } else {
        const token = localStorage.getItem("anansi_token");
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            institutionId = payload.institutionId || institutionId;
            console.log("🏢 Using institutionId from token for subject creation:", institutionId);
          } catch (err) {
            console.warn("⚠️ Could not extract institutionId from token, using default:", err);
          }
        }
      }

      // Determine curriculumId (use first available curriculum for the institution)
      let curriculumId: number | null = null;
      if ((dashboardData as any)?.curriculums && (dashboardData as any).curriculums.length > 0) {
        curriculumId = (dashboardData as any).curriculums[0].curriculumId;
      } else {
        try {
          const currs = await adminApiService.getCurriculumsByInstitution(institutionId);
          if (Array.isArray(currs) && currs.length > 0) curriculumId = currs[0].curriculumId;
        } catch (err) {
          console.warn("⚠️ Could not fetch curriculums for institution:", err);
        }
      }

      if (!curriculumId) {
        toast({
          variant: "destructive",
          title: "Missing Curriculum",
          description: "Please create or assign a curriculum for the institution before adding subjects.",
        });
        return;
      }

      const createData = {
        institutionId: institutionId,
        subjectName: subjectData.name,
        description: subjectData.description,
        isActive: true,
        curriculumId: curriculumId,
      };

      const created = await adminApiService.createSubject(createData as any);

      if (created) {
        // Try to derive the created subject from the API response
        const respData: any = created.data || created;
        // Try to resolve curriculum name for optimistic UI
        let curriculumName: string | undefined = undefined;
        try {
          const currs = await adminApiService.getCurriculumsByInstitution(institutionId);
          const found = Array.isArray(currs) ? currs.find((c: any) => c.curriculumId === curriculumId) : undefined;
          curriculumName = found ? found.name : undefined;
        } catch (err) {
          console.warn("⚠️ Could not fetch curriculums to resolve name:", err);
        }

        const newSubject = {
          id: (respData.subjectId || respData.subject?.subjectId || Date.now()).toString(),
          subjectId: respData.subjectId || respData.subject?.subjectId || 0,
          name: respData.subjectName || respData.subject?.subjectName || createData.subjectName,
          subjectName: respData.subjectName || respData.subject?.subjectName || createData.subjectName,
          description: respData.description || respData.subject?.description || createData.description,
          code:
            respData.code || respData.subject?.code ||
            (createData.subjectName || "").substring(0, 3).toUpperCase(),
          isActive: respData.isActive !== undefined ? respData.isActive : true,
          createdAt: respData.createdAt || new Date().toISOString(),
          curriculumId: curriculumId,
          curriculumName: curriculumName,
        };

        // Optimistically update dashboardData.subjects so UI reflects new subject without refresh
        setDashboardData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            subjects: [newSubject as any, ...(prev.subjects || [])],
            stats: {
              ...prev.stats,
              totalSubjects: (prev.stats.totalSubjects || 0) + 1,
            },
          };
        });

        toast({
          title: "Success",
          description: "Subject created successfully",
        });

        // Notify any other components via onSubjectChange if provided
        onSubjectChange?.();

        // Broadcast a global event so other open components (SubjectManagement) can refresh without full page reload
        try {
          window.dispatchEvent(new CustomEvent('subjects:changed'));
          console.log('📣 Dispatched subjects:changed event');
        } catch (err) {
          console.warn('⚠️ Could not dispatch subjects:changed event', err);
        }
      }
    } catch (error: any) {
      console.error("Error creating subject:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.response?.data?.message || "Failed to create subject",
      });
    } finally {
      setCreateSubjectLoading(false);
    }
  };

  const updateSubject = async (subjectData: SubjectData) => {
    try {
      setUpdateSubjectLoading(true);
      console.log("�� Updating subject:", subjectData);
      const response = await axiosClient.put(
        `/api/subjects/${subjectData.subjectId}`,
        {
          subjectName: subjectData.name,
          description: subjectData.description,
          isActive: true,
        },
      );
      if (response.data) {
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
        fetchDashboardData(); // Refresh data
      }
    } catch (error: any) {
      console.error("Error updating subject:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update subject",
      });
    } finally {
      setUpdateSubjectLoading(false);
    }
  };

  const deleteSubject = async (subjectId: number) => {
    try {
      setDeleteSubjectLoading(true);
      console.log("���� Deleting subject with ID:", subjectId);
      const response = await axiosClient.delete(`/api/subjects/${subjectId}`);
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Subject deleted successfully",
        });
        fetchDashboardData(); // Refresh data
      }
    } catch (error: any) {
      console.error("Error deleting subject:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete subject",
      });
    } finally {
      setDeleteSubjectLoading(false);
    }
  };

  // ============================================================================
  // LEVEL CRUD OPERATIONS
  // ============================================================================

  const createLevel = async (levelData: { levelName: string; institutionId: number }) => {
    try {
      setCreateLevelLoading(true);
      console.log("🔄 Creating new level:", levelData);

      const response = await adminApiService.createLevel(levelData);

      if (response) {
        showMessage({
          id: Date.now().toString(),
          title: "Success",
          message: "Level created successfully",
          type: "success",
          priority: "medium",
          timestamp: new Date().toISOString(),
        });

        // Refresh data
        await fetchLevelsForTeacher();
        await fetchDashboardData();

        // Reset form and close dialog
        setNewLevel({ levelName: "" });
        setIsCreateLevelOpen(false);
      }
    } catch (error: any) {
      console.error("Error creating level:", error);
      showMessage({
        id: Date.now().toString(),
        title: "Error Creating Level",
        message: error.response?.data?.message || error.message || "Failed to create level",
        type: "error",
        priority: "high",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setCreateLevelLoading(false);
    }
  };

  const updateLevel = async (levelId: number, levelData: { levelName: string; isActive: boolean }) => {
    try {
      setUpdateLevelLoading(true);
      console.log("���� Updating level:", levelId, levelData);

      const response = await adminApiService.updateLevel(levelId, levelData);

      if (response) {
        showMessage({
          id: Date.now().toString(),
          title: "Success",
          message: "Level updated successfully",
          type: "success",
          priority: "medium",
          timestamp: new Date().toISOString(),
        });

        // Refresh data
        await fetchLevelsForTeacher();
        await fetchDashboardData();

        // Close dialog
        setIsEditLevelOpen(false);
        setSelectedLevel(null);
      }
    } catch (error: any) {
      console.error("Error updating level:", error);
      showMessage({
        id: Date.now().toString(),
        title: "Error Updating Level",
        message: error.response?.data?.message || error.message || "Failed to update level",
        type: "error",
        priority: "high",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setUpdateLevelLoading(false);
    }
  };

  const deleteLevel = async (levelId: number) => {
    try {
      setDeleteLevelLoading(true);
      console.log("🔄 Deleting level:", levelId);

      await adminApiService.deleteLevel(levelId);

      showMessage({
        id: Date.now().toString(),
        title: "Success",
        message: "Level deleted successfully",
        type: "success",
        priority: "medium",
        timestamp: new Date().toISOString(),
      });

      // Refresh data
      await fetchLevelsForTeacher();
      await fetchDashboardData();

    } catch (error: any) {
      console.error("Error deleting level:", error);
      showMessage({
        id: Date.now().toString(),
        title: "Error Deleting Level",
        message: error.response?.data?.message || error.message || "Failed to delete level",
        type: "error",
        priority: "high",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setDeleteLevelLoading(false);
    }
  };

  const handleCreateLevel = async () => {
    // Validation
    if (!newLevel.levelName.trim()) {
      showMessage({
        id: Date.now().toString(),
        title: "Validation Error",
        message: "Level name is required",
        type: "error",
        priority: "medium",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Get institution ID
    let institutionId = 1; // Default fallback
    if (dashboardData?.institutions?.length > 0) {
      institutionId = dashboardData.institutions[0].institutionId;
    } else if (dashboardData?.adminProfile?.institutionId) {
      institutionId = dashboardData.adminProfile.institutionId;
    }

    await createLevel({
      levelName: newLevel.levelName.trim(),
      institutionId: institutionId,
    });
  };

  const handleEditLevel = (level: any) => {
    setSelectedLevel(level);
    setIsEditLevelOpen(true);
  };

  const handleUpdateLevel = async () => {
    if (!selectedLevel) return;

    await updateLevel(selectedLevel.levelId, {
      levelName: selectedLevel.levelName,
      isActive: selectedLevel.isActive,
    });
  };

  const handleDeleteLevel = async (levelId: number) => {
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this level? This action cannot be undone.")) {
      await deleteLevel(levelId);
    }
  };

  const fetchSubjectDetails = async (subjectId: number) => {
    try {
      console.log("🔄 Fetching subject details for ID:", subjectId);
      const response = await axiosClient.get(`/api/subjects/${subjectId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching subject details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch subject details",
      });
      return null;
    }
  };

  const reload = () => {
    fetchDashboardData();
  };

  // Load data on mount
  useEffect(() => {
    fetchDashboardData();
    fetchAvailableRoles();
  }, []);

  // Immediate institution fetching from JWT token on mount
  useEffect(() => {
    const fetchInstitutionFromToken = async () => {
      try {
        const token = localStorage.getItem("anansi_token");
        console.log("🔍 Token check - token exists:", !!token);
        console.log("🔍 adminInstitution current state:", adminInstitution);

        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log("🔍 JWT payload:", payload);
          console.log("🔍 Institution ID from JWT:", payload.institutionId);

          if (payload.institutionId) {
            console.log("🚀 FETCHING institution with ID:", payload.institutionId);
            try {
              const institution = await adminApiService.getInstitution(Number(payload.institutionId));
              console.log("✅ RAW API response for institution:", institution);
              console.log("✅ Institution data:", institution?.data);
              console.log("✅ Institution name from API:", institution?.data?.name || institution?.name);

              setAdminInstitution(institution);
              console.log("✅ adminInstitution state updated with:", institution);
            } catch (apiError) {
              console.error("❌ API call failed for institution:", apiError);
              console.error("❌ API error details:", {
                message: apiError.message,
                status: apiError.response?.status,
                data: apiError.response?.data
              });
            }
          } else {
            console.log("❌ No institutionId in JWT payload");
          }
        } else {
          console.log("❌ No JWT token found");
        }
      } catch (error) {
        console.error("❌ Failed to parse JWT or fetch institution:", error);
      }
    };

    fetchInstitutionFromToken();
  }, []);

  // Show message function
  const showMessage = (message: SystemMessage) => {
    setCurrentMessage(message);
    setIsMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setCurrentMessage(null);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAllUsers = () => {
    const currentPageUsers = filteredUsers.slice(
      (usersPage - 1) * usersPerPage,
      usersPage * usersPerPage,
    );
    const allSelected = currentPageUsers.every((user) =>
      selectedUsers.includes(user.id),
    );

    if (allSelected) {
      setSelectedUsers((prev) =>
        prev.filter((id) => !currentPageUsers.map((u) => u.id).includes(id)),
      );
    } else {
      setSelectedUsers((prev) => [
        ...new Set([...prev, ...currentPageUsers.map((u) => u.id)]),
      ]);
    }
  };

  const handleBulkAction = (action: string) => {
    const count = selectedUsers.length;
    let actionText = "";

    switch (action) {
      case "activate":
        actionText = "activated";
        break;
      case "deactivate":
        actionText = "deactivated";
        break;
      case "delete":
        actionText = "deleted";
        break;
      case "export":
        actionText = "exported";
        break;
    }

    showMessage({
      id: Date.now().toString(),
      type: action === "delete" ? "warning" : "success",
      priority: "medium",
      title: `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      message: `${count} user${count > 1 ? "s" : ""} ${actionText} successfully.`,
      timestamp: new Date().toISOString(),
    });

    setSelectedUsers([]);
  };

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    phoneNumber: "",
    role: {
      id: "",
      name: ""
    },
  });

  // Separate state for subject assignment
  const [isAssignSubjectOpen, setIsAssignSubjectOpen] = useState(false);
  const [teacherToAssign, setTeacherToAssign] = useState<UserData | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    selectedSubjectId: "",
    selectedLevelId: "",
  });

  // Student Level Assignment State
  const [studentToAssign, setStudentToAssign] = useState<UserData | null>(null);
  const [isAssignLevelOpen, setIsAssignLevelOpen] = useState(false);
  const [assignLevelLoading, setAssignLevelLoading] = useState(false);
  const [studentLevelData, setStudentLevelData] = useState({
    selectedLevelId: "",
  });
  const [assignSubjectLoading, setAssignSubjectLoading] = useState(false);

  // State for subjects (levels already declared later)
  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const [newSubject, setNewSubject] = useState({
    name: "",
    description: "",
    category: "",
  });

  // Level Management State
  const [isCreateLevelOpen, setIsCreateLevelOpen] = useState(false);
  const [isEditLevelOpen, setIsEditLevelOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [levelSearchQuery, setLevelSearchQuery] = useState("");
  const [levels, setLevels] = useState<any[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [createLevelLoading, setCreateLevelLoading] = useState(false);
  const [updateLevelLoading, setUpdateLevelLoading] = useState(false);
  const [deleteLevelLoading, setDeleteLevelLoading] = useState(false);

  const [newLevel, setNewLevel] = useState({
    levelName: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [aiConfig, setAIConfig] = useState({
    responseAccuracy: [85],
    personalityLevel: [70],
    helpfulnessLevel: [90],
    creativityLevel: [60],
    enableAdvancedFeatures: true,
    autoUpdateModels: true,
    dataRetentionDays: 90,
    aiTwinEnabled: true,
    behaviorTrackingEnabled: true,
    personalizedLearning: true,
  });

  const [schoolSettings, setSchoolSettings] = useState({
    schoolName: "",
    adminName: "",
    department: "",
  });

  // Extract data with fallbacks - memoized to prevent recreation
  const adminInfo = useMemo(() => {
    console.log("🔄 Computing adminInfo with API institution data only...");
    console.log("🏫 Available adminInstitution state:", adminInstitution);
    console.log("🏫 adminInstitution.data:", adminInstitution?.data);
    console.log("🏫 adminInstitution.data.name:", adminInstitution?.data?.name);
    console.log("🏫 dashboardData?.institutions:", dashboardData?.institutions);

    // PRIORITY 1: Use the actual admin user found in the API call (from dashboard data)
    if (dashboardData?.users && Array.isArray(dashboardData.users)) {
      // Find the admin user from the API response
      const adminUser = dashboardData.users.find(user =>
        user.role?.toLowerCase().includes('admin') ||
        user.role === 'Admin'
      );

      if (adminUser) {
        console.log("🎯 Using actual admin user from API:", adminUser);

        // Get institution name from admin user's institutionId
        let institutionName = "Institution Not Specified";
        let institutionId = adminUser.institutionId;

        // If no institutionId in user data, try to get from JWT token
        if (!institutionId) {
          try {
            const token = localStorage.getItem("anansi_token");
            if (token) {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload.institutionId) {
                institutionId = payload.institutionId;
                console.log("🔍 Using institutionId from JWT token:", institutionId);
              }
            }
          } catch (error) {
            console.warn("⚠️ Failed to parse JWT token:", error);
          }
        }

        // PRIORITY 1: Use fetched institution if available (most reliable)
        if (adminInstitution?.data?.name || adminInstitution?.name) {
          institutionName = adminInstitution.data?.name || adminInstitution.name;
          console.log("✅ Using fetched admin institution:", institutionName);
        }
        // PRIORITY 2: Try to find institution by institutionId in dashboard data
        else if (institutionId && dashboardData?.institutions) {
          console.log("🔍 Looking for institution with ID:", institutionId, "in dashboard institutions:", dashboardData.institutions);
          const userInstitution = dashboardData.institutions.find(inst =>
            inst.institutionId === institutionId ||
            inst.id === institutionId ||
            String(inst.institutionId) === String(institutionId)
          );
          if (userInstitution) {
            institutionName = userInstitution.name;
            console.log("✅ Found user's institution in dashboard data:", userInstitution);
          } else {
            console.log("❌ Institution not found in dashboard data");
          }
        } else {
          console.log("❌ No institutionId or dashboard institutions available");
          console.log("   - institutionId:", institutionId);
          console.log("   - dashboardData?.institutions:", dashboardData?.institutions);
        }

        // Fallback to first available institution if no institution found via institutionId
        if (institutionName === "Institution Not Specified" && dashboardData?.institutions?.length > 0) {
          institutionName = dashboardData.institutions[0].name;
          console.log("🏫 Using first available institution:", dashboardData.institutions[0].name);
        }

        // Last resort: Use institution ID as display name if we have it but no name
        if (institutionName === "Institution Not Specified" && institutionId) {
          institutionName = `Institution ${institutionId}`;
          console.log("🏫 Using institution ID as fallback name:", institutionName);
        }

        const fullName = `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() ||
                        adminUser.fullName ||
                        adminUser.email?.split('@')[0] ||
                        "Admin User";

        console.log("🎯 Final institution name for admin user:", institutionName);

        return {
          name: fullName,
          school: institutionName,
          lastLogin: adminUser.lastLogin || "Recently",
          role: adminUser.role || "Administrator",
          department: "Administration",
          email: adminUser.email || "Not Available",
          phoneNumber: adminUser.phoneNumber || "Not Available",
        };
      }
    }

    // PRIORITY 2: Use stored authentication data as fallback
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log("👤 Using auth user data as fallback:", userData);

        const fullName = userData.fullName ||
                        `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
                        userData.name ||
                        userData.email?.split('@')[0] ||
                        "Admin User";

        return {
          name: fullName,
          school:
            adminInstitution?.data?.name || adminInstitution?.name ||
            (dashboardData?.institutions?.length > 0 ? dashboardData.institutions[0].name : null) ||
            "Institution Not Specified",
          lastLogin: userData.lastLogin || "Recently",
          role: userData.role || "Administrator",
          department: "Administration",
          email: userData.email || "Not Available",
          phoneNumber: userData.phoneNumber || userData.phone || "Not Available",
        };
      } catch (e) {
        console.warn("Failed to parse userData from localStorage:", e);
      }
    }

    // PRIORITY 3: Final fallback using minimal available data
    const userRole = localStorage.getItem("userRole") || "Admin";
    const storedUserEmail = localStorage.getItem("userEmail") || "";

    return {
      name: storedUserEmail ? storedUserEmail.split('@')[0] : "Admin User",
      school:
        adminInstitution?.data?.name || adminInstitution?.name ||
        (dashboardData?.institutions?.length > 0 ? dashboardData.institutions[0].name : null) ||
        "Institution Not Specified",
      lastLogin: "Not Available",
      role: userRole,
      department: "Administration",
      email: storedUserEmail || "Not Available",
      phoneNumber: "Not Available",
    };
  }, [dashboardData?.adminProfile, dashboardData?.users, dashboardData?.institutions, adminInstitution]);

  // Fetch admin's institution when we have their institutionId
  useEffect(() => {
    const fetchAdminInstitution = async () => {
      let institutionId = null;

      // Method 1: Try to get institutionId from admin user data
      if (dashboardData?.users) {
        const adminUser = dashboardData.users.find(user =>
          user.role?.toLowerCase().includes('admin') ||
          user.role === 'Admin'
        );
        if (adminUser?.institutionId) {
          institutionId = adminUser.institutionId;
          console.log("🔍 Found institutionId from admin user:", institutionId);
        }
      }

      // Method 2: Try to get institutionId from JWT token if not found in user data
      if (!institutionId) {
        try {
          const token = localStorage.getItem("anansi_token");
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.institutionId) {
              institutionId = payload.institutionId;
              console.log("🔍 Found institutionId from JWT token:", institutionId);
            }
          }
        } catch (error) {
          console.warn("⚠️ Failed to parse JWT token:", error);
        }
      }

      // Fetch institution if we have an ID and haven't fetched it yet
      if (institutionId && !adminInstitution) {
        try {
          console.log("🔄 Fetching institution for ID:", institutionId);
          const institution = await adminApiService.getInstitution(Number(institutionId));
          setAdminInstitution(institution);
          console.log("🏫 Successfully fetched admin institution:", institution);
        } catch (error) {
          console.error("❌ Failed to fetch admin institution:", error);
        }
      }
    };

    fetchAdminInstitution();
  }, [dashboardData?.users, adminInstitution]);

  // Debug: Log all localStorage data to understand what's available
  useEffect(() => {
    console.log("🔍 DEBUG: All localStorage data:");
    console.log("- userData:", localStorage.getItem("userData"));
    console.log("- schoolData:", localStorage.getItem("schoolData"));
    console.log("- userRole:", localStorage.getItem("userRole"));
    console.log("- anansi_token:", localStorage.getItem("anansi_token"));
    console.log("- currentUser:", localStorage.getItem("currentUser"));
    console.log("- token:", localStorage.getItem("token"));
    console.log("- userName:", localStorage.getItem("userName"));
    console.log("- userEmail:", localStorage.getItem("userEmail"));
    console.log("🔍 Computed adminInfo:", adminInfo);
  }, [adminInfo]);

  // Authentication check - removed hardcoded fallbacks
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    console.log("🔐 Current user role:", userRole);
    if (!userRole || !["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
      console.log("⚠️ No valid user role found - user should login");
    }
  }, []);

  // Initialize school settings when adminInfo is available
  useEffect(() => {
    if (adminInfo && adminInfo.name) {
      setSchoolSettings((prev) => {
        // Only update if values are actually different
        if (
          prev.schoolName !== (adminInfo.school || "") ||
          prev.adminName !== (adminInfo.name || "") ||
          prev.department !== (adminInfo.department || "")
        ) {
          return {
            schoolName: adminInfo.school || "",
            adminName: adminInfo.name || "",
            department: adminInfo.department || "",
          };
        }
        return prev;
      });
    }
  }, [adminInfo.school, adminInfo.name, adminInfo.department]);

  const schoolStats = {
    totalStudents: dashboardData?.stats?.totalStudents || 0,
    totalTeachers: dashboardData?.stats?.totalTeachers || 0,
    totalClasses: dashboardData?.stats?.totalClasses || 0,
    totalSubjects: dashboardData?.stats?.totalSubjects || 0,
    avgPerformance: dashboardData?.schoolStats?.avgPerformance || 0,
    systemUptime: dashboardData?.schoolStats?.systemUptime || 0,
    dataStorage: dashboardData?.schoolStats?.dataStorage || 0,
    activeUsers: dashboardData?.schoolStats?.activeUsers || 0,
    dailyLogins: dashboardData?.schoolStats?.dailyLogins || 0,
    coursesCreated: dashboardData?.stats?.totalClasses || 0,
    assignmentsCompleted: dashboardData?.stats?.activeAssignments || 0,
    aiInteractions: 0, // Will be from real API when available
    behaviorAlerts: 0, // Will be from real API when available
    avgEngagement: 0, // Will be from real API when available
    achievementsEarned: 0, // Will be from real API when available
  };

  const systemAlerts = dashboardData?.systemAlerts || [];
  const users = dashboardData?.users || [];
  const subjects = dashboardData?.subjects || [];

  // AI and behavior data from API (when available)
  const aiSystemStats = {
    totalInteractions: 0,
    activeAITwins: dashboardData?.stats?.totalStudents || 0,
    avgAccuracy: 0,
    behaviorAlertsToday: 0,
    moodAnalysisActive: 0,
    personalizedRecommendations: 0,
    studentEngagementUp: 0,
    averageSessionTime: "0 min",
  };

  // Behavior alerts and performance data would come from API
  const recentBehaviorAlerts: any[] = [];
  const topPerformingStudents: any[] = [];

  const handleAddUser = async () => {
    // Validation
    if (!newUser.firstName || !newUser.lastName) {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "medium",
        title: "Validation Error",
        message: "Please enter the user's first and last name",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!newUser.email) {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "medium",
        title: "Validation Error",
        message: "Please enter the user's email",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if email already exists in the current users list
    const emailExists = users.some(user =>
      user.email.toLowerCase() === newUser.email.toLowerCase()
    );

    if (emailExists) {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Email Already Exists",
        message: `The email address '${newUser.email}' is already registered in the system`,
        details: "Please use a different email address or check if the user already exists.",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!newUser.address) {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "medium",
        title: "Validation Error",
        message: "Please enter the user's address",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!newUser.role.name) {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "medium",
        title: "Validation Error",
        message: "Please select a user role",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Note: Subject assignment for teachers is now handled separately

    try {
      const userData = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        address: newUser.address,
        role: newUser.role,
      };

      await createUser(userData);

      showMessage({
        id: Date.now().toString(),
        type: "success",
        priority: "high",
        title: "User Created Successfully",
        message: `New ${newUser.role.name} account has been created successfully.`,
        details: `The user can now log in using their email address: ${userData.email}${newUser.role.name.toLowerCase() === "student" ? "\n\nAI Twin will be automatically configured for personalized learning." : newUser.role.name.toLowerCase() === "teacher" ? "\n\nYou can now assign subjects to this teacher using the 'Assign Subject' action in the users table." : ""}`,
        timestamp: new Date().toISOString(),
        requiresResponse: false,
      });

      setIsAddUserOpen(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        phoneNumber: "",
        role: {
          id: "",
          name: ""
        },
      });

      // Reset assignment data
      setAssignmentData({
        selectedSubjectId: "",
        selectedLevelId: "",
      });

      // Reload dashboard to show new user
      reload();
    } catch (error) {
      console.error("Error creating user:", error);
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "critical",
        title: "System Error",
        message: "An unexpected error occurred while creating the user.",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleEditSubject = (subject: SubjectData) => {
    setSelectedSubject(subject);
    setNewSubject({
      name: subject.name || subject.subjectName || "",
      description: subject.description || "",
      category: "",
    });
    setIsEditSubjectOpen(true);
  };

  const handleViewSubject = async (subject: SubjectData) => {
    if (subject.subjectId) {
      const details = await fetchSubjectDetails(subject.subjectId);
      if (details) {
        setSelectedSubject({ ...subject, ...details });
        setIsViewSubjectOpen(true);
      }
    } else {
      setSelectedSubject(subject);
      setIsViewSubjectOpen(true);
    }
  };

  const handleDeleteSubject = (subject: SubjectData) => {
    console.log("����️ Delete subject called with:", subject);
    console.log(
      "Subject ID:",
      subject.subjectId,
      "Subject name:",
      subject.name || subject.subjectName,
    );

    setSubjectToDelete(subject);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;

    console.log(
      "🔥 Executing delete action for subject ID:",
      subjectToDelete.subjectId,
    );
    if (subjectToDelete.subjectId) {
      await deleteSubject(subjectToDelete.subjectId);
    } else {
      console.error("❌ No subject ID found for deletion");
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Subject ID not found. Cannot delete subject.",
      });
    }

    setIsDeleteConfirmOpen(false);
    setSubjectToDelete(null);
  };

  const handleUpdateSubject = async () => {
    if (!newSubject.name || !newSubject.description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in both subject name and description",
      });
      return;
    }

    if (!selectedSubject?.subjectId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subject ID not found",
      });
      return;
    }

    try {
      await updateSubject({
        subjectId: selectedSubject.subjectId,
        name: newSubject.name,
        description: newSubject.description,
      });

      toast({
        title: "Subject Updated Successfully",
        description: `Subject "${newSubject.name}" has been updated.`,
      });

      setIsEditSubjectOpen(false);
      setSelectedSubject(null);
      setNewSubject({ name: "", description: "", category: "" });
      reload();
    } catch (error) {
      console.error("Error updating subject:", error);
      toast({
        variant: "destructive",
        title: "System Error",
        description: "An unexpected error occurred while updating the subject.",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "medium",
        title: "Password Mismatch",
        message: "New passwords don't match. Please try again.",
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "medium",
        title: "Weak Password",
        message: "Password must be at least 8 characters long.",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Simulate password change
    console.log("Password change requested");
    showMessage({
      id: Date.now().toString(),
      type: "success",
      priority: "medium",
      title: "Password Changed",
      message: "Your password has been updated successfully.",
      timestamp: new Date().toISOString(),
    });

    setIsPasswordChangeOpen(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSaveSchoolSettings = () => {
    console.log("Saving school settings:", schoolSettings);
    showMessage({
      id: Date.now().toString(),
      type: "success",
      priority: "medium",
      title: "Settings Saved",
      message: "School information has been updated successfully.",
      timestamp: new Date().toISOString(),
    });
  };

  const handleExportReport = () => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "low",
      title: "Export Started",
      message:
        "Your comprehensive report is being generated and will be downloaded shortly.",
      details:
        "Report includes user analytics, AI insights, and behavior patterns.",
      timestamp: new Date().toISOString(),
    });
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    console.log("🔄 User logged out, redirecting to login...");

    // Navigate to login page
    navigate("/login");
  };

  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setNewUser({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email,
      phone: user.phoneNumber || "",
      address: user.address || "",
      institutionName: user.institutionName || "",
      role: user.role?.toLowerCase() || "student",
      regNo: "",
      grade: "",
      subject: "",
      bio: "",
      experience: "",
    });
    setIsAddUserOpen(true);
  };

  const handleDeleteUser = (user: UserData) => {
    showMessage({
      id: Date.now().toString(),
      type: "warning",
      priority: "high",
      title: "Confirm Deletion",
      message: `Are you sure you want to delete ${user.fullName}? This action cannot be undone.`,
      details:
        "This will also remove all associated AI Twin data and learning progress.",
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: "confirm",
          label: "Delete User",
          variant: "destructive",
          action: () => {
            deleteUser(user);
          },
        },
      ],
    });
  };

  const deleteUser = async (user: UserData) => {
    showMessage({
      id: Date.now().toString(),
      title: "Feature Not Available",
      message: "User deletion is not supported by the current API. The backend does not provide a DELETE endpoint for users.",
      type: "warning",
      priority: "medium",
      timestamp: new Date().toISOString(),
      details: "API Limitation: No DELETE /api/Users/{userId} endpoint exists in the API documentation.",
    });
  };

  // Subject assignment functions
  const handleAssignSubject = (user: UserData) => {
    if (user.role?.toLowerCase() !== "teacher") {
      showMessage({
        id: Date.now().toString(),
        title: "Invalid Action",
        message: "Subject assignment is only available for teachers.",
        type: "warning",
        priority: "medium",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    setTeacherToAssign(user);
    setAssignmentData({
      selectedSubjectId: "",
      selectedLevelId: "",
    });
    setIsAssignSubjectOpen(true);

    // Load subjects and levels for assignment
    fetchSubjectsForTeacher();
    fetchLevelsForTeacher();
  };

  const handleAssignLevel = (user: UserData) => {
    if (user.role?.toLowerCase() !== "student") {
      showMessage({
        id: Date.now().toString(),
        type: "warning",
        priority: "medium",
        title: "Invalid Action",
        message: "Level assignment is only available for students.",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    setStudentToAssign(user);
    setStudentLevelData({
      selectedLevelId: "",
    });
    setIsAssignLevelOpen(true);

    // Load levels for assignment
    fetchLevelsForTeacher();
  };

  const handleLevelAssignment = async () => {
    if (!studentToAssign) return;

    // Validation
    if (!studentLevelData.selectedLevelId || studentLevelData.selectedLevelId === "no-levels") {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "medium",
        title: "Validation Error",
        message: "Please select a level for the student",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      setAssignLevelLoading(true);
      console.log("🔄 Assigning level to student:", studentToAssign.fullName);

      // Get institution ID from available sources
      let institutionId = 1; // Default fallback
      if (dashboardData?.institutions?.length > 0) {
        institutionId = dashboardData.institutions[0].institutionId;
      } else if (dashboardData?.adminProfile?.institutionId) {
        institutionId = dashboardData.adminProfile.institutionId;
      }

      const assignmentPayload = {
        studentId: studentToAssign.id,
        levelId: parseInt(studentLevelData.selectedLevelId),
        institutionId: institutionId,
      };

      console.log("📤 Level assignment payload:", assignmentPayload);

      // Validate required fields
      if (!studentToAssign.id || !assignmentPayload.levelId) {
        throw new Error(`Missing required fields: studentId=${studentToAssign.id}, levelId=${assignmentPayload.levelId}`);
      }

      const assignmentResponse = await adminApiService.assignStudentToLevel(assignmentPayload);
      console.log("✅ Level assigned to student successfully:", assignmentResponse);

      showMessage({
        id: Date.now().toString(),
        title: "Level Assigned Successfully",
        message: `${studentToAssign.fullName} has been assigned to the selected level.`,
        type: "success",
        priority: "medium",
        timestamp: new Date().toISOString(),
      });

      // Close dialog and refresh data
      setIsAssignLevelOpen(false);
      setStudentToAssign(null);
      await fetchDashboardData();

    } catch (error: any) {
      console.error("⚠️ Failed to assign level to student:", error);
      showMessage({
        id: Date.now().toString(),
        title: "Level Assignment Failed",
        message: "Failed to assign level to student.",
        details: error.response?.data?.message || error.message || "Unknown error occurred",
        type: "error",
        priority: "high",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setAssignLevelLoading(false);
    }
  };

  const handleSubjectAssignment = async () => {
    if (!teacherToAssign) return;

    // Validation
    if (!assignmentData.selectedSubjectId || assignmentData.selectedSubjectId === "no-subjects") {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "medium",
        title: "Validation Error",
        message: "Please select a subject for the teacher",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!assignmentData.selectedLevelId || assignmentData.selectedLevelId === "no-levels") {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "medium",
        title: "Validation Error",
        message: "Please select a level for the teacher",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      setAssignSubjectLoading(true);
      console.log("🔄 Assigning subject to teacher:", teacherToAssign.fullName);

      // Get institution ID from available sources
      let institutionId = 1; // Default fallback
      if (dashboardData?.institutions?.length > 0) {
        institutionId = dashboardData.institutions[0].institutionId;
      } else if (dashboardData?.adminProfile?.institutionId) {
        institutionId = dashboardData.adminProfile.institutionId;
      }

      const assignmentPayload = {
        teacherId: teacherToAssign.id,
        subjectId: parseInt(assignmentData.selectedSubjectId),
        levelId: parseInt(assignmentData.selectedLevelId),
        institutionId: institutionId,
      };

      console.log("📤 Subject assignment payload:", assignmentPayload);

      // Validate required fields
      if (!teacherToAssign.id || !assignmentPayload.subjectId || !assignmentPayload.levelId) {
        throw new Error(`Missing required fields: teacherId=${teacherToAssign.id}, subjectId=${assignmentPayload.subjectId}, levelId=${assignmentPayload.levelId}`);
      }

      const assignmentResponse = await adminApiService.assignSubjectToTeacher(assignmentPayload);
      console.log("✅ Subject assigned to teacher successfully:", assignmentResponse);

      showMessage({
        id: Date.now().toString(),
        title: "Subject Assigned Successfully",
        message: `${teacherToAssign.fullName} has been assigned to the selected subject and level.`,
        type: "success",
        priority: "medium",
        timestamp: new Date().toISOString(),
      });

      // Close dialog and refresh data
      setIsAssignSubjectOpen(false);
      setTeacherToAssign(null);
      await fetchDashboardData();

    } catch (error: any) {
      console.error("⚠️ Failed to assign subject to teacher:", error);
      showMessage({
        id: Date.now().toString(),
        title: "Subject Assignment Failed",
        message: "Failed to assign subject to teacher.",
        details: error.response?.data?.message || error.message || "Unknown error occurred",
        type: "error",
        priority: "high",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setAssignSubjectLoading(false);
    }
  };

  const handleViewAITwin = (user: UserData) => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: `${user.fullName}'s AI Twin`,
      message: "AI Twin Analytics & Personalization Data",
      details: `���������� Learning Style: Visual/Kinesthetic\n• Engagement Level: High (${Math.floor(Math.random() * 20) + 80}%)\n• Preferred Learning Time: Morning\n��� Strengths: Mathematics, Science\n• Areas for Improvement: Essay Writing\n• AI Interactions Today: ${Math.floor(Math.random() * 50) + 20}\n• Mood Analysis: Focused & Motivated\n�� Personalized Recommendations: ${Math.floor(Math.random() * 10) + 5} pending`,
      timestamp: new Date().toISOString(),
      requiresResponse: false,
    });
  };

  const handleToggleUserStatus = (user: UserData) => {
    const newStatus = user.isActive ? "inactive" : "active";
    showMessage({
      id: Date.now().toString(),
      type: "success",
      priority: "medium",
      title: "User Status Updated",
      message: `${user.fullName} has been ${newStatus === "active" ? "activated" : "deactivated"}.`,
      details:
        newStatus === "active"
          ? "User can now access the system and AI Twin services."
          : "User access has been temporarily suspended.",
      timestamp: new Date().toISOString(),
    });
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.id || "").toLowerCase().includes(searchQuery.toLowerCase());

    const userRole = user.role ? user.role.toLowerCase() : "";
    const matchesRole = filterRole === "all" || userRole === filterRole;

    const userStatus = user.isActive ? "active" : "inactive";
    const matchesStatus = filterStatus === "all" || userStatus === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(
    (subject) =>
      (subject.name || subject.subjectName || "")
        .toLowerCase()
        .includes(subjectSearchQuery.toLowerCase()) ||
      (subject.description || "")
        .toLowerCase()
        .includes(subjectSearchQuery.toLowerCase()),
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case "teacher":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "student":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Create notifications array from system alerts for compatibility
  const notifications = systemAlerts.map((alert) => ({
    id: alert.id,
    type: alert.type as
      | "alert"
      | "system"
      | "user"
      | "maintenance"
      | "performance",
    title: alert.title,
    message: alert.message,
    time: alert.timestamp,
    read: alert.resolved,
    priority: alert.severity as "high" | "medium" | "low",
  }));

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const highPriorityAlerts = systemAlerts.filter(
    (alert) => alert.severity === "high",
  ).length;

  // Available subjects for teacher assignment - only from API
  const availableSubjects = subjects.map((subject) => subject.subjectName);
  const uniqueSubjects = [...new Set(availableSubjects)];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg font-medium text-gray-600">
            Loading Admin Dashboard...
          </p>
          <p className="text-sm text-gray-500">
            Initializing AI systems and behavior analytics...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    // Check if this is a mixed content error
    const isMixedContentError =
      error.includes("Mixed Content") ||
      error.includes("Network Error") ||
      error.includes("HTTPS->HTTP blocked");

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Dashboard Connection Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
              <Button onClick={reload} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>

          {/* Show mixed content resolver if this appears to be a mixed content issue */}
          {isMixedContentError && <MixedContentResolver onResolved={reload} />}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="admin-dashboard min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn.builder.io/api/v1/assets/2d09da496e544a1eab05e596d02031d8/twinternet-logo-b18833?format=webp&width=800"
                  alt="AnansiAI Logo"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h1 className="font-bold text-xl text-gray-800">AnansiAI</h1>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3" />
                    Admin Portal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* AI Status Indicator */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">AI Active</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI systems running normally</p>
                    <p className="text-xs text-gray-500">
                      {aiSystemStats.activeAITwins} AI Twins active
                    </p>
                  </TooltipContent>
                </Tooltip>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setIsNotificationOpen(true)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>

                {/* Quick AI Monitor */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsAIMonitorOpen(true)}
                    >
                      <Brain className="w-5 h-5 text-purple-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>AI System Monitor</p>
                  </TooltipContent>
                </Tooltip>

                {/* Settings */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsPasswordChangeOpen(true)}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsAIConfigOpen(true)}>
                      <Brain className="w-4 h-4 mr-2" />
                      AI Configuration
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>
                      {(adminInfo.name || "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">
                      {adminInfo.name}
                    </p>
                    <p className="text-gray-600">{adminInfo.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  School Administration Center
                </h2>
                <p className="text-gray-600 flex items-center gap-2">
                  <School className="w-4 h-4" />
                  Welcome back, {adminInfo.name} • {adminInfo.school}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last login: {adminInfo.lastLogin}
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {schoolStats.activeUsers} users active
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
                  <p className="text-sm font-medium">AI Accuracy</p>
                  <p className="text-xl font-bold">
                    {aiSystemStats.avgAccuracy}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* High Priority Alerts */}
          {highPriorityAlerts > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">
                {highPriorityAlerts} High Priority Alert
                {highPriorityAlerts > 1 ? "s" : ""} Require Attention
              </AlertTitle>
              <AlertDescription className="text-red-700">
                Please review the system alerts in the notifications panel.
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-4"
                  onClick={() => setIsNotificationOpen(true)}
                >
                  View Alerts
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Main Dashboard Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="class-management" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Levels
              </TabsTrigger>
              <TabsTrigger
                value="curriculum-management"
                className="flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Curriculum
              </TabsTrigger>
              <TabsTrigger
                value="ai-insights"
                className="flex items-center gap-2"
              >
                <Brain className="w-4 h-4" />
                AI Insights
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Students
                    </CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {(schoolStats.totalStudents || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +5.2% from last month
                    </p>
                    <div className="mt-2">
                      <Progress value={78} className="h-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-l-4 border-l-green-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active AI Twins
                    </CardTitle>
                    <Brain className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {aiSystemStats.activeAITwins.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {aiSystemStats.avgAccuracy}% accuracy
                    </p>
                    <div className="mt-2">
                      <Progress value={94} className="h-1" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-l-4 border-l-purple-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Engagement Rate
                    </CardTitle>
                    <Activity className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {schoolStats.avgEngagement}%
                    </div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />+
                      {aiSystemStats.studentEngagementUp}% this week
                    </p>
                    <div className="mt-2">
                      <Progress
                        value={schoolStats.avgEngagement}
                        className="h-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden border-l-4 border-l-orange-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Achievements
                    </CardTitle>
                    <Trophy className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {schoolStats.achievementsEarned}
                    </div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      This month
                    </p>
                    <div className="mt-2">
                      <Progress value={85} className="h-1" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions and AI Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common administrative tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => setIsAddUserOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedTab("curriculum-management")}
                    >
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Manage Curriculum
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsBehaviorReportOpen(true)}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Behavior Report
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleExportReport}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI System Overview
                    </CardTitle>
                    <CardDescription>
                      Real-time AI performance and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Total Interactions
                          </span>
                          <span className="font-semibold">
                            {aiSystemStats.totalInteractions.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Avg Session
                          </span>
                          <span className="font-semibold">
                            {aiSystemStats.averageSessionTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Mood Analysis
                          </span>
                          <span className="font-semibold">
                            {aiSystemStats.moodAnalysisActive}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Recommendations
                          </span>
                          <span className="font-semibold">
                            {aiSystemStats.personalizedRecommendations.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Alerts Today
                          </span>
                          <span className="font-semibold text-orange-600">
                            {aiSystemStats.behaviorAlertsToday}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Engagement Up
                          </span>
                          <span className="font-semibold text-green-600">
                            +{aiSystemStats.studentEngagementUp}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsAIMonitorOpen(true)}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        View AI Monitor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Behavior Alerts and Top Performers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      Recent Behavior Alerts
                    </CardTitle>
                    <CardDescription>
                      Latest AI-detected behavior patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {recentBehaviorAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Activity className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">
                              {alert.studentName}
                            </p>
                            <Badge
                              className={getSeverityBadgeClass(alert.severity)}
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{alert.type}</p>
                          <p className="text-xs text-gray-500">
                            {alert.timestamp}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsBehaviorReportOpen(true)}
                    >
                      View All Alerts
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      Top Performing Students
                    </CardTitle>
                    <CardDescription>
                      Students excelling with AI assistance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topPerformingStudents.map((student, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">
                              {student.name}
                            </p>
                            <span className="font-semibold text-green-600">
                              {student.grade}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            {student.subject}
                          </p>
                          <div className="mt-1">
                            <Progress
                              value={student.progress}
                              className="h-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      View All Students
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    User Management
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manage students and teachers • {filteredUsers.length} of{" "}
                    {users.length} users • {aiSystemStats.activeAITwins} AI
                    Twins active
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleBulkAction("export")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All
                  </Button>
                  <Button onClick={() => setIsAddUserOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search users by name, email, or registration number..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="student">Students</SelectItem>
                          <SelectItem value="teacher">Teachers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Users Table */}
              <Card>
                {selectedUsers.length > 0 && (
                  <div className="p-4 border-b bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {selectedUsers.length} user
                          {selectedUsers.length > 1 ? "s" : ""} selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction("activate")}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Activate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction("deactivate")}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Deactivate
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkAction("export")}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBulkAction("delete")}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={filteredUsers
                              .slice(
                                (usersPage - 1) * usersPerPage,
                                usersPage * usersPerPage,
                              )
                              .every((user) => selectedUsers.includes(user.id))}
                            onChange={handleSelectAllUsers}
                            className="rounded border-gray-300"
                            aria-label="Select all users"
                            title="Select all users"
                            placeholder="Select all users"
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Assigned Subjects</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>AI Twin</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="w-8 h-8 text-gray-400" />
                              <p className="text-gray-500">
                                {searchQuery ||
                                filterRole !== "all" ||
                                filterStatus !== "all"
                                  ? "No users match your filters"
                                  : "No users found"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers
                          .slice(
                            (usersPage - 1) * usersPerPage,
                            usersPage * usersPerPage,
                          )
                          .map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user.id)}
                                  onChange={() => handleSelectUser(user.id)}
                                  className="rounded border-gray-300"
                                  aria-label={`Select user ${user.fullName}`}
                                  title={`Select user ${user.fullName}`}
                                  placeholder={`Select user ${user.fullName}`}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={user.photoUrl} />
                                    <AvatarFallback>
                                      {(user.fullName || "")
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {user.fullName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getRoleBadgeClass(
                                    user.role?.toLowerCase() || "",
                                  )}
                                >
                                  {user.role?.toLowerCase() || "unknown"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.role?.toLowerCase() === "teacher" ? (
                                  <div className="max-w-xs">
                                    {user.assignedSubjectNames && user.assignedSubjectNames !== "None" ? (
                                      <div className="flex flex-wrap gap-1">
                                        {user.assignedSubjectNames.split(", ").map((subject, index) => (
                                          <Badge
                                            key={index}
                                            variant="outline"
                                            className="text-xs bg-green-50 text-green-700 border-green-200"
                                          >
                                            {subject}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-400 italic">
                                        No subjects assigned
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">
                                    N/A
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusBadgeClass(
                                    user.isActive ? "active" : "inactive",
                                  )}
                                >
                                  {user.isActive ? "active" : "inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.role?.toLowerCase() === "student" ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">
                                      Active
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">
                                    N/A
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>{user.lastLogin}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleViewUser(user)}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Profile
                                    </DropdownMenuItem>
                                    {user.role?.toLowerCase() === "student" && (
                                      <DropdownMenuItem
                                        onClick={() => handleViewAITwin(user)}
                                      >
                                        <Brain className="w-4 h-4 mr-2" />
                                        View AI Twin
                                      </DropdownMenuItem>
                                    )}
                                    {user.role?.toLowerCase() === "teacher" && (
                                      <DropdownMenuItem
                                        onClick={() => handleAssignSubject(user)}
                                      >
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        Assign Subject
                                      </DropdownMenuItem>
                                    )}
                                    {user.role?.toLowerCase() === "student" && (
                                      <DropdownMenuItem
                                        onClick={() => handleAssignLevel(user)}
                                      >
                                        <GraduationCap className="w-4 h-4 mr-2" />
                                        Assign Level
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => handleEditUser(user)}
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleToggleUserStatus(user)
                                      }
                                    >
                                      {user.isActive ? (
                                        <>
                                          <UserX className="w-4 h-4 mr-2" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="w-4 h-4 mr-2" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDeleteUser(user)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                  {filteredUsers.length > usersPerPage && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-sm text-gray-600">
                        Showing {(usersPage - 1) * usersPerPage + 1} to{" "}
                        {Math.min(
                          usersPage * usersPerPage,
                          filteredUsers.length,
                        )}{" "}
                        of {filteredUsers.length} users
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setUsersPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={usersPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            {
                              length: Math.ceil(
                                filteredUsers.length / usersPerPage,
                              ),
                            },
                            (_, i) => i + 1,
                          )
                            .slice(
                              Math.max(0, usersPage - 3),
                              Math.min(
                                Math.ceil(filteredUsers.length / usersPerPage),
                                usersPage + 2,
                              ),
                            )
                            .map((page) => (
                              <Button
                                key={page}
                                variant={
                                  page === usersPage ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setUsersPage(page)}
                                className="w-8 h-8 p-0"
                              >
                                {page}
                              </Button>
                            ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setUsersPage((prev) =>
                              Math.min(
                                Math.ceil(filteredUsers.length / usersPerPage),
                                prev + 1,
                              ),
                            )
                          }
                          disabled={
                            usersPage >=
                            Math.ceil(filteredUsers.length / usersPerPage)
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="class-management" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                    Level Management
                  </h3>
                  <p className="text-sm text-gray-600">
                    Create and manage educational levels for students and teachers
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsCreateLevelOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Level
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Educational Levels
                  </CardTitle>
                  <CardDescription>
                    Manage educational levels with teacher assignments and student enrollment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search levels..."
                        value={levelSearchQuery}
                        onChange={(e) => setLevelSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {levelsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-2">Loading levels...</span>
                        </div>
                      ) : levels.length > 0 ? (
                        levels
                          .filter(level =>
                            level.levelName?.toLowerCase().includes(levelSearchQuery.toLowerCase()) ||
                            level.levelId?.toString().includes(levelSearchQuery)
                          )
                          .map((level) => (
                            <div key={level.levelId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <p className="font-medium text-lg">{level.levelName}</p>
                                  <Badge variant="secondary">Level {level.levelId}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  Status: {level.isActive ? "Active" : "Inactive"}
                                </p>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Progress value={level.maxStudents ? 75 : 0} className="w-24 h-2" />
                                    <span className="text-sm text-gray-500">
                                      Max: {level.maxStudents || "N/A"} students
                                    </span>
                                  </div>
                                  <Badge
                                    variant={level.isActive ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {level.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditLevel(level)}
                                  disabled={updateLevelLoading}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteLevel(level.levelId)}
                                  disabled={deleteLevelLoading}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No levels found</p>
                          <p className="text-xs mt-1">Create your first level to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum-management" className="space-y-6">
              <UnifiedCurriculumManagement onDataChange={fetchDashboardData} />
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-600" />
                    AI System Insights
                  </h3>
                  <p className="text-sm text-gray-600">
                    Monitor AI behavior analysis, recommendations, and system
                    performance
                  </p>
                </div>
                <Button onClick={() => setIsAIMonitorOpen(true)}>
                  <Brain className="w-4 h-4 mr-2" />
                  Open AI Monitor
                </Button>
              </div>

              {/* AI System Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <BrainCircuit className="w-5 h-5" />
                      AI Twins Active
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {aiSystemStats.activeAITwins}
                    </div>
                    <p className="text-sm text-purple-700">
                      Operating at {aiSystemStats.avgAccuracy}% accuracy
                    </p>
                    <div className="mt-4">
                      <Progress value={94} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Activity className="w-5 h-5" />
                      Behavior Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {aiSystemStats.moodAnalysisActive}
                    </div>
                    <p className="text-sm text-blue-700">
                      Students under mood analysis
                    </p>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-blue-600">
                        <span>Happy: 67%</span>
                        <span>Focused: 23%</span>
                        <span>Stressed: 10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <Lightbulb className="w-5 h-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {aiSystemStats.personalizedRecommendations.toLocaleString()}
                    </div>
                    <p className="text-sm text-green-700">
                      Generated this month
                    </p>
                    <div className="mt-4">
                      <Progress value={87} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Behavior Analytics Component */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-600" />
                    System-wide Behavior Analytics
                  </CardTitle>
                  <CardDescription>
                    Real-time behavior monitoring and analysis across all
                    students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2">
                          Loading behavior analytics...
                        </span>
                      </div>
                    }
                  >
                    <LazyBehaviorAnalytics
                      studentId="system-overview"
                      currentMood={Mood.Neutral}
                      riskScore={0.15}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      System Performance
                    </CardTitle>
                    <CardDescription>
                      Monitor system health and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>System Uptime</span>
                        <span>{schoolStats.systemUptime}%</span>
                      </div>
                      <Progress
                        value={schoolStats.systemUptime}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>AI Processing Load</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Data Storage Used</span>
                        <span>{schoolStats.dataStorage}%</span>
                      </div>
                      <Progress
                        value={schoolStats.dataStorage}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Performance</span>
                        <span>{schoolStats.avgPerformance}%</span>
                      </div>
                      <Progress
                        value={schoolStats.avgPerformance}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      Usage Statistics
                    </CardTitle>
                    <CardDescription>
                      Daily activity and engagement metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {schoolStats.activeUsers}
                        </div>
                        <p className="text-xs text-gray-600">Active Users</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {schoolStats.dailyLogins}
                        </div>
                        <p className="text-xs text-gray-600">Daily Logins</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {schoolStats.coursesCreated}
                        </div>
                        <p className="text-xs text-gray-600">Courses Created</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {(
                            schoolStats.assignmentsCompleted || 0
                          ).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-600">
                          Assignments Completed
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-medium mb-3">
                        AI Engagement Metrics
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>AI Interactions Today</span>
                          <span className="font-semibold">
                            {Math.floor(aiSystemStats.totalInteractions / 30)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg Session Time</span>
                          <span className="font-semibold">
                            {aiSystemStats.averageSessionTime}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Student Satisfaction</span>
                          <span className="font-semibold text-green-600">
                            92%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      User Analytics Report
                    </CardTitle>
                    <CardDescription>
                      Comprehensive user analytics, engagement, and performance
                      data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>• User activity patterns</div>
                      <div>• Learning progress analytics</div>
                      <div>�� AI interaction summaries</div>
                    </div>
                    <Button className="w-full" onClick={handleExportReport}>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Performance Report
                    </CardTitle>
                    <CardDescription>
                      AI Twin effectiveness, behavior analysis, and
                      recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>• AI Twin accuracy metrics</div>
                      <div>• Behavior prediction success</div>
                      <div>• Personalization effectiveness</div>
                    </div>
                    <Button className="w-full" onClick={handleExportReport}>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Academic Performance
                    </CardTitle>
                    <CardDescription>
                      Student achievements, progress tracking, and learning
                      outcomes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>• Grade distributions</div>
                      <div>������� Subject performance</div>
                      <div>• Achievement statistics</div>
                    </div>
                    <Button className="w-full" onClick={handleExportReport}>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-600" />
                      Behavior Analysis Report
                    </CardTitle>
                    <CardDescription>
                      Student behavior patterns, mood analysis, and
                      interventions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>• Mood trend analysis</div>
                      <div>• Risk factor identification</div>
                      <div>• Intervention effectiveness</div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => setIsBehaviorReportOpen(true)}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      View Live Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      System Security Report
                    </CardTitle>
                    <CardDescription>
                      Security events, access logs, and system integrity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>����� Login activity logs</div>
                      <div>�� Security incident reports</div>
                      <div>��� Data access audits</div>
                    </div>
                    <Button className="w-full" onClick={handleExportReport}>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      Custom Reports
                    </CardTitle>
                    <CardDescription>
                      Build custom reports with specific metrics and timeframes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div>• Custom date ranges</div>
                      <div>• Specific user groups</div>
                      <div>• Multiple data sources</div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Build Custom Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>School Information</CardTitle>
                    <CardDescription>
                      Manage basic school information and administrative
                      settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        value={schoolSettings.schoolName}
                        onChange={(e) =>
                          setSchoolSettings({
                            ...schoolSettings,
                            schoolName: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="adminName">Administrator Name</Label>
                      <Input
                        id="adminName"
                        value={schoolSettings.adminName}
                        onChange={(e) =>
                          setSchoolSettings({
                            ...schoolSettings,
                            adminName: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={schoolSettings.department}
                        onChange={(e) =>
                          setSchoolSettings({
                            ...schoolSettings,
                            department: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleSaveSchoolSettings}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI System Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure AI behavior, analytics, and personalization
                      settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">AI Twin System</p>
                        <p className="text-sm text-gray-500">
                          Enable personalized AI companions for students
                        </p>
                      </div>
                      <Button
                        variant={aiConfig.aiTwinEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          setAIConfig({
                            ...aiConfig,
                            aiTwinEnabled: !aiConfig.aiTwinEnabled,
                          })
                        }
                      >
                        {aiConfig.aiTwinEnabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Behavior Tracking</p>
                        <p className="text-sm text-gray-500">
                          Monitor student behavior and mood patterns
                        </p>
                      </div>
                      <Button
                        variant={
                          aiConfig.behaviorTrackingEnabled
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setAIConfig({
                            ...aiConfig,
                            behaviorTrackingEnabled:
                              !aiConfig.behaviorTrackingEnabled,
                          })
                        }
                      >
                        {aiConfig.behaviorTrackingEnabled
                          ? "Enabled"
                          : "Disabled"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Personalized Learning</p>
                        <p className="text-sm text-gray-500">
                          Adapt content based on individual learning patterns
                        </p>
                      </div>
                      <Button
                        variant={
                          aiConfig.personalizedLearning ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setAIConfig({
                            ...aiConfig,
                            personalizedLearning:
                              !aiConfig.personalizedLearning,
                          })
                        }
                      >
                        {aiConfig.personalizedLearning ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsAIConfigOpen(true)}
                      >
                        <Cog className="w-4 h-4 mr-2" />
                        Advanced AI Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                    <CardDescription>
                      Advanced system settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">
                          Receive system alerts and reports via email
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Backup</p>
                        <p className="text-sm text-gray-500">
                          Automatic daily backups of all system data
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Setup
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Security Settings</p>
                        <p className="text-sm text-gray-500">
                          Configure access controls and security policies
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-indigo-600" />
                      Data & Privacy
                    </CardTitle>
                    <CardDescription>
                      Manage data retention and privacy settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Data Retention Period</Label>
                      <Select defaultValue="90">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Privacy Level</Label>
                      <Select defaultValue="balanced">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strict">Strict</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="permissive">Permissive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Privacy Policy Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Add User Dialog */}
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Add New User
                </DialogTitle>
                <DialogDescription>
                  Create a new student, teacher, or admin account. AI Twin integration
                  is automatically provided for students. For teachers, subjects can be assigned separately after creation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Role Selection - FIRST FIELD */}
                <div>
                  <Label htmlFor="role">User Role *</Label>
                  <Select
                    value={newUser.role.name}
                    onValueChange={(value) => {
                      console.log("🔄 Role selection changed to:", value);
                      console.log("📋 Available roles:", availableRoles);

                      const selectedRole = availableRoles.find(role => role.name === value);
                      console.log("🎯 Selected role object:", selectedRole);

                      if (selectedRole) {
                        const newRoleData = {
                          id: selectedRole.id,
                          name: selectedRole.name
                        };

                        console.log("💾 Setting role data:", newRoleData);

                        setNewUser({
                          ...newUser,
                          role: newRoleData,
                        });

                        // Fetch subjects and levels if teacher role selected
                        if (value.toLowerCase() === "teacher") {
                          console.log("👨��🏫 Teacher role selected, fetching subjects and levels...");
                          fetchSubjectsForTeacher();
                          fetchLevelsForTeacher();
                        }
                      } else {
                        console.error("❌ No matching role found for:", value);
                      }
                    }}
                    disabled={rolesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          rolesLoading ? "Loading roles..." : "Select role"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles
                        .filter(role => role.name !== "SuperAdmin") // EXCLUDE SUPERADMIN
                        .map((role) => (
                        <SelectItem
                          key={role.id}
                          value={role.name}
                        >
                          <div className="flex items-center gap-2">
                            {role.name.toLowerCase() === "student" && (
                              <GraduationCap className="w-4 h-4" />
                            )}
                            {role.name.toLowerCase() === "teacher" && (
                              <Users className="w-4 h-4" />
                            )}
                            {role.name.toLowerCase() === "admin" && (
                              <Shield className="w-4 h-4" />
                            )}
                            {!["student", "teacher", "admin"].includes(
                              role.name.toLowerCase(),
                            ) && <CircleDot className="w-4 h-4" />}
                            {role.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>



                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, firstName: e.target.value })
                      }
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, lastName: e.target.value })
                      }
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newUser.phoneNumber}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phoneNumber: e.target.value })
                    }
                    placeholder="+254-700-000-000"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={newUser.address}
                    onChange={(e) =>
                      setNewUser({ ...newUser, address: e.target.value })
                    }
                    placeholder="Enter address"
                    required
                  />
                </div>

                {/* NO INSTITUTION FIELD - User automatically assigned to admin's institution */}
                <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                  <p><strong>Institution:</strong> User will be automatically assigned to your institution</p>
                </div>

                {newUser.role.name.toLowerCase() === "student" && (
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertTitle>AI Twin Integration</AlertTitle>
                    <AlertDescription>
                      An AI Twin will be automatically created for this student
                      to provide personalized learning assistance and behavior
                      monitoring.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddUserOpen(false)}
                  disabled={createUserLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddUser} disabled={createUserLoading}>
                  {createUserLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Assign Subject Dialog */}
          <Dialog open={isAssignSubjectOpen} onOpenChange={setIsAssignSubjectOpen}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Assign Subject to Teacher
                </DialogTitle>
                <DialogDescription>
                  Assign a subject and level to {teacherToAssign?.fullName || "the selected teacher"}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Teacher Info */}
                {teacherToAssign && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p><strong>Teacher:</strong> {teacherToAssign.fullName}</p>
                    <p><strong>Email:</strong> {teacherToAssign.email}</p>
                    <p><strong>Current Subjects:</strong> {teacherToAssign.assignedSubjectNames || "None"}</p>
                  </div>
                )}

                {/* Subject Selection */}
                <div>
                  <Label htmlFor="assignSubject">Subject *</Label>
                  <Select
                    value={assignmentData.selectedSubjectId}
                    onValueChange={(value) => setAssignmentData({ ...assignmentData, selectedSubjectId: value })}
                    disabled={subjectsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={subjectsLoading ? "Loading subjects..." : "Select subject"} />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherSubjects.length > 0 ? (
                        teacherSubjects.map((subject: any) => (
                          <SelectItem
                            key={subject.subjectId}
                            value={subject.subjectId.toString()}
                          >
                            {subject.subjectName || subject.name}
                          </SelectItem>
                        ))
                      ) : !subjectsLoading && (
                        <SelectItem value="no-subjects" disabled>
                          No subjects available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Selection */}
                <div>
                  <Label htmlFor="assignLevel">Level *</Label>
                  <Select
                    value={assignmentData.selectedLevelId}
                    onValueChange={(value) => setAssignmentData({ ...assignmentData, selectedLevelId: value })}
                    disabled={levelsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={levelsLoading ? "Loading levels..." : "Select level"} />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.length > 0 ? (
                        levels.map((level: any) => (
                          <SelectItem
                            key={level.levelId}
                            value={level.levelId.toString()}
                          >
                            {level.levelName}
                          </SelectItem>
                        ))
                      ) : !levelsLoading && (
                        <SelectItem value="no-levels" disabled>
                          No levels available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Info Note */}
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p><strong>Note:</strong> This will assign the teacher to teach the selected subject at the selected level. Teachers can be assigned to multiple subjects.</p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAssignSubjectOpen(false)}
                  disabled={assignSubjectLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubjectAssignment} disabled={assignSubjectLoading}>
                  {assignSubjectLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Assign Subject
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Assign Level Dialog */}
          <Dialog open={isAssignLevelOpen} onOpenChange={setIsAssignLevelOpen}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Assign Level to Student
                </DialogTitle>
                <DialogDescription>
                  Assign a level to {studentToAssign?.fullName || "the selected student"}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Student Info */}
                {studentToAssign && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p><strong>Student:</strong> {studentToAssign.fullName}</p>
                    <p><strong>Email:</strong> {studentToAssign.email}</p>
                  </div>
                )}

                {/* Level Selection */}
                <div>
                  <Label htmlFor="assignLevel">Level *</Label>
                  <Select
                    value={studentLevelData.selectedLevelId}
                    onValueChange={(value) => setStudentLevelData({ ...studentLevelData, selectedLevelId: value })}
                    disabled={levelsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={levelsLoading ? "Loading levels..." : "Select level"} />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.length > 0 ? (
                        levels.map((level: any) => (
                          <SelectItem
                            key={level.levelId}
                            value={level.levelId.toString()}
                          >
                            {level.levelName}
                          </SelectItem>
                        ))
                      ) : !levelsLoading && (
                        <SelectItem value="no-levels" disabled>
                          No levels available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Info Note */}
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p><strong>Note:</strong> This will assign the student to the selected academic level. Students can only be assigned to one level at a time.</p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAssignLevelOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLevelAssignment}
                  disabled={assignLevelLoading}
                >
                  {assignLevelLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Assign Level
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Subject Dialog */}
          <Dialog open={isEditSubjectOpen} onOpenChange={setIsEditSubjectOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Edit Subject
                </DialogTitle>
                <DialogDescription>
                  Update subject information and settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editSubjectName">Subject Name *</Label>
                  <Input
                    id="editSubjectName"
                    value={newSubject.name}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, name: e.target.value })
                    }
                    placeholder="e.g., Advanced Mathematics"
                  />
                </div>
                <div>
                  <Label htmlFor="editSubjectDescription">Description *</Label>
                  <Textarea
                    id="editSubjectDescription"
                    value={newSubject.description}
                    onChange={(e) =>
                      setNewSubject({
                        ...newSubject,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description of the subject..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="editSubjectCategory">
                    Category (Optional)
                  </Label>
                  <Select
                    value={newSubject.category}
                    onValueChange={(value) =>
                      setNewSubject({ ...newSubject, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="languages">Languages</SelectItem>
                      <SelectItem value="social-studies">
                        Social Studies
                      </SelectItem>
                      <SelectItem value="arts">Arts</SelectItem>
                      <SelectItem value="physical-education">
                        Physical Education
                      </SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertTitle>AI Enhancement</AlertTitle>
                  <AlertDescription>
                    Changes will be reflected in AI-generated content and
                    personalized learning materials.
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditSubjectOpen(false);
                    setSelectedSubject(null);
                    setNewSubject({ name: "", description: "", category: "" });
                  }}
                  disabled={updateSubjectLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateSubject}
                  disabled={updateSubjectLoading}
                >
                  {updateSubjectLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Subject
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Subject Confirmation Dialog */}
          <AlertDialog
            open={isDeleteConfirmOpen}
            onOpenChange={setIsDeleteConfirmOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Confirm Deletion
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "
                  {subjectToDelete?.name || subjectToDelete?.subjectName}"? This
                  action cannot be undone and will also remove all associated
                  content and AI-generated materials.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteSubject}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleteSubjectLoading}
                >
                  {deleteSubjectLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Subject
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* View Subject Dialog */}
          <Dialog open={isViewSubjectOpen} onOpenChange={setIsViewSubjectOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Subject Details
                </DialogTitle>
                <DialogDescription>
                  View detailed information about this subject
                </DialogDescription>
              </DialogHeader>
              {selectedSubject && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Subject ID
                      </Label>
                      <p className="text-lg font-semibold">
                        {selectedSubject.subjectId}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Status
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700"
                        >
                          Active
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-700">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Enhanced
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Subject Name
                    </Label>
                    <p className="text-xl font-semibold mt-1">
                      {selectedSubject.name || selectedSubject.subjectName}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Description
                    </Label>
                    <p className="text-gray-700 mt-1">
                      {selectedSubject.description ||
                        "No description available"}
                    </p>
                  </div>


                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      AI Features
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Personalized Content
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Adaptive Learning
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Progress Tracking
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Smart Assessments
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewSubjectOpen(false);
                    setSelectedSubject(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewSubjectOpen(false);
                    if (selectedSubject) {
                      handleEditSubject(selectedSubject);
                    }
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Subject
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* User Details Dialog */}
          <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Details
                </DialogTitle>
                <DialogDescription>
                  View detailed information about the user and their AI Twin
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedUser.photoUrl} />
                      <AvatarFallback className="text-lg">
                        {(selectedUser.fullName || "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {selectedUser.fullName}
                      </h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleBadgeClass(selectedUser.role)}>
                          {selectedUser.role}
                        </Badge>
                        <Badge
                          className={getStatusBadgeClass(
                            selectedUser.isActive ? "active" : "inactive",
                          )}
                        >
                          {selectedUser.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {selectedUser.role === "STUDENT" && (
                          <Badge className="bg-purple-100 text-purple-700">
                            <Brain className="w-3 h-3 mr-1" />
                            AI Twin Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        User ID
                      </Label>
                      <p className="mt-1">{selectedUser.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Phone
                      </Label>
                      <p className="mt-1">
                        {selectedUser.phoneNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Last Active
                      </Label>
                      <p className="mt-1">{selectedUser.lastLogin}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Account Status
                      </Label>
                      <p className="mt-1 capitalize">
                        {selectedUser.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>

                  {selectedUser.role === "STUDENT" && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        AI Twin Status
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="text-green-600 font-medium">
                            Active
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-medium">94.2%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Interactions:</span>
                          <span className="font-medium">1,247</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Interaction:</span>
                          <span className="font-medium">2 hours ago</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsUserDetailsOpen(false)}
                >
                  Close
                </Button>
                {selectedUser && (
                  <>
                    {selectedUser.role === "STUDENT" && (
                      <Button
                        variant="outline"
                        onClick={() => handleViewAITwin(selectedUser)}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        View AI Twin
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleEditUser(selectedUser)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit User
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* AI Monitor Dialog */}
          <Dialog open={isAIMonitorOpen} onOpenChange={setIsAIMonitorOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI System Monitor
                </DialogTitle>
                <DialogDescription>
                  Real-time monitoring of AI Twin systems and behavior analytics
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* AI System Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">AI Twins</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {aiSystemStats.activeAITwins}
                          </p>
                        </div>
                        <Brain className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Accuracy</p>
                          <p className="text-2xl font-bold text-green-600">
                            {aiSystemStats.avgAccuracy}%
                          </p>
                        </div>
                        <Target className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Interactions</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {Math.floor(aiSystemStats.totalInteractions / 1000)}
                            K
                          </p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Live AI Chat Monitor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Live AI Interactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-2">Loading AI monitor...</span>
                        </div>
                      }
                    >
                      <LazyAITwinChat
                        studentId="admin-monitor"
                        currentLessonId={undefined}
                        emotionalState={Mood.Neutral}
                        className="h-96"
                      />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAIMonitorOpen(false)}
                >
                  Close Monitor
                </Button>
                <Button onClick={() => setIsAIConfigOpen(true)}>
                  <Cog className="w-4 h-4 mr-2" />
                  AI Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Behavior Report Dialog */}
          <Dialog
            open={isBehaviorReportOpen}
            onOpenChange={setIsBehaviorReportOpen}
          >
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  Comprehensive Behavior Report
                </DialogTitle>
                <DialogDescription>
                  Real-time behavior analytics and insights across all students
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">
                        Loading behavior analytics...
                      </span>
                    </div>
                  }
                >
                  <LazyBehaviorAnalytics
                    studentId="system-wide"
                    currentMood={Mood.Neutral}
                    riskScore={0.15}
                  />
                </Suspense>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsBehaviorReportOpen(false)}
                >
                  Close Report
                </Button>
                <Button onClick={handleExportReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Notifications Dialog */}
          <Dialog
            open={isNotificationOpen}
            onOpenChange={setIsNotificationOpen}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </DialogTitle>
                <DialogDescription>
                  {unreadNotifications > 0
                    ? `You have ${unreadNotifications} unread notifications`
                    : "You're all caught up!"}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-96">
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No notifications available
                    </p>
                  ) : (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${
                          notification.read
                            ? "bg-gray-50"
                            : "bg-blue-50 border-blue-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">
                                {notification.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityBadgeClass(
                                  notification.priority,
                                )}`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNotificationOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Password Change Dialog */}
          <Dialog
            open={isPasswordChangeOpen}
            onOpenChange={setIsPasswordChangeOpen}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Change Password
                </DialogTitle>
                <DialogDescription>
                  Update your account password for enhanced security
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsPasswordChangeOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handlePasswordChange}>
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create Level Dialog */}
          <Dialog open={isCreateLevelOpen} onOpenChange={setIsCreateLevelOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Create New Level
                </DialogTitle>
                <DialogDescription>
                  Create a new educational level in your institution
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="level-name">Level Name *</Label>
                  <Input
                    id="level-name"
                    value={newLevel.levelName}
                    onChange={(e) =>
                      setNewLevel({ ...newLevel, levelName: e.target.value })
                    }
                    placeholder="e.g., Beginner Level, Advanced Level"
                    required
                  />
                </div>
                <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                  <p><strong>Institution:</strong> Level will be automatically assigned to your institution</p>
                  <p><strong>Note:</strong> Subject assignments and teacher assignments can be configured separately after level creation using the Subject Assignments section.</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateLevelOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateLevel}
                  disabled={createLevelLoading || !newLevel.levelName.trim()}
                >
                  {createLevelLoading ? "Creating..." : "Create Level"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Level Dialog */}
          <Dialog open={isEditLevelOpen} onOpenChange={setIsEditLevelOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="w-5 h-5" />
                  Edit Level
                </DialogTitle>
                <DialogDescription>
                  Update the level information
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editLevelName">Level Name *</Label>
                  <Input
                    id="editLevelName"
                    value={selectedLevel?.levelName || ""}
                    onChange={(e) => setSelectedLevel({
                      ...selectedLevel,
                      levelName: e.target.value
                    })}
                    placeholder="Enter level name (e.g., Grade 1, Beginner, etc.)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editLevelActive"
                    checked={selectedLevel?.isActive || false}
                    onChange={(e) => setSelectedLevel({
                      ...selectedLevel,
                      isActive: e.target.checked
                    })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="editLevelActive">Active Level</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditLevelOpen(false);
                    setSelectedLevel(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateLevel}
                  disabled={updateLevelLoading || !selectedLevel?.levelName?.trim()}
                >
                  {updateLevelLoading ? "Updating..." : "Update Level"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Message Modal */}
          <ModernMessageModal
            isOpen={isMessageModalOpen}
            onClose={closeMessageModal}
            message={currentMessage}
            onAction={(actionId, message) => {
              console.log(`Action ${actionId} executed for message:`, message);
              closeMessageModal();
            }}
          />
        </main>
      </div>
    </TooltipProvider>
  );
};

export default AdminDashboard;
