// Comprehensive education platform types matching the .NET backend

// Core User and Authentication
export interface AppUser {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  address?: string;
  photoUrl?: string;
  phoneNumber?: string;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Educational Structure
export interface Subject {
  subjectId: number;
  subjectName: string;
  description: string;
  isActive: boolean;
  createdById: string;
  createdAt: Date;
  levels: Level[];
  lessons: Lesson[];
}

export interface Level {
  levelId: number;
  levelName: string;
  subjectId: number;
  teacherId: string;
  isActive: boolean;
  maxStudents: number;
  createdAt: Date;
  subject: Subject;
  teacher: AppUser;
  levelStudents: LevelStudents[];
}

export interface LevelStudents {
  levelId: number;
  studentId: string;
  enrolledAt: Date;
  status: LevelStudentStatus;
  level: Level;
  student: AppUser;
}

export enum LevelStudentStatus {
  Active = "Active",
  Inactive = "Inactive",
  Completed = "Completed",
  Withdrawn = "Withdrawn",
}

// Content and Learning
export interface Lesson {
  lessonId: number;
  subjectId: number;
  title: string;
  content: LessonContent; // JSON content
  difficultyLevel: number; // 1-10
  createdById: string;
  approvalStatus: ApprovalStatus;
  approvedById?: string;
  approvedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subject: Subject;
  createdBy: AppUser;
  approvedBy?: AppUser;
  assignments: Assignment[];
  twinInteractions: TwinInteraction[];
  behaviorLogs: BehaviorLog[];
}

export interface LessonContent {
  type: "video" | "text" | "interactive" | "quiz" | "coding";
  title: string;
  description: string;
  modules: LessonModule[];
  estimatedDuration: number; // minutes
  prerequisites: number[]; // lesson IDs
  learningObjectives: string[];
  resources: LessonResource[];
}

export interface LessonModule {
  id: string;
  title: string;
  type: "video" | "text" | "interactive" | "exercise";
  content: any; // Flexible content based on type
  duration: number;
  isRequired: boolean;
}

export interface LessonResource {
  id: string;
  title: string;
  type: "pdf" | "link" | "video" | "code";
  url: string;
  description?: string;
}

export interface Assignment {
  assignmentId: number;
  lessonId: number;
  title: string;
  questionType: QuestionType;
  content: AssignmentContent; // JSON content
  rubric: AssignmentRubric; // JSON rubric
  deadline?: Date;
  createdById: string;
  approvalStatus: ApprovalStatus;
  approvedById?: string;
  approvedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lesson: Lesson;
  createdBy: AppUser;
  approvedBy?: AppUser;
  submissions: Submission[];
}

export interface AssignmentContent {
  instructions: string;
  questions: AssignmentQuestion[];
  timeLimit?: number; // minutes
  allowedAttempts: number;
  resources: string[];
  hints: string[];
}

export interface AssignmentQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer?: any;
  points: number;
  explanation?: string;
  difficulty: number; // 1-10
}

export interface AssignmentRubric {
  criteria: RubricCriterion[];
  totalPoints: number;
  gradingScale: GradingScale;
  autoGradingEnabled: boolean;
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  level: string;
  description: string;
  points: number;
}

export interface GradingScale {
  A: { min: number; max: number };
  B: { min: number; max: number };
  C: { min: number; max: number };
  D: { min: number; max: number };
  F: { min: number; max: number };
}

export enum QuestionType {
  MultipleChoice = "MultipleChoice",
  Essay = "Essay",
  ShortAnswer = "ShortAnswer",
  TrueFalse = "TrueFalse",
  Matching = "Matching",
  FillInTheBlanks = "FillInTheBlanks",
  CodeSubmission = "CodeSubmission",
  ProjectSubmission = "ProjectSubmission",
  Presentation = "Presentation",
  PeerReview = "PeerReview",
}

export enum ApprovalStatus {
  Draft = "Draft",
  PendingReview = "PendingReview",
  Approved = "Approved",
  Rejected = "Rejected",
  RequiresRevision = "RequiresRevision",
}

export interface Submission {
  submissionId: number;
  assignmentId: number;
  studentId: string;
  content: SubmissionContent; // JSON content
  autoGrade?: number;
  teacherGrade?: number;
  finalGrade?: number;
  feedback?: string;
  reviewStatus: ReviewStatus;
  reviewedById?: string;
  reviewedAt?: Date;
  flagged: boolean;
  flagReason?: string;
  submittedAt: Date;
  gradedAt?: Date;
  assignment: Assignment;
  student: AppUser;
  reviewedBy?: AppUser;
}

export interface SubmissionContent {
  answers: SubmissionAnswer[];
  timeSpent: number; // minutes
  attemptNumber: number;
  files?: SubmissionFile[];
  notes?: string;
}

export interface SubmissionAnswer {
  questionId: string;
  answer: any; // flexible based on question type
  timeSpent: number;
  attempts: number;
  confidence: number; // 1-10 self-reported
}

export interface SubmissionFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export enum ReviewStatus {
  Pending = "Pending",
  InReview = "InReview",
  Approved = "Approved",
  Rejected = "Rejected",
  RequiresRevision = "RequiresRevision",
  Graded = "Graded",
}

// AI and Personalization
export interface StudentProfile {
  profileId: number;
  id?: string;
  appUserId?: string;
  studentId: string;
  personalityTraits: PersonalityTraits;
  learningPreferences: LearningPreferences;
  emotionalState: EmotionalState;
  aiPersonalityAnalysis?: {
    dominantTraits: string[];
    learningArchetype: string;
    strengthAreas: string[];
    growthAreas: string[];
    recommendedApproaches: string[];
  };
  parentContactInfo?: ParentContactInfo;
  privacySettings?: {
    dataSharing: string;
    parentalAccess: boolean;
    behaviorTracking: boolean;
    aiPersonalization: boolean;
    thirdPartyIntegrations: boolean;
  };
  isMinor: boolean;
  lastUpdated?: Date;
  createdAt: Date;
  updatedAt: Date;
  student: AppUser;
}

export interface PersonalityTraits {
  openness: number; // 0-100
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  learningStyle: LearningStyle;
  motivation: MotivationType[];
  strengths: string[];
  growthAreas: string[];
  lastAnalyzed: Date;
}

export interface LearningPreferences {
  preferredPace: "slow" | "medium" | "fast";
  preferredDifficulty: "easy" | "medium" | "challenging";
  preferredModalities: LearningModality[];
  preferredTimeOfDay: "morning" | "afternoon" | "evening";
  attentionSpan: number; // minutes
  breakPreference: number; // minutes between sessions
  feedbackStyle: "immediate" | "delayed" | "summary";
  collaborationPreference: "solo" | "pairs" | "groups";
  preferredStyle?: LearningStyle; // For backward compatibility
  difficultyPreference?: string;
  pacePreference?: string;
  feedbackFrequency?: string;
}

export interface EmotionalState {
  currentMood: Mood;
  stressLevel: number; // 0-100
  motivationLevel: number; // 0-100
  confidenceLevel: number; // 0-100
  engagementLevel: number; // 0-100
  frustrationLevel: number; // 0-100
  lastUpdated: Date;
  moodHistory: MoodEntry[];
}

export interface MoodEntry {
  mood: Mood;
  timestamp: Date;
  context: string;
  triggers?: string[];
}

export enum LearningStyle {
  Visual = "Visual",
  Auditory = "Auditory",
  Kinesthetic = "Kinesthetic",
  ReadingWriting = "ReadingWriting",
  Multimodal = "Multimodal",
}

export enum LearningModality {
  Video = "Video",
  Text = "Text",
  Audio = "Audio",
  Interactive = "Interactive",
  Hands_On = "Hands_On",
  Discussion = "Discussion",
  Simulation = "Simulation",
}

export enum MotivationType {
  Achievement = "Achievement",
  Social = "Social",
  Curiosity = "Curiosity",
  Competition = "Competition",
  Collaboration = "Collaboration",
  Recognition = "Recognition",
  Mastery = "Mastery",
}

export enum Mood {
  Excited = "Excited",
  Happy = "Happy",
  Neutral = "Neutral",
  Focused = "Focused",
  Tired = "Tired",
  Frustrated = "Frustrated",
  Confused = "Confused",
  Anxious = "Anxious",
  Bored = "Bored",
  Overwhelmed = "Overwhelmed",
}

export interface ParentContactInfo {
  primaryParent: ParentInfo;
  secondaryParent?: ParentInfo;
  emergencyContact: EmergencyContact;
  communicationPreferences: CommunicationPreferences;
  // Backward compatibility properties
  primaryParentName?: string;
  primaryParentEmail?: string;
  primaryParentPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface ParentInfo {
  name: string;
  email: string;
  phone: string;
  relationship: "mother" | "father" | "guardian" | "other";
  preferredContact: "email" | "phone" | "both";
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface CommunicationPreferences {
  progressReports: "daily" | "weekly" | "monthly";
  alertTypes: AlertType[];
  language: string;
  timezone: string;
}

export enum AlertType {
  LowPerformance = "LowPerformance",
  MissedDeadlines = "MissedDeadlines",
  BehaviorConcerns = "BehaviorConcerns",
  EmotionalSupport = "EmotionalSupport",
  Achievements = "Achievements",
  SystemUpdates = "SystemUpdates",
}

// Privacy and Settings
export interface PrivacySetting {
  settingId: number;
  userId: string;
  allowAiPersonalityAnalysis: boolean;
  allowBehaviorTracking: boolean;
  allowInteractionRecording: boolean;
  dataSharingLevel: DataSharingLevel;
  parentNotificationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: AppUser;
  // Backward compatibility properties
  dataSharing?: string;
  parentalAccess?: boolean;
  behaviorTracking?: boolean;
  aiPersonalization?: boolean;
  thirdPartyIntegrations?: boolean;
}

export enum DataSharingLevel {
  Minimal = "Minimal", // Only essential data
  Standard = "Standard", // Standard educational data
  Enhanced = "Enhanced", // Include behavior analytics
  Full = "Full", // All available data for research
}

// Behavior and AI Interaction
export interface BehaviorLog {
  behaviorLogId: number;
  studentId: string;
  lessonId: number;
  sessionId: string;
  actionType: BehaviorActionType;
  details: BehaviorDetails;
  riskScore: number; // 0-1
  flagged: boolean;
  createdAt: Date;
  student: AppUser;
  lesson: Lesson;
}

export interface BehaviorDetails {
  action: string;
  duration: number;
  context: any;
  metadata: {
    userAgent: string;
    screenResolution: string;
    timestamp: Date;
    sessionStartTime: Date;
  };
}

export enum BehaviorActionType {
  // Learning behaviors
  LessonStarted = "LessonStarted",
  LessonCompleted = "LessonCompleted",
  LessonAbandoned = "LessonAbandoned",
  QuestionAnswered = "QuestionAnswered",
  QuestionSkipped = "QuestionSkipped",

  // Interaction behaviors
  ClickPattern = "ClickPattern",
  ScrollPattern = "ScrollPattern",
  TimeSpentOnTask = "TimeSpentOnTask",
  FocusLoss = "FocusLoss",
  FocusReturn = "FocusReturn",

  // Social behaviors
  HelpRequested = "HelpRequested",
  PeerInteraction = "PeerInteraction",
  TeacherInteraction = "TeacherInteraction",

  // Risk indicators
  FrustrationDetected = "FrustrationDetected",
  ConfusionDetected = "ConfusionDetected",
  DisengagementDetected = "DisengagementDetected",
  ExcessiveGuessing = "ExcessiveGuessing",

  // Positive indicators
  FlowStateDetected = "FlowStateDetected",
  MasteryAchieved = "MasteryAchieved",
  ImprovementShown = "ImprovementShown",
  HelpProvided = "HelpProvided",
}

export interface TwinInteraction {
  interactionId: number;
  studentId: string;
  lessonId?: number;
  sessionId: string;
  interactionType: InteractionType;
  studentMessage: ChatMessage;
  twinResponse: ChatMessage;
  contextData: InteractionContext;
  sentimentScore: number; // -1 to 1
  flagged: boolean;
  flagReason?: string;
  createdAt: Date;
  student: AppUser;
  lesson?: Lesson;
}

export interface ChatMessage {
  content: string;
  type: "text" | "voice" | "image" | "code";
  metadata: {
    wordCount: number;
    readingLevel: number;
    topics: string[];
    entities: string[];
  };
}

export interface InteractionContext {
  currentLesson?: number;
  recentPerformance: number[];
  emotionalState: Mood;
  timeOfDay: string;
  sessionDuration: number;
  previousInteractions: number;
}

export enum InteractionType {
  QuestionAnswering = "QuestionAnswering",
  ConceptExplanation = "ConceptExplanation",
  MotivationalSupport = "MotivationalSupport",
  BehaviorGuidance = "BehaviorGuidance",
  GeneralConversation = "GeneralConversation",
  EmergencySupport = "EmergencySupport",
  LearningAssessment = "LearningAssessment",
  PersonalityAnalysis = "PersonalityAnalysis",
}

// Analytics and Progress
export interface LearningAnalytics {
  studentId: string;
  overallProgress: number; // 0-100
  subjectProgress: SubjectProgress[];
  strengths: string[];
  improvementAreas: string[];
  recommendedActions: RecommendedAction[];
  riskFactors: RiskFactor[];
  achievements: Achievement[];
  lastUpdated: Date;
}

export interface SubjectProgress {
  subjectId: number;
  subjectName: string;
  progress: number; // 0-100
  grade: string;
  completedLessons: number;
  totalLessons: number;
  averageScore: number;
  timeSpent: number; // hours
  lastActivity: Date;
}

export interface RecommendedAction {
  type: "lesson" | "practice" | "review" | "break" | "help";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedTime: number; // minutes
  dueDate?: Date;
}

export interface RiskFactor {
  type: string;
  level: "low" | "medium" | "high" | "critical";
  description: string;
  indicators: string[];
  recommendations: string[];
  detectedAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: "academic" | "behavioral" | "social" | "milestone";
  badgeUrl?: string;
  unlockedAt: Date;
  points: number;
}
