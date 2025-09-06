import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  CheckCircle,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Target,
  Users,
  MessageSquare,
  BarChart3,
  Star,
  GraduationCap,
  Activity,
  AlertTriangle,
  Lightbulb,
  Smile,
  Heart,
  Zap,
  Filter,
  Search,
    RefreshCw,
  Plus,
  Eye,
  StopCircle,
  Timer,
  Pause,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/services/axiosClient";
import { AssignmentForDashboard } from "@/services/assignmentService";
import {
  educationService,
  Course,
  Subject,
  Lesson,
} from "@/services/educationService";
import {
  lessonSessionService,
  LessonSession as APILessonSession,
  LessonSessionRequest,
  EndLessonSessionRequest,
} from "@/services/lessonSessionService";
import { authService } from "@/services/authService";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "/anansiai";

// Lesson timing interfaces
interface LessonSession {
  lessonId: number;
  startTime: Date;
  pausedTime?: number; // Total paused time in ms
  isPaused: boolean;
  subject: string;
  lessonTitle: string;
  // API session tracking
  apiSessionId?: number;
  apiSession?: APILessonSession;
}

interface LessonStats {
  totalTime: number; // in seconds
  pausedTime: number; // in seconds
  effectiveTime: number; // total - paused
}

// Import AI components directly
import { Suspense, lazy } from "react";
import BehaviorAnalytics from "@/components/BehaviorAnalytics";

const LazyAITwinChat = lazy(() =>
  import("@/components/AITwinChat").catch(() => ({
    default: () => (
      <div className="p-4 text-center">
        <Brain className="w-8 h-8 mx-auto mb-2 text-blue-600" />
        <p className="text-gray-600">AI Twin Chat temporarily unavailable</p>
      </div>
    ),
  })),
);

const LazyStudentProfileManager = lazy(() =>
  import("@/components/StudentProfileManager").catch(() => ({
    default: () => (
      <div className="p-8 text-center">
        <div className="max-w-md mx-auto">
          <Settings className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Profile Manager
          </h3>
          <p className="text-gray-600 mb-6">
            The advanced profile manager is temporarily unavailable. Basic
            profile information is shown below.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 text-left">
            <h4 className="font-medium text-gray-900 mb-3">Current Profile</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Name:</span> {studentDisplayName}
              </div>
              <div>
                <span className="font-medium">Student ID:</span> STU001
              </div>
              <div>
                <span className="font-medium">Grade:</span> 10th Grade
              </div>
              <div>
                <span className="font-medium">Learning Style:</span> Visual
              </div>
              <div>
                <span className="font-medium">Current Mood:</span> Focused
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2">
                Privacy Settings
              </h5>
              <div className="text-sm text-gray-600">
                <div>✓ Behavior tracking enabled</div>
                <div>✓ AI personalization active</div>
                <div>✓ Educational data sharing only</div>
              </div>
            </div>
          </div>

          <Button className="mt-6" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    ),
  })),
);

// Import comprehensive types
import {
  StudentProfile,
  Level,
  Assignment,
  Submission,
  BehaviorLog,
  Mood,
  LearningStyle,
  LearningModality,
} from "@/types/education";

interface DashboardCourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  recentGrade?: number;
  aiRecommended: boolean;
  subject: {
    subjectId: number;
    name: string;
    description: string;
  };
  upcomingAssignments: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    status: string;
  }>;
}

interface DashboardCourseDetailed extends DashboardCourse {
  nextLesson?: Lesson;
  completedLessons: number;
  upcomingAssignments: Assignment[];
  recentGrade?: number;
  aiRecommended?: boolean;
}

// Backend DTO interfaces to match API responses
interface StudentDashboardData {
  courses?: DashboardCourse[];
  profile: {
    id: string;
    appUserId: string;
    personalityTraits: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    learningPreferences: {
      preferredStyle: string;
      preferredModalities: string[];
      difficultyPreference: string;
      pacePreference: string;
      feedbackFrequency: string;
    };
    emotionalState: {
      currentMood: string;
      stressLevel: number;
      confidenceLevel: number;
      motivationLevel: number;
      lastUpdated: string;
    };
    aiPersonalityAnalysis: {
      dominantTraits: string[];
      learningArchetype: string;
      strengthAreas: string[];
      growthAreas: string[];
      recommendedActivities: string[];
      confidenceScore: number;
      lastAnalysis: string;
    };
    privacySettings: {
      shareLearningData: boolean;
      shareBehaviorAnalytics: boolean;
      allowPersonalization: boolean;
      showInLeaderboards: boolean;
      dataRetentionPreference: string;
    };
  };
  enrolledCourses: Array<{
    id: string;
    title: string;
    instructor: string;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    recentGrade?: number;
    aiRecommended: boolean;
    subject: {
      subjectId: number;
      name: string;
      description: string;
    };
    upcomingAssignments: Array<{
      id: string;
      title: string;
      dueDate: string;
      priority: string;
      status: string;
    }>;
  }>;
  behaviorSummary: {
    currentMood: string;
    riskLevel: string;
    engagementScore: number;
    focusScore: number;
    recentActivities: string[];
    lastActivity: string;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    earnedDate: string;
    iconUrl: string;
    isNew: boolean;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    priority: string;
  }>;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // State declarations first
  const [showNotifications, setShowNotifications] = useState(false);
  const [dashboardData, setDashboardData] =
    useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [studentProfileLoading, setStudentProfileLoading] = useState(true);

  // Helper function to build courses from student-subjects data
  const buildCoursesFromStudentSubjects = (studentSubjectsData: any[]): Course[] => {
    return studentSubjectsData.map((studentSubject) => {
      const subjectName = studentSubject.subjectName || studentSubject.name || 'Unknown Subject';
      const lessons = studentSubject.lessons || [];

      const completedLessons = lessons.filter((lesson: any) => lesson.isCompleted).length;
      const totalDuration = lessons.reduce((sum: number, lesson: any) => sum + (lesson.duration || 45), 0);

      const difficulty = lessons.some((l: any) => l.difficulty === 'advanced') ? 'advanced' as const :
                        lessons.some((l: any) => l.difficulty === 'intermediate') ? 'intermediate' as const :
                        'beginner' as const;

      return {
        id: `course_${studentSubject.subjectId || studentSubject.id}`,
        title: subjectName,
        subject: {
          id: studentSubject.subjectId || studentSubject.id,
          name: subjectName,
          description: studentSubject.description || '',
          isActive: true
        },
        lessons: lessons.map((lesson: any) => ({
          id: lesson.lessonId || lesson.id,
          subjectId: lesson.subjectId || studentSubject.subjectId || studentSubject.id,
          title: lesson.title || 'Untitled Lesson',
          description: lesson.content || lesson.description || '',
          content: lesson.content || '',
          duration: lesson.duration || 45,
          difficulty: lesson.difficulty || 'intermediate' as const,
          isCompleted: lesson.isCompleted || false,
          order: lesson.order || 1,
          type: 'reading' as const
        })),
        totalLessons: lessons.length,
        completedLessons: completedLessons,
        progress: lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0,
        instructor: `${subjectName} Instructor`,
        estimatedDuration: Math.round(totalDuration / 60),
        difficulty,
        enrollmentDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastAccessedDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      };
    });
  };

  // Get student display name from API data
  const getStudentDisplayName = () => {
    // Check if we have student profile data from the API
    if (studentProfile) {
      const firstName = studentProfile.firstName || '';
      const lastName = studentProfile.lastName || '';
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      } else if (studentProfile.email) {
        return studentProfile.email.split('@')[0]; // Use email username as fallback
      }
    }

    // Check if we have student profile data from the dashboard API
    if (dashboardData?.profile?.id) {
      return `Student ${dashboardData.profile.id}`;
    }

    // Final fallback to generic student name
    return "Student";
  };

  const studentDisplayName = getStudentDisplayName();

  // New state for enhanced functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    progress: "all", // all, completed, in-progress, not-started
    subject: "all", // all, math, science, english, etc.
    difficulty: "all", // all, beginner, intermediate, advanced
  });
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseAnalyticsOpen, setCourseAnalyticsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [notificationDetailOpen, setNotificationDetailOpen] = useState(false);
  const [realAssignments, setRealAssignments] = useState<
    AssignmentForDashboard[]
  >([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [educationLoading, setEducationLoading] = useState(false);
    const [lessonsApiError, setLessonsApiError] = useState<string | null>(null);
  const [lessonSessionError, setLessonSessionError] = useState<string | null>(null);

  // Lesson timing state
  const [activeLessonSession, setActiveLessonSession] = useState<LessonSession | null>(null);
  const [lessonTimer, setLessonTimer] = useState<number>(0); // seconds since start
  const [pauseStartTime, setPauseStartTime] = useState<Date | null>(null);

    // Auto-clear action feedback after 3 seconds
  useEffect(() => {
    if (lastAction) {
      const timer = setTimeout(() => setLastAction(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastAction]);

  // Lesson timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (activeLessonSession && !activeLessonSession.isPaused) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - activeLessonSession.startTime.getTime()) / 1000);
        const pausedTime = activeLessonSession.pausedTime || 0;
        setLessonTimer(elapsed - Math.floor(pausedTime / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeLessonSession]);

  // Behavior tracking effects
  useEffect(() => {
    if (!activeLessonSession?.apiSessionId) return;

    let idleTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    // Track user activity
    const resetIdleTimer = () => {
      lastActivity = Date.now();
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (activeLessonSession?.apiSessionId) {
          lessonSessionService.logUserActivity(
            activeLessonSession.lessonId,
            activeLessonSession.apiSessionId,
            "student_001", // TODO: Get from auth context
            1, // TODO: Get from auth context
            "idle",
            "User has been idle for 30 seconds"
          );
        }
      }, 30000); // 30 seconds idle time
    };

    // Track focus loss
    const handleVisibilityChange = () => {
      if (document.hidden && activeLessonSession?.apiSessionId) {
        lessonSessionService.logUserActivity(
          activeLessonSession.lessonId,
          activeLessonSession.apiSessionId,
          "student_001", // TODO: Get from auth context
          1, // TODO: Get from auth context
          "focus_loss",
          "User switched away from the application"
        );
      }
    };

    // Track tab switching
    const handleBeforeUnload = () => {
      if (activeLessonSession?.apiSessionId) {
        lessonSessionService.logUserActivity(
          activeLessonSession.lessonId,
          activeLessonSession.apiSessionId,
          "student_001", // TODO: Get from auth context
          1, // TODO: Get from auth context
          "tab_switch",
          "User is leaving the lesson page"
        );
      }
    };

    // Activity event listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    // Focus/visibility event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Initialize idle timer
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeLessonSession?.apiSessionId]);

  // Lesson timing functions
  const startLesson = async (lesson: any, subject: Subject | undefined) => {
    try {
      // Start API session
      const sessionRequest: LessonSessionRequest = {
        lessonId: lesson.id,
        studentId: "student_001", // TODO: Get from auth context
        institutionId: 1, // TODO: Get from auth context
      };

      const apiResponse = await lessonSessionService.startLessonSession(sessionRequest);

      if (!apiResponse.success) {
        console.error("Failed to start lesson session:", apiResponse.error);
        setLessonSessionError(apiResponse.error || "Failed to start lesson session");
        setLastAction(`Error starting lesson: ${apiResponse.error}`);
        return;
      }

      // Clear any previous errors
      setLessonSessionError(null);

      const newSession: LessonSession = {
        lessonId: lesson.id,
        startTime: new Date(),
        pausedTime: 0,
        isPaused: false,
        subject: subject?.name || "Unknown Subject",
        lessonTitle: lesson.title,
        apiSessionId: apiResponse.data.lessonSessionId,
        apiSession: apiResponse.data,
      };

      setActiveLessonSession(newSession);
      setLessonTimer(0);
      setLastAction(`Started lesson: ${lesson.title}`);

      // Log lesson start behavior
      if (newSession.apiSessionId) {
        await lessonSessionService.logLessonAction(
          lesson.id,
          newSession.apiSessionId,
          sessionRequest.studentId,
          sessionRequest.institutionId,
          "start",
          `Started lesson: ${lesson.title}`
        );
      }

      // Navigate to lesson content
      navigate("/lesson-content", {
        state: {
          type: "lesson",
          lesson: lesson,
          subject: subject?.name || "Unknown Subject",
          lessonId: lesson.id,
          sessionStartTime: newSession.startTime,
          apiSessionId: newSession.apiSessionId,
        },
      });
    } catch (error) {
      console.error("Failed to start lesson session:", error);
      setLastAction(`Failed to start lesson: ${error}`);
    }
  };

  const pauseLesson = async () => {
    if (activeLessonSession && !activeLessonSession.isPaused) {
      setPauseStartTime(new Date());
      setActiveLessonSession({
        ...activeLessonSession,
        isPaused: true,
      });
      setLastAction(`Paused lesson: ${activeLessonSession.lessonTitle}`);

      // Log pause behavior
      if (activeLessonSession.apiSessionId) {
        await lessonSessionService.logLessonAction(
          activeLessonSession.lessonId,
          activeLessonSession.apiSessionId,
          "student_001", // TODO: Get from auth context
          1, // TODO: Get from auth context
          "pause",
          `Paused lesson: ${activeLessonSession.lessonTitle}`
        );
      }
    }
  };

  const resumeLesson = async () => {
    if (activeLessonSession && activeLessonSession.isPaused && pauseStartTime) {
      const pauseDuration = new Date().getTime() - pauseStartTime.getTime();
      setActiveLessonSession({
        ...activeLessonSession,
        isPaused: false,
        pausedTime: (activeLessonSession.pausedTime || 0) + pauseDuration,
      });
      setPauseStartTime(null);
      setLastAction(`Resumed lesson: ${activeLessonSession.lessonTitle}`);

      // Log resume behavior
      if (activeLessonSession.apiSessionId) {
        await lessonSessionService.logLessonAction(
          activeLessonSession.lessonId,
          activeLessonSession.apiSessionId,
          "student_001", // TODO: Get from auth context
          1, // TODO: Get from auth context
          "resume",
          `Resumed lesson: ${activeLessonSession.lessonTitle}`
        );
      }
    }
  };

  const endLesson = async () => {
    if (activeLessonSession) {
      const endTime = new Date();
      const totalTime = Math.floor((endTime.getTime() - activeLessonSession.startTime.getTime()) / 1000);
      const pausedTime = Math.floor((activeLessonSession.pausedTime || 0) / 1000);
      const effectiveTime = totalTime - pausedTime;

      try {
        // End API session
        if (activeLessonSession.apiSessionId) {
          const endRequest: EndLessonSessionRequest = {
            endTime: endTime.toISOString(),
            isActive: false,
          };

          const apiResponse = await lessonSessionService.endLessonSession(
            activeLessonSession.apiSessionId,
            endRequest
          );

          if (!apiResponse.success) {
            console.error("Failed to end lesson session:", apiResponse.error);
          }

          // Log lesson end behavior
          await lessonSessionService.logLessonAction(
            activeLessonSession.lessonId,
            activeLessonSession.apiSessionId,
            "student_001", // TODO: Get from auth context
            1, // TODO: Get from auth context
            "end",
            `Completed lesson: ${activeLessonSession.lessonTitle} in ${Math.floor(effectiveTime / 60)}m ${effectiveTime % 60}s`
          );
        }

        setLastAction(
          `Completed lesson: ${activeLessonSession.lessonTitle} (${Math.floor(effectiveTime / 60)}m ${effectiveTime % 60}s)`
        );

        console.log("Lesson completed:", {
          lessonId: activeLessonSession.lessonId,
          totalTime,
          pausedTime,
          effectiveTime,
          subject: activeLessonSession.subject,
          apiSessionId: activeLessonSession.apiSessionId,
        });

        setActiveLessonSession(null);
        setLessonTimer(0);
        setPauseStartTime(null);
      } catch (error) {
        console.error("Failed to end lesson session:", error);
        setLastAction(`Error ending lesson: ${error}`);
        // Still clear the local session even if API call fails
        setActiveLessonSession(null);
        setLessonTimer(0);
        setPauseStartTime(null);
      }
    }
  };

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load student profile from API
  const loadStudentProfile = async () => {
    try {
      setStudentProfileLoading(true);
      console.log("🔄 Fetching student profile from API...");

      // REMOVED: Admin-only endpoint that causes 403 errors for students
      // const studentsResponse = await axiosClient.get('/api/Users/students')
      const studentsResponse = { error: 'admin-endpoint-disabled' }
        .then(res => {
          console.log("👤 Students API response:", res.data);
          return res.data;
        })
        .catch(err => {
          console.error("❌ Students API error:", err.message);
          // Check if it's a 403 Forbidden error
          if (err.message.includes('403') || err.message.includes('Forbidden')) {
            console.warn("🔒 Student profile access forbidden - using mock profile");
            return { error: 'forbidden', code: 403 };
          }
          return { error: err.message };
        });

      if (studentsResponse && !studentsResponse.error && Array.isArray(studentsResponse)) {
        // For now, get the first student (in a real app, you'd filter by current user ID)
        const currentStudent = studentsResponse[0];
        if (currentStudent) {
          setStudentProfile(currentStudent);
          console.log("✅ Student profile loaded:", {
            name: `${currentStudent.firstName || ''} ${currentStudent.lastName || ''}`.trim(),
            email: currentStudent.email
          });
          return; // Successfully loaded, exit early
        }
      }

      // If first attempt failed or no students found, try alternative approach
      if (studentsResponse?.code !== 403) {
        console.warn("⚠️ Failed to load student profile:", studentsResponse?.error || 'Invalid response');
        console.log("🔄 Trying alternative student role API...");

        try {
          // REMOVED: Admin-only endpoint that causes 403 errors for students
          // const studentRoleResponse = await axiosClient.get('/api/Users/get-users-by-role?roleName=Student')
          const studentRoleResponse = { error: 'admin-endpoint-disabled' }
            .then(res => {
              console.log("👤 Student role API response:", res.data);
              return res.data;
            })
            .catch(err => {
              console.error("��� Student role API error:", err.message);
              if (err.message.includes('403') || err.message.includes('Forbidden')) {
                console.warn("🔒 Student role access forbidden - using mock profile");
                return { error: 'forbidden', code: 403 };
              }
              return { error: err.message };
            });

          if (studentRoleResponse && !studentRoleResponse.error && Array.isArray(studentRoleResponse)) {
            const currentStudent = studentRoleResponse[0];
            if (currentStudent) {
              setStudentProfile(currentStudent);
              console.log("✅ Student profile loaded via role API:", {
                name: `${currentStudent.firstName || ''} ${currentStudent.lastName || ''}`.trim(),
                email: currentStudent.email
              });
              return; // Successfully loaded, exit early
            }
          }
        } catch (roleError) {
          console.error("❌ Failed to load student via role API:", roleError);
        }
      }

      // If all API attempts failed, use mock profile data
      console.log("���� Using mock student profile due to API restrictions");
      const mockProfile = {
        firstName: "Alex",
        lastName: "Student",
        email: "alex.student@school.edu",
        id: "student_001"
      };
      setStudentProfile(mockProfile);
      console.log("✅ Mock student profile loaded:", {
        name: `${mockProfile.firstName} ${mockProfile.lastName}`,
        email: mockProfile.email
      });

    } catch (error) {
      console.error("❌ Error loading student profile:", error);
      // Fallback to basic mock profile
      setStudentProfile({
        firstName: "Student",
        lastName: "",
        email: "student@school.edu",
        id: "student_default"
      });
    } finally {
      setStudentProfileLoading(false);
    }
  };

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setAssignmentsLoading(true);

        // Ensure user is authenticated before making API calls
        console.log("�� Checking authentication...");
        await authService.ensureAuthenticated();

        // Load student profile first
        await loadStudentProfile();

        // Load educational data (subjects, courses, assignments)
        setEducationLoading(true);

        try {
          // Load educational data directly from API endpoints (teacher-created content)
          console.log("🔄 Fetching student data from consolidated API endpoint...");
          console.log("🔑 Using auth token:", localStorage.getItem('anansi_token') ? 'Present' : 'Missing');

          // Only call the student-scoped endpoint - no admin endpoints
          const studentSubjectsResponse = await axiosClient.get('/api/students/student-subjects')
            .then(res => {
              console.log("🎓 Student subjects with lessons API response:", res.data);
              return res.data;
            })
            .catch(err => {
              console.error("❌ Student subjects API error:", err.message);
              return { error: err.message };
            });

          // Handle assignments (direct API response)
          if (studentSubjectsResponse && !studentSubjectsResponse.error && Array.isArray(studentSubjectsResponse)) {
            // Extract assignments from student-subjects consolidated response
            const allAssignments = [];

            console.log("🔍 Full student-subjects response structure:", JSON.stringify(studentSubjectsResponse, null, 2));

            studentSubjectsResponse.forEach((studentSubject, index) => {
              console.log(`🔍 StudentSubject ${index}:`, studentSubject);
              console.log(`📝 Object keys:`, Object.keys(studentSubject));
              const subjectName = studentSubject.subjectName || studentSubject.name || 'Unknown Subject';

              // Extract assignments from lessons (where they're actually located)
              if (studentSubject.lessons && Array.isArray(studentSubject.lessons)) {
                studentSubject.lessons.forEach((lesson, lessonIndex) => {
                  console.log(`  📚 Lesson ${lessonIndex} keys:`, Object.keys(lesson));

                  if (lesson.assignments && Array.isArray(lesson.assignments)) {
                    console.log(`  ✅ Processing ${lesson.assignments.length} assignments from lesson: ${lesson.title}`);

                    lesson.assignments
                      .filter(assignment => assignment.isActive !== false)
                      .forEach(assignment => {
                        allAssignments.push({
                          id: assignment.assignmentId?.toString() || assignment.id?.toString() || 'unknown',
                          title: assignment.title || 'Untitled Assignment',
                          dueDate: assignment.deadline || new Date().toISOString(),
                          priority: 'medium' as const,
                          status: 'pending' as const,
                          courseTitle: lesson.title || `Lesson ${assignment.lessonId}`,
                          subject: subjectName,
                          description: assignment.content || 'Assignment content'
                        });
                      });
                  }
                });
              }

              // Also check for assignments at subject level (fallback)
              if (studentSubject.assignments && Array.isArray(studentSubject.assignments)) {
                console.log(`✅ Processing ${studentSubject.assignments.length} assignments from subject:`, subjectName);
                studentSubject.assignments
                  .filter(assignment => assignment.isActive !== false)
                  .forEach(assignment => {
                    // Find the corresponding lesson if available
                    let lesson = null;
                    if (studentSubject.lessons && Array.isArray(studentSubject.lessons)) {
                      lesson = studentSubject.lessons.find(l =>
                        l.lessonId === assignment.lessonId || l.id === assignment.lessonId
                      );
                    }

                    allAssignments.push({
                      id: assignment.assignmentId?.toString() || assignment.id?.toString() || 'unknown',
                      title: assignment.title || 'Untitled Assignment',
                      dueDate: assignment.deadline || new Date().toISOString(),
                      priority: 'medium' as const,
                      status: 'pending' as const,
                      courseTitle: lesson?.title || `Lesson ${assignment.lessonId}`,
                      subject: subjectName,
                      description: assignment.content || 'Assignment content'
                    });
                  });
              }
            });

            setRealAssignments(allAssignments);
            console.log("✅ Assignments loaded from student-subjects only:", allAssignments.length);
            console.log("📋 Assignment details:", allAssignments.map(a => ({
              id: a.id,
              title: a.title,
              status: a.status,
              priority: a.priority,
              dueDate: a.dueDate,
              subject: a.subject
            })));
            console.log("🔄 setRealAssignments called with:", allAssignments.length, "assignments from student-subjects endpoint only");

            // Also extract and set subjects from the same response
            const formattedSubjects = studentSubjectsResponse.map(studentSubject => ({
              id: studentSubject.subjectId || studentSubject.id,
              name: studentSubject.subjectName || studentSubject.name || 'Unknown Subject',
              description: studentSubject.description || '',
              isActive: true
            }));
            setSubjects(formattedSubjects);
            console.log("✅ Loaded subjects from student-subjects:", formattedSubjects.length);

            // Extract lessons from the same response
            const allLessons = [];
            studentSubjectsResponse.forEach(studentSubject => {
              if (studentSubject.lessons && Array.isArray(studentSubject.lessons)) {
                studentSubject.lessons
                  .filter(lesson => lesson.isActive !== false)
                  .forEach(lesson => {
                    const subjectName = studentSubject.subjectName || studentSubject.name || 'General Subject';

                    allLessons.push({
                      id: lesson.lessonId || lesson.id,
                      subjectId: lesson.subjectId || studentSubject.subjectId || studentSubject.id,
                      subjectName: subjectName,
                      title: lesson.title || 'Untitled Lesson',
                      description: lesson.content || lesson.description || 'AI-generated content',
                      content: lesson.content || '',
                      duration: lesson.duration || 45,
                      difficulty: 'intermediate' as const,
                      isCompleted: lesson.isCompleted || false,
                      order: lesson.order || 1,
                      type: 'reading' as const
                    });
                  });
              }
            });

            setLessons(allLessons);
            setLessonsApiError(null);
            console.log("✅ Loaded lessons from student-subjects:", allLessons.length);

            // Show success message to student
            if (dashboardAssignments.length > 0) {
              console.log("��� Student can now view teacher-created assignments");

            }
          } else {
            console.warn("⚠️ Failed to load student subjects data for assignments");
          }

          // Subjects are now extracted together with assignments above

          // Lessons are now extracted together with assignments and subjects above

          // Build courses from student-subjects data (no separate API calls needed)
          if (studentSubjectsResponse && !studentSubjectsResponse.error && Array.isArray(studentSubjectsResponse)) {
            const builtCourses = buildCoursesFromStudentSubjects(studentSubjectsResponse);
            setCourses(builtCourses);
            console.log("✅ Built courses from student-subjects data:", builtCourses.length);
          } else {
            console.warn("⚠️ Failed to build courses from student-subjects data");
            setCourses([]);
          }
        } catch (error) {
          console.error("❌ Education data loading error:", error);
        } finally {
          setAssignmentsLoading(false);
          setEducationLoading(false);

          // Summary notification for student
          console.log("🎓 Teacher content loading complete!");

          // Use a timeout to ensure state has been updated
          setTimeout(() => {
            console.log(`📊 Final Summary: assignments loaded, lessons loaded, subjects attempted`);
            console.log("🎯 Final assignment state check will be logged separately after state updates");
          }, 100);
        }

        // Use mock data since student-dashboard endpoint doesn't exist (404)
        console.log("📝 Using mock dashboard data - student-dashboard endpoint not available");
        const mockData: StudentDashboardData = {
          profile: {
            id: "student_001",
            appUserId: "user_001",
            personalityTraits: {
              openness: 0.75,
              conscientiousness: 0.82,
              extraversion: 0.65,
              agreeableness: 0.78,
              neuroticism: 0.35,
            },
            learningPreferences: {
              preferredStyle: "Visual",
              preferredModalities: ["Interactive", "Visual"],
              difficultyPreference: "adaptive",
              pacePreference: "moderate",
              feedbackFrequency: "immediate",
            },
            emotionalState: {
              currentMood: Mood.Focused,
              stressLevel: 0.3,
              confidenceLevel: 0.75,
              motivationLevel: 0.8,
              lastUpdated: new Date().toISOString(),
            },
            aiPersonalityAnalysis: {
              dominantTraits: ["analytical", "creative", "collaborative"],
              learningArchetype: "The Explorer",
              strengthAreas: [
                "problem-solving",
                "visual learning",
                "pattern recognition",
              ],
              growthAreas: ["time management", "verbal communication"],
              recommendedActivities: [
                "Visual learning materials",
                "Interactive problem-solving",
                "Collaborative projects",
                "Regular feedback loops",
              ],
              confidenceScore: 0.85,
              lastAnalysis: new Date().toISOString(),
            },
            privacySettings: {
              shareLearningData: true,
              shareBehaviorAnalytics: false,
              allowPersonalization: true,
              showInLeaderboards: true,
              dataRetentionPreference: "standard",
            },
          },
          enrolledCourses: courses.length > 0 ? courses.map(course => ({
            id: course.id,
            title: course.title,
            instructor: course.instructor,
            progress: course.progress,
            completedLessons: course.completedLessons,
            totalLessons: course.totalLessons,
            recentGrade: undefined,
            aiRecommended: false,
            subject: {
              subjectId: course.subject.id,
              name: course.subject.name,
              description: course.subject.description,
            },
            upcomingAssignments: [], // Use real assignments from API
          })) : [],
          behaviorSummary: {
            currentMood: "Focused",
            riskLevel: "low",
            engagementScore: 0.85,
            focusScore: 0.78,
            recentActivities: [
              "Completed Math Lesson 12",
              "Participated in Biology Discussion",
              "Submitted History Assignment",
            ],
            lastActivity: new Date().toISOString(),
          },
          achievements: [
            {
              id: "ach_001",
              title: "Math Wizard",
              description:
                "Completed 10 consecutive math assignments with 90%+ scores",
              category: "Academic Excellence",
              earnedDate: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              iconUrl: "",
              isNew: false,
            },
            {
              id: "ach_002",
              title: "Study Streak",
              description:
                "Maintained daily study habit for 7 consecutive days",
              category: "Consistency",
              earnedDate: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              iconUrl: "",
              isNew: true,
            },
            {
              id: "ach_003",
              title: "Biology Expert",
              description:
                "Scored above 90% on 5 consecutive biology quizzes",
              category: "Subject Mastery",
              earnedDate: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              iconUrl: "",
              isNew: false,
            },
          ],
          notifications: [
            {
              id: "notif_001",
              type: "ai_insight",
              title: "AI Learning Recommendation",
              message:
                "Based on your recent performance, I recommend focusing on integration techniques in calculus. You're showing great progress!",
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              read: false,
              priority: "medium",
            },
            {
              id: "notif_002",
              type: "assignment",
              title: "Math Assignment Due Soon",
              message: "Your calculus homework is due in 6 hours",
              timestamp: new Date(
                Date.now() - 2 * 60 * 60 * 1000,
              ).toISOString(),
              read: false,
              priority: "high",
            },
            {
              id: "notif_003",
              type: "grade",
              title: "Biology Quiz Graded",
              message:
                "Great work! You scored 94% on your latest biology quiz",
              timestamp: new Date(
                Date.now() - 24 * 60 * 60 * 1000,
              ).toISOString(),
              read: false,
              priority: "medium",
            },
          ],
        };

        setDashboardData(mockData);
        setNotificationsList(mockData.notifications);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Log final state when assignments and lessons are loaded
  useEffect(() => {
    if (!loading && !assignmentsLoading && !educationLoading) {
      console.log(`📊 Final Summary: ${realAssignments.length} assignments, ${lessons.length} lessons, ${subjects.length} subjects`);
      console.log("🎯 Real assignments:", realAssignments.map(a => ({ title: a.title, subject: a.subject })));
      console.log("📚 Lessons:", lessons.map(l => ({ title: l.title, subjectName: l.subjectName || `Subject ${l.subjectId}` })));
      console.log("📖 Subjects:", subjects.map(s => ({ name: s.name, id: s.id })));
    }
  }, [loading, assignmentsLoading, educationLoading, realAssignments.length, lessons.length, subjects.length]);

  // Debug effect for assignments tab visibility
  useEffect(() => {
    if (selectedTab === "assignments") {
      console.log("🔍 ASSIGNMENTS TAB DEBUG:");
      console.log("- realAssignments.length:", realAssignments.length);
      console.log("- assignmentsLoading:", assignmentsLoading);
      console.log("- assignments data:", realAssignments);
    }
  }, [selectedTab, realAssignments, assignmentsLoading]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("anansi_token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  // Enhanced functionality handlers
  const handleContinueLearning = (course: any) => {
    setLastAction(`Continuing ${course.title}`);
    console.log("Navigating to course:", course.title);
  };

  // Helper function for assignment interaction
  const handleAssignmentStart = (assignment: any, course: any) => {
    setLastAction(`Starting ${assignment.title} for ${course.title}`);
    navigate("/lesson-content", {
      state: {
        type: "assignment",
        title: assignment.title,
        course: course.title,
        subject: course.subject.name,
        dueDate: assignment.dueDate,
        priority: assignment.priority,
      },
    });
  };

  // Helper function for quiz interaction
  const handleQuizStart = (
    title: string,
    subject: string,
    isRetake = false,
  ) => {
    setLastAction(`${isRetake ? "Retaking" : "Starting"} ${title}`);
    navigate("/lesson-content", {
      state: {
        type: "quiz",
        title,
        subject,
        isRetake,
      },
    });
  };

  // Helper function for milestone creation
  const handleCreateMilestone = () => {
    setLastAction("Creating new learning milestone...");
    // Simulate milestone creation process
    setTimeout(() => {
      setLastAction(
        "New milestone: 'Complete Physics Chapter 4' added successfully!",
      );
    }, 1500);
  };

  // Helper function for filter actions
  const handleFilterAssignments = () => {
    setLastAction("Applying assignment filters...");
    // Simulate filter logic
    setTimeout(() => {
      setLastAction("Showing high priority assignments only");
    }, 800);

    // Navigate to lesson content with course data
    // Get the first available course or most recent
    const firstCourse = dashboardData?.courses?.[0];
    if (firstCourse) {
      navigate("/lesson-content", {
        state: {
          course: firstCourse,
          lessonId: `${firstCourse.id}_lesson_${firstCourse.completedLessons + 1}`,
        },
      });
    }
  };

  const handleCourseAnalytics = (course: any) => {
    setSelectedCourse(course);
    setCourseAnalyticsOpen(true);
    setLastAction(`Viewing analytics for ${course.title}`);
  };

  const handleSearch = () => {
    setShowSearchInput(!showSearchInput);
    if (!showSearchInput) {
      setLastAction("Search mode activated");
    } else {
      setSearchQuery("");
      setLastAction("Search cleared");
    }
  };

  const handleFilter = () => {
    setFilterDialogOpen(true);
    setLastAction("Opened filter options");
  };

  const applyFilters = () => {
    setFilterDialogOpen(false);
    setLastAction("Filters applied");
  };

  const resetFilters = () => {
    setSelectedFilters({
      progress: "all",
      subject: "all",
      difficulty: "all",
    });
    setLastAction("Filters reset");
  };

  // Filter courses based on search and filters
  const getFilteredCourses = (): DashboardCourse[] => {
    // Use real courses if available, otherwise fall back to enrolledCourses
    let filtered: DashboardCourse[] = courses.length > 0
      ? courses.map(course => ({
          id: course.id,
          title: course.title,
          instructor: course.instructor,
          progress: course.progress,
          completedLessons: course.completedLessons,
          totalLessons: course.totalLessons,
          recentGrade: undefined,
          aiRecommended: false,
          subject: {
            subjectId: course.subject.id,
            name: course.subject.name,
            description: course.subject.description,
          },
          upcomingAssignments: [],
        }))
      : enrolledCourses;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.subject.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.instructor.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply progress filter
    if (selectedFilters.progress !== "all") {
      filtered = filtered.filter((course) => {
        if (selectedFilters.progress === "completed")
          return course.progress === 100;
        if (selectedFilters.progress === "in-progress")
          return course.progress > 0 && course.progress < 100;
        if (selectedFilters.progress === "not-started")
          return course.progress === 0;
        return true;
      });
    }

    // Apply subject filter (simplified for demo)
    if (selectedFilters.subject !== "all") {
      filtered = filtered.filter((course) =>
        course.subject.name
          .toLowerCase()
          .includes(selectedFilters.subject.toLowerCase()),
      );
    }

    return filtered;
  };

  // Notification viewing - shows content before marking as read
  const viewNotification = (notification: any) => {
    setSelectedNotification(notification);
    setNotificationDetailOpen(true);
    setShowNotifications(false); // Close the dropdown
  };

  // Mark notification as read after viewing
  const markNotificationAsReadAfterViewing = async (notificationId: string) => {
    const notification = notificationsList.find((n) => n.id === notificationId);

    try {
      // DISABLED: Notification endpoints don't exist in API documentation
      // const response = await axiosClient
      //   .post(`/api/notifications/${notificationId}/mark-read`)
      //   .catch(() => ({ data: { success: false } }));
      const response = { data: { success: true } }; // Mock success response

      if (response.data && response.data.success) {
        setNotificationsList((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification,
          ),
        );

        if (notification && !notification.read) {
          setLastAction(`Read: ${notification.title}`);
        }
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      setNotificationsList((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    }

    setNotificationDetailOpen(false);
    setSelectedNotification(null);
  };

  // Mark notification as unread
  const markNotificationAsUnread = async (notificationId: string) => {
    const notification = notificationsList.find((n) => n.id === notificationId);

    try {
      // Direct cloud mode check
      const isCloudMode =
        import.meta.env.VITE_FORCE_CLOUD_MODE === "true" ||
        window.location.hostname.includes("fly.dev") ||
        window.location.hostname.includes("builder.codes");

      if (isCloudMode) {
        // Simulate API call with mock service
        setNotificationsList((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: false }
              : notification,
          ),
        );

        if (notification && notification.read) {
          setLastAction(`Marked as unread: ${notification.title}`);
        }

        setNotificationDetailOpen(false);
        setSelectedNotification(null);
        return;
      }

      // For real API calls (local development)
      // Note: Direct axios calls would be used here
      // Note: Backend would need to implement markNotificationAsUnread endpoint
      // For now, just update UI
      setNotificationsList((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: false }
            : notification,
        ),
      );

      if (notification && notification.read) {
        setLastAction(`Marked as unread: ${notification.title}`);
      }

      setNotificationDetailOpen(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error("Failed to mark notification as unread:", error);
      // Still update UI for better UX
      setNotificationsList((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: false }
            : notification,
        ),
      );
    }
  };

  // Notification handling
  const markNotificationAsRead = async (notificationId: string) => {
    // Find the notification to get its title for feedback
    const notification = notificationsList.find((n) => n.id === notificationId);

    try {
      // DISABLED: Notification endpoints don't exist in API documentation
      // const response = await axiosClient
      //   .post(`/api/notifications/${notificationId}/mark-read`)
      //   .catch(() => ({ data: { success: false } }));
      const response = { data: { success: true } }; // Mock success response

      if (response.data && response.data.success) {
        setNotificationsList((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification,
          ),
        );

        if (notification && !notification.read) {
          setLastAction(`Read: ${notification.title}`);

          // Auto-close dropdown after a short delay if all notifications are read
          setTimeout(() => {
            const unreadCount = notificationsList.filter((n) =>
              n.id === notificationId ? true : !n.read,
            ).length;
            if (unreadCount === 0) {
              setShowNotifications(false);
            }
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Still update UI for better UX
      setNotificationsList((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      // DISABLED: Notification endpoints don't exist in API documentation
      // const response = await axiosClient
      //   .post("/api/notifications/mark-all-read")
      //   .catch(() => ({ data: { success: false } }));
      const response = { data: { success: true } }; // Mock success response

      if (response.data?.success) {
        setNotificationsList((prev) =>
          prev.map((notification) => ({ ...notification, read: true })),
        );
        setLastAction("All notifications marked as read");

        // Auto-close dropdown after marking all as read
        setTimeout(() => {
          setShowNotifications(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      // Still update UI for better UX
      setNotificationsList((prev) =>
        prev.map((notification) => ({ ...notification, read: true })),
      );
      setLastAction("All notifications marked as read");
    }
  };

  const getMoodEmoji = (mood: Mood) => {
    switch (mood) {
      case Mood.Excited:
        return "����";
      case Mood.Happy:
        return "����";
      case Mood.Neutral:
        return "😐";
      case Mood.Focused:
        return "🎯";
      case Mood.Anxious:
        return "😰";
      case Mood.Tired:
        return "😴";
      case Mood.Frustrated:
        return "😤";
      case Mood.Anxious:
        return "😨";
      default:
        return "😐";
    }
  };

  const getRiskLevelColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "high":
        return "text-red-600 bg-red-50";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ai_insight":
        return <Brain className="w-4 h-4" />;
      case "assignment":
        return <BookOpen className="w-4 h-4" />;
      case "grade":
        return <Award className="w-4 h-4" />;
      case "system":
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (loading || !dashboardData || studentProfileLoading) {
    return (
      <div className="student-dashboard min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {studentProfileLoading ? "Loading student profile..." : "Loading your personalized dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.profile) {
    return (
      <div className="student-dashboard min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const {
    profile,
    enrolledCourses = [],
    behaviorSummary = {
      currentMood: "focused",
      riskLevel: "low",
      engagementScore: 0.0,
      focusScore: 0.0,
      recentActivities: [],
      lastActivity: new Date().toISOString(),
    },
    achievements = [],
    notifications = [],
  } = dashboardData;

  return (
    <div className="student-dashboard min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn.builder.io/api/v1/assets/2d09da496e544a1eab05e596d02031d8/twinternet-logo-b18833?format=webp&width=800"
                  alt="AnansiAI Logo"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h1 className="font-bold text-xl text-gray-800">AnansiAI</h1>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    Student Portal
                  </p>
                </div>
              </div>
              <div className="hidden md:flex flex-col">
                <div className="text-sm text-gray-600">
                  Welcome back, {studentDisplayName}
                </div>
                {lastAction && (
                  <div className="text-xs text-green-600 animate-pulse">
                    ✓ {lastAction}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">


              {/* Mood Indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                <span className="text-lg">
                  {getMoodEmoji(
                    (behaviorSummary?.currentMood as Mood) || Mood.Focused,
                  )}
                </span>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {behaviorSummary?.currentMood || Mood.Focused}
                </span>
              </div>

              {/* Notifications */}
              <DropdownMenu
                open={showNotifications}
                onOpenChange={setShowNotifications}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="w-5 h-5" />
                    {notificationsList.filter((n) => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notificationsList.filter((n) => !n.read).length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between p-3 border-b">
                    <span className="font-medium text-sm">Notifications</span>
                    {notificationsList.some((n) => !n.read) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllNotificationsAsRead}
                        className="text-xs h-auto p-1 text-blue-600 hover:text-blue-700"
                      >
                        Mark all read
                      </Button>
                    )}
                  </div>
                  {notificationsList.slice(0, 5).map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`p-3 cursor-pointer transition-all duration-200 ${
                        !notification.read
                          ? "bg-blue-50 hover:bg-blue-100 border-l-2 border-blue-400"
                          : "hover:bg-gray-50 opacity-75"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        viewNotification(notification);
                      }}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="p-1.5 rounded-lg bg-blue-50">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(
                              notification.timestamp,
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {notificationsList.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  )}
                  {notificationsList.length > 0 &&
                    notificationsList.filter((n) => !n.read).length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm border-t">
                        All caught up! ���
                      </div>
                    )}
                  {notificationsList.length > 5 && (
                    <div className="p-3 text-center border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-blue-600 hover:text-blue-700"
                        onClick={() => {
                          setLastAction("Opened all notifications");
                          setShowNotifications(false);
                        }}
                      >
                        View all notifications ({notificationsList.length})
                      </Button>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* AI Chat Toggle */}
              <Button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`${isChatOpen ? "bg-blue-600" : "bg-blue-500"} hover:bg-blue-700`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Twin
              </Button>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt="Student" />
                      <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{studentDisplayName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="hover:bg-green-50 transition-colors cursor-pointer"
                    onClick={() => {
                      console.log("Opening profile from dropdown...");
                      setLastAction("Opened Profile Settings");
                      setIsProfileOpen(true);
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2 text-green-600" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-5 h-auto">
                <TabsTrigger
                  value="overview"
                  className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5"
                >
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Home</span>
                </TabsTrigger>
                <TabsTrigger
                  value="lessons"
                  className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5"
                >
                  <span className="hidden sm:inline">Lessons</span>
                  <span className="sm:hidden">Learn</span>
                </TabsTrigger>
                <TabsTrigger
                  value="assignments"
                  className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5"
                >
                  <span className="hidden sm:inline">Assignments</span>
                  <span className="sm:hidden">Tasks</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5"
                >
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2.5"
                >
                  <span className="hidden sm:inline">Achievements</span>
                  <span className="sm:hidden">Awards</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-2xl font-bold text-gray-900">
                            {educationLoading ? (
                              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : courses.length > 0 ? (
                              courses.length
                            ) : (
                              enrolledCourses.length
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            Active Courses
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-2xl font-bold text-gray-900">
                            {educationLoading ? (
                              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : courses.length > 0 ? (
                              Math.round(
                                courses.reduce(
                                  (sum, course) => sum + course.progress,
                                  0,
                                ) / courses.length,
                              )
                            ) : (
                              Math.round(
                                enrolledCourses.reduce(
                                  (sum, course) => sum + course.progress,
                                  0,
                                ) / enrolledCourses.length,
                              )
                            )}
                            %
                          </p>
                          <p className="text-sm text-gray-600">Avg Progress</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Target className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-2xl font-bold text-gray-900">
                            {Math.round(behaviorSummary.focusScore * 100)}%
                          </p>
                          <p className="text-sm text-gray-600">Focus Level</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Award className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-2xl font-bold text-gray-900">
                            {achievements.length}
                          </p>
                          <p className="text-sm text-gray-600">Achievements</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                                </div>

                {/* Current Lesson Status */}
                {activeLessonSession && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Timer className="w-5 h-5 text-blue-600" />
                        Current Lesson Session
                        {activeLessonSession.apiSessionId && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs ml-auto">
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {activeLessonSession.lessonTitle}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {activeLessonSession.subject}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-mono font-bold text-blue-600">
                              {formatTime(lessonTimer)}
                            </div>
                            <p className="text-xs text-gray-500">
                              {activeLessonSession.isPaused ? "Paused" : "Active"}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {activeLessonSession.isPaused ? (
                            <Button size="sm" onClick={resumeLesson} className="flex-1">
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={pauseLesson} className="flex-1">
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={endLesson} className="flex-1">
                            <StopCircle className="w-4 h-4 mr-2" />
                            End Lesson
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Learning Milestones - Responsive */}
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      Learning Milestones
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Your learning goals and achievements
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {/* Current Milestones - Mobile First */}
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white/80 rounded-lg border border-purple-200 space-y-2 sm:space-y-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              Complete Mathematics Chapter 3
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Due: Tomorrow
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-11 sm:ml-0">
                          <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full w-3/4"></div>
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-purple-600 whitespace-nowrap">
                            75%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white/80 rounded-lg border border-green-200 space-y-2 sm:space-y-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              Submit Science Project
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Completed
                            </p>
                          </div>
                        </div>
                        <div className="ml-11 sm:ml-0">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Done
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white/80 rounded-lg border border-blue-200 space-y-2 sm:space-y-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              Practice AI Twin Conversations
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Weekly goal: 5 sessions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-11 sm:ml-0">
                          <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full w-2/5"></div>
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-blue-600 whitespace-nowrap">
                            2/5
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Milestone Actions - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs sm:text-sm"
                        onClick={() => {
                          setLastAction("Opening milestone creation dialog");
                          // Simulate milestone creation
                          setTimeout(() => {
                            setLastAction(
                              "New learning goal set successfully!",
                            );
                          }, 1000);
                        }}
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Set New Goal</span>
                        <span className="sm:hidden">New Goal</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs sm:text-sm"
                        onClick={() => {
                          setSelectedTab("achievements");
                          setLastAction(
                            "Viewing all milestones and achievements",
                          );
                        }}
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">View All</span>
                        <span className="sm:hidden">View All</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions - Responsive */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Pending Assignments - Using Real API Data */}
                  <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                    <CardHeader className="pb-3 sm:pb-6">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                        <span className="truncate">Pending Assignments</span>
                        {assignmentsLoading && (
                          <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Complete your upcoming tasks{" "}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 sm:space-y-3">
                        {assignmentsLoading ? (
                          <div className="text-center py-4 text-gray-500">
                            <div className="w-6 h-6 mx-auto mb-2 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm">
                              Loading assignments from API...
                            </p>
                          </div>
                        ) : realAssignments.length > 0 ? (
                          realAssignments
                            .filter(
                              (assignment) => assignment.status === "pending",
                            )
                            .slice(0, 3)
                            .map((assignment, index) => (
                              <div
                                key={assignment.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-white/80 rounded-lg border border-orange-200 space-y-2 sm:space-y-0"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium text-sm text-gray-900 truncate">
                                    {assignment.title}
                                  </p>
                                  <p className="text-xs text-gray-600 truncate">
                                    {assignment.subject}{" "}
                                    {assignment.courseTitle &&
                                      `• ${assignment.courseTitle}`}
                                  </p>
                                  <p className="text-xs text-orange-600">
                                    Due:{" "}
                                    {new Date(
                                      assignment.dueDate,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex justify-end sm:justify-start">
                                  <Badge
                                    variant={
                                      assignment.priority === "high"
                                        ? "destructive"
                                        : assignment.priority === "medium"
                                          ? "default"
                                          : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {assignment.priority}
                                  </Badge>
                                </div>
                              </div>
                            ))
                        ) : (
                          // Show message when no assignments are available from API
                          <div className="p-4 text-center text-gray-600">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">No assignments available</p>
                            <p className="text-xs mt-1">Check back later for new assignments from your teachers</p>
                          </div>
                        )}

                        {!assignmentsLoading &&
                          realAssignments.length === 0 &&
                          enrolledCourses.every(
                            (course) => course.upcomingAssignments.length === 0,
                          ) && (
                            <div className="text-center py-4 text-gray-500">
                              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">All caught up!</p>
                            </div>
                          )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3 sm:mt-4 text-xs sm:text-sm"
                        onClick={() => {
                          setSelectedTab("assignments");
                          setLastAction("Navigated to assignments section");
                        }}
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        View All Assignments{" "}
                        {realAssignments.length > 0 &&
                          `(${realAssignments.length})`}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Quick Quiz Access */}
                  <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader className="pb-3 sm:pb-6">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                        <span className="truncate">Available Quizzes</span>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Test your knowledge
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-white/80 rounded-lg border border-purple-200 space-y-2 sm:space-y-0">
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              Mathematics Quiz
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              Linear Equations
                            </p>
                            <p className="text-xs text-purple-600">
                              Available now
                            </p>
                          </div>
                          <div className="flex justify-end sm:justify-start">
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-xs px-2 sm:px-3"
                              onClick={() => {
                                setLastAction("Starting Mathematics Quiz...");
                                navigate("/lesson-content", {
                                  state: {
                                    type: "quiz",
                                    title:
                                      "Mathematics Quiz - Linear Equations",
                                    subject: "Mathematics",
                                  },
                                });
                              }}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-white/80 rounded-lg border border-green-200 space-y-2 sm:space-y-0">
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              Biology Quiz
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              Cell Structure
                            </p>
                            <p className="text-xs text-green-600">
                              Retake available
                            </p>
                          </div>
                          <div className="flex justify-end sm:justify-start">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 sm:px-3"
                              onClick={() => {
                                setLastAction("Retaking Biology Quiz...");
                                navigate("/lesson-content", {
                                  state: {
                                    type: "quiz",
                                    title: "Biology Quiz - Cell Structure",
                                    subject: "Biology",
                                    isRetake: true,
                                  },
                                });
                              }}
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Retake
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3 sm:mt-4 text-xs sm:text-sm"
                        onClick={() => {
                          setSelectedTab("assignments");
                          setLastAction("Viewing all available quizzes");
                        }}
                      >
                        <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        View All Quizzes
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Courses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Your Courses
                    </CardTitle>
                    <CardDescription>
                      Continue your learning journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {enrolledCourses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {course.title}
                            </h3>
                            <div className="flex gap-1">
                              <Badge
                                variant={
                                  course.aiRecommended ? "default" : "outline"
                                }
                                className="text-xs"
                              >
                                {course.aiRecommended
                                  ? "AI Recommended"
                                  : course.subject.name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <Brain className="w-5 h-5" />
                      AI Learning Insights
                    </CardTitle>
                    <CardDescription>
                      Personalized recommendations based on your learning
                      patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg border border-purple-100">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Study Recommendation
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Based on your learning style (
                              {profile.learningPreferences.preferredStyle}), I
                              recommend focusing on visual aids for your
                              upcoming calculus topics. Your recent performance
                              shows 15% improvement with visual materials.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-purple-100">
                        <div className="flex items-start gap-3">
                          <Heart className="w-5 h-5 text-red-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Emotional Check-in
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              You're showing great focus today! Your stress
                              levels are low (
                              {Math.round(
                                profile.emotionalState.stressLevel * 100,
                              )}
                              %), which is perfect for tackling challenging
                              concepts. Keep up the excellent work!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Subjects Overview - Educational Hierarchy */}
                <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <BookOpen className="w-5 h-5" />
                      Your Learning Subjects
                    </CardTitle>
                    <CardDescription>
                      Progress across different subject areas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {educationLoading ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="w-8 h-8 mx-auto mb-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm">Loading subjects...</p>
                      </div>
                    ) : subjects.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.slice(0, 6).map((subject) => {
                          const subjectCourse = courses.find(
                            (c) => c.subject.id === subject.id,
                          );
                          const progress =
                            subjectCourse?.progress || subject.progress || 0;

                          return (
                            <div
                              key={subject.id}
                              className="p-4 bg-white rounded-lg border border-green-100 hover:border-green-200 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedTab("lessons");
                                setLastAction(
                                  `Viewing ${subject.name} lessons`,
                                );
                              }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                  {subject.name}
                                </h4>
                                <span className="text-xs font-medium text-green-600">
                                  {progress}%
                                </span>
                              </div>

                              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>

                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {subject.description}
                              </p>

                              <div className="flex justify-between text-xs text-gray-500">
                                <span>
                                  {subjectCourse?.totalLessons ||
                                    subject.lessonsCount ||
                                    0}{" "}
                                  lessons
                                </span>
                                <span>
                                  {subjectCourse?.completedLessons || 0}{" "}
                                  completed
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No subjects loaded yet</p>
                      </div>
                    )}

                    {subjects.length > 6 && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTab("lessons");
                            setLastAction("Viewing all subject lessons");
                          }}
                        >
                          View All {subjects.length} Subjects
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lessons" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Your Lessons
                    </h2>
                    <p className="text-gray-600">
                      Continue learning with individual lessons from your
                      subjects
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFilter}
                      className="hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSearch}
                      className={`transition-colors ${showSearchInput ? "bg-green-50 border-green-200" : "hover:bg-green-50 hover:border-green-200"}`}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {showSearchInput ? "Hide Search" : "Search"}
                    </Button>
                  </div>
                </div>

                {/* Search Input - appears when search is activated */}
                {showSearchInput && (
                  <div className="mb-6">
                    <div className="relative max-w-md">
                      <input
                        type="text"
                        placeholder="Search lessons, subjects, topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {searchQuery && (
                      <p className="text-sm text-gray-600 mt-2">
                        Showing {getFilteredCourses().length} lessons from{" "}
                        {enrolledCourses.length} course subjects
                      </p>
                    )}
                  </div>
                )}

                {/* Lesson Session Error Display */}
                {lessonSessionError && (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-orange-900">Unable to Start Lesson</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          There was a problem starting your lesson session. Please try again.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLessonSessionError(null)}
                        className="ml-auto"
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}



                {/* Loading State */}
                {educationLoading && (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 mx-auto mb-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading your lessons...</p>
                  </div>
                )}

                {/* Connection Error State - Only show if no lessons and there's an error */}
                {!educationLoading && lessonsApiError && lessons.length === 0 && (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Unable to Load Lessons
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {lessonsApiError.includes('Access denied')
                          ? 'Access denied - please contact your teacher or administrator.'
                          : 'We\'re having trouble connecting to the server. Please try again in a moment.'}
                      </p>
                      <Button
                        onClick={() => {
                          setEducationLoading(true);
                          setLessonsApiError(null);
                          // Retry loading lessons directly from API
                          window.location.reload(); // Simple reload to retry the API calls
                        }}
                        className="mt-4"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}

                {/* No Lessons Available State */}
                {!educationLoading &&
                  !lessonsApiError &&
                  lessons.length === 0 && (
                    <div className="text-center py-12">
                      <div className="max-w-md mx-auto">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No Lessons Available
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Your lessons will appear here once they've been added to your curriculum.
                        </p>
                        <p className="text-sm text-gray-500">
                          Contact your instructor if you believe you should have access to lessons.
                        </p>
                      </div>
                    </div>
                  )}

                {/* Lessons Display */}
                {!educationLoading && lessons.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lessons.slice(0, 9).map((lesson) => {
                      const subject = subjects.find(
                        (s) => s.id === lesson.subjectId,
                      );
                      // Transform lesson to course-like object for display compatibility
                      const courseDisplay = {
                        id: (lesson.id || lesson.lessonId || `lesson_${lesson.title || 'unknown'}`).toString(),
                        title: lesson.title || "Untitled Lesson",
                        instructor: subject?.name || "Unknown Subject",
                        progress: lesson.isCompleted ? 100 : 0,
                        difficulty: lesson.difficulty || "medium",
                        subject: { name: subject?.name || "Unknown" },
                        estimatedDuration:
                          Math.round(lesson.duration / 60) || 1,
                        description: lesson.description,
                        type: lesson.type,
                        order: lesson.order,
                        isCompleted: lesson.isCompleted,
                      };
                      return (
                        <Card
                          key={`lesson-${lesson.id}`}
                          className={`hover:shadow-lg transition-shadow ${
                            courseDisplay.isCompleted
                              ? "border-green-200 bg-green-50/30"
                              : ""
                          }`}
                          onClick={() => {
                            setLastAction(
                              `Opening lesson: ${courseDisplay.title}`,
                            );
                            navigate("/lesson-content", {
                              state: {
                                type: "lesson",
                                lesson: lesson,
                                subject: subject?.name || "Unknown Subject",
                                lessonId: lesson.id,
                              },
                            });
                          }}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  {lesson.type === "video"
                                    ? "����"
                                    : lesson.type === "reading"
                                      ? "📖"
                                      : lesson.type === "interactive"
                                        ? "🎮"
                                        : lesson.type === "quiz"
                                          ? "📝"
                                          : "📚"}{" "}
                                  {courseDisplay.title}
                                  {courseDisplay.isCompleted && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                  {courseDisplay.difficulty && (
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        courseDisplay.difficulty === "advanced"
                                          ? "border-red-500 text-red-700"
                                          : courseDisplay.difficulty ===
                                              "intermediate"
                                            ? "border-yellow-500 text-yellow-700"
                                            : "border-green-500 text-green-700"
                                      }`}
                                    >
                                      {courseDisplay.difficulty}
                                    </Badge>
                                  )}
                                </CardTitle>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <div>{courseDisplay.instructor}</div>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration} minutes • Lesson{" "}
                                    {lesson.order}
                                  </div>
                                  <div className="text-xs text-gray-500 line-clamp-1">
                                    {courseDisplay.description}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-600">
                                  {courseDisplay.isCompleted
                                    ? "Complete"
                                    : "Start"}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Progress</span>
                                  <span>{courseDisplay.progress}%</span>
                                </div>
                                <Progress
                                  value={courseDisplay.progress}
                                  className="h-2"
                                />
                              </div>

                              <div className="flex justify-between text-sm text-gray-600">
                                <span className="capitalize">
                                  {lesson.type} lesson
                                </span>
                                <span>{lesson.duration} min duration</span>
                              </div>

                                                            {/* Lesson timing display for active lesson */}
                              {activeLessonSession && activeLessonSession.lessonId === lesson.id && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Timer className="w-4 h-4 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-700">
                                        {activeLessonSession.isPaused ? "Paused" : "Active"}
                                      </span>
                                    </div>
                                    <div className="text-lg font-mono font-bold text-blue-700">
                                      {formatTime(lessonTimer)}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2">
                                {/* Show different buttons based on lesson state */}
                                {activeLessonSession && activeLessonSession.lessonId === lesson.id ? (
                                  // Active lesson controls
                                  <>
                                    {activeLessonSession.isPaused ? (
                                      <Button
                                        size="sm"
                                        variant="default"
                                        className="flex-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          resumeLesson();
                                        }}
                                      >
                                        <Play className="w-4 h-4 mr-2" />
                                        Resume
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          pauseLesson();
                                        }}
                                      >
                                        <Pause className="w-4 h-4 mr-2" />
                                        Pause
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="flex-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        endLesson();
                                      }}
                                    >
                                      <StopCircle className="w-4 h-4 mr-2" />
                                      End Lesson
                                    </Button>
                                  </>
                                ) : courseDisplay.isCompleted ? (
                                  // Completed lesson
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLastAction(`Reviewing ${courseDisplay.title}`);
                                      navigate("/lesson-content", {
                                        state: {
                                          type: "lesson",
                                          lesson: lesson,
                                          subject: subject?.name || "Unknown Subject",
                                          lessonId: lesson.id,
                                        },
                                      });
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Review
                                  </Button>
                                ) : (
                                  // Start new lesson
                                  <Button
                                    size="sm"
                                    className="flex-1 hover:bg-blue-700 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startLesson(lesson, subject);
                                    }}
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Lesson
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Assignments & Quizzes Tab - Responsive */}
              <TabsContent
                value="assignments"
                className="space-y-4 sm:space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Assignments & Quizzes
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Track your pending assignments and upcoming assessments
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm"
                      onClick={() => {
                        setLastAction("Assignment filters applied");
                        // Simulate filter functionality
                      }}
                    >
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Filter</span>
                      <span className="sm:hidden">Filter</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs sm:text-sm"
                      onClick={() => {
                        setLastAction("Switched to calendar view");
                        // Simulate calendar view
                      }}
                    >
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Calendar View</span>
                      <span className="sm:hidden">Calendar</span>
                    </Button>
                  </div>
                </div>

                {/* Summary Cards - Responsive Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center">
                        <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg flex-shrink-0">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-red-600" />
                        </div>
                        <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                            {assignmentsLoading ? (
                              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : realAssignments.length > 0 ? (
                              realAssignments.filter((a) => {
                                const dueDate = new Date(a.dueDate);
                                const now = new Date();
                                const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                return a.status === "pending" && daysDiff <= 7 && daysDiff >= 0;
                              }).length
                            ) : (
                              0
                            )}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Due Soon
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center">
                        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                        <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                            {assignmentsLoading ? (
                              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              realAssignments.filter((a) =>
                                a.questionType === 3 || a.title.toLowerCase().includes('quiz')
                              ).length
                            )}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Quizzes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center">
                        <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                        </div>
                        <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                            {assignmentsLoading ? (
                              <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : realAssignments.length > 0 ? (
                              realAssignments.filter(
                                (a) => a.status === "completed",
                              ).length
                            ) : (
                              0
                            )}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Completed
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center">
                        <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
                        </div>
                        <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                            -
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Avg Score
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Upcoming Assignments - Responsive */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Upcoming Assignments
                    </CardTitle>
                    <CardDescription className="text-sm">
                      All assignments from your teachers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Debug info - temporary */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        Debug: realAssignments.length = {realAssignments.length}
                        {realAssignments.length > 0 && (
                          <div>Assignments: {realAssignments.map(a => a.title).join(', ')}</div>
                        )}
                      </div>
                    )}
                    <div className="space-y-3 sm:space-y-4">
                      {assignmentsLoading ? (
                        <div className="text-center py-8">
                          <div className="w-6 h-6 mx-auto mb-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-600">Loading assignments...</p>
                        </div>
                      ) : realAssignments.length > 0 ? (
                        realAssignments
                          .map((assignment, index: number) => (
                            <div
                              key={assignment.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-3 sm:space-y-0"
                            >
                              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                                    {assignment.title}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                                    {assignment.subject || 'Teacher Assignment'} • {assignment.courseTitle || 'Course'}
                                  </p>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                                    <span className="text-xs text-gray-500">
                                      Due:{" "}
                                      {new Date(assignment.dueDate).toLocaleDateString()}
                                    </span>
                                    <Badge
                                      variant={
                                        assignment.priority === "high"
                                          ? "destructive"
                                          : "default"
                                      }
                                      className="text-xs w-fit"
                                    >
                                      {assignment.priority} priority
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 justify-end sm:justify-start flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => {
                                    setLastAction(
                                      `Viewing assignment: ${assignment.title}`,
                                    );
                                    // View real assignment details
                                  }}
                                >
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  <span className="hidden sm:inline">View</span>
                                  <span className="sm:hidden">View</span>
                                </Button>
                                <Button
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    setLastAction(
                                      `Starting assignment: ${assignment.title}`,
                                    );
                                    navigate("/lesson-content", {
                                      state: {
                                        type: "assignment",
                                        title: assignment.title,
                                        course: assignment.courseTitle || 'Course',
                                        dueDate: assignment.dueDate,
                                      },
                                    });
                                  }}
                                >
                                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                  <span className="hidden sm:inline">
                                    Start
                                  </span>
                                  <span className="sm:hidden">Start</span>
                                </Button>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-gray-500">
                          <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                          <p className="text-base sm:text-lg font-medium">
                            No assignments available
                          </p>
                          <p className="text-sm mb-2">
                            Assignments from your teachers will appear here
                          </p>
                          <p className="text-xs text-gray-400">
                            Check the Overview tab to see if assignments are loading
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                              setSelectedTab("overview");
                              setLastAction("Switched to Overview to check assignments");
                            }}
                          >
                            Check Overview Tab
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

{/* Real Quizzes from API */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Recent Quizzes & Assessments
                    </CardTitle>
                    <CardDescription>
                      Quiz and assessment data from your teachers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignmentsLoading ? (
                        <div className="text-center py-8">
                          <div className="w-6 h-6 mx-auto mb-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-600">Loading quizzes and assessments...</p>
                        </div>
                      ) : realAssignments.length > 0 ? (
                        <div className="grid gap-4">
                          {realAssignments
                            .slice(0, 3)
                            .map((assignment, index) => {
                              const isCompleted = assignment.status === 'completed';
                              const isUpcoming = new Date(assignment.dueDate) > new Date();
                              const bgColor = isCompleted ? 'bg-green-50 border-green-200' : isUpcoming ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200';
                              const iconColor = isCompleted ? 'text-green-600' : isUpcoming ? 'text-blue-600' : 'text-yellow-600';
                              const IconComponent = isCompleted ? CheckCircle : isUpcoming ? Clock : AlertTriangle;
                              
                              return (
                                <div key={assignment.id} className={`flex items-center justify-between p-4 border rounded-lg ${bgColor}`}>
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{backgroundColor: isCompleted ? '#dcfce7' : isUpcoming ? '#dbeafe' : '#fef3c7'}}>
                                      <IconComponent className={`w-6 h-6 ${iconColor}`} />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-900">
                                        {assignment.title}
                                      </h3>
                                      <p className="text-sm text-gray-600">
                                        {assignment.description || assignment.courseTitle}
                                      </p>
                                      <span className="text-xs text-gray-500">
                                        {isCompleted ? 'Completed' : isUpcoming ? `Due ${new Date(assignment.dueDate).toLocaleDateString()}` : 'Available now'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isCompleted ? (
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-green-600">
                                          Done
                                        </div>
                                        <div className="text-xs text-gray-500">Completed</div>
                                      </div>
                                    ) : (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setLastAction(`Previewing ${assignment.title}`);
                                          }}
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          Preview
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            setLastAction(`Taking ${assignment.title}`);
                                            navigate("/lesson-content", {
                                              state: {
                                                type: "assignment",
                                                title: assignment.title,
                                                subject: assignment.subject,
                                                assignmentId: assignment.id,
                                              },
                                            });
                                          }}
                                        >
                                          <Play className="w-4 h-4 mr-2" />
                                          Start
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          }
                          {realAssignments.length === 0 && (
                            <div className="text-center py-8">
                              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                              <p className="text-gray-600 font-medium">No assignments available</p>
                              <p className="text-sm text-gray-500">Assignments from your teachers will appear here</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600 font-medium">No assignments available</p>
                          <p className="text-sm text-gray-500">Assignments from your teachers will appear here</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <BehaviorAnalytics
                  studentId={dashboardData?.profile?.id || "student_001"}
                  currentMood={
                    (behaviorSummary?.currentMood as Mood) || Mood.Focused
                  }
                  riskScore={
                    behaviorSummary?.riskLevel === "low"
                      ? 0.2
                      : behaviorSummary?.riskLevel === "medium"
                        ? 0.5
                        : 0.8
                  }
                  behaviorLogs={[]}
                  analytics={{
                    studentId: dashboardData?.profile?.id || "student_001",
                    overallProgress: Math.round(
                      enrolledCourses.reduce(
                        (sum, course) => sum + course.progress,
                        0,
                      ) / enrolledCourses.length,
                    ),
                    subjectProgress: enrolledCourses.map((course) => ({
                      subjectId: parseInt(course.id.replace("course_", "")),
                      subjectName: course.subject.name,
                      progress: course.progress,
                      grade: "A-",
                      completedLessons: course.completedLessons,
                      totalLessons: course.totalLessons,
                      averageScore: course.recentGrade || 85,
                      timeSpent: course.completedLessons * 1.5,
                      lastActivity: new Date(),
                    })),
                    strengths: [
                      "problem-solving",
                      "visual learning",
                      "analytical thinking",
                    ],
                    achievements: [
                      {
                        id: "ach_001",
                        title: "Math Whiz",
                        description:
                          "Completed 10 consecutive math assignments with 90%+ scores",
                        type: "academic" as const,
                        badgeUrl: "����",
                        unlockedAt: new Date("2024-01-10"),
                        points: 100,
                      },
                      {
                        id: "ach_002",
                        title: "Science Explorer",
                        description:
                          "Conducted 5 virtual experiments with detailed observations",
                        type: "academic" as const,
                        badgeUrl: "🔬",
                        unlockedAt: new Date("2024-01-08"),
                        points: 75,
                      },
                      {
                        id: "ach_003",
                        title: "Biology Master",
                        description:
                          "Scored above 90% on 5 consecutive biology quizzes",
                        type: "academic" as const,
                        badgeUrl: "🧬",
                        unlockedAt: new Date("2024-01-05"),
                        points: 85,
                      },
                    ],
                    riskFactors: [],
                    lastUpdated: new Date(),
                  }}
                  onRiskDetected={(risk) => {
                    console.log("Risk detected:", risk);
                  }}
                />
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Achievements
                    </h2>
                    <p className="text-gray-600">
                      Your learning milestones and accomplishments
                    </p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">
                    Total Achievements: {achievements.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-yellow-100 rounded-lg">
                            <Award className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {achievement.description}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <Badge variant="outline">
                                {achievement.category}
                              </Badge>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    achievement.earnedDate,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      time: "9:00 AM",
                      subject: "Advanced Math",
                      type: "Class",
                    },
                    { time: "11:00 AM", subject: "Biology Lab", type: "Lab" },
                    {
                      time: "2:00 PM",
                      subject: "History Essay",
                      type: "Assignment",
                    },
                    {
                      time: "4:00 PM",
                      subject: "AI Study Session",
                      type: "AI Twin",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.subject}</p>
                        <p className="text-xs text-gray-600">
                          {item.time} • {item.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Wellness Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Level</span>
                    <Badge
                      className={getRiskLevelColor(
                        behaviorSummary.riskLevel as "high" | "medium" | "low",
                      )}
                    >
                      {behaviorSummary.riskLevel.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Focus</span>
                      <span>
                        {Math.round(behaviorSummary.focusScore * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={behaviorSummary.focusScore * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Engagement</span>
                      <span>
                        {Math.round(behaviorSummary.engagementScore * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={behaviorSummary.engagementScore * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      <Smile className="w-4 h-4 inline mr-1" />
                      You're doing great! Keep up the excellent work.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setIsChatOpen(true)}
                  className="w-full justify-start hover:bg-blue-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with AI Twin
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-green-50 hover:border-green-200 transition-colors"
                  onClick={() => {
                    console.log("Opening profile dialog...");
                    setLastAction("Opened Profile Manager");
                    setIsProfileOpen(true);
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-purple-50 hover:border-purple-200 transition-colors"
                  onClick={() => {
                    console.log("Switching to analytics tab...");
                    setSelectedTab("analytics");
                  }}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Twin Chat Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-4">
          <div className="w-full max-w-md h-[600px] bg-white rounded-lg shadow-2xl">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">AI Twin Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                >
                  ×
                </Button>
              </div>
              <div className="flex-1">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
                      <span>Loading AI Chat...</span>
                    </div>
                  }
                >
                  <LazyAITwinChat
                    studentId={dashboardData?.profile?.id || "student_001"}
                    currentLessonId={undefined}
                    onInteractionLogged={(interaction) => {
                      console.log("AI interaction logged:", interaction);
                    }}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Manager Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Manage Your Profile
            </DialogTitle>
            <DialogDescription>
              Customize your learning preferences, privacy settings, and AI
              personalization
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <span className="text-gray-600">
                      Loading Profile Manager...
                    </span>
                  </div>
                </div>
              }
            >
              <LazyStudentProfileManager
                profile={dashboardData?.profile as any}
                privacySettings={dashboardData?.profile?.privacySettings as any}
                onProfileUpdate={(updates) => {
                  console.log("Profile updated:", updates);
                  // In a real app, this would update the backend
                  alert(
                    "Profile updated successfully! Changes: " +
                      JSON.stringify(updates, null, 2),
                  );
                }}
                onPrivacyUpdate={(updates) => {
                  console.log("Privacy updated:", updates);
                  // In a real app, this would update the backend
                  alert(
                    "Privacy settings updated! Changes: " +
                      JSON.stringify(updates, null, 2),
                  );
                }}
                isMinor={false}
              />
            </Suspense>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Courses</DialogTitle>
            <DialogDescription>
              Customize how you view your courses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Status
              </label>
              <select
                value={selectedFilters.progress}
                onChange={(e) =>
                  setSelectedFilters({
                    ...selectedFilters,
                    progress: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter achievements by course"
              >
                <option value="all">All Courses</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={selectedFilters.subject}
                onChange={(e) =>
                  setSelectedFilters({
                    ...selectedFilters,
                    subject: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter achievements by subject"
              >
                <option value="all">All Subjects</option>
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
                <option value="english">English</option>
                <option value="history">History</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={selectedFilters.difficulty}
                onChange={(e) =>
                  setSelectedFilters({
                    ...selectedFilters,
                    difficulty: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter achievements by difficulty level"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={resetFilters} variant="outline" className="flex-1">
              Reset
            </Button>
            <Button onClick={applyFilters} className="flex-1">
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Analytics Dialog */}
      <Dialog open={courseAnalyticsOpen} onOpenChange={setCourseAnalyticsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {selectedCourse?.title} - Course Analytics
            </DialogTitle>
            <DialogDescription>
              Detailed performance and progress analytics for this course
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-6">
              {/* Course Overview Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCourse.progress}%
                    </div>
                    <div className="text-sm text-gray-600">Progress</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedCourse.recentGrade || "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">Latest Grade</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedCourse.completedLessons}
                    </div>
                    <div className="text-sm text-gray-600">Lessons Done</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedCourse.upcomingAssignments.length}
                    </div>
                    <div className="text-sm text-gray-600">Pending Tasks</div>
                  </div>
                </Card>
              </div>

              {/* Upcoming Assignments */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Upcoming Assignments</h4>
                <div className="space-y-2">
                  {selectedCourse.upcomingAssignments.map(
                    (assignment: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {assignment.title}
                          </div>
                          <div className="text-xs text-gray-600">
                            Due:{" "}
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge
                          variant={
                            assignment.priority === "high"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {assignment.priority}
                        </Badge>
                      </div>
                    ),
                  )}
                  {selectedCourse.upcomingAssignments.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No pending assignments
                    </div>
                  )}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    handleContinueLearning(selectedCourse);
                    setCourseAnalyticsOpen(false);
                  }}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLastAction(`Opened ${selectedCourse.title} discussion`);
                    setCourseAnalyticsOpen(false);
                    navigate("/course-discussion", {
                      state: { course: selectedCourse },
                    });
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Discussion
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Detail Modal */}
      <Dialog
        open={notificationDetailOpen}
        onOpenChange={setNotificationDetailOpen}
      >
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                {selectedNotification &&
                  getNotificationIcon(selectedNotification.type)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {selectedNotification?.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedNotification?.timestamp
                    ? new Date(selectedNotification.timestamp).toLocaleString()
                    : ""}
                </div>
              </div>
              {selectedNotification && !selectedNotification.read && (
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedNotification?.message}
            </div>

            {selectedNotification?.priority === "high" && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-medium">High Priority</span>
                </div>
              </div>
            )}

            {selectedNotification?.type === "assignment" && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    Assignment Deadline
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotificationDetailOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
            {selectedNotification && !selectedNotification.read && (
              <Button
                size="sm"
                onClick={() =>
                  markNotificationAsReadAfterViewing(selectedNotification.id)
                }
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Read
              </Button>
            )}
            {selectedNotification && selectedNotification.read && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  markNotificationAsUnread(selectedNotification.id)
                }
                className="flex-1"
              >
                <Bell className="w-4 h-4 mr-2" />
                Mark as Unread
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;
