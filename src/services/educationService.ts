// Education Service - Manages the educational hierarchy: Subjects → Lessons → Assignments
import axios, { AxiosInstance } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/anansiai";

// Educational Hierarchy Types
export interface Subject {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  lessonsCount?: number;
  progress?: number; // Student's progress in this subject
}

export interface Lesson {
  id: number;
  subjectId: number;
  title: string;
  description: string;
  content: string;
  duration: number; // in minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  isCompleted?: boolean;
  order: number;
  type: "video" | "reading" | "interactive" | "quiz";
}

export interface Course {
  id: string;
  title: string;
  subject: Subject;
  lessons: Lesson[];
  totalLessons: number;
  completedLessons: number;
  progress: number;
  instructor: string;
  estimatedDuration: number; // total course duration in hours
  difficulty: "beginner" | "intermediate" | "advanced";
  enrollmentDate: string;
  lastAccessedDate?: string;
}

export interface StudentProgress {
  subjectId: number;
  totalLessons: number;
  completedLessons: number;
  currentLesson?: Lesson;
  averageScore: number;
  timeSpent: number; // in minutes
  streak: number; // consecutive days
  lastActivity: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class EducationService {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 45000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Load auth token
    this.authToken =
      localStorage.getItem("auth_token") ||
      localStorage.getItem("anansi_token");

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("Education API Error:", error);
        return Promise.reject(error);
      },
    );
  }

  // =================== SUBJECTS ===================
  async getSubjects(): Promise<ApiResponse<Subject[]>> {
    try {
      console.log("📚 Fetching subjects from API...");

      const response = await this.client.get("/api/subjects");

      if (response.data) {
        const subjects = Array.isArray(response.data)
          ? response.data
          : [response.data];

        console.log("✅ Successfully fetched subjects:", subjects.length);

        return {
          success: true,
          data: subjects,
          message: `Successfully fetched ${subjects.length} subjects`,
        };
      }

      return {
        success: false,
        data: [],
        error: "No subjects data received from API",
      };
    } catch (error: any) {
      console.error("❌ Failed to fetch subjects:", error);

      return {
        success: false,
        data: [],
        error: `Failed to fetch subjects: ${error.message}`,
      };
    }
  }

  // =================== LESSONS ===================
  async getLessons(): Promise<ApiResponse<Lesson[]>> {
    try {
      console.log("📖 Fetching lessons from API...");

      const response = await this.client.get("/api/lessons");

      if (response.data) {
        const lessons = Array.isArray(response.data)
          ? response.data
          : [response.data];

        console.log("✅ Successfully fetched lessons:", lessons.length);

        return {
          success: true,
          data: lessons,
          message: `Successfully fetched ${lessons.length} lessons`,
        };
      }

      return {
        success: false,
        data: [],
        error: "No lessons data received from API",
      };
    } catch (error: any) {
      console.error("❌ Failed to fetch lessons:", error);

      return {
        success: false,
        data: [],
        error: `Failed to fetch lessons: ${error.message}`,
      };
    }
  }

  async getLessonsBySubject(subjectId: number): Promise<ApiResponse<Lesson[]>> {
    try {
      const allLessonsResponse = await this.getLessons();

      if (allLessonsResponse.success) {
        const subjectLessons = allLessonsResponse.data.filter(
          (lesson) => lesson.subjectId === subjectId,
        );

        return {
          success: true,
          data: subjectLessons,
          message: `Found ${subjectLessons.length} lessons for subject ${subjectId}`,
        };
      }

      return allLessonsResponse;
    } catch (error: any) {
      console.error(
        `❌ Failed to fetch lessons for subject ${subjectId}:`,
        error,
      );

      return {
        success: false,
        data: [],
        error: `Failed to load lessons: ${error.message}`,
      };
    }
  }

  // =================== COURSES (Combining Subjects + Lessons) ===================
  async getStudentCourses(): Promise<ApiResponse<Course[]>> {
    try {
      console.log("🎓 Building student courses from subjects and lessons...");

      const [subjectsResponse, lessonsResponse] = await Promise.all([
        this.getSubjects(),
        this.getLessons(),
      ]);

      if (subjectsResponse.success && lessonsResponse.success) {
        const courses: Course[] = subjectsResponse.data.map((subject) => {
          const subjectLessons = lessonsResponse.data.filter(
            (lesson) => lesson.subjectId === subject.id,
          );

          const completedLessons = subjectLessons.filter(
            (lesson) => lesson.isCompleted,
          ).length;

          const totalDuration = subjectLessons.reduce(
            (sum, lesson) => sum + lesson.duration,
            0,
          );

          // Determine course difficulty based on lessons
          const lessonDifficulties = subjectLessons.map((l) => l.difficulty);
          const difficulty = lessonDifficulties.includes("advanced")
            ? "advanced"
            : lessonDifficulties.includes("intermediate")
              ? "intermediate"
              : "beginner";

          return {
            id: `course_${subject.id}`,
            title: subject.name,
            subject: subject,
            lessons: subjectLessons.sort((a, b) => a.order - b.order),
            totalLessons: subjectLessons.length,
            completedLessons: completedLessons,
            progress:
              subjectLessons.length > 0
                ? Math.round((completedLessons / subjectLessons.length) * 100)
                : 0,
            instructor: this.getInstructorForSubject(subject.name),
            estimatedDuration: Math.round(totalDuration / 60), // Convert to hours
            difficulty,
            enrollmentDate: new Date(
              Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            lastAccessedDate:
              Math.random() > 0.3
                ? new Date(
                    Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
                  ).toISOString()
                : undefined,
          };
        });

        console.log("✅ Successfully built courses from subjects and lessons");

        return {
          success: true,
          data: courses,
          message: `Built ${courses.length} courses from ${subjectsResponse.data.length} subjects`,
        };
      }

      return {
        success: false,
        data: [],
        error: "Failed to load subjects or lessons",
      };
    } catch (error: any) {
      console.error("❌ Failed to build student courses:", error);

      return {
        success: false,
        data: [],
        error: `Failed to load courses: ${error.message}`,
      };
    }
  }

  // =================== STUDENT PROGRESS ===================
  async getStudentProgress(): Promise<ApiResponse<StudentProgress[]>> {
    try {
      const subjectsResponse = await this.getSubjects();
      const lessonsResponse = await this.getLessons();

      if (subjectsResponse.success && lessonsResponse.success) {
        const progressData: StudentProgress[] = subjectsResponse.data.map(
          (subject) => {
            const subjectLessons = lessonsResponse.data.filter(
              (lesson) => lesson.subjectId === subject.id,
            );

            const completedLessons = subjectLessons.filter(
              (l) => l.isCompleted,
            );
            const currentLesson = subjectLessons.find((l) => !l.isCompleted);

            return {
              subjectId: subject.id,
              totalLessons: subjectLessons.length,
              completedLessons: completedLessons.length,
              currentLesson,
              averageScore: 75 + Math.random() * 20, // Mock score
              timeSpent: completedLessons.length * 45, // Estimated time
              streak: Math.floor(Math.random() * 14), // Days streak
              lastActivity: new Date(
                Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000,
              ).toISOString(),
            };
          },
        );

        return {
          success: true,
          data: progressData,
          message: "Student progress calculated successfully",
        };
      }

      return {
        success: false,
        data: [],
        error: "Failed to calculate progress",
      };
    } catch (error: any) {
      console.error("❌ Failed to get student progress:", error);

      return {
        success: false,
        data: [],
        error: `Failed to load progress: ${error.message}`,
      };
    }
  }

  // =================== HELPER METHODS ===================
  private getInstructorForSubject(subjectName: string): string {
    const instructors: Record<string, string> = {
      Mathematics: "Dr. Sarah Chen",
      Biology: "Prof. Michael Torres",
      Physics: "Dr. Emily Watson",
      Chemistry: "Prof. James Rodriguez",
      History: "Dr. Angela Foster",
      "English Literature": "Prof. David Kim",
    };

    return instructors[subjectName] || "Prof. Academic Staff";
  }

  // Get next lesson for a subject
  async getNextLesson(subjectId: number): Promise<ApiResponse<Lesson | null>> {
    try {
      const lessonsResponse = await this.getLessonsBySubject(subjectId);

      if (lessonsResponse.success) {
        const nextLesson = lessonsResponse.data
          .sort((a, b) => a.order - b.order)
          .find((lesson) => !lesson.isCompleted);

        return {
          success: true,
          data: nextLesson || null,
          message: nextLesson ? "Next lesson found" : "All lessons completed",
        };
      }

      return lessonsResponse;
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: `Failed to get next lesson: ${error.message}`,
      };
    }
  }

  // Update auth token
  setAuthToken(token: string): void {
    this.authToken = token;
  }
}

// Export singleton instance
export const educationService = new EducationService();
export default educationService;
