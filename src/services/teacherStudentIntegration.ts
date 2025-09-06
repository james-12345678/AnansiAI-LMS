// Teacher-Student Content Integration Service
// This service ensures that teacher-created content flows to students properly

interface TeacherClass {
  id: string;
  name: string;
  subject: string;
  grade: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  progress: number;
  nextLesson: string;
  schedule: string;
  status: string;
  description: string;
  createdAt: string;
}

interface TeacherContent {
  id: string;
  title: string;
  subject: string;
  type: "lesson" | "assignment" | "quiz" | "project";
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "published" | "archived";
  teacherId: string;
  teacherName: string;
  classIds: string[]; // Which classes this content is assigned to
  createdAt: string;
  studentsCompleted: number;
  averageScore: number;
  estimatedDuration: number;
  description?: string;
  dueDate?: string;
  instructions?: string;
}

interface StudentEnrollment {
  studentId: string;
  classId: string;
  enrolledAt: string;
  progress: number;
  status: "active" | "completed" | "dropped";
}

interface StudentCourse {
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
    dueDate: Date;
    priority: "low" | "medium" | "high";
    status: "pending" | "submitted" | "graded";
  }>;
  schedule: string;
  teacherCreated: boolean; // Flag to show this comes from teacher
  classId: string; // Reference to original teacher class
}

// Storage for teacher-created content and enrollments
class TeacherStudentIntegrationService {
  private static instance: TeacherStudentIntegrationService;
  private teacherClasses: Map<string, TeacherClass> = new Map();
  private teacherContent: Map<string, TeacherContent> = new Map();
  private studentEnrollments: Map<string, StudentEnrollment[]> = new Map();

  static getInstance(): TeacherStudentIntegrationService {
    if (!TeacherStudentIntegrationService.instance) {
      TeacherStudentIntegrationService.instance =
        new TeacherStudentIntegrationService();
      TeacherStudentIntegrationService.instance.initializeMockData();
    }
    return TeacherStudentIntegrationService.instance;
  }

  // Initialize with some mock data to show the flow
  private initializeMockData() {
    // Mock teacher classes
    const mockClasses: TeacherClass[] = [
      {
        id: "TCH_CLS001",
        name: "Advanced Mathematics",
        subject: "Mathematics",
        grade: "10th",
        teacherId: "TCH001",
        teacherName: "Sarah Chen",
        studentCount: 28,
        progress: 78,
        nextLesson: "Calculus Fundamentals",
        schedule: "Mon, Wed, Fri - 9:00 AM",
        status: "active",
        description: "Advanced mathematical concepts for accelerated students",
        createdAt: "2024-01-15",
      },
      {
        id: "TCH_CLS002",
        name: "General Science",
        subject: "Science",
        grade: "9th",
        teacherId: "TCH001",
        teacherName: "Sarah Chen",
        studentCount: 32,
        progress: 65,
        nextLesson: "Chemical Reactions",
        schedule: "Tue, Thu - 11:00 AM",
        status: "active",
        description:
          "Comprehensive science curriculum covering biology, chemistry, and physics",
        createdAt: "2024-01-12",
      },
    ];

    // Mock teacher content
    const mockContent: TeacherContent[] = [
      {
        id: "TCH_CONT001",
        title: "Introduction to Calculus",
        subject: "Mathematics",
        type: "lesson",
        difficulty: "hard",
        status: "published",
        teacherId: "TCH001",
        teacherName: "Sarah Chen",
        classIds: ["TCH_CLS001"],
        createdAt: "2024-01-15",
        studentsCompleted: 24,
        averageScore: 83,
        estimatedDuration: 45,
        description:
          "Fundamental concepts of calculus including limits and derivatives",
        instructions:
          "Complete the interactive exercises and submit your solutions",
      },
      {
        id: "TCH_CONT002",
        title: "Quadratic Equations Practice",
        subject: "Mathematics",
        type: "assignment",
        difficulty: "medium",
        status: "published",
        teacherId: "TCH001",
        teacherName: "Sarah Chen",
        classIds: ["TCH_CLS001"],
        createdAt: "2024-01-12",
        studentsCompleted: 28,
        averageScore: 78,
        estimatedDuration: 30,
        description:
          "Practice problems for quadratic equations and their applications",
        dueDate: "2024-02-01",
        instructions: "Solve all problems showing your work step by step",
      },
      {
        id: "TCH_CONT003",
        title: "Chemical Reactions Lab",
        subject: "Science",
        type: "assignment",
        difficulty: "medium",
        status: "published",
        teacherId: "TCH001",
        teacherName: "Sarah Chen",
        classIds: ["TCH_CLS002"],
        createdAt: "2024-01-10",
        studentsCompleted: 18,
        averageScore: 89,
        estimatedDuration: 60,
        description:
          "Hands-on laboratory experiment exploring chemical reactions",
        dueDate: "2024-01-28",
        instructions: "Complete the lab worksheet and submit your observations",
      },
    ];

    // Mock student enrollments
    const mockEnrollments: { [studentId: string]: StudentEnrollment[] } = {
      STU001: [
        {
          studentId: "STU001",
          classId: "TCH_CLS001",
          enrolledAt: "2024-01-10",
          progress: 85,
          status: "active",
        },
      ],
      student_001: [
        // Default student from mock data
        {
          studentId: "student_001",
          classId: "TCH_CLS001",
          enrolledAt: "2024-01-10",
          progress: 68,
          status: "active",
        },
        {
          studentId: "student_001",
          classId: "TCH_CLS002",
          enrolledAt: "2024-01-08",
          progress: 45,
          status: "active",
        },
      ],
    };

    // Store the mock data
    mockClasses.forEach((cls) => this.teacherClasses.set(cls.id, cls));
    mockContent.forEach((content) =>
      this.teacherContent.set(content.id, content),
    );
    Object.entries(mockEnrollments).forEach(([studentId, enrollments]) => {
      this.studentEnrollments.set(studentId, enrollments);
    });

    console.info("🔗 Teacher-Student Integration: Mock data initialized");
    console.info(`📚 Classes available: ${this.teacherClasses.size}`);
    console.info(`📝 Content available: ${this.teacherContent.size}`);
    console.info(
      `👥 Students enrolled: ${Object.keys(mockEnrollments).length}`,
    );
  }

  // Teacher methods - called from teacher dashboard
  addTeacherClass(
    classData: Omit<
      TeacherClass,
      "id" | "createdAt" | "studentCount" | "progress"
    >,
  ): TeacherClass {
    const id = `TCH_CLS${Date.now()}`;
    const newClass: TeacherClass = {
      ...classData,
      id,
      createdAt: new Date().toISOString().split("T")[0],
      studentCount: 0,
      progress: 0,
    };

    this.teacherClasses.set(id, newClass);
    console.info(
      `📚 New class created: ${newClass.name} by ${newClass.teacherName}`,
    );
    return newClass;
  }

  addTeacherContent(
    contentData: Omit<
      TeacherContent,
      "id" | "createdAt" | "studentsCompleted" | "averageScore"
    >,
  ): TeacherContent {
    const id = `TCH_CONT${Date.now()}`;
    const newContent: TeacherContent = {
      ...contentData,
      id,
      createdAt: new Date().toISOString().split("T")[0],
      studentsCompleted: 0,
      averageScore: 0,
    };

    this.teacherContent.set(id, newContent);
    console.info(
      `📝 New content created: ${newContent.title} by ${newContent.teacherName}`,
    );
    return newContent;
  }

  // Student methods - called from student dashboard
  getStudentEnrolledCourses(studentId: string): StudentCourse[] {
    const enrollments = this.studentEnrollments.get(studentId) || [];
    const courses: StudentCourse[] = [];

    enrollments.forEach((enrollment) => {
      const teacherClass = this.teacherClasses.get(enrollment.classId);
      if (teacherClass) {
        // Convert teacher class to student course format
        const course: StudentCourse = {
          id: teacherClass.id,
          title: teacherClass.name,
          instructor: teacherClass.teacherName,
          progress: enrollment.progress,
          completedLessons: Math.floor((enrollment.progress / 100) * 15), // Estimate lessons
          totalLessons: 15, // Default lesson count
          aiRecommended: true, // Teacher-created content is AI-enhanced
          subject: {
            subjectId: this.getSubjectIdFromName(teacherClass.subject),
            name: teacherClass.subject,
            description: teacherClass.description,
          },
          upcomingAssignments: this.getUpcomingAssignmentsForClass(
            teacherClass.id,
          ),
          schedule: teacherClass.schedule,
          teacherCreated: true,
          classId: teacherClass.id,
        };
        courses.push(course);
      }
    });

    return courses;
  }

  getUpcomingAssignmentsForClass(classId: string): Array<{
    id: string;
    title: string;
    dueDate: Date;
    priority: "low" | "medium" | "high";
    status: "pending" | "submitted" | "graded";
  }> {
    const assignments: Array<{
      id: string;
      title: string;
      dueDate: Date;
      priority: "low" | "medium" | "high";
      status: "pending" | "submitted" | "graded";
    }> = [];

    this.teacherContent.forEach((content) => {
      if (
        content.classIds.includes(classId) &&
        content.type === "assignment" &&
        content.status === "published" &&
        content.dueDate
      ) {
        assignments.push({
          id: content.id,
          title: content.title,
          dueDate: new Date(content.dueDate),
          priority:
            content.difficulty === "hard"
              ? "high"
              : content.difficulty === "medium"
                ? "medium"
                : "low",
          status: "pending",
        });
      }
    });

    return assignments.sort(
      (a, b) => a.dueDate.getTime() - b.dueDate.getTime(),
    );
  }

  // Utility methods
  private getSubjectIdFromName(subjectName: string): number {
    const subjectMap: { [key: string]: number } = {
      Mathematics: 1,
      English: 2,
      Science: 3,
      "Computer Science": 4,
      History: 5,
    };
    return subjectMap[subjectName] || 1;
  }

  // Enrollment management
  enrollStudentInClass(studentId: string, classId: string): boolean {
    const existingEnrollments = this.studentEnrollments.get(studentId) || [];

    // Check if already enrolled
    if (existingEnrollments.some((e) => e.classId === classId)) {
      console.warn(`Student ${studentId} already enrolled in class ${classId}`);
      return false;
    }

    const newEnrollment: StudentEnrollment = {
      studentId,
      classId,
      enrolledAt: new Date().toISOString().split("T")[0],
      progress: 0,
      status: "active",
    };

    existingEnrollments.push(newEnrollment);
    this.studentEnrollments.set(studentId, existingEnrollments);

    // Update class student count
    const teacherClass = this.teacherClasses.get(classId);
    if (teacherClass) {
      teacherClass.studentCount += 1;
      this.teacherClasses.set(classId, teacherClass);
    }

    console.info(`✅ Student ${studentId} enrolled in class ${classId}`);
    return true;
  }

  // Get all teacher classes for display
  getTeacherClasses(teacherId?: string): TeacherClass[] {
    const classes = Array.from(this.teacherClasses.values());
    return teacherId
      ? classes.filter((cls) => cls.teacherId === teacherId)
      : classes;
  }

  // Get all teacher content
  getTeacherContent(teacherId?: string): TeacherContent[] {
    const content = Array.from(this.teacherContent.values());
    return teacherId
      ? content.filter((cont) => cont.teacherId === teacherId)
      : content;
  }

  // Integration status
  getIntegrationStatus() {
    return {
      totalClasses: this.teacherClasses.size,
      totalContent: this.teacherContent.size,
      totalEnrollments: Array.from(this.studentEnrollments.values()).reduce(
        (sum, enrollments) => sum + enrollments.length,
        0,
      ),
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const teacherStudentIntegration =
  TeacherStudentIntegrationService.getInstance();

// Export types for use in components
export type { TeacherClass, TeacherContent, StudentEnrollment, StudentCourse };
