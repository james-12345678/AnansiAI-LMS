// Test file for adminApiService
import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminApiService } from "./adminApiService";

// Mock axiosClient
vi.mock("./axiosClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("AdminApiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be a singleton instance", () => {
    const instance1 = adminApiService;
    const instance2 = adminApiService;
    expect(instance1).toBe(instance2);
  });

  it("should have all required methods", () => {
    expect(typeof adminApiService.getInstitutions).toBe("function");
    expect(typeof adminApiService.getSubjects).toBe("function");
    expect(typeof adminApiService.getLessons).toBe("function");
    expect(typeof adminApiService.getAssignments).toBe("function");
    expect(typeof adminApiService.getUsersByRole).toBe("function");
    expect(typeof adminApiService.getAllRoles).toBe("function");
    expect(typeof adminApiService.getAllEnums).toBe("function");
    expect(typeof adminApiService.getDashboardData).toBe("function");
  });

  it("should have CRUD methods for each entity", () => {
    // Institutions
    expect(typeof adminApiService.createInstitution).toBe("function");
    expect(typeof adminApiService.updateInstitution).toBe("function");
    expect(typeof adminApiService.deleteInstitution).toBe("function");

    // Subjects
    expect(typeof adminApiService.createSubject).toBe("function");
    expect(typeof adminApiService.updateSubject).toBe("function");
    expect(typeof adminApiService.deleteSubject).toBe("function");

    // Lessons
    expect(typeof adminApiService.createLesson).toBe("function");
    expect(typeof adminApiService.updateLesson).toBe("function");
    expect(typeof adminApiService.deleteLesson).toBe("function");

    // Assignments
    expect(typeof adminApiService.createAssignment).toBe("function");
    expect(typeof adminApiService.updateAssignment).toBe("function");
    expect(typeof adminApiService.deleteAssignment).toBe("function");
  });

  it("should have utility methods", () => {
    expect(typeof adminApiService.testConnection).toBe("function");
    expect(typeof adminApiService.getHealthStatus).toBe("function");
    expect(typeof adminApiService.searchAll).toBe("function");
    expect(typeof adminApiService.getInstitutionData).toBe("function");
  });
});
