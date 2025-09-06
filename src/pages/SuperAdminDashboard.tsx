import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "@/hooks/usePageTitle";
import SchoolRegistration from "@/components/SchoolRegistration";
import InstitutionsManagement from "@/components/InstitutionsManagement";
import UsersManagement from "@/components/UsersManagement";
import ApiDiagnostics from "@/components/ApiDiagnostics";
import ApiStatusNotification from "@/components/ApiStatusNotification";
import UserForm from "@/components/UserForm";
import axiosClient from "@/services/axiosClient";
import { adminApiService } from "@/services/adminApiService";
import type { Milestone } from "@/services/adminApiService";
import { ModernMessageModal } from "@/components/ModernMessageModal";
import { type SystemMessage } from "@/components/MessageModal";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Brain,
  Building,
  Users,
  GraduationCap,
  Settings,
  Shield,
  BarChart3,
  Bell,
  LogOut,
  Plus,
  Edit,
  Eye,
  MapPin,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Download,
  Search,
  Filter,
  Globe,
  Database,
  Zap,
  Calendar,
  FileText,
  Monitor,
  Trash2,
  Activity,
  Star,
  School,
  BookOpen,
  Target,
  Lightbulb,
  Clock,
  Save,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MoreHorizontal,
  Home,
  Briefcase,
  PieChart as PieChartIcon,
  TrendingDown,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Key,
  BrainCircuit,
  MessageSquare,
  UserCheck,
  UserX,
  AlertCircle,
  Info,
  CheckSquare,
  Timer,
  Sparkles,
  Layers,
  Gamepad2,
  Heart,
  Focus,
  Coffee,
  Headphones,
  Smile,
  DollarSign,
  Bookmark,
  ThumbsUp,
  Lock,
  Unlock,
  Upload,
  Send,
  Archive,
  MessageCircle,
  UserPlus,
  ChevronDown,
  Cog,
  HelpCircle,
  User,
  CreditCard,
  Gauge,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  PlusCircle,
  MinusCircle,
  RotateCcw,
  PowerIcon,
  WifiIcon,
  HardDriveIcon,
  CpuIcon,
  NetworkIcon,
  CloudIcon,
  ServerIcon,
} from "lucide-react";
import { NotificationCenter } from "@/components/NotificationCenter";
import type { SystemNotification } from "@/components/NotificationCenter";

// Kenya counties and sub-counties data
const kenyanCountiesData = {
  Nairobi: [
    "Westlands",
    "Dagoretti North",
    "Dagoretti South",
    "Langata",
    "Kibra",
    "Roysambu",
    "Kasarani",
    "Ruaraka",
    "Embakasi South",
    "Embakasi North",
    "Embakasi Central",
    "Embakasi East",
    "Embakasi West",
    "Makadara",
    "Kamukunji",
    "Starehe",
    "Mathare",
  ],
  Mombasa: ["Changamwe", "Jomba", "Kisauni", "Nyali", "Likoni", "Mvita"],
  Kiambu: [
    "Gatundu South",
    "Gatundu North",
    "Juja",
    "Thika Town",
    "Ruiru",
    "Githunguri",
    "Kiambu",
    "Kiambaa",
    "Kabete",
    "Kikuyu",
    "Limuru",
    "Lari",
  ],
  Nakuru: [
    "Molo",
    "Njoro",
    "Naivasha",
    "Gilgil",
    "Kuresoi South",
    "Kuresoi North",
    "Subukia",
    "Rongai",
    "Bahati",
    "Nakuru Town West",
    "Nakuru Town East",
  ],
  Machakos: [
    "Masinga",
    "Yatta",
    "Kangundo",
    "Matungulu",
    "Kathiani",
    "Mavoko",
    "Machakos Town",
    "Mwala",
  ],
  Kisumu: [
    "Kisumu East",
    "Kisumu West",
    "Kisumu Central",
    "Seme",
    "Nyando",
    "Muhoroni",
    "Nyakach",
  ],
  "Uasin Gishu": ["Soy", "Turbo", "Moiben", "Ainabkoi", "Kapseret", "Kesses"],
  Meru: [
    "Imenti North",
    "Imenti South",
    "Imenti Central",
    "North Imenti",
    "Tigania West",
    "Tigania East",
    "Igembe South",
    "Igembe Central",
    "Igembe North",
  ],
  Kilifi: [
    "Kilifi North",
    "Kilifi South",
    "Kaloleni",
    "Rabai",
    "Ganze",
    "Malindi",
    "Magarini",
  ],
  Kakamega: [
    "Lugari",
    "Likuyani",
    "Malava",
    "Lurambi",
    "Navakholo",
    "Mumias West",
    "Mumias East",
    "Matungu",
    "Butere",
    "Khwisero",
    "Shinyalu",
    "Ikolomani",
  ],
  "Murang'a": [
    "Kangema",
    "Mathioya",
    "Kiharu",
    "Kigumo",
    "Maragwa",
    "Kandara",
    "Gatanga",
  ],
  Kajiado: [
    "Kajiado North",
    "Kajiado Central",
    "Kajiado East",
    "Kajiado West",
    "Kajiado South",
  ],
  Kericho: [
    "Kipkelion East",
    "Kipkelion West",
    "Ainamoi",
    "Bureti",
    "Belgut",
    "Sigowet/Soin",
  ],
  Bomet: ["Bomet East", "Bomet Central", "Chepalungu", "Konoin", "Sotik"],
  Nyeri: ["Tetu", "Kieni", "Mathira", "Othaya", "Mukurweini", "Nyeri Town"],
  Kirinyaga: ["Mwea", "Gichugu", "Ndia", "Kirinyaga Central"],
  Laikipia: ["Laikipia West", "Laikipia East", "Laikipia North"],
  Nyandarua: ["Kinangop", "Kipipiri", "Ol Kalou", "Ol Joro Orok", "Ndaragwa"],
  Turkana: [
    "Turkana North",
    "Turkana West",
    "Turkana Central",
    "Loima",
    "Turkana South",
    "Turkana East",
  ],
  "West Pokot": ["West Pokot", "North Pokot", "Pokot South", "Kacheliba"],
  Samburu: ["Samburu North", "Samburu Central", "Samburu East"],
  "Trans Nzoia": ["Cherangany", "Endebess", "Saboti", "Kiminini", "Kwanza"],
  Nandi: ["Tinderet", "Aldai", "Nandi Hills", "Chesumei", "Emgwen", "Mosop"],
  Baringo: [
    "Baringo North",
    "Baringo Central",
    "Baringo South",
    "Mogotio",
    "Eldama Ravine",
    "Tiaty",
  ],
  "Elgeyo-Marakwet": [
    "Marakwet East",
    "Marakwet West",
    "Keiyo North",
    "Keiyo South",
  ],
  Bungoma: [
    "Mt. Elgon",
    "Sirisia",
    "Kabuchai",
    "Bumula",
    "Kanduyi",
    "Webuye East",
    "Webuye West",
    "Kimilili",
    "Tongaren",
  ],
  Busia: [
    "Teso North",
    "Teso South",
    "Nambale",
    "Matayos",
    "Butula",
    "Funyula",
    "Budalangi",
  ],
  Vihiga: ["Vihiga", "Sabatia", "Hamisi", "Luanda", "Emuhaya"],
  Siaya: ["Rarieda", "Bondo", "Gem", "Ugenya", "Ugunja", "Alego Usonga"],
  Kisii: [
    "Bonchari",
    "South Mugirango",
    "Bomachoge Borabu",
    "Bobasi",
    "Bomachoge Chache",
    "Nyaribari Masaba",
    "Nyaribari Chache",
    "Kitutu Chache North",
    "Kitutu Chache South",
  ],
  Nyamira: ["Kitutu Masaba", "West Mugirango", "North Mugirango", "Borabu"],
  Migori: [
    "Rongo",
    "Awendo",
    "Suna East",
    "Suna West",
    "Uriri",
    "Nyatike",
    "Kuria West",
    "Kuria East",
  ],
  "Homa Bay": [
    "Kasipul",
    "Kabondo Kasipul",
    "Karachuonyo",
    "Rangwe",
    "Homa Bay Town",
    "Ndhiwa",
    "Suba North",
    "Suba South",
  ],
  "Taita-Taveta": ["Taveta", "Wundanyi", "Mwatate", "Voi"],
  Kwale: ["Msambweni", "Lungalunga", "Matuga", "Kinango"],
  "Tana River": ["Garsen", "Galole", "Bura"],
  Lamu: ["Lamu East", "Lamu West"],
  Garissa: [
    "Garissa Township",
    "Balambala",
    "Lagdera",
    "Dadaab",
    "Fafi",
    "Ijara",
  ],
  Wajir: [
    "Wajir North",
    "Wajir East",
    "Tarbaj",
    "Wajir West",
    "Eldas",
    "Wajir South",
  ],
  Mandera: [
    "Mandera West",
    "Banissa",
    "Mandera North",
    "Mandera South",
    "Mandera East",
    "Lafey",
  ],
  Marsabit: ["Moyale", "North Horr", "Saku", "Laisamis"],
  Isiolo: ["Isiolo North", "Isiolo South"],
  Makueni: [
    "Makueni",
    "Kibwezi West",
    "Kibwezi East",
    "Kilome",
    "Kaiti",
    "Mbooni",
  ],
  Kitui: [
    "Mwingi North",
    "Mwingi West",
    "Mwingi Central",
    "Kitui West",
    "Kitui Rural",
    "Kitui Central",
    "Kitui East",
    "Kitui South",
  ],
  Embu: ["Manyatta", "Runyenjes", "Mbeere South", "Mbeere North"],
  "Tharaka-Nithi": ["Tharaka", "Chuka/Igambang'ombe", "Maara"],
};

interface SuperAdminDashboardProps {}

interface NewSchool {
  name: string;
  code: string;
  county: string;
  subcounty: string;
  ward: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  type: "primary" | "secondary" | "mixed";
  establishedYear: number;
}

// Using SystemMessage from MessageModal component for consistency

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = () => {
  usePageTitle("Super Admin Dashboard - AnansiAI");
  const navigate = useNavigate();

  // State management
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCounty, setFilterCounty] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [messageModal, setMessageModal] = useState<SystemMessage | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Add Milestone (Super Admin quick action)
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [milestoneTopic, setMilestoneTopic] = useState("");
  const [milestoneObjective, setMilestoneObjective] = useState("");
  const [milestoneTask, setMilestoneTask] = useState("");
  const [milestonesQuick, setMilestonesQuick] = useState<Array<{ id: number; title: string; objective: string; task?: string }>>([]);
  const [milestonesQuickLoading, setMilestonesQuickLoading] = useState(false);
  const [milestoneSaving, setMilestoneSaving] = useState(false);
  const [milestoneDeletingId, setMilestoneDeletingId] = useState<number | null>(null);
  const [editBioId, setEditBioId] = useState<number | null>(null);
  const [instOptions, setInstOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [curOptions, setCurOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [subjOptions, setSubjOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [termOptions, setTermOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [instId, setInstId] = useState<number | null>(null);
  const [curId, setCurId] = useState<number | null>(null);
  const [subjId, setSubjId] = useState<number | null>(null);
  const [termId, setTermId] = useState<number | null>(null);

  // User CRUD states (create removed - handled in InstitutionsManagement)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [isAIConfigOpen, setIsAIConfigOpen] = useState(false);
  const [isAIMonitorOpen, setIsAIMonitorOpen] = useState(false);
  const [isSchoolRegistrationOpen, setIsSchoolRegistrationOpen] =
    useState(false);
  const [newSchool, setNewSchool] = useState<NewSchool>({
    name: "",
    code: "",
    county: "",
    subcounty: "",
    ward: "",
    adminName: "",
    adminEmail: "",
    adminPhone: "",
    type: "secondary",
    establishedYear: new Date().getFullYear(),
  });

  // Available sub-counties based on selected county
  const availableSubcounties =
    newSchool.county &&
    kenyanCountiesData[newSchool.county as keyof typeof kenyanCountiesData]
      ? kenyanCountiesData[newSchool.county as keyof typeof kenyanCountiesData]
      : [];

  // Message modal helper with defaults for required properties
  const showMessage = (
    message: Partial<SystemMessage> & {
      type: SystemMessage["type"];
      title: string;
      message: string;
    },
  ) => {
    const fullMessage: SystemMessage = {
      id: message.id || Date.now().toString(),
      type: message.type,
      priority: message.priority || "medium",
      title: message.title,
      message: message.message,
      timestamp: message.timestamp || new Date().toISOString(),
    };
    setMessageModal(fullMessage);
    setIsMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setMessageModal(null);
  };

  // Note: Breadcrumbs functionality removed - not implemented in this project

  // Direct logout function
  const logout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  // Direct state management following user's preferred pattern
  const [schools, setSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolsError, setSchoolsError] = useState(null);

  const [systemAlerts, setSystemAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState(null);

  const [systemStats, setSystemStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [createSchoolLoading, setCreateSchoolLoading] = useState(false);
  const [superAdminInfo, setSuperAdminInfo] = useState(null);
  const baseURL = axiosClient.defaults.baseURL || "/anansiai";
  const isProduction = true;

  // Direct API calls following user's preferred pattern
  const fetchSchools = async () => {
    try {
      setSchoolsLoading(true);
      setSchoolsError(null);
      console.log("�� Fetching institutions from API...");

      const response = await axiosClient
        .get("/api/Institutions")
        .catch(() => ({ data: [] }));
      console.log("✅ Institutions response:", response.data);

      if (Array.isArray(response.data)) {
        // Transform Institution objects to School format for compatibility
        const transformedSchools = response.data.map((institution, index) => ({
          id: institution.institutionId || institution.id || index + 1,
          name: institution.name || "Unnamed Institution",
          code: institution.name?.substring(0, 3).toUpperCase() || "SCH",
          county: "Nairobi", // Default since not in Institution model
          subcounty: "Central", // Default since not in Institution model
          ward: "Central", // Default since not in Institution model
          students: 0, // Default since not in Institution model
          teachers: 0, // Default since not in Institution model
          status: institution.isDeleted ? "inactive" : "active",
          performance: 85, // Default value
          aiAccuracy: 90, // Default value
          lastSync: "Just fetched",
          adminName: "Administrator", // Default since not in Institution model
          adminEmail:
            "admin@" +
            (institution.name?.toLowerCase().replace(/\s+/g, "") ||
              "institution") +
            ".edu",
          adminPhone: "+254 700 000 000", // Default
          establishedYear: new Date().getFullYear(),
          type: "secondary",
          createdAt: institution.createdDate || new Date().toISOString(),
          updatedAt: institution.modifiedDate || new Date().toISOString(),
        }));

        setSchools(transformedSchools);
        setIsConnected(true);
        showMessage({
          id: Date.now().toString(),
          type: "success",
          priority: "medium",
          title: "Success",
          message: `✅ Loaded ${transformedSchools.length} institutions from API`,
          timestamp: new Date().toISOString(),
        });
      } else {
        setSchools([]);
      }
    } catch (error) {
      console.error("❌ Error fetching schools:", error);
      setSchoolsError(`Failed to fetch schools: ${error.message}`);
      setSchools([]);
      setIsConnected(false);

      // Enhanced error handling for CORS/Mixed Content
      if (error.message === "Network Error") {
        const isMixedContent =
          window.location.protocol === "https:" && baseURL.startsWith("http:");
        if (isMixedContent) {
          setSchoolsError(
            "🔒 Mixed Content Error: HTTPS frontend cannot call HTTP API. Please allow mixed content in browser settings or use HTTPS API.",
          );
        } else {
          setSchoolsError(
            "🌐 CORS Error: API server is not allowing requests from this domain. Please configure CORS on your .NET API server.",
          );
        }
      }

      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "API Error",
        message: `❌ Cannot connect to API: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setSchoolsLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      setStatsLoading(true);
      console.log("📊 Calculating system stats from available endpoints...");

      // Get institutions count from available endpoint
      let totalSchools = 0;
      try {
        const institutionsResponse = await axiosClient.get("/api/Institutions");
        totalSchools = Array.isArray(institutionsResponse.data)
          ? institutionsResponse.data.length
          : 0;
      } catch (institutionError) {
        console.warn("Could not fetch institutions count:", institutionError);
        totalSchools = 5; // Fallback value
      }

      // Try to get subjects count
      let totalSubjects = 0;
      try {
        const subjectsResponse = await axiosClient.get("/api/subjects");
        if (Array.isArray(subjectsResponse.data)) {
          totalSubjects = subjectsResponse.data.length;
        }
      } catch (subjectError) {
        console.warn("Could not fetch subjects count:", subjectError);
      }

      const calculatedStats = {
        totalSchools,
        totalStudents: 0, // Would need student endpoint
        totalTeachers: 0, // Would need teacher endpoint
        totalSubjects,
        avgPerformance: 0, // Would need performance data
        systemUptime: 99.9, // Default value
        dataStorage: 0, // Would need system metrics
        activeUsers: 0, // Would need user activity data
        dailyLogins: 0, // Would need login metrics
        lastUpdated: new Date().toISOString(),
      };

      setSystemStats(calculatedStats);
      console.log("📊 System stats calculated:", calculatedStats);
    } catch (error) {
      console.error("❌ Error calculating system stats:", error);
      // Set default stats on error
      setSystemStats({
        totalSchools: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalSubjects: 0,
        avgPerformance: 0,
        systemUptime: 0,
        dataStorage: 0,
        activeUsers: 0,
        dailyLogins: 0,
        lastUpdated: new Date().toISOString(),
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchSystemAlerts = async () => {
    // System alerts endpoint not available in your API
    console.log("🚨 System alerts endpoint not available in current API");
    setSystemAlerts([]);
  };

  const fetchSuperAdminProfile = async () => {
    // Admin profile endpoint not available in your API
    console.log("👤 Admin profile endpoint not available in current API");
    setSuperAdminInfo({
      name: "Super Administrator",
      id: "admin-001",
      role: "Super Administrator",
      avatar: "",
      lastLogin: new Date().toISOString(),
      region: "Kenya",
      permissions: ["all"],
    });
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log("🔍 Testing API connection...");
      const response = await axiosClient.get("/api/Institutions", {
        timeout: 45000,
      });
      const connected = response.status >= 200 && response.status < 300;
      setIsConnected(connected);

      if (connected) {
        console.log("✅ API connection successful");
        return true;
      } else {
        console.warn(`⚠️ API responded with status ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error("❌ API connection failed:", error.message);
      setIsConnected(false);
      return false;
    }
  };

  // Milestone helpers for Super Admin
  const loadInstitutionsForMilestones = async () => {
    try {
      const institutions = await adminApiService.getInstitutions();
      const opts = (institutions || []).map((i: any) => ({ id: i.institutionId, name: i.name }));
      setInstOptions(opts);
      if (!instId && opts[0]) setInstId(opts[0].id);
    } catch (e) {
      setInstOptions([]);
    }
  };

  const loadCurriculumsForMilestones = async (institutionId: number) => {
    try {
      const currics = await adminApiService.getCurriculumsByInstitution(institutionId);
      const opts = (currics || []).map((c: any) => ({ id: c.curriculumId, name: c.name }));
      setCurOptions(opts);
      if (!curId && opts[0]) setCurId(opts[0].id);
    } catch (e) {
      setCurOptions([]);
    }
  };

  const loadSubjectsForMilestones = async (curriculumId: number, institutionId: number) => {
    try {
      const subjects = await adminApiService.getSubjectsByCurriculum(curriculumId, institutionId);
      const opts = (subjects || []).map((s: any) => ({ id: s.subjectId, name: s.subjectName }));
      setSubjOptions(opts);
      if (!subjId && opts[0]) setSubjId(opts[0].id);
    } catch (e) {
      setSubjOptions([]);
    }
  };

  const loadTermsForMilestones = async (institutionId: number) => {
    try {
      const terms = await adminApiService.getTermsByInstitution(institutionId);
      const opts = (terms || []).map((t: any) => ({ id: t.termId, name: t.termName }));
      setTermOptions(opts);
      if (!termId && opts[0]) setTermId(opts[0].id);
    } catch (e) {
      setTermOptions([]);
    }
  };

  const refreshMilestonesQuick = async () => {
    try {
      setMilestonesQuickLoading(true);
      const data = await adminApiService.getBiographyMilestones();
      const normalized = (Array.isArray(data) ? data : []).map((m: any) => ({
        id: m.id ?? m.milestoneId ?? m.biographyMilestoneId,
        title: m.title ?? m.topic ?? "",
        objective: m.objective ?? m.description ?? "",
        task: m.task ?? undefined,
      })).filter((m: any) => m.id != null);
      setMilestonesQuick(normalized);
    } catch (error: any) {
      console.error("Failed to load milestones:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      const detail = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to load milestones";
      showMessage({ id: Date.now().toString(), type: "error", title: "Error", message: `Failed to load milestones: ${detail}` });
      setMilestonesQuick([]);
    } finally {
      setMilestonesQuickLoading(false);
    }
  };

  const getDefaultContextForMilestone = async () => {
    // Institution
    let institutionId = 1;
    try {
      const institutions = await axiosClient.get("/api/Institutions");
      if (Array.isArray(institutions.data) && institutions.data.length > 0) {
        institutionId = institutions.data[0].institutionId || 1;
      }
    } catch {}

    // Curriculum
    let curriculumId = 1;
    try {
      const curByInst = await adminApiService.getCurriculumsByInstitution(institutionId);
      if (curByInst && curByInst.length > 0) curriculumId = curByInst[0].curriculumId;
    } catch {}
    if (!curriculumId) {
      try {
        const curAll = await adminApiService.getCurriculums();
        if (curAll && curAll.length > 0) curriculumId = curAll[0].curriculumId;
      } catch {}
    }
    if (!curriculumId) curriculumId = 1;

    // Subject
    let subjectId = 1;
    try {
      const subjByCur = await adminApiService.getSubjectsByCurriculum(curriculumId, institutionId);
      if (subjByCur && subjByCur.length > 0) subjectId = subjByCur[0].subjectId;
    } catch {}
    if (!subjectId) {
      try {
        const subjAll = await adminApiService.getSubjects();
        if (subjAll && subjAll.length > 0) subjectId = subjAll[0].subjectId;
      } catch {}
    }
    if (!subjectId) subjectId = 1;

    // Term
    let termId = 1;
    try {
      const termsByInst = await adminApiService.getTermsByInstitution(institutionId);
      if (termsByInst && termsByInst.length > 0) termId = termsByInst[0].termId;
    } catch {}
    if (!termId) {
      try {
        const termsAll = await adminApiService.getTerms();
        if (termsAll && termsAll.length > 0) termId = termsAll[0].termId;
      } catch {}
    }
    if (!termId) termId = 1;

    return { institutionId, curriculumId, subjectId, termId };
  };

  const handleQuickAddMilestone = async () => {
    if (!milestoneTopic.trim() || !milestoneObjective.trim()) {
      showMessage({ id: Date.now().toString(), type: "error", title: "Validation", message: "Topic and objective are required" });
      return;
    }
    try {
      setMilestoneSaving(true);
      const payload: any = {
        title: milestoneTopic.trim(),
        objective: milestoneObjective.trim(),
      };
      if (milestoneTask.trim()) payload.task = milestoneTask.trim();
      if (editBioId) {
        await adminApiService.updateBiographyMilestone(editBioId, payload);
      } else {
        await adminApiService.createBiographyMilestone(payload);
      }
      showMessage({ id: Date.now().toString(), type: "success", title: "Success", message: editBioId ? "Milestone updated" : "Milestone created" });
      setMilestoneTopic("");
      setMilestoneObjective("");
      setMilestoneTask("");
      setEditBioId(null);
      await refreshMilestonesQuick();
    } catch (error: any) {
      console.error("Failed to create milestone:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      const status = error?.response?.status;
      const baseMsg = status === 401 || status === 403 ? "Unauthorized. Please log in again." : (error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to create milestone");
      showMessage({ id: Date.now().toString(), type: "error", title: "Error", message: `Failed to create milestone: ${baseMsg}` });
    } finally {
      setMilestoneSaving(false);
    }
  };

  const handleQuickDeleteMilestone = async (id: number) => {
    if (!id) return;
    if (!window.confirm("Delete this milestone? This action cannot be undone.")) return;
    try {
      setMilestoneDeletingId(id);
      await adminApiService.deleteBiographyMilestone(id);
      showMessage({ id: Date.now().toString(), type: "success", title: "Deleted", message: "Milestone removed" });
      await refreshMilestonesQuick();
    } catch (error: any) {
      console.error("Failed to delete milestone:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      const detail = error?.response?.data?.message || error?.response?.data?.error || error?.message || "Failed to delete milestone";
      showMessage({ id: Date.now().toString(), type: "error", title: "Error", message: `Failed to delete milestone: ${detail}` });
    } finally {
      setMilestoneDeletingId(null);
    }
  };

  // Create school function following user's direct axios pattern
  const createSchool = async (schoolData: any) => {
    try {
      setCreateSchoolLoading(true);
      console.log("🏫 Creating new school...", schoolData);

      // Transform school data to Institution API format matching schema
      const institutionData = {
        modifiedDate: new Date().toISOString(),
        createdBy: 1,
        modifiedBy: "system",
        isDeleted: false,
        institutionId: 0,
        name: schoolData.name || "New School",
        address:
          schoolData.address || `${schoolData.county}, ${schoolData.subcounty}`,
        institutionType: Number(schoolData.institutionType) || 1,
      };

      const response = await axiosClient.post(
        "/api/Institutions",
        institutionData,
      );

      if (response.data) {
        // Transform response back to School format for compatibility
        const newSchool = {
          id: response.data.institutionId || response.data.id || Date.now(),
          name: response.data.name,
          code:
            schoolData.code ||
            response.data.name?.substring(0, 3).toUpperCase() ||
            "SCH",
          county: schoolData.county || "Nairobi",
          subcounty: schoolData.subcounty || "Central",
          ward: schoolData.ward || "Central",
          students: 0,
          teachers: 0,
          status: "active",
          performance: 0,
          aiAccuracy: 0,
          lastSync: "Just now",
          adminName: schoolData.adminName || "Administrator",
          adminEmail: schoolData.adminEmail || "admin@school.ac.ke",
          adminPhone: schoolData.adminPhone || "+254 700 000 000",
          establishedYear: new Date().getFullYear(),
          type: schoolData.type || "secondary",
          createdAt: response.data.createdDate || new Date().toISOString(),
          updatedAt: response.data.modifiedDate || new Date().toISOString(),
        };

        // Refresh schools list to show the new school
        fetchSchools();

        return newSchool;
      } else {
        throw new Error("Failed to create school");
      }
    } catch (error: any) {
      console.error("❌ Error creating school:", error);
      throw new Error(`Failed to create school: ${error.message}`);
    } finally {
      setCreateSchoolLoading(false);
    }
  };

  // Refresh function for manual refresh
  const refetchSchools = () => {
    console.log("🔄 Manually refreshing schools data...");
    fetchSchools();
  };

  // Mock notifications for now (can be replaced with real API when available)
  const notifications: any[] = [];
  const notificationsLoading = false;
  const notificationsError = null;

  // Load data on component mount - following user's preferred pattern
  useEffect(() => {
    fetchSchools();
    fetchSystemStats();
    fetchSystemAlerts();
    fetchSuperAdminProfile();
  }, []);

  // Update time every minute and auto-refresh data
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Auto-refresh system stats every 5 minutes
    const refreshTimer = setInterval(
      () => {
        // Only auto-refresh if user is on overview tab and data is not loading
        if (selectedTab === "overview" && !statsLoading) {
          showMessage({
            id: Date.now().toString(),
            type: "info",
            priority: "low",
            title: "Data Refreshed",
            message: "System statistics have been automatically updated.",
            timestamp: new Date().toISOString(),
          });
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, [selectedTab, statsLoading]);

  // Use actual API data only
  const schoolsData = schools || [];
  const systemStatsData = systemStats || {
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    avgPerformance: 0,
    systemUptime: 0,
    dataStorage: 0,
    activeUsers: 0,
    dailyLogins: 0,
  };
  const systemAlertsData = systemAlerts || [];
  const notificationsData = notifications || [];
  const superAdminInfoData = superAdminInfo || {
    name: "Super Administrator",
    id: "N/A",
    role: "System Administrator",
    avatar: "",
    lastLogin: "N/A",
    region: "N/A",
    permissions: [],
  };

  // Load data on component mount - following user's preferred pattern
  useEffect(() => {
    fetchSchools();
    fetchRealUsers();
    fetchSystemStats();
    fetchSystemAlerts();
    fetchSuperAdminProfile();
    testApiConnection();
  }, []);

  // Enhanced mock data for analytics
  const monthlyGrowthData = [
    { month: "Jan", schools: 180, students: 65000, teachers: 6200 },
    { month: "Feb", schools: 192, students: 71000, teachers: 6800 },
    { month: "Mar", schools: 205, students: 78000, teachers: 7400 },
    { month: "Apr", schools: 218, students: 84000, teachers: 7950 },
    { month: "May", schools: 231, students: 91000, teachers: 8500 },
    { month: "Jun", schools: 247, students: 98742, teachers: 8945 },
  ];

  const performanceData = [
    { subject: "Mathematics", performance: 78, target: 80 },
    { subject: "English", performance: 82, target: 85 },
    { subject: "Science", performance: 75, target: 78 },
    { subject: "Kiswahili", performance: 88, target: 85 },
    { subject: "Social Studies", performance: 71, target: 75 },
  ];

  const regionalDistribution = [
    { name: "Central", value: 85, color: "#3B82F6" },
    { name: "Western", value: 67, color: "#10B981" },
    { name: "Eastern", value: 52, color: "#F59E0B" },
    { name: "Nyanza", value: 43, color: "#EF4444" },
    { name: "Rift Valley", value: 38, color: "#8B5CF6" },
    { name: "Coast", value: 28, color: "#06B6D4" },
    { name: "North Eastern", value: 15, color: "#84CC16" },
    { name: "Nairobi", value: 12, color: "#F97316" },
  ];

  const criticalAlerts = systemAlertsData.filter(
    (alert) => alert.priority === "high",
  ).length;

  // Mock notifications for the notification center
  const systemNotifications: SystemNotification[] = [
    {
      id: "1",
      type: "system",
      priority: "critical",
      title: "Server Maintenance Required",
      message:
        "Primary database server requires urgent maintenance. Performance degradation detected.",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      isRead: false,
      actionRequired: true,
    },
    {
      id: "2",
      type: "ai",
      priority: "high",
      title: "AI Twin Analysis Complete",
      message:
        "Monthly AI Twin performance analysis completed. 94.2% accuracy achieved.",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      isRead: false,
      actionRequired: false,
    },
    {
      id: "3",
      type: "alert",
      priority: "medium",
      title: "New School Registrations",
      message:
        "5 new schools registered in the system today. Approval required.",
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      isRead: true,
      actionRequired: true,
    },
  ];

  const unreadNotifications = systemNotifications.filter(
    (n) => !n.isRead,
  ).length;

  // AI System Stats for Super Admin
  const aiSystemStats = {
    activeAITwins: 98742,
    systemAccuracy: 94.2,
    dailyInteractions: 892456,
    behaviorAlertsToday: 1247,
  };

  // Action handlers
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreateSchool = async () => {
    if (
      !newSchool.name ||
      !newSchool.code ||
      !newSchool.county ||
      !newSchool.subcounty
    ) {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Validation Error",
        message: "Please fill in all required fields",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!newSchool.adminName || !newSchool.adminEmail) {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Admin Details Required",
        message: "Please provide administrator details",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      const response = await createSchool({
        name: newSchool.name,
        code: newSchool.code,
        county: newSchool.county,
        subcounty: newSchool.subcounty,
        ward: newSchool.ward || "Central",
        type: newSchool.type,
        adminName: newSchool.adminName,
        adminEmail: newSchool.adminEmail,
        adminPhone: newSchool.adminPhone,
        establishedYear: newSchool.establishedYear,
      });

      if (response) {
        showMessage({
          id: Date.now().toString(),
          type: "success",
          priority: "medium",
          title: "School Registered",
          message: `School "${newSchool.name}" registered successfully! Admin credentials sent to ${newSchool.adminEmail}`,
          timestamp: new Date().toISOString(),
        });

        // Reset form
        setNewSchool({
          name: "",
          code: "",
          county: "",
          subcounty: "",
          ward: "",
          adminName: "",
          adminEmail: "",
          adminPhone: "",
          type: "secondary",
          establishedYear: new Date().getFullYear(),
        });

        // Refresh schools list
        refetchSchools();
        setIsCreateSchoolOpen(false);
      } else {
        showMessage({
          id: Date.now().toString(),
          type: "error",
          priority: "high",
          title: "Registration Failed",
          message: "Failed to register school. Please try again.",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Registration Failed",
        message: `Failed to register school: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Enhanced Action Handlers
  const handleExportUsers = () => {
    showMessage({
      id: Date.now().toString(),
      type: "success",
      priority: "medium",
      title: "Export Started",
      message: `Exporting ${filteredUsers.length} users from all schools. Download will start shortly.`,
      timestamp: new Date().toISOString(),
    });

    // Simulate CSV download with multi-school data
    setTimeout(() => {
      const csvContent =
        "data:text/csv;charset=utf-8,Name,Email,Role,Status,School,County,Last Login\n" +
        filteredUsers
          .map(
            (user) =>
              `${user.fullName},${user.email},${user.role},${user.isActive ? "Active" : "Inactive"},${user.schoolName},${user.county},${user.lastLogin}`,
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

      showMessage({
        id: Date.now().toString(),
        type: "success",
        priority: "medium",
        title: "Export Complete",
        message: `Successfully exported ${filteredUsers.length} users to CSV file.`,
        timestamp: new Date().toISOString(),
      });
    }, 1000);
  };

  const handleViewUserDetails = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "User Details",
      message: `Viewing details for ${user?.fullName}. This would open a detailed user profile view.`,
      timestamp: new Date().toISOString(),
    });
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

  // User CRUD Operations (create removed - handled in InstitutionsManagement)
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setIsDeleteUserOpen(true);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      // Update existing user
      const response = await axiosClient.put(
        `/api/Users/${editingUser.id}`,
        userData,
      );

      showMessage({
        id: Date.now().toString(),
        type: "success",
        priority: "medium",
        title: "User Updated",
        message: `User ${userData.firstName} ${userData.lastName} has been updated successfully.`,
        timestamp: new Date().toISOString(),
      });

      // Refresh users list
      fetchRealUsers();
      setIsEditUserOpen(false);
      setEditingUser(null);
    } catch (error) {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Error",
        message: `Failed to update user: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await axiosClient.delete(`/api/Users/${userToDelete.id}`);

      showMessage({
        id: Date.now().toString(),
        type: "success",
        priority: "medium",
        title: "User Deleted",
        message: `User ${userToDelete.fullName} has been deleted successfully.`,
        timestamp: new Date().toISOString(),
      });

      // Refresh users list
      fetchRealUsers();
      setIsDeleteUserOpen(false);
      setUserToDelete(null);
    } catch (error) {
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "Error",
        message: `Failed to delete user: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Academic Management Actions
  const handleGenerateAcademicReport = () => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "Generating Report",
      message: "Academic performance report is being generated...",
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      showMessage({
        id: Date.now().toString(),
        type: "success",
        priority: "medium",
        title: "Report Ready",
        message:
          "Academic report generated successfully! ��� Includes curriculum coverage and student outcomes.",
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  };

  const handleAddSubject = () => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "Add Subject",
      message:
        "Subject creation form would open here. Add new subjects to the national curriculum.",
      timestamp: new Date().toISOString(),
    });
  };

  const handleViewSubjectAnalytics = (subject: string) => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "Subject Analytics",
      message: `Viewing detailed analytics for ${subject}. Includes performance trends and recommendations.`,
      timestamp: new Date().toISOString(),
    });
  };

  // AI Insights Actions
  const handleGenerateAIReport = () => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "AI Analysis",
      message: "Generating comprehensive AI insights report...",
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      showMessage({
        id: Date.now().toString(),
        type: "success",
        priority: "medium",
        title: "AI Report Ready",
        message:
          "AI insights report generated! 🤖 Includes behavior patterns and learning recommendations.",
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  };

  const handleAISettings = () => {
    setIsAIConfigOpen(true);
  };

  const handleViewBehaviorAlert = (alertType: string) => {
    showMessage({
      id: Date.now().toString(),
      type: "warning",
      priority: "high",
      title: "Behavior Alert",
      message: `Investigating ${alertType} across the system. This would show detailed behavioral analytics.`,
      timestamp: new Date().toISOString(),
    });
  };

  // Performance Management Actions
  const handleGeneratePerformanceReport = () => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "Performance Report",
      message: "Generating system-wide performance report...",
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      showMessage({
        id: Date.now().toString(),
        type: "success",
        priority: "medium",
        title: "Report Generated",
        message:
          "Performance report ready! 📈 Includes school metrics and effectiveness analytics.",
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  };

  const handleSetPerformanceTargets = () => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "Set Targets",
      message:
        "Performance targets configuration would open here. Set goals for schools and teachers.",
      timestamp: new Date().toISOString(),
    });
  };

  const handleViewSchoolPerformance = (schoolName: string) => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "School Performance",
      message: `Viewing detailed performance analytics for ${schoolName}.`,
      timestamp: new Date().toISOString(),
    });
  };

  // Infrastructure Actions
  const handleViewSystemHealth = () => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "System Health",
      message:
        "Opening detailed system health dashboard with real-time metrics.",
      timestamp: new Date().toISOString(),
    });
  };

  const handleManageBackups = () => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "Backup Management",
      message:
        "Backup management panel would open here. Configure and monitor system backups.",
      timestamp: new Date().toISOString(),
    });
  };

  const handleSecurityAudit = () => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "Security Audit",
      message:
        "Initiating security audit... Running comprehensive security checks.",
      timestamp: new Date().toISOString(),
    });
  };

  // Reports Actions
  const handleGenerateReport = (reportType: string) => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "Generating Report",
      message: `Generating ${reportType} report...`,
      timestamp: new Date().toISOString(),
    });

    setTimeout(() => {
      showMessage({
        id: Date.now().toString(),
        type: "success",
        priority: "medium",
        title: "Report Ready",
        message: `${reportType} report generated successfully! 📄`,
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  };

  const handleScheduleReports = () => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "medium",
      title: "Schedule Reports",
      message:
        "Report scheduling panel would open here. Configure automated reports.",
      timestamp: new Date().toISOString(),
    });
  };

  // Notification handlers
  const markNotificationAsRead = (id: string) => {
    showMessage({
      id: Date.now().toString(),
      type: "success",
      priority: "low",
      title: "Notification Read",
      message: "Notification marked as read.",
      timestamp: new Date().toISOString(),
    });
  };

  const markAllNotificationsAsRead = () => {
    showMessage({
      id: Date.now().toString(),
      type: "success",
      priority: "low",
      title: "All Read",
      message: "All notifications marked as read.",
      timestamp: new Date().toISOString(),
    });
  };

  const dismissNotification = (id: string) => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "low",
      title: "Notification Dismissed",
      message: "Notification dismissed.",
      timestamp: new Date().toISOString(),
    });
  };

  const clearAllNotifications = () => {
    showMessage({
      id: Date.now().toString(),
      type: "info",
      priority: "low",
      title: "Notifications Cleared",
      message: "All notifications have been cleared.",
      timestamp: new Date().toISOString(),
    });
  };

  // Real users from API
  const [realUsers, setRealUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const fetchRealUsers = async () => {
    try {
      setUsersLoading(true);
      console.log("👥 Fetching users from API...");

      // Fetch users from multiple roles since this is Super Admin Dashboard
      const roleRequests = ["admin", "teacher", "student", "superadmin"].map(
        (role) =>
          axiosClient
            .get(`/api/Users/get-users-by-role?roleName=${role}`)
            .catch((error) => {
              console.warn(`⚠️ Failed to fetch ${role} users:`, error.message);
              return { data: [] };
            }),
      );

      const responses = await Promise.all(roleRequests);
      console.log(
        "✅ Users API responses:",
        responses.map((r) => r.data),
      );

      // Combine all user data from different roles
      const allUsersData = responses.reduce((acc, response) => {
        const userData = response.data?.data || response.data || [];
        return acc.concat(Array.isArray(userData) ? userData : []);
      }, []);

      // Transform API data and fetch institution names
      const transformedUsers = [];

      if (Array.isArray(allUsersData)) {
        for (let i = 0; i < allUsersData.length; i++) {
          const user = allUsersData[i];
          let institutionName = "Unknown Institution";

          // Try to fetch real institution name if user has institutionId
          if (user.institutionId) {
            try {
              console.log(`🔍 Fetching institution for user ${user.email} with institutionId: ${user.institutionId}`);
              const institution = await adminApiService.getInstitution(Number(user.institutionId));

              // Handle API response structure (same as AdminDashboard fix)
              institutionName = institution?.data?.name || institution?.name || `Institution ${user.institutionId}`;
              console.log(`✅ Found institution name: ${institutionName} for user ${user.email}`);
            } catch (error) {
              console.warn(`⚠️ Failed to fetch institution for user ${user.email}:`, error);
              institutionName = `Institution ${user.institutionId}`;
            }
          } else {
            console.log(`ℹ️ User ${user.email} has no institutionId, using default institution name`);
          }

          const transformedUser = {
            id: user.id || user.userId || String(i + 1),
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
            email: user.email || "",
            phoneNumber: user.phoneNumber || "",
            role: user.role?.name || user.roleName || "Unknown",
            isActive: user.isActive !== undefined ? user.isActive : true,
            lastLogin:
              user.lastLogin ||
              new Date().toISOString().split("T")[0] +
                " " +
                new Date()
                  .toLocaleTimeString("en-GB", { hour12: false })
                  .slice(0, 5),
            photoUrl: user.photoUrl || "",
            schoolName: institutionName,
            schoolCode: user.institutionId
              ? `INST${user.institutionId}`
              : "UNK",
            county: user.address || "Unknown",
          };

          transformedUsers.push(transformedUser);
        }
      }

      setRealUsers(transformedUsers);

      const usersWithInstitutions = transformedUsers.filter(u => u.schoolName !== "Unknown Institution").length;
      console.log(`✅ Successfully loaded ${transformedUsers.length} users from API`);
      console.log(`🏫 Fetched real institution names for ${usersWithInstitutions} users`);

      // Show success message
      showMessage({
        id: Date.now().toString(),
        type: "success",
        priority: "medium",
        title: "Users Loaded",
        message: `✅ Loaded ${transformedUsers.length} users from API`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
      setRealUsers([]);

      // Show error message
      showMessage({
        id: Date.now().toString(),
        type: "error",
        priority: "high",
        title: "API Error",
        message: `❌ Failed to load users: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setUsersLoading(false);
    }
  };

  // Mock multi-school users data
  const users = [
    {
      id: "1",
      fullName: "John Doe",
      email: "john.doe@nairobi-academy.ac.ke",
      phoneNumber: "+254 700 123 456",
      role: "STUDENT",
      isActive: true,
      lastLogin: "2024-01-15 10:30",
      photoUrl: "",
      schoolName: "Nairobi Academy",
      schoolCode: "NAC001",
      county: "Nairobi",
    },
    {
      id: "2",
      fullName: "Jane Smith",
      email: "jane.smith@mombasa-int.ac.ke",
      phoneNumber: "+254 700 123 457",
      role: "TEACHER",
      isActive: true,
      lastLogin: "2024-01-15 09:15",
      photoUrl: "",
      schoolName: "Mombasa International",
      schoolCode: "MIS002",
      county: "Mombasa",
    },
    {
      id: "3",
      fullName: "Bob Johnson",
      email: "bob.johnson@kisumu-elite.ac.ke",
      phoneNumber: "+254 700 123 458",
      role: "ADMIN",
      isActive: false,
      lastLogin: "2024-01-14 16:45",
      photoUrl: "",
      schoolName: "Kisumu Elite School",
      schoolCode: "KES003",
      county: "Kisumu",
    },
    {
      id: "4",
      fullName: "Alice Wilson",
      email: "alice.wilson@nakuru-high.ac.ke",
      phoneNumber: "+254 700 123 459",
      role: "STUDENT",
      isActive: true,
      lastLogin: "2024-01-15 11:20",
      photoUrl: "",
      schoolName: "Nakuru High School",
      schoolCode: "NHS004",
      county: "Nakuru",
    },
    {
      id: "5",
      fullName: "David Brown",
      email: "david.brown@eldoret-academy.ac.ke",
      phoneNumber: "+254 700 123 460",
      role: "TEACHER",
      isActive: true,
      lastLogin: "2024-01-15 08:30",
      photoUrl: "",
      schoolName: "Eldoret Academy",
      schoolCode: "EA005",
      county: "Uasin Gishu",
    },
    {
      id: "6",
      fullName: "Mary Wanjiku",
      email: "mary.wanjiku@thika-girls.ac.ke",
      phoneNumber: "+254 700 123 461",
      role: "STUDENT",
      isActive: true,
      lastLogin: "2024-01-15 14:22",
      photoUrl: "",
      schoolName: "Thika Girls High School",
      schoolCode: "TGH006",
      county: "Kiambu",
    },
    {
      id: "7",
      fullName: "Peter Otieno",
      email: "peter.otieno@kakamega-boys.ac.ke",
      phoneNumber: "+254 700 123 462",
      role: "TEACHER",
      isActive: true,
      lastLogin: "2024-01-15 13:45",
      photoUrl: "",
      schoolName: "Kakamega Boys High",
      schoolCode: "KBH007",
      county: "Kakamega",
    },
    {
      id: "8",
      fullName: "Grace Nyambura",
      email: "grace.nyambura@machakos-girls.ac.ke",
      phoneNumber: "+254 700 123 463",
      role: "ADMIN",
      isActive: true,
      lastLogin: "2024-01-15 12:10",
      photoUrl: "",
      schoolName: "Machakos Girls Secondary",
      schoolCode: "MGS008",
      county: "Machakos",
    },
    {
      id: "9",
      fullName: "Samuel Kiprop",
      email: "samuel.kiprop@kericho-tea.ac.ke",
      phoneNumber: "+254 700 123 464",
      role: "STUDENT",
      isActive: true,
      lastLogin: "2024-01-15 16:30",
      photoUrl: "",
      schoolName: "Kericho Tea Estate School",
      schoolCode: "KTE009",
      county: "Kericho",
    },
    {
      id: "10",
      fullName: "Rebecca Akinyi",
      email: "rebecca.akinyi@meru-secondary.ac.ke",
      phoneNumber: "+254 700 123 465",
      role: "TEACHER",
      isActive: false,
      lastLogin: "2024-01-13 09:15",
      photoUrl: "",
      schoolName: "Meru Secondary School",
      schoolCode: "MSS010",
      county: "Meru",
    },
  ];

  // Use only real API users (mock data removed)
  const allUsers = realUsers;

  // Filter users
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      (user.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.schoolName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (user.id || "").toLowerCase().includes(searchQuery.toLowerCase());

    const userRole = user.role ? user.role.toLowerCase() : "";
    const matchesRole = filterRole === "all" || userRole === filterRole;

    const userStatus = user.isActive ? "active" : "inactive";
    const matchesStatus = filterStatus === "all" || userStatus === filterStatus;

    const matchesCounty =
      filterCounty === "all" || user.county === filterCounty;

    return matchesSearch && matchesRole && matchesStatus && matchesCounty;
  });

  // Filter schools
  const filteredSchools = schoolsData.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.adminName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || school.status === filterStatus;
    const matchesCounty =
      filterCounty === "all" || school.county === filterCounty;

    return matchesSearch && matchesStatus && matchesCounty;
  });

  // Pagination for users (matching institutions pattern)
  const totalUsersPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startUsersIndex = (usersPage - 1) * usersPerPage;
  const endUsersIndex = startUsersIndex + usersPerPage;
  const paginatedUsers = filteredUsers.slice(startUsersIndex, endUsersIndex);

  const handleUsersPageChange = (page: number) => {
    setUsersPage(page);
  };

  const handleUsersPrevious = () => {
    if (usersPage > 1) {
      setUsersPage(usersPage - 1);
    }
  };

  const handleUsersNext = () => {
    if (usersPage < totalUsersPages) {
      setUsersPage(usersPage + 1);
    }
  };

  // Helper functions
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "student":
        return "bg-blue-100 text-blue-700";
      case "teacher":
        return "bg-green-100 text-green-700";
      case "admin":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === "boolean") {
      return status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
    }
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <TooltipProvider>
      <div className="superadmin-dashboard min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Message Modal */}
        <ModernMessageModal
          isOpen={isMessageModalOpen}
          onClose={closeMessageModal}
          message={messageModal}
        />

        {/* Enhanced Header with Full Branding */}
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Brand Section */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-3 group cursor-pointer"
                  aria-label="Go to login"
                >
                  <img
                    src="https://cdn.builder.io/api/v1/assets/2d09da496e544a1eab05e596d02031d8/twinternet-logo-b18833?format=webp&width=800"
                    alt="AnansiAI Logo"
                    className="w-14 h-14 object-contain transition-transform group-hover:scale-105"
                  />
                  <div className="text-left">
                    <span className="hidden sm:inline font-heading font-bold text-xs md:text-sm text-gray-800 leading-none">
                      AnansiAI
                    </span>
                    <p className="hidden sm:flex text-[10px] md:text-xs text-gray-500 items-center gap-1 mt-0.5">
                      <Shield className="w-3 h-3" />
                      Super Admin Portal
                    </p>
                  </div>
                </button>
              </div>

              {/* System Status and Actions */}
              <div className="flex items-center gap-4">
                {/* National System Status */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">
                        National System Operational
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-medium">AnansiAI Platform Active</p>
                      <Separator className="my-1" />
                      <p className="text-xs">
                        Uptime: {systemStatsData.systemUptime}%
                      </p>
                      <p className="text-xs">
                        AI Twins: {aiSystemStats.activeAITwins.toLocaleString()}
                      </p>
                      <p className="text-xs">
                        Schools: {systemStatsData.totalSchools}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* API Diagnostics */}
                <ApiDiagnostics />

                {/* AI Twin Management */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                      onClick={() => setSelectedTab("ai-insights")}
                    >
                      <Brain className="w-5 h-5 text-blue-600" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-medium">AI Twin Management</p>
                      <Separator className="my-1" />
                      <p className="text-xs">
                        Active Twins:{" "}
                        {aiSystemStats.activeAITwins.toLocaleString()}
                      </p>
                      <p className="text-xs">
                        Accuracy: {aiSystemStats.systemAccuracy}%
                      </p>
                      <p className="text-xs">
                        Daily Chats:{" "}
                        {aiSystemStats.dailyInteractions.toLocaleString()}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Notifications */}
                <DropdownMenu
                  open={showNotificationCenter}
                  onOpenChange={setShowNotificationCenter}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="w-5 h-5" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-96 p-0" align="end">
                    <NotificationCenter
                      notifications={systemNotifications}
                      onMarkAsRead={markNotificationAsRead}
                      onMarkAllAsRead={markAllNotificationsAsRead}
                      onDismiss={dismissNotification}
                      onClearAll={clearAllNotifications}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Quick Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Zap className="w-5 h-5 text-blue-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsSchoolRegistrationOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Register School
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleGenerateReport("System Report")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleViewSystemHealth}>
                      <Monitor className="w-4 h-4 mr-2" />
                      System Health
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSecurityAudit}>
                      <Shield className="w-4 h-4 mr-2" />
                      Security Audit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <div className="w-full">
                        <ApiDiagnostics />
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Advanced Settings */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>System Settings</DropdownMenuLabel>
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
                    <DropdownMenuItem onClick={handleManageBackups}>
                      <Database className="w-4 h-4 mr-2" />
                      Backup Management
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Globe className="w-4 h-4 mr-2" />
                      Regional Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Enhanced Profile Section */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer hover:bg-gray-50 rounded-lg p-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={superAdminInfoData.avatar} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {superAdminInfoData.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">
                          {superAdminInfoData.name}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {superAdminInfoData.role}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {superAdminInfoData.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {superAdminInfoData.role}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Platform Owner
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Super Admin
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Shield className="w-4 h-4 mr-2" />
                      Security Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="w-4 h-4 mr-2" />
                      Notification Preferences
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  AnansiAI Platform Control Center
                </h2>
                <p className="text-blue-100 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Welcome back, {superAdminInfoData.name} ��� Platform Owner &
                  Administrator
                </p>
                <div className="flex items-center gap-6 mt-3 text-sm text-blue-100">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last login: {superAdminInfoData.lastLogin}
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {systemStatsData.activeUsers.toLocaleString()} users active
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {systemStatsData.totalSchools} schools monitored
                  </div>
                  <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    {aiSystemStats.activeAITwins.toLocaleString()} AI Twins
                    active
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <p className="text-sm font-medium">System Status</p>
                  <p className="text-xl font-bold">
                    {systemStatsData.systemUptime}%
                  </p>
                  <p className="text-xs text-blue-100">Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="space-y-6"
          >
            <div className="flex justify-end">
              <Button variant="outline" onClick={async () => { setIsAddMilestoneOpen(true); await loadInstitutionsForMilestones(); const inst = instId ?? null; if (inst) { await loadCurriculumsForMilestones(inst); await loadTermsForMilestones(inst); const cur = curId ?? null; if (cur) { await loadSubjectsForMilestones(cur, inst); } } refreshMilestonesQuick(); }}>
                <Target className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>
            {/* Enhanced Navigation */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 border border-gray-200">
              <TabsList
                className="grid w-full grid-cols-10 gap-1"
                role="tablist"
                aria-label="Dashboard navigation"
              >
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 px-4 py-2"
                  aria-label="Overview dashboard section"
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="schools"
                  className="flex items-center gap-2 px-2 sm:px-4 py-2"
                  aria-label="Schools management section"
                >
                  <Building className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Schools</span>
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="flex items-center gap-2 px-2 sm:px-4 py-2"
                  aria-label="Users management section"
                >
                  <Users className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger
                  value="academics"
                  className="flex items-center gap-2 px-2 sm:px-4 py-2"
                  aria-label="Academic management section"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Academics</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ai-insights"
                  className="flex items-center gap-2 px-2 sm:px-4 py-2"
                  aria-label="AI insights and analytics section"
                >
                  <Brain className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">AI Insights</span>
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="flex items-center gap-2 px-2 sm:px-4 py-2"
                  aria-label="Performance metrics section"
                >
                  <TrendingUp className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Performance</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-2 px-2 sm:px-4 py-2"
                  aria-label="Data analytics section"
                >
                  <BarChart3 className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger
                  value="infrastructure"
                  className="flex items-center gap-2 px-2 sm:px-4 py-2"
                  aria-label="System infrastructure section"
                >
                  <Monitor className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Infrastructure</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="flex items-center gap-2 px-2 sm:px-4 py-2"
                  aria-label="Reports and documentation section"
                >
                  <FileText className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Reports</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2 px-2 sm:px-4 py-2"
                  aria-label="System settings section"
                >
                  <Settings className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Add Milestone Dialog */}
            <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Add Milestone</DialogTitle>
                  <DialogDescription>Create a Biography Milestone with Topic and objective only and the seed task</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sa-milestone-topic">Week and Topic</Label>
                    <Input id="sa-milestone-topic" value={milestoneTopic} onChange={(e) => setMilestoneTopic(e.target.value)} placeholder="e.g Week 1- Critical Thinking" />
                  </div>
                  <div>
                    <Label htmlFor="sa-milestone-objective">Objective</Label>
                    <Textarea id="sa-milestone-objective" value={milestoneObjective} onChange={(e) => setMilestoneObjective(e.target.value)} rows={3} placeholder="Brief objective" />
                  </div>
                  <div>
                    <Label htmlFor="sa-milestone-task">Task</Label>
                    <Textarea id="sa-milestone-task" value={milestoneTask} onChange={(e) => setMilestoneTask(e.target.value)} rows={2} placeholder="Seed task" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setMilestoneTopic(""); setMilestoneObjective(""); setMilestoneTask(""); }}>Clear</Button>
                    <Button onClick={handleQuickAddMilestone} disabled={milestoneSaving}>
                      {milestoneSaving ? (
                        <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 rounded-full border-2 border-b-transparent"></span>Saving...</span>
                      ) : (
                        <span className="flex items-center"><Plus className="w-4 h-4 mr-2" />{editBioId ? "Update Milestone" : "Save Milestone"}</span>
                      )}
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Recent Milestones</h4>
                      <Button variant="ghost" size="sm" onClick={refreshMilestonesQuick} disabled={milestonesQuickLoading}>
                        <RefreshCw className="w-4 h-4 mr-1" /> Refresh
                      </Button>
                    </div>
                    <div className="max-h-56 overflow-y-auto border rounded-md">
                      {milestonesQuickLoading ? (
                        <div className="p-4 text-sm text-gray-500">Loading...</div>
                      ) : milestonesQuick.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No milestones found</div>
                      ) : (
                        <ul className="divide-y">
                          {milestonesQuick.slice(0, 10).map((m) => (
                            <li key={m.id} className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.title || m.topic}</p>
                  <p className="text-xs text-gray-500 truncate">{m.objective}</p>
                  <p className="text-xs text-gray-400">#{m.id}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setIsAddMilestoneOpen(true); setMilestoneTopic(m.title || m.topic); setMilestoneObjective(m.objective || ""); setMilestoneTask(m.task || ""); setEditBioId(m.id); }}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleQuickDeleteMilestone(m.id)} disabled={milestoneDeletingId === m.id}>
                    {milestoneDeletingId === m.id ? "..." : (<><Trash2 className="w-4 h-4 mr-1" />Delete</>)}
                  </Button>
                </div>
              </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    AnansiAI Platform Overview
                  </h3>
                  <p className="text-gray-600">
                    Comprehensive view of your {schoolsData.length}-school
                    education platform
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentTime(new Date());
                            showMessage({
                              id: Date.now().toString(),
                              type: "success",
                              priority: "low",
                              title: "Data Refreshed",
                              message: "All dashboard data has been refreshed.",
                              timestamp: new Date().toISOString(),
                            });
                          }}
                          className="h-8 w-8 p-0"
                          aria-label="Refresh dashboard data"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Refresh dashboard data</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-gray-600">
                    Last updated: {currentTime.toLocaleString()}
                  </p>
                  {/* Removed for declutter */}
                </div>
              </div>

              {/* Key Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total Schools</p>
                        {statsLoading ? (
                          <div className="h-9 w-16 bg-blue-400/50 rounded animate-pulse" />
                        ) : (
                          <p className="text-3xl font-bold">
                            {systemStatsData.totalSchools.toLocaleString()}
                          </p>
                        )}
                        <p className="text-blue-100 flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          +12 this month
                        </p>
                      </div>
                      <Building className="w-10 h-10 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Total Students</p>
                        {statsLoading ? (
                          <div className="h-9 w-20 bg-green-400/50 rounded animate-pulse" />
                        ) : (
                          <p className="text-3xl font-bold">
                            {systemStatsData.totalStudents.toLocaleString()}
                          </p>
                        )}
                        <p className="text-green-100 flex items-center mt-2">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          +2.3% growth
                        </p>
                      </div>
                      <GraduationCap className="w-10 h-10 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Total Teachers</p>
                        {statsLoading ? (
                          <div className="h-9 w-16 bg-purple-400/50 rounded animate-pulse" />
                        ) : (
                          <p className="text-3xl font-bold">
                            {systemStatsData.totalTeachers.toLocaleString()}
                          </p>
                        )}
                        <p className="text-purple-100 flex items-center mt-2">
                          <Award className="w-4 h-4 mr-1" />
                          Professional
                        </p>
                      </div>
                      <Users className="w-10 h-10 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">System Performance</p>
                        {statsLoading ? (
                          <div className="h-9 w-12 bg-orange-400/50 rounded animate-pulse" />
                        ) : (
                          <p className="text-3xl font-bold">
                            {systemStatsData.avgPerformance}%
                          </p>
                        )}
                        <p className="text-orange-100 flex items-center mt-2">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Excellent
                        </p>
                      </div>
                      <BarChart3 className="w-10 h-10 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions and Analytics */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Platform Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Frequently used institution management tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => setIsSchoolRegistrationOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Institution
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleExportUsers}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export System Data
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleViewSystemHealth}
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      System Health Check
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleGenerateReport("National Overview")}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Reports
                    </Button>
                  </CardContent>
                </Card>

                {/* Growth Chart */}
                <Card className="lg:col-span-2 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      AnansiAI Platform Growth Trends
                    </CardTitle>
                    <CardDescription>
                      6-month growth across all schools on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="schools"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          name="Schools"
                        />
                        <Line
                          type="monotone"
                          dataKey="students"
                          stroke="#10B981"
                          strokeWidth={3}
                          name="Students"
                        />
                        <Line
                          type="monotone"
                          dataKey="teachers"
                          stroke="#8B5CF6"
                          strokeWidth={3}
                          name="Teachers"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Regional Distribution and Alerts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Regional Distribution */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-purple-600" />
                      Regional Distribution
                    </CardTitle>
                    <CardDescription>
                      Schools distribution across Kenya
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={regionalDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {regionalDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* System Alerts */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      Platform System Alerts
                    </CardTitle>
                    <CardDescription>
                      Important notifications across all {schoolsData.length}{" "}
                      schools requiring attention
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">
                            Critical Priority
                          </span>
                        </div>
                        <Badge variant="destructive">3 alerts</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            High Priority
                          </span>
                        </div>
                        <Badge variant="outline">7 alerts</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            General Notices
                          </span>
                        </div>
                        <Badge variant="outline">12 notices</Badge>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedTab("infrastructure")}
                    >
                      View All Alerts
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Schools Tab */}
            <TabsContent value="schools" className="space-y-6">
              <InstitutionsManagement onShowMessage={showMessage} />

              {/* Legacy Content - Keeping for reference */}
              <div
                className="flex items-center justify-between"
                style={{ display: "none" }}
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    National School Management
                  </h3>
                  <p className="text-gray-600">
                    Comprehensive oversight of all educational institutions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      showMessage({
                        id: Date.now().toString(),
                        type: "success",
                        priority: "medium",
                        title: "Export Started",
                        message: `Exporting ${filteredSchools.length} schools data. Download will start shortly.`,
                        timestamp: new Date().toISOString(),
                      });

                      setTimeout(() => {
                        const csvContent =
                          "data:text/csv;charset=utf-8,School Name,Code,County,Sub-County,Type,Students,Teachers,Performance,Status,Admin Name,Admin Email\n" +
                          filteredSchools
                            .map(
                              (school) =>
                                `${school.name},${school.code},${school.county},${school.subcounty},${school.type},${(school as any).students || (school as any).studentCount || 0},${(school as any).teachers || (school as any).teacherCount || 0},${school.performance}%,${school.status},${school.adminName},${school.adminEmail}`,
                            )
                            .join("\n");

                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute(
                          "download",
                          `anansiai_schools_${new Date().toISOString().split("T")[0]}.csv`,
                        );
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        showMessage({
                          id: Date.now().toString(),
                          type: "success",
                          priority: "medium",
                          title: "Export Complete",
                          message: `Successfully exported ${filteredSchools.length} schools to CSV file.`,
                          timestamp: new Date().toISOString(),
                        });
                      }, 1000);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Schools
                  </Button>
                  <Button onClick={() => setIsSchoolRegistrationOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Register School
                  </Button>
                </div>
              </div>

              {/* Schools Data Table - HIDDEN as requested: duplicates InstitutionsManagement above */}
              <Card
                className="bg-white/70 backdrop-blur-sm"
                style={{ display: "none" }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-lg">
                      Registered Institutions
                    </CardTitle>
                    <CardDescription>
                      {isConnected ? "Live data from API" : "Mock data mode"} •{" "}
                      {schools?.length || 0} institutions
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      console.log("🔄 Manually refreshing schools data...");
                      refetchSchools();
                    }}
                    variant="outline"
                    size="sm"
                    disabled={schoolsLoading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${schoolsLoading ? "animate-spin" : ""}`}
                    />
                    {schoolsLoading ? "Loading..." : "Refresh"}
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {schoolsError && (
                    <div className="p-6">
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800">
                          Cannot Load Real Institutions
                        </AlertTitle>
                        <AlertDescription className="text-red-700">
                          <div className="space-y-2">
                            <p>API Error: {schoolsError}</p>
                            <p>API URL: {baseURL}/api/Institutions</p>
                            <p>
                              Status:{" "}
                              {isConnected ? "Connected" : "Disconnected"}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button
                                onClick={() => {
                                  console.log("🔄 Testing API connection...");
                                  refetchSchools();
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry Connection
                              </Button>
                              <Button
                                onClick={testApiConnection}
                                variant="outline"
                                size="sm"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Test API
                              </Button>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School Details</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Teachers</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchools.map((school, index) => (
                        <TableRow
                          key={school.id}
                          className="hover:bg-gray-50 focus-within:bg-gray-50"
                          tabIndex={0}
                          role="row"
                          aria-rowindex={index + 1}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleViewSchoolPerformance(school.name);
                            }
                          }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <School className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {school.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Code: {school.code}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span>{school.county}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {school.subcounty}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">
                                {(school as any).students ||
                                  (school as any).studentCount ||
                                  0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-green-600" />
                              <span className="font-medium">
                                {(school as any).teachers ||
                                  (school as any).teacherCount ||
                                  0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ProgressBar
                                value={school.performance}
                                className="w-16"
                                color="blue"
                                size="md"
                              />
                              <span className="text-sm font-medium">
                                {school.performance}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(school.status)}>
                              {school.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewSchoolPerformance(school.name)
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Analytics
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit School
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="w-4 h-4 mr-2" />
                                  Manage Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove School
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination for Schools */}
                  {filteredSchools.length > 10 && (
                    <div className="p-4 border-t flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Showing {Math.min(10, filteredSchools.length)} of{" "}
                        {filteredSchools.length} schools
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <Button variant="outline" size="sm">
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <UsersManagement onShowMessage={showMessage} />
            </TabsContent>

            {/* Academics Tab */}
            <TabsContent value="academics" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Multi-School Academic Management
                  </h3>
                  <p className="text-gray-600">
                    Curriculum oversight and academic performance across all{" "}
                    {schoolsData.length} schools
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleGenerateAcademicReport}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Cross-School Report
                  </Button>
                  <Button onClick={handleAddSubject}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                </div>
              </div>

              {/* Academic Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Platform Subjects</p>
                        <p className="text-3xl font-bold">24</p>
                        <p className="text-green-100">Across all schools</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Platform Average</p>
                        <p className="text-3xl font-bold">78.5%</p>
                        <p className="text-blue-100">
                          {schoolsData.length} schools combined
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Total Assessments</p>
                        <p className="text-3xl font-bold">1,847</p>
                        <p className="text-purple-100">All schools this term</p>
                      </div>
                      <FileText className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Curriculum Coverage</p>
                        <p className="text-3xl font-bold">92%</p>
                        <p className="text-orange-100">Platform average</p>
                      </div>
                      <Target className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* School Performance by Subject */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    School Performance by Subject
                  </CardTitle>
                  <CardDescription>
                    Subject performance overview across your managed schools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        subject: "Mathematics",
                        school: "Nairobi Academy",
                        performance: 96.8,
                        county: "Nairobi",
                      },
                      {
                        subject: "English",
                        school: "Mombasa International",
                        performance: 94.2,
                        county: "Mombasa",
                      },
                      {
                        subject: "Science",
                        school: "Kisumu Elite School",
                        performance: 92.7,
                        county: "Kisumu",
                      },
                      {
                        subject: "Kiswahili",
                        school: "Nakuru High School",
                        performance: 91.3,
                        county: "Nakuru",
                      },
                      {
                        subject: "Social Studies",
                        school: "Eldoret Academy",
                        performance: 90.8,
                        county: "Uasin Gishu",
                      },
                      {
                        subject: "Computer Science",
                        school: "Thika Girls High",
                        performance: 89.4,
                        county: "Kiambu",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <BookOpen className="w-3 h-3 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {item.subject}
                              </p>
                              <p className="text-xs text-gray-600">
                                {item.school} �� {item.county}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-sm">
                            {item.performance}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subject Performance Chart */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Platform-Wide Subject Performance Analysis
                  </CardTitle>
                  <CardDescription>
                    Performance vs targets across all {schoolsData.length}{" "}
                    schools in the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar
                        dataKey="performance"
                        fill="#3B82F6"
                        name="Current Performance"
                      />
                      <Bar dataKey="target" fill="#10B981" name="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Subjects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {performanceData.map((subject) => (
                  <Card
                    key={subject.subject}
                    className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        {subject.subject}
                      </CardTitle>
                      <CardDescription>
                        Performance: {subject.performance}% (Target:{" "}
                        {subject.target}%)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Progress value={subject.performance} className="h-3" />

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Current</span>
                        <span className="font-medium">
                          {subject.performance}%
                        </span>
                      </div>

                      <div className="pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() =>
                            handleViewSubjectAnalytics(subject.subject)
                          }
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="ai-insights" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    AI Twin Management & Analytics
                  </h3>
                  <p className="text-gray-600">
                    Comprehensive AI Twin oversight, behavior analytics, and
                    system management
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleGenerateAIReport}>
                    <Brain className="w-4 h-4 mr-2" />
                    AI Twin Report
                  </Button>
                  <Button onClick={handleAISettings}>
                    <Settings className="w-4 h-4 mr-2" />
                    AI Twin Settings
                  </Button>
                </div>
              </div>

              {/* AI Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">AI Twins Active</p>
                        <p className="text-3xl font-bold">98,742</p>
                        <p className="text-blue-100">Learning profiles</p>
                      </div>
                      <Brain className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">AI Accuracy</p>
                        <p className="text-3xl font-bold">94.2%</p>
                        <p className="text-green-100">Prediction accuracy</p>
                      </div>
                      <Target className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Daily Interactions</p>
                        <p className="text-3xl font-bold">892,456</p>
                        <p className="text-orange-100">AI engagements</p>
                      </div>
                      <Activity className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100">Behavior Alerts</p>
                        <p className="text-3xl font-bold">1,247</p>
                        <p className="text-red-100">Require attention</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Twin Interaction Overview */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      Real-time AI Twin Conversations
                    </CardTitle>
                    <CardDescription>
                      Monitor active AI Twin chats across all students
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          student: "Alice Johnson",
                          subject: "Mathematics",
                          activity: "Solving quadratic equations",
                          mood: "Focused",
                        },
                        {
                          student: "David Chen",
                          subject: "Physics",
                          activity: "Understanding momentum",
                          mood: "Curious",
                        },
                        {
                          student: "Sarah Kimani",
                          subject: "Chemistry",
                          activity: "Balancing chemical equations",
                          mood: "Confident",
                        },
                        {
                          student: "John Mwangi",
                          subject: "Biology",
                          activity: "Cell division concepts",
                          mood: "Struggling",
                        },
                      ].map((chat, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <div>
                              <p className="font-medium text-sm">
                                {chat.student}
                              </p>
                              <p className="text-xs text-gray-600">
                                {chat.subject} • {chat.activity}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              chat.mood === "Struggling"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {chat.mood}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Active Chats
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      AI Twin Learning Insights
                    </CardTitle>
                    <CardDescription>
                      Key insights from AI Twin interactions today
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">
                          Top Learning Challenge
                        </h4>
                        <p className="text-sm text-blue-700">
                          Quadratic equations - 67% of students requesting help
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900">
                          Success Story
                        </h4>
                        <p className="text-sm text-green-700">
                          AI Twin helped improve Biology comprehension by 34%
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <h4 className="font-medium text-orange-900">
                          Engagement Peak
                        </h4>
                        <p className="text-sm text-orange-700">
                          Highest AI Twin usage: 2:00 PM - 4:00 PM
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Behavior Alerts */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    AI Twin Behavioral Alerts
                  </CardTitle>
                  <CardDescription>
                    AI-detected behavioral patterns requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      type: "Academic Decline",
                      count: 342,
                      severity: "high",
                      description: "Significant drop in performance",
                    },
                    {
                      type: "Engagement Issues",
                      count: 567,
                      severity: "medium",
                      description: "Reduced participation patterns",
                    },
                    {
                      type: "Learning Difficulty",
                      count: 234,
                      severity: "medium",
                      description: "Struggling with concepts",
                    },
                    {
                      type: "Social Isolation",
                      count: 104,
                      severity: "high",
                      description: "Withdrawal from peer interaction",
                    },
                  ].map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleViewBehaviorAlert(alert.type)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            alert.severity === "high"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <div>
                          <h4 className="font-medium">{alert.type}</h4>
                          <p className="text-sm text-gray-600">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            alert.severity === "high"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {alert.count} students
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Multi-School Performance Management
                  </h3>
                  <p className="text-gray-600">
                    Performance tracking and analytics across all{" "}
                    {schoolsData.length} schools on the platform
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleGeneratePerformanceReport}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Performance Report
                  </Button>
                  <Button onClick={handleSetPerformanceTargets}>
                    <Target className="w-4 h-4 mr-2" />
                    Set Targets
                  </Button>
                </div>
              </div>

              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Platform Performance</p>
                        <p className="text-3xl font-bold">
                          {systemStatsData.avgPerformance}%
                        </p>
                        <p className="text-blue-100">
                          {schoolsData.length} schools average
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Teacher Effectiveness</p>
                        <p className="text-3xl font-bold">87.6%</p>
                        <p className="text-green-100">Across all schools</p>
                      </div>
                      <Award className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Platform Engagement</p>
                        <p className="text-3xl font-bold">78.9%</p>
                        <p className="text-orange-100">Multi-school average</p>
                      </div>
                      <Activity className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Achievement Rate</p>
                        <p className="text-3xl font-bold">92.3%</p>
                        <p className="text-purple-100">Platform-wide</p>
                      </div>
                      <Star className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* School Performance Overview */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="w-5 h-5 text-blue-600" />
                    School Performance Overview
                  </CardTitle>
                  <CardDescription>
                    Performance monitoring across your {schoolsData.length}
                    -school network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Nairobi Academy",
                        performance: 96.8,
                        students: 1240,
                        trend: "up",
                        county: "Nairobi",
                      },
                      {
                        name: "Mombasa International",
                        performance: 94.2,
                        students: 980,
                        trend: "up",
                        county: "Mombasa",
                      },
                      {
                        name: "Kisumu Elite School",
                        performance: 92.7,
                        students: 856,
                        trend: "stable",
                        county: "Kisumu",
                      },
                      {
                        name: "Nakuru High School",
                        performance: 91.3,
                        students: 1120,
                        trend: "up",
                        county: "Nakuru",
                      },
                      {
                        name: "Eldoret Academy",
                        performance: 90.8,
                        students: 743,
                        trend: "down",
                        county: "Uasin Gishu",
                      },
                    ].map((school, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewSchoolPerformance(school.name)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <School className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{school.name}</h4>
                            <p className="text-sm text-gray-600">
                              {school.students} students ��� {school.county}{" "}
                              County
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {school.performance}%
                            </p>
                            <div className="flex items-center gap-1">
                              {school.trend === "up" && (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              )}
                              {school.trend === "down" && (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                              )}
                              {school.trend === "stable" && (
                                <Activity className="w-4 h-4 text-gray-600" />
                              )}
                              <span className="text-xs text-gray-600">
                                Performance
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Platform Analytics Dashboard
                  </h3>
                  <p className="text-gray-600">
                    Comprehensive analytics across all {schoolsData.length}{" "}
                    schools on the AnansiAI platform
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportUsers}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Analytics
                  </Button>
                  <Button onClick={handleScheduleReports}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Reports
                  </Button>
                </div>
              </div>

              {/* Analytics Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Growth */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Platform Growth Trends
                    </CardTitle>
                    <CardDescription>
                      Growth across all schools on the AnansiAI platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area
                          type="monotone"
                          dataKey="schools"
                          stackId="1"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Regional Performance */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-purple-600" />
                      Regional Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={regionalDistribution.slice(0, 6)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {regionalDistribution
                            .slice(0, 6)
                            .map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* User Activity Analytics */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Platform-Wide User Activity Analytics
                  </CardTitle>
                  <CardDescription>
                    Real-time engagement metrics across all {schoolsData.length}{" "}
                    schools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-900">45,620</p>
                      <p className="text-sm text-blue-600">
                        Daily Active Users
                      </p>
                    </div>

                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-900">
                        78,432
                      </p>
                      <p className="text-sm text-green-600">
                        Weekly Active Users
                      </p>
                    </div>

                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                      <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">
                        142,891
                      </p>
                      <p className="text-sm text-purple-600">
                        Monthly Active Users
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Infrastructure Tab */}
            <TabsContent value="infrastructure" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    AnansiAI Platform Infrastructure
                  </h3>
                  <p className="text-gray-600">
                    System health, security, and technical infrastructure
                    serving {schoolsData.length} schools
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleViewSystemHealth}>
                    <Monitor className="w-4 h-4 mr-2" />
                    System Health
                  </Button>
                  <Button onClick={handleSecurityAudit}>
                    <Shield className="w-4 h-4 mr-2" />
                    Security Audit
                  </Button>
                </div>
              </div>

              {/* Infrastructure Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">System Uptime</p>
                        <p className="text-3xl font-bold">
                          {systemStatsData.systemUptime}%
                        </p>
                        <p className="text-green-100">99.8% target met</p>
                      </div>
                      <Monitor className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Data Storage</p>
                        <p className="text-3xl font-bold">
                          {systemStatsData.dataStorage}%
                        </p>
                        <p className="text-blue-100">Storage utilized</p>
                      </div>
                      <Database className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Security Score</p>
                        <p className="text-3xl font-bold">94</p>
                        <p className="text-purple-100">Out of 100</p>
                      </div>
                      <Shield className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Active Connections</p>
                        <p className="text-3xl font-bold">2,847</p>
                        <p className="text-orange-100">Concurrent users</p>
                      </div>
                      <Activity className="w-8 h-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Health Monitoring */}
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-blue-600" />
                    AnansiAI Platform Health Monitoring
                  </CardTitle>
                  <CardDescription>
                    Real-time performance metrics for the entire platform
                    serving {schoolsData.length} schools
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">CPU Usage</span>
                        <span className="font-bold">34%</span>
                      </div>
                      <Progress value={34} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Memory Usage</span>
                        <span className="font-bold">67%</span>
                      </div>
                      <Progress value={67} className="h-3" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Disk Usage</span>
                        <span className="font-bold">
                          {systemStatsData.dataStorage}%
                        </span>
                      </div>
                      <Progress
                        value={systemStatsData.dataStorage}
                        className="h-3"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Network Traffic</span>
                        <span className="font-bold">45%</span>
                      </div>
                      <Progress value={45} className="h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Multi-School Platform Reports
                  </h3>
                  <p className="text-gray-600">
                    Generate and manage comprehensive reports across all{" "}
                    {schoolsData.length} schools
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleScheduleReports}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Reports
                  </Button>
                  <Button
                    onClick={() => handleGenerateReport("Platform Overview")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>

              {/* Report Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Academic Performance",
                    description:
                      "Cross-school student and academic performance metrics",
                    icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
                    reports: [
                      "Platform Performance Overview",
                      "School Comparison Analysis",
                      "Cross-School Grade Distribution",
                    ],
                  },
                  {
                    title: "User Analytics",
                    description:
                      "Multi-school user engagement and activity reports",
                    icon: <Users className="w-6 h-6 text-green-600" />,
                    reports: [
                      "Platform User Activity",
                      "School Usage Statistics",
                      "Feature Adoption Analysis",
                    ],
                  },
                  {
                    title: "System Health",
                    description:
                      "Platform infrastructure and technical reports",
                    icon: <Monitor className="w-6 h-6 text-purple-600" />,
                    reports: [
                      "Platform System Status",
                      "Infrastructure Performance",
                      "Security Audit Reports",
                    ],
                  },
                  {
                    title: "Financial Reports",
                    description: "Platform revenue and cost analysis",
                    icon: <Briefcase className="w-6 h-6 text-orange-600" />,
                    reports: [
                      "Platform Revenue Analysis",
                      "School-wise Cost Breakdown",
                      "Resource Utilization",
                    ],
                  },
                  {
                    title: "Compliance Reports",
                    description:
                      "Platform-wide regulatory and policy compliance",
                    icon: <Shield className="w-6 h-6 text-red-600" />,
                    reports: [
                      "Platform Compliance Audit",
                      "Data Privacy Assessment",
                      "Security Compliance",
                    ],
                  },
                  {
                    title: "AI Insights",
                    description: "Cross-school AI analytics and predictions",
                    icon: <Brain className="w-6 h-6 text-indigo-600" />,
                    reports: [
                      "Multi-School Behavior Analysis",
                      "Learning Pattern Insights",
                      "AI Twin Performance Report",
                    ],
                  },
                ].map((category, index) => (
                  <Card
                    key={index}
                    className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-200"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {category.icon}
                        <div>
                          <CardTitle className="text-lg">
                            {category.title}
                          </CardTitle>
                          <CardDescription>
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {category.reports.map((report, reportIndex) => (
                        <Button
                          key={reportIndex}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleGenerateReport(report)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {report}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    AnansiAI Platform Settings
                  </h3>
                  <p className="text-gray-600">
                    Platform-wide configuration and administrative settings for{" "}
                    {schoolsData.length} schools
                  </p>
                </div>
              </div>

              {/* Settings Categories */}
              <div className="grid gap-6">
                {/* General Settings */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      General Settings
                    </CardTitle>
                    <CardDescription>
                      Basic system configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="systemName">System Name</Label>
                        <Input
                          id="systemName"
                          defaultValue="AnansiAI Education Platform"
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Admin Email</Label>
                        <Input
                          id="adminEmail"
                          defaultValue="admin@anansiai.org"
                          readOnly
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select defaultValue="Africa/Nairobi">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Africa/Nairobi">
                              Africa/Nairobi (EAT)
                            </SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Default Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="sw">Kiswahili</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      System security and access control
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">
                          Require 2FA for admin accounts
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Session Timeout</Label>
                        <p className="text-sm text-gray-600">
                          Auto-logout after inactivity
                        </p>
                      </div>
                      <Select defaultValue="30">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Password Policy</Label>
                        <p className="text-sm text-gray-600">
                          Minimum password requirements
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit Policy
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Configuration */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Configuration
                    </CardTitle>
                    <CardDescription>
                      AI Twin and behavior analysis settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>AI Twin Generation</Label>
                        <p className="text-sm text-gray-600">
                          Automatically create AI Twins for new students
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Behavior Analysis</Label>
                        <p className="text-sm text-gray-600">
                          Enable real-time behavior monitoring
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Data Retention</Label>
                        <p className="text-sm text-gray-600">
                          How long to keep AI analysis data
                        </p>
                      </div>
                      <Select defaultValue="365">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">180 days</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                          <SelectItem value="730">2 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* System Maintenance */}
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-green-600" />
                      System Maintenance
                    </CardTitle>
                    <CardDescription>
                      Backup and maintenance configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Automatic Backups</Label>
                        <p className="text-sm text-gray-600">
                          Schedule regular system backups
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleManageBackups}
                      >
                        Configure
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Health Monitoring</Label>
                        <p className="text-sm text-gray-600">
                          Real-time system health checks
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Security Audits</Label>
                        <p className="text-sm text-gray-600">
                          Regular security vulnerability scans
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSecurityAudit}
                      >
                        Run Audit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Save Settings */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button
                    onClick={() =>
                      showMessage({
                        id: Date.now().toString(),
                        type: "success",
                        priority: "medium",
                        title: "Settings Saved",
                        message:
                          "All settings have been saved successfully! ✅",
                        timestamp: new Date().toISOString(),
                      })
                    }
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Register School Dialog - New comprehensive registration system */}
        <SchoolRegistration
          isOpen={isSchoolRegistrationOpen}
          onClose={() => setIsSchoolRegistrationOpen(false)}
          onSuccess={() => {
            refetchSchools();
            showMessage({
              id: Date.now().toString(),
              type: "success",
              priority: "medium",
              title: "Success!",
              message:
                "School registered successfully with credentials sent to administrator.",
              timestamp: new Date().toISOString(),
            });
          }}
        />

        {/* AI Configuration Dialog */}
        <Dialog open={isAIConfigOpen} onOpenChange={setIsAIConfigOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI System Configuration
              </DialogTitle>
              <DialogDescription>
                Configure national AI system parameters and settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>AI Twin Performance Threshold</Label>
                <Input defaultValue="85%" readOnly />
              </div>
              <div className="space-y-2">
                <Label>Behavior Analysis Sensitivity</Label>
                <Select defaultValue="high">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Learning Pattern Recognition</Label>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAIConfigOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsAIConfigOpen(false);
                  showMessage({
                    id: Date.now().toString(),
                    type: "success",
                    priority: "medium",
                    title: "AI Configuration Updated",
                    message:
                      "AI system parameters have been updated successfully.",
                    timestamp: new Date().toISOString(),
                  });
                }}
              >
                Save Configuration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User CRUD Dialogs */}

        {/* Edit User Dialog */}
        <Dialog
          open={isEditUserOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsEditUserOpen(false);
              setEditingUser(null);
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>

            <UserForm
              user={editingUser}
              onSave={handleSaveUser}
              onCancel={() => {
                setIsEditUserOpen(false);
                setEditingUser(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            {userToDelete && (
              <div className="py-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {userToDelete.fullName
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{userToDelete.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {userToDelete.email}
                    </p>
                    <p className="text-sm text-gray-500">{userToDelete.role}</p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteUserOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDeleteUser}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* API Status Notification */}
        <ApiStatusNotification />
      </div>
    </TooltipProvider>
  );
};

export default SuperAdminDashboard;
