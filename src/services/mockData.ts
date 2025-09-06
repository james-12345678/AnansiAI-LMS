// Development Mock Data Fallback Service
// This provides mock data when the API is not available during development

import type {
  ApiResponse,
  School,
  SystemStats,
  SystemAlert,
  Notification,
  SuperAdminInfo,
} from "./api";
import { teacherStudentIntegration } from "./teacherStudentIntegration";

// Mock delay to simulate network requests
const mockDelay = (ms: number = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock Schools Data
const mockSchools: School[] = [
  {
    id: "SCH001",
    name: "Nairobi Academy",
    code: "NAC",
    county: "Nairobi",
    subcounty: "Westlands",
    ward: "Parklands",
    students: 1250,
    teachers: 85,
    status: "active",
    performance: 89,
    aiAccuracy: 94,
    lastSync: "2 min ago",
    adminName: "Dr. Sarah Johnson",
    adminEmail: "admin@nairobiacademy.ac.ke",
    adminPhone: "+254 701 234 567",
    establishedYear: 1985,
    type: "secondary",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2024-01-15T14:20:00Z",
  },
  {
    id: "SCH002",
    name: "Mombasa International School",
    code: "MIS",
    county: "Mombasa",
    subcounty: "Nyali",
    ward: "Frere Town",
    students: 890,
    teachers: 62,
    status: "active",
    performance: 86,
    aiAccuracy: 91,
    lastSync: "5 min ago",
    adminName: "Mr. James Kiprotich",
    adminEmail: "admin@mis.ac.ke",
    adminPhone: "+254 722 345 678",
    establishedYear: 1992,
    type: "mixed",
    createdAt: "2023-02-10T09:15:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
  },
  {
    id: "SCH003",
    name: "Kakamega Girls High School",
    code: "KGH",
    county: "Kakamega",
    subcounty: "Lurambi",
    ward: "Mahiakalo",
    students: 980,
    teachers: 68,
    status: "maintenance",
    performance: 91,
    aiAccuracy: 96,
    lastSync: "1 hour ago",
    adminName: "Mrs. Grace Wanjiku",
    adminEmail: "admin@kgh.ac.ke",
    adminPhone: "+254 733 456 789",
    establishedYear: 1956,
    type: "secondary",
    createdAt: "2023-01-20T11:00:00Z",
    updatedAt: "2024-01-13T08:30:00Z",
  },
];

// Mock System Stats
const mockSystemStats: SystemStats = {
  totalSchools: 247,
  totalStudents: 156780,
  totalTeachers: 8945,
  avgPerformance: 84.2,
  systemUptime: 99.8,
  dataStorage: 72.3,
  activeUsers: 89542,
  dailyLogins: 45620,
};

// Mock Super Admin Info
const mockSuperAdminInfo: SuperAdminInfo = {
  name: "Dr. Robert Martinez",
  id: "SUP-ADM-001",
  role: "Super Administrator",
  avatar: "",
  lastLogin: "Today at 8:45 AM",
  region: "National Education Authority",
  permissions: ["full_access", "user_management", "system_config"],
};

// Mock System Alerts
const mockSystemAlerts: SystemAlert[] = [
  {
    id: "1",
    type: "critical",
    title: "Development Mode Active",
    message: "API server not available. Using mock data for development.",
    school: "System Notice",
    time: "Just now",
    priority: "high",
    actionRequired: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Storage Capacity Warning",
    message:
      "Regional data centers approaching 85% capacity - expansion planning required",
    time: "45 min ago",
    priority: "medium",
    actionRequired: true,
  },
];

// Mock Notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "system",
    title: "Development Mode",
    message: "Frontend is running in development mode with mock data fallback",
    time: "Just now",
    read: false,
    priority: "high",
  },
  {
    id: "2",
    type: "school",
    title: "New School Registration",
    message:
      "Meru Science Academy has completed registration and is pending final approval",
    time: "2 hours ago",
    read: false,
    priority: "medium",
  },
];

// Mock API Service
export class MockApiService {
  static async login(
    userId: string,
    password: string,
  ): Promise<ApiResponse<any>> {
    await mockDelay();

    // Mock validation
    if (userId && password) {
      // Determine role from user ID
      let role = "student";
      if (userId.includes("ADM")) role = "admin";
      else if (userId.includes("TCH")) role = "teacher";
      else if (userId.includes("STU")) role = "student";

      const schoolCode = userId.split("-")[0];
      const mockSchool =
        mockSchools.find((s) => s.code === schoolCode) || mockSchools[0];

      return {
        success: true,
        data: {
          token: "mock_jwt_token_" + Date.now(),
          user: {
            id: userId,
            name: `Mock User ${userId}`,
            email: `${userId.toLowerCase()}@school.ac.ke`,
            role: role,
            schoolId: mockSchool.id,
            status: "active",
            lastActive: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          school: mockSchool,
        },
      };
    }

    return {
      success: false,
      data: null as any,
      error: "Invalid credentials",
    };
  }

  static async superAdminLogin(
    loginId: string,
    password: string,
  ): Promise<ApiResponse<any>> {
    await mockDelay();

    // Mock super admin validation
    const validCredentials = [
      { id: "SUP-ADM-001", password: "admin123" },
      { id: "SUP-ADM-002", password: "superadmin456" },
    ];

    const isValid = validCredentials.some(
      (cred) => cred.id === loginId && cred.password === password,
    );

    if (isValid) {
      return {
        success: true,
        data: {
          token: "mock_super_admin_token_" + Date.now(),
          user: {
            id: loginId,
            name: "Dr. Robert Martinez",
            email: "superadmin@education.go.ke",
            role: "superadmin",
            schoolId: "",
            status: "active",
            lastActive: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }

    return {
      success: false,
      data: null as any,
      error: "Invalid super admin credentials",
    };
  }

  static async getSchools(): Promise<ApiResponse<School[]>> {
    await mockDelay();
    return {
      success: true,
      data: mockSchools,
    };
  }

  static async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    await mockDelay();
    return {
      success: true,
      data: mockSystemStats,
    };
  }

  static async getSuperAdminInfo(): Promise<ApiResponse<SuperAdminInfo>> {
    await mockDelay();
    return {
      success: true,
      data: mockSuperAdminInfo,
    };
  }

  static async getSystemAlerts(): Promise<ApiResponse<SystemAlert[]>> {
    await mockDelay();
    return {
      success: true,
      data: mockSystemAlerts,
    };
  }

  static async getNotifications(): Promise<ApiResponse<Notification[]>> {
    await mockDelay();
    return {
      success: true,
      data: mockNotifications,
    };
  }

  static async registerSchool(schoolData: any): Promise<ApiResponse<any>> {
    await mockDelay();

    const newSchool: School = {
      id: `SCH${String(mockSchools.length + 1).padStart(3, "0")}`,
      ...schoolData,
      students: 0,
      teachers: 0,
      status: "pending" as const,
      performance: 0,
      aiAccuracy: 0,
      lastSync: "Never",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const adminCredentials = {
      loginId: `${schoolData.code}-ADM-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      password: Math.random().toString(36).slice(-8).toUpperCase(),
    };

    // Add to mock data
    mockSchools.push(newSchool);

    return {
      success: true,
      data: {
        school: newSchool,
        adminCredentials,
      },
    };
  }

  static async resetPassword(
    email: string,
  ): Promise<ApiResponse<{ message: string }>> {
    await mockDelay();
    return {
      success: true,
      data: {
        message: `Password reset instructions sent to ${email}`,
      },
    };
  }

  // Student Dashboard Methods
  static async getStudentDashboard(): Promise<ApiResponse<any>> {
    await mockDelay(600);

    // Generate comprehensive mock dashboard data
    const mockDashboardData = {
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
          currentMood: "Focused",
          stressLevel: 0.3,
          confidenceLevel: 0.75,
          motivationLevel: 0.8,
          lastUpdated: new Date(),
        },
        aiPersonalityAnalysis: {
          dominantTraits: ["analytical", "creative", "collaborative"],
          learningArchetype: "The Explorer",
          strengthAreas: [
            "problem-solving",
            "visual learning",
            "analytical thinking",
          ],
          growthAreas: [
            "time management",
            "note-taking",
            "verbal communication",
          ],
          recommendedActivities: [
            "interactive simulations",
            "group projects",
            "visual aids",
          ],
          confidenceScore: 0.85,
          lastAnalysis: new Date(),
        },
        privacySettings: {
          shareLearningData: true,
          shareBehaviorAnalytics: false,
          allowPersonalization: true,
          showInLeaderboards: true,
          dataRetentionPreference: "standard",
        },
      },
      enrolledCourses: [
        // Include teacher-created courses from integration service
        ...teacherStudentIntegration.getStudentEnrolledCourses("student_001"),
        {
          id: "course_001",
          title: "Advanced Calculus",
          instructor: "Dr. Maria Rodriguez",
          progress: 68,
          completedLessons: 12,
          totalLessons: 18,
          recentGrade: 87,
          aiRecommended: true,
          subject: {
            subjectId: 1,
            name: "Mathematics",
            description: "Advanced mathematical concepts and applications",
          },
          upcomingAssignments: [
            {
              id: "assign_001",
              title: "Integration Techniques",
              dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
              priority: "high",
              status: "pending",
            },
            {
              id: "assign_002",
              title: "Problem Set 4",
              dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
              priority: "medium",
              status: "pending",
            },
          ],
          teacherCreated: false, // Original mock course
          classId: "",
          schedule: "Mon, Wed, Fri - 10:00 AM",
        },
        {
          id: "course_002",
          title: "Molecular Biology",
          instructor: "Prof. James Wilson",
          progress: 45,
          completedLessons: 8,
          totalLessons: 16,
          recentGrade: 92,
          aiRecommended: false,
          subject: {
            subjectId: 3,
            name: "Science",
            description: "Life sciences and biological processes",
          },
          upcomingAssignments: [
            {
              id: "assign_003",
              title: "Lab Report: DNA Extraction",
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              priority: "high",
              status: "pending",
            },
          ],
          teacherCreated: false,
          classId: "",
          schedule: "Tue, Thu - 2:00 PM",
        },
        {
          id: "course_003",
          title: "English Literature",
          instructor: "Ms. Sarah Thompson",
          progress: 82,
          completedLessons: 14,
          totalLessons: 16,
          recentGrade: 78,
          aiRecommended: false,
          subject: {
            subjectId: 2,
            name: "English Language",
            description: "Literature analysis and creative writing",
          },
          upcomingAssignments: [],
          teacherCreated: false,
          classId: "",
          schedule: "Mon, Wed - 1:00 PM",
        },
      ],
      behaviorSummary: {
        currentMood: "Focused",
        riskLevel: "low",
        engagementScore: 0.8,
        focusScore: 0.75,
        recentActivities: [
          "Completed Calculus Lesson 12",
          "Participated in Biology Discussion",
          "Submitted English Essay",
        ],
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      achievements: [
        {
          id: "achieve_001",
          title: "Math Wizard",
          description: "Completed 10 calculus lessons with >85% score",
          category: "academic",
          earnedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          iconUrl: "/icons/math-wizard.svg",
          isNew: true,
        },
        {
          id: "achieve_002",
          title: "Active Participant",
          description: "Posted 5 meaningful discussion contributions",
          category: "engagement",
          earnedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          iconUrl: "/icons/discussion.svg",
          isNew: false,
        },
        {
          id: "achieve_003",
          title: "Perfect Score",
          description: "Achieved 100% on Biology Lab Exam",
          category: "excellence",
          earnedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          iconUrl: "/icons/perfect-score.svg",
          isNew: true,
        },
      ],
      notifications: [
        {
          id: "notif_001",
          type: "assignment",
          title: "Assignment Due Soon",
          message: "Integration Techniques assignment is due in 5 days",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          read: false,
          priority: "high",
        },
        {
          id: "notif_002",
          type: "grade",
          title: "New Grade Posted",
          message: "Your Biology Lab Report has been graded: 92%",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          read: false,
          priority: "medium",
        },
        {
          id: "notif_003",
          type: "ai_insight",
          title: "AI Study Recommendation",
          message:
            "Based on your progress, consider reviewing integration by parts",
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          read: true,
          priority: "low",
        },
      ],
    };

    return {
      success: true,
      data: mockDashboardData,
    };
  }

  static async getCourseLessons(courseId: string): Promise<ApiResponse<any>> {
    await mockDelay(400);

    const mockLessons = [
      {
        id: `${courseId}_lesson_1`,
        title: "Introduction to Advanced Concepts",
        description:
          "Learn the fundamental principles that will guide your journey through this course.",
        type: "video",
        duration: 15,
        completed: false,
        content: {
          videoUrl: "https://example.com/video1",
          textContent: `Welcome to this comprehensive lesson on advanced concepts!

In this lesson, you'll learn:
• Core principles and foundations
• Key terminology and definitions
• Practical applications and examples
• How these concepts connect to real-world scenarios

This lesson is designed to build your understanding step by step, with interactive elements to help reinforce your learning.`,
        },
      },
      {
        id: `${courseId}_lesson_2`,
        title: "Practical Applications",
        description:
          "Apply what you've learned through hands-on exercises and real-world examples.",
        type: "interactive",
        duration: 25,
        completed: false,
        content: {
          textContent: "Interactive lesson content would go here...",
          interactiveElements: [],
        },
      },
      {
        id: `${courseId}_lesson_3`,
        title: "Assessment and Review",
        description: "Test your knowledge with a comprehensive quiz.",
        type: "quiz",
        duration: 20,
        completed: false,
        content: {
          quizQuestions: [],
        },
      },
    ];

    return {
      success: true,
      data: mockLessons,
    };
  }

  static async getCourseDiscussion(
    courseId: string,
  ): Promise<ApiResponse<any>> {
    await mockDelay(500);

    const mockDiscussion = {
      id: courseId,
      courseId: courseId,
      posts: [
        {
          id: "post_1",
          author: {
            name: "Dr. Sarah Johnson",
            role: "teacher",
            avatar: "",
          },
          title: "Welcome to the Course Discussion!",
          content: `Welcome everyone to our course discussion forum!

This is your space to:
• Ask questions about the course material
• Share insights and discoveries
• Collaborate with your classmates
• Get help from teaching assistants

Please remember to:
- Be respectful and constructive
- Search before posting to avoid duplicates
- Use clear, descriptive titles
- Tag your posts appropriately

Looking forward to great discussions!`,
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          likes: 23,
          replies: [
            {
              id: "reply_1_1",
              author: { name: "Alex Chen", role: "student" },
              content:
                "Thank you Dr. Johnson! Really excited to be part of this course.",
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
              likes: 5,
              isLiked: false,
            },
          ],
          isPinned: true,
          tags: ["announcement", "welcome"],
          isLiked: true,
        },
        {
          id: "post_2",
          author: {
            name: "Marcus Rodriguez",
            role: "student",
            avatar: "",
          },
          title: "Question about Lesson 3 - Advanced Concepts",
          content: `Hi everyone! I'm having trouble understanding the concept covered in Lesson 3, specifically the part about advanced principles.

Could someone explain how these connect to the examples we saw in Lesson 2? I feel like I'm missing something fundamental.

Any help would be appreciated!`,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          likes: 8,
          replies: [
            {
              id: "reply_2_1",
              author: { name: "Teaching Assistant", role: "ta" },
              content: `Great question Marcus! The connection between Lesson 2 and 3 is indeed subtle. Let me break it down:

1. In Lesson 2, we established the basic framework
2. Lesson 3 builds on that by introducing complexity layers
3. The key is to see how each principle amplifies the previous ones

Would you like to schedule office hours to go through this together?`,
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              likes: 12,
              isLiked: true,
            },
          ],
          isPinned: false,
          tags: ["question", "lesson-3"],
          isLiked: false,
        },
      ],
    };

    return {
      success: true,
      data: mockDiscussion,
    };
  }

  static async markNotificationAsRead(
    notificationId: string,
  ): Promise<ApiResponse<boolean>> {
    await mockDelay(200);
    return {
      success: true,
      data: true,
    };
  }

  static async markAllNotificationsAsRead(): Promise<ApiResponse<boolean>> {
    await mockDelay(300);
    return {
      success: true,
      data: true,
    };
  }

  static async markNotificationAsUnread(
    notificationId: string,
  ): Promise<ApiResponse<boolean>> {
    await mockDelay(200);
    return {
      success: true,
      data: true,
    };
  }
}
