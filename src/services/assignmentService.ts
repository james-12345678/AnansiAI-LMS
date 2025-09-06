// Assignment Service - Integrates with available assignment endpoints
import axios, { AxiosInstance } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/anansiai";

// Assignment Types based on API schema
export interface Assignment {
  id?: number;
  lessonId: number;
  title: string;
  questionType: number;
  content: string;
  rubric: string;
  deadline: string;
  approvalStatus: number;
  approvedAt?: string;
  isActive: boolean;
}

export interface AssignmentForDashboard {
  id: string;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed" | "submitted";
  courseTitle?: string;
  subject?: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class AssignmentService {
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

    // Setup interceptors
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("Assignment API Error:", error);
        return Promise.reject(error);
      },
    );
  }

  // Get all assignments
  async getAllAssignments(): Promise<ApiResponse<Assignment[]>> {
    try {
      console.log("📚 Fetching all assignments from API...");

      const response = await this.client.get("/api/assignments");

      if (response.data) {
        const assignments = Array.isArray(response.data)
          ? response.data
          : [response.data];

        console.log("✅ Successfully fetched assignments:", assignments.length);

        return {
          success: true,
          data: assignments,
          message: `Successfully fetched ${assignments.length} assignments`,
        };
      }

      return {
        success: false,
        data: [],
        error: "No assignment data received from API",
      };
    } catch (error: any) {
      console.error("❌ Failed to fetch assignments:", error);

      // Return mock assignments for demonstration
      const mockAssignments: Assignment[] = [
        {
          id: 1,
          lessonId: 1,
          title: "Mathematics Problem Set - Calculus",
          questionType: 1,
          content: "Solve the integration problems and show your work clearly.",
          rubric: "Points based on accuracy and methodology",
          deadline: new Date(
            Date.now() + 3 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          approvalStatus: 1,
          isActive: true,
        },
        {
          id: 2,
          lessonId: 2,
          title: "Biology Lab Report - Cell Structure",
          questionType: 2,
          content:
            "Write a comprehensive lab report based on your microscope observations.",
          rubric: "Graded on observation accuracy, analysis, and presentation",
          deadline: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          approvalStatus: 1,
          isActive: true,
        },
        {
          id: 3,
          lessonId: 3,
          title: "History Essay - World War II Impact",
          questionType: 1,
          content:
            "Analyze the social and economic impact of World War II on developing nations.",
          rubric: "Essay structure, historical accuracy, critical thinking",
          deadline: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          approvalStatus: 1,
          isActive: true,
        },
      ];

      return {
        success: true,
        data: mockAssignments,
        message: "Using demo assignments (API not available)",
      };
    }
  }

  // Get specific assignment by ID
  async getAssignmentById(
    assignmentId: number,
  ): Promise<ApiResponse<Assignment>> {
    try {
      console.log(`📖 Fetching assignment ${assignmentId} from API...`);

      const response = await this.client.get(
        `/api/assignments/${assignmentId}`,
      );

      if (response.data) {
        console.log("✅ Successfully fetched assignment:", response.data);

        return {
          success: true,
          data: response.data,
          message: "Assignment fetched successfully",
        };
      }

      return {
        success: false,
        data: {} as Assignment,
        error: "Assignment not found",
      };
    } catch (error: any) {
      console.error(`❌ Failed to fetch assignment ${assignmentId}:`, error);

      // Return mock assignment for demonstration
      const mockAssignment: Assignment = {
        id: assignmentId,
        lessonId: 1,
        title: "Sample Assignment",
        questionType: 1,
        content: "This is a sample assignment for demonstration.",
        rubric: "Sample rubric",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        approvalStatus: 1,
        isActive: true,
      };

      return {
        success: true,
        data: mockAssignment,
        message: "Using demo assignment (API not available)",
      };
    }
  }

  // Create new assignment
  async createAssignment(
    assignmentData: Omit<Assignment, "id">,
  ): Promise<ApiResponse<Assignment>> {
    try {
      console.log("📝 Creating new assignment...", assignmentData);

      const response = await this.client.post(
        "/api/assignments/add-assignment",
        assignmentData,
      );

      if (response.data) {
        console.log("✅ Assignment created successfully:", response.data);

        return {
          success: true,
          data: response.data,
          message: "Assignment created successfully",
        };
      }

      return {
        success: false,
        data: {} as Assignment,
        error: "Failed to create assignment",
      };
    } catch (error: any) {
      console.error("❌ Failed to create assignment:", error);

      return {
        success: false,
        data: {} as Assignment,
        error: `Failed to create assignment: ${error.message}`,
      };
    }
  }

  // Update assignment
  async updateAssignment(
    assignmentId: number,
    updates: Partial<Assignment>,
  ): Promise<ApiResponse<Assignment>> {
    try {
      console.log(`📝 Updating assignment ${assignmentId}...`, updates);

      const response = await this.client.put(
        `/api/assignments/${assignmentId}`,
        updates,
      );

      if (response.data) {
        console.log("✅ Assignment updated successfully:", response.data);

        return {
          success: true,
          data: response.data,
          message: "Assignment updated successfully",
        };
      }

      return {
        success: false,
        data: {} as Assignment,
        error: "Failed to update assignment",
      };
    } catch (error: any) {
      console.error(`❌ Failed to update assignment ${assignmentId}:`, error);

      return {
        success: false,
        data: {} as Assignment,
        error: `Failed to update assignment: ${error.message}`,
      };
    }
  }

  // Delete assignment
  async deleteAssignment(assignmentId: number): Promise<ApiResponse<boolean>> {
    try {
      console.log(`🗑️ Deleting assignment ${assignmentId}...`);

      const response = await this.client.delete(
        `/api/assignments/${assignmentId}`,
      );

      console.log("✅ Assignment deleted successfully");

      return {
        success: true,
        data: true,
        message: "Assignment deleted successfully",
      };
    } catch (error: any) {
      console.error(`❌ Failed to delete assignment ${assignmentId}:`, error);

      return {
        success: false,
        data: false,
        error: `Failed to delete assignment: ${error.message}`,
      };
    }
  }

  // Transform API assignments to dashboard format
  transformToDashboardFormat(
    assignments: Assignment[],
  ): AssignmentForDashboard[] {
    return assignments.map((assignment) => {
      // Calculate priority based on deadline
      const daysUntilDue = Math.ceil(
        (new Date(assignment.deadline).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );

      let priority: "high" | "medium" | "low" = "medium";
      if (daysUntilDue <= 1) priority = "high";
      else if (daysUntilDue <= 3) priority = "medium";
      else priority = "low";

      // Determine status based on approval and activity
      let status: "pending" | "completed" | "submitted" = "pending";
      if (assignment.approvalStatus === 2) status = "completed";
      else if (assignment.approvalStatus === 1) status = "submitted";

      return {
        id: assignment.id?.toString() || "unknown",
        title: assignment.title,
        dueDate: assignment.deadline,
        priority,
        status,
        description: assignment.content,
        courseTitle: `Lesson ${assignment.lessonId}`, // Would need course mapping
        subject: this.getSubjectFromTitle(assignment.title),
      };
    });
  }

  // Helper to extract subject from assignment title
  private getSubjectFromTitle(title: string): string {
    const lowerTitle = title.toLowerCase();

    if (
      lowerTitle.includes("math") ||
      lowerTitle.includes("calculus") ||
      lowerTitle.includes("algebra")
    ) {
      return "Mathematics";
    } else if (
      lowerTitle.includes("bio") ||
      lowerTitle.includes("cell") ||
      lowerTitle.includes("lab")
    ) {
      return "Biology";
    } else if (
      lowerTitle.includes("history") ||
      lowerTitle.includes("war") ||
      lowerTitle.includes("essay")
    ) {
      return "History";
    } else if (
      lowerTitle.includes("physics") ||
      lowerTitle.includes("force") ||
      lowerTitle.includes("motion")
    ) {
      return "Physics";
    } else if (
      lowerTitle.includes("chemistry") ||
      lowerTitle.includes("chemical") ||
      lowerTitle.includes("reaction")
    ) {
      return "Chemistry";
    } else if (
      lowerTitle.includes("english") ||
      lowerTitle.includes("literature") ||
      lowerTitle.includes("writing")
    ) {
      return "English";
    }

    return "General Studies";
  }

  // Get assignments for student dashboard with mock course context
  async getAssignmentsForDashboard(): Promise<
    ApiResponse<AssignmentForDashboard[]>
  > {
    try {
      const assignmentsResponse = await this.getAllAssignments();

      if (assignmentsResponse.success) {
        const dashboardAssignments = this.transformToDashboardFormat(
          assignmentsResponse.data,
        );

        return {
          success: true,
          data: dashboardAssignments,
          message: `Loaded ${dashboardAssignments.length} assignments for dashboard`,
        };
      }

      return {
        success: false,
        data: [],
        error: assignmentsResponse.error || "Failed to load assignments",
      };
    } catch (error: any) {
      console.error("❌ Failed to get assignments for dashboard:", error);

      return {
        success: false,
        data: [],
        error: `Failed to load assignments: ${error.message}`,
      };
    }
  }

  // Update auth token
  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem("auth_token", token);
  }

  // Clear auth token
  clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem("auth_token");
  }
}

// Export singleton instance
export const assignmentService = new AssignmentService();
export default assignmentService;
