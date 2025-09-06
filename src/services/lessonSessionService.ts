import axiosClient from "./axiosClient";

export interface LessonSessionRequest {
  lessonId: number;
  studentId: string;
  institutionId: number;
}

export interface EndLessonSessionRequest {
  endTime: string;
  isActive: boolean;
}

export interface LessonSession {
  lessonSessionId: number;
  lessonId: number;
  studentId: string;
  institutionId: number;
  startTime: string;
  endTime?: string;
  isActive: boolean;
}

export interface BehaviorLogRequest {
  lessonId: number;
  lessonSessionId: number;
  studentId: string;
  institutionId: number;
  actionType: number; // 1=Click, 2=Scroll, 3=AppSwitch, 4=Idle, 5=FocusLoss, 6=TabSwitch, 7=Download, 8=Copy, 9=Paste
  details: string;
  riskScore: number;
  flagged: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

class LessonSessionService {
  // Start a new lesson session
  async startLessonSession(
    request: LessonSessionRequest
  ): Promise<ApiResponse<LessonSession>> {
    try {
      const response = await axiosClient.post("/api/lesson-sessions/start-session", request);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to start lesson session:", error);
      return {
        success: false,
        data: {} as LessonSession,
        error: error.response?.data?.message || error.message || "Failed to start lesson session",
      };
    }
  }

  // End a lesson session
  async endLessonSession(
    sessionId: number,
    request: EndLessonSessionRequest
  ): Promise<ApiResponse<LessonSession>> {
    try {
      const response = await axiosClient.post(
        `/api/lesson-sessions/end-session/${sessionId}`,
        request
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to end lesson session:", error);
      return {
        success: false,
        data: {} as LessonSession,
        error: error.response?.data?.message || error.message || "Failed to end lesson session",
      };
    }
  }

  // Get lesson session details
  async getLessonSession(sessionId: number): Promise<ApiResponse<LessonSession>> {
    try {
      const response = await axiosClient.get(`/api/lesson-sessions/${sessionId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to get lesson session:", error);
      return {
        success: false,
        data: {} as LessonSession,
        error: error.response?.data?.message || error.message || "Failed to get lesson session",
      };
    }
  }

  // Add behavior log entry
  async addBehaviorLog(request: BehaviorLogRequest): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.post("/api/behavior-logs/add-behavior-log", request);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to add behavior log:", error);
      return {
        success: false,
        data: {},
        error: error.response?.data?.message || error.message || "Failed to add behavior log",
      };
    }
  }

  // Get behavior log details
  async getBehaviorLog(logId: number): Promise<ApiResponse<any>> {
    try {
      const response = await axiosClient.get(`/api/behavior-logs/${logId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Failed to get behavior log:", error);
      return {
        success: false,
        data: {},
        error: error.response?.data?.message || error.message || "Failed to get behavior log",
      };
    }
  }

  // Helper method to create standard behavior logs for lesson actions
  async logLessonAction(
    lessonId: number,
    sessionId: number,
    studentId: string,
    institutionId: number,
    action: "start" | "pause" | "resume" | "end",
    details?: string
  ): Promise<void> {
    const actionTypes = {
      start: 1, // Click
      pause: 1, // Click
      resume: 1, // Click
      end: 1, // Click
    };

    const behaviorLog: BehaviorLogRequest = {
      lessonId,
      lessonSessionId: sessionId,
      studentId,
      institutionId,
      actionType: actionTypes[action],
      details: details || `Lesson ${action} action`,
      riskScore: 0, // Normal activity
      flagged: false,
    };

    try {
      await this.addBehaviorLog(behaviorLog);
    } catch (error) {
      console.warn("Failed to log lesson action:", error);
      // Don't throw error as this is non-critical
    }
  }

  // Helper method to create behavior logs for user activity during lessons
  async logUserActivity(
    lessonId: number,
    sessionId: number,
    studentId: string,
    institutionId: number,
    activityType: "focus_loss" | "tab_switch" | "idle" | "app_switch",
    details?: string
  ): Promise<void> {
    const actionTypes = {
      focus_loss: 5, // FocusLoss
      tab_switch: 6, // TabSwitch
      idle: 4, // Idle
      app_switch: 3, // AppSwitch
    };

    // Calculate risk score based on activity type
    const riskScores = {
      focus_loss: 0.3,
      tab_switch: 0.4,
      idle: 0.2,
      app_switch: 0.6,
    };

    const behaviorLog: BehaviorLogRequest = {
      lessonId,
      lessonSessionId: sessionId,
      studentId,
      institutionId,
      actionType: actionTypes[activityType],
      details: details || `User ${activityType.replace('_', ' ')} detected`,
      riskScore: riskScores[activityType],
      flagged: riskScores[activityType] > 0.5,
    };

    try {
      await this.addBehaviorLog(behaviorLog);
    } catch (error) {
      console.warn("Failed to log user activity:", error);
      // Don't throw error as this is non-critical
    }
  }
}

export const lessonSessionService = new LessonSessionService();
export default lessonSessionService;
