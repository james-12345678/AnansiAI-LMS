// Types for Curriculum Management System

export interface Curriculum {
  id: string;
  name: string;
  description?: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Many-to-many relationship with curriculums
  curriculums?: Curriculum[];
}

export interface SubjectCurriculumRelation {
  id: string;
  subjectId: string;
  curriculumId: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  curriculumId: string;
  subjectId: string;
  term: string; // e.g., "Term 1", "Quarter 1", "Semester 1" (clean name)
  milestone: string; // Description of what content is to be covered
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Related entities for UI display
  curriculum?: Curriculum;
  subject?: Subject;
  // Additional fields for teacher dashboard
  curriculumName?: string;
  subjectName?: string;
  termFull?: string; // Full term name with curriculum prefix
}

export interface Goal {
  id: string;
  curriculumId: string;
  subjectId: string;
  term: string; // e.g., "Term 1", "Quarter 1", "Semester 1" (clean name)
  goal: string; // Description of what learners should achieve
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Related entities for UI display
  curriculum?: Curriculum;
  subject?: Subject;
  // Additional fields for teacher dashboard
  curriculumName?: string;
  subjectName?: string;
  termFull?: string; // Full term name with curriculum prefix
}

// Common options for terms/durations
export const TERM_OPTIONS = [
  "Term 1",
  "Term 2",
  "Term 3",
  "Quarter 1",
  "Quarter 2",
  "Quarter 3",
  "Quarter 4",
  "Semester 1",
  "Semester 2",
  "Full Year",
] as const;

export type TermOption = (typeof TERM_OPTIONS)[number];

// Common curriculum systems
export const COMMON_CURRICULUMS = [
  "CBC (Competency Based Curriculum)",
  "IGCSE (International General Certificate of Secondary Education)",
  "8-4-4 System",
  "IB (International Baccalaureate)",
  "A-Levels",
  "Cambridge International",
  "American Curriculum",
  "French Curriculum",
  "German Curriculum",
  "Other",
] as const;

export type CommonCurriculum = (typeof COMMON_CURRICULUMS)[number];

// Form data interfaces for creating/editing
export interface CurriculumFormData {
  name: string;
  description?: string;
  code?: string;
}

export interface SubjectFormData {
  name: string;
  description?: string;
  code?: string;
  curriculumIds?: string[]; // For many-to-many relationships
}

export interface MilestoneFormData {
  curriculumId: string;
  subjectId: string;
  term: string;
  milestone: string;
}

export interface GoalFormData {
  curriculumId: string;
  subjectId: string;
  term: string;
  goal: string;
}

// Filter interfaces for data display
export interface CurriculumFilter {
  search?: string;
  isActive?: boolean;
}

export interface SubjectFilter {
  search?: string;
  curriculumId?: string;
  isActive?: boolean;
}

export interface MilestoneFilter {
  search?: string;
  curriculumId?: string;
  subjectId?: string;
  term?: string;
}

export interface GoalFilter {
  search?: string;
  curriculumId?: string;
  subjectId?: string;
  term?: string;
}

// API response interfaces
export interface CurriculumApiResponse {
  curriculums: Curriculum[];
  total: number;
  page: number;
  limit: number;
}

export interface SubjectApiResponse {
  subjects: Subject[];
  total: number;
  page: number;
  limit: number;
}

export interface MilestoneApiResponse {
  milestones: Milestone[];
  total: number;
  page: number;
  limit: number;
}

export interface GoalApiResponse {
  goals: Goal[];
  total: number;
  page: number;
  limit: number;
}
