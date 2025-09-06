import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Brain,
  Heart,
  Shield,
  Settings,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Star,
  Target,
  Palette,
  Clock,
  Users,
  Book,
  Headphones,
  Video,
  PenTool,
  Activity,
  Zap,
  Coffee,
  Moon,
  Sun,
  Volume2,
  Bell,
  Mail,
  Phone,
  Home,
  Calendar,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  StudentProfile,
  PersonalityTraits,
  LearningPreferences,
  EmotionalState,
  PrivacySetting,
  DataSharingLevel,
  LearningStyle,
  LearningModality,
  MotivationType,
  Mood,
  ParentContactInfo,
  AlertType,
} from "@/types/education";

interface StudentProfileManagerProps {
  profile?: Partial<StudentProfile>;
  privacySettings?: Partial<PrivacySetting>;
  onProfileUpdate?: (updates: Partial<StudentProfile>) => void;
  onPrivacyUpdate?: (updates: Partial<PrivacySetting>) => void;
  isMinor?: boolean;
  className?: string;
}

const StudentProfileManager: React.FC<StudentProfileManagerProps> = ({
  profile = {},
  privacySettings = {},
  onProfileUpdate = () => {},
  onPrivacyUpdate = () => {},
  isMinor = false,
  className,
}) => {
  const [activeTab, setActiveTab] = useState("personality");
  const [isEditing, setIsEditing] = useState(false);

  // Create default profile structure with all required nested objects
  const defaultProfile: StudentProfile = {
    profileId: profile?.profileId || 1,
    studentId: profile?.studentId || "default_student",
    id: profile?.id || "default_student",
    appUserId: profile?.appUserId || "default_user",
    personalityTraits: {
      openness: 0.75,
      conscientiousness: 0.82,
      extraversion: 0.65,
      agreeableness: 0.78,
      neuroticism: 0.35,
      learningStyle: LearningStyle.Visual,
      motivation: [],
      strengths: ["problem-solving", "visual learning", "analytical thinking"],
      growthAreas: ["time management", "verbal communication"],
      lastAnalyzed: new Date(),
      ...profile?.personalityTraits,
    },
    learningPreferences: {
      preferredStyle: LearningStyle.Visual,
      preferredModalities: [
        LearningModality.Interactive,
        LearningModality.Video,
      ],
      difficultyPreference: "adaptive",
      pacePreference: "moderate",
      feedbackFrequency: "immediate",
      preferredPace: "medium",
      preferredDifficulty: "medium",
      preferredTimeOfDay: "morning",
      attentionSpan: 45,
      breakPreference: 10,
      feedbackStyle: "immediate",
      collaborationPreference: "pairs",
      ...profile?.learningPreferences,
    },
    emotionalState: {
      currentMood: Mood.Neutral,
      stressLevel: 0.3,
      confidenceLevel: 0.75,
      motivationLevel: 0.8,
      lastUpdated: new Date(),
      ...profile?.emotionalState,
    },
    aiPersonalityAnalysis: {
      dominantTraits: ["analytical", "creative"],
      learningArchetype: "The Explorer",
      strengthAreas: ["problem-solving", "visual learning"],
      growthAreas: ["time management"],
      recommendedApproaches: ["Visual learning materials"],
      ...profile?.aiPersonalityAnalysis,
    },
    parentContactInfo: {
      primaryParent: {
        name: profile?.parentContactInfo?.primaryParentName || "Parent Name",
        email:
          profile?.parentContactInfo?.primaryParentEmail || "parent@email.com",
        phone: profile?.parentContactInfo?.primaryParentPhone || "+1-555-0000",
        relationship: "guardian",
        preferredContact: "email",
      },
      emergencyContact: {
        name:
          profile?.parentContactInfo?.emergencyContactName ||
          "Emergency Contact",
        phone:
          profile?.parentContactInfo?.emergencyContactPhone || "+1-555-0001",
      },
      communicationPreferences: {
        method: "email",
        frequency: "weekly",
        language: "english",
        timezone: "EST",
      },
      ...profile?.parentContactInfo,
    },
    privacySettings: {
      dataSharing: "educational_only" as any,
      parentalAccess: true,
      behaviorTracking: true,
      aiPersonalization: true,
      thirdPartyIntegrations: false,
      ...profile?.privacySettings,
    },
    isMinor: profile?.isMinor || isMinor || false,
    lastUpdated: profile?.lastUpdated || new Date(),
    createdAt: profile?.createdAt || new Date(),
    updatedAt: profile?.updatedAt || new Date(),
    student: profile?.student || {
      id: "default_user",
      userName: "DefaultUser",
      email: "default@example.com",
      fullName: "Default Student",
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const defaultPrivacy: PrivacySetting = {
    settingId: privacySettings?.settingId || 1,
    userId: privacySettings?.userId || "default_user",
    allowAiPersonalityAnalysis:
      privacySettings?.allowAiPersonalityAnalysis || true,
    allowBehaviorTracking: privacySettings?.allowBehaviorTracking || true,
    allowInteractionRecording:
      privacySettings?.allowInteractionRecording || true,
    dataSharingLevel:
      privacySettings?.dataSharingLevel || DataSharingLevel.Standard,
    parentNotificationEnabled:
      privacySettings?.parentNotificationEnabled || true,
    createdAt: privacySettings?.createdAt || new Date(),
    updatedAt: privacySettings?.updatedAt || new Date(),
    user: privacySettings?.user || {
      id: "default_user",
      userName: "DefaultUser",
      email: "default@example.com",
      fullName: "Default User",
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Backward compatibility properties
    dataSharing: "educational_only" as any,
    parentalAccess: true,
    behaviorTracking: true,
    aiPersonalization: true,
    thirdPartyIntegrations: false,
    ...privacySettings,
  };

  const [localProfile, setLocalProfile] =
    useState<StudentProfile>(defaultProfile);
  const [localPrivacy, setLocalPrivacy] =
    useState<PrivacySetting>(defaultPrivacy);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Personality Analysis Simulation
  const triggerPersonalityAnalysis = async () => {
    setIsAnalyzing(true);

    // Simulate AI personality analysis
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const newTraits: PersonalityTraits = {
      openness: 65 + Math.random() * 30,
      conscientiousness: 70 + Math.random() * 25,
      extraversion: 55 + Math.random() * 35,
      agreeableness: 75 + Math.random() * 20,
      neuroticism: 30 + Math.random() * 25,
      learningStyle: profile.personalityTraits.learningStyle,
      motivation: [
        MotivationType.Achievement,
        MotivationType.Curiosity,
        MotivationType.Mastery,
      ],
      strengths: [
        "Strong analytical thinking",
        "Good at breaking down complex problems",
        "Excellent attention to detail",
        "Natural curiosity for learning",
      ],
      growthAreas: [
        "Could benefit from more collaborative work",
        "Time management skills development",
        "Confidence in public speaking",
      ],
      lastAnalyzed: new Date(),
    };

    setLocalProfile((prev) => ({
      ...prev,
      personalityTraits: newTraits,
    }));

    setIsAnalyzing(false);
  };

  const handleSave = () => {
    onProfileUpdate(localProfile);
    onPrivacyUpdate(localPrivacy);
    setIsEditing(false);
  };

  const handleReset = () => {
    setLocalProfile({ ...defaultProfile, ...profile });
    setLocalPrivacy({ ...defaultPrivacy, ...privacySettings });
    setIsEditing(false);
  };

  const updatePersonalityTrait = (
    trait: keyof PersonalityTraits,
    value: any,
  ) => {
    setLocalProfile((prev) => ({
      ...prev,
      personalityTraits: {
        ...prev.personalityTraits,
        [trait]: value,
      },
    }));
  };

  const updateLearningPreference = (
    pref: keyof LearningPreferences,
    value: any,
  ) => {
    setLocalProfile((prev) => ({
      ...prev,
      learningPreferences: {
        ...prev.learningPreferences,
        [pref]: value,
      },
    }));
  };

  const updateEmotionalState = (state: keyof EmotionalState, value: any) => {
    setLocalProfile((prev) => ({
      ...prev,
      emotionalState: {
        ...prev.emotionalState,
        [state]: value,
        lastUpdated: new Date(),
      },
    }));
  };

  const updatePrivacySetting = (setting: keyof PrivacySetting, value: any) => {
    setLocalPrivacy((prev) => ({
      ...prev,
      [setting]: value,
      updatedAt: new Date(),
    }));
  };

  const getPersonalityColor = (value: number) => {
    if (value >= 80) return "text-green-600 bg-green-50";
    if (value >= 60) return "text-blue-600 bg-blue-50";
    if (value >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getMoodIcon = (mood: Mood) => {
    const icons = {
      [Mood.Excited]: "🤩",
      [Mood.Happy]: "😊",
      [Mood.Neutral]: "😐",
      [Mood.Focused]: "🎯",
      [Mood.Tired]: "😴",
      [Mood.Frustrated]: "😤",
      [Mood.Confused]: "😕",
      [Mood.Anxious]: "😰",
      [Mood.Bored]: "😑",
      [Mood.Overwhelmed]: "😵",
    };
    return icons[mood] || "😐";
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <CardTitle>Student Profile & AI Personalization</CardTitle>
            {localProfile?.personalityTraits?.lastAnalyzed && (
              <Badge variant="outline" className="text-xs">
                Last analyzed:{" "}
                {new Date(
                  localProfile.personalityTraits.lastAnalyzed,
                ).toLocaleDateString()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personality">
              <Brain className="w-4 h-4 mr-2" />
              Personality
            </TabsTrigger>
            <TabsTrigger value="learning">
              <Book className="w-4 h-4 mr-2" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="emotional">
              <Heart className="w-4 h-4 mr-2" />
              Emotional
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="parents">
              <Home className="w-4 h-4 mr-2" />
              Parents
            </TabsTrigger>
          </TabsList>

          {/* Personality Traits Tab */}
          <TabsContent value="personality" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">AI Personality Analysis</h3>
              <Button
                onClick={triggerPersonalityAnalysis}
                disabled={
                  isAnalyzing || !privacySettings.allowAiPersonalityAnalysis
                }
                variant="outline"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                {isAnalyzing ? "Analyzing..." : "Run AI Analysis"}
              </Button>
            </div>

            {!privacySettings.allowAiPersonalityAnalysis && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  AI personality analysis is disabled. Enable it in Privacy
                  settings to get personalized insights.
                </span>
              </div>
            )}

            {/* Big 5 Personality Traits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "openness",
                  label: "Openness to Experience",
                  description:
                    "Creativity, curiosity, and willingness to try new things",
                },
                {
                  key: "conscientiousness",
                  label: "Conscientiousness",
                  description:
                    "Organization, discipline, and goal-oriented behavior",
                },
                {
                  key: "extraversion",
                  label: "Extraversion",
                  description:
                    "Social energy, assertiveness, and positive emotions",
                },
                {
                  key: "agreeableness",
                  label: "Agreeableness",
                  description: "Cooperation, trust, and concern for others",
                },
                {
                  key: "neuroticism",
                  label: "Emotional Stability",
                  description: "Emotional resilience and stress management",
                },
              ].map((trait) => (
                <Card key={trait.key} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">{trait.label}</Label>
                    <Badge
                      className={getPersonalityColor(
                        localProfile.personalityTraits[
                          trait.key as keyof PersonalityTraits
                        ] as number,
                      )}
                    >
                      {Math.round(
                        localProfile.personalityTraits[
                          trait.key as keyof PersonalityTraits
                        ] as number,
                      )}
                      %
                    </Badge>
                  </div>
                  <Progress
                    value={
                      localProfile.personalityTraits[
                        trait.key as keyof PersonalityTraits
                      ] as number
                    }
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-600">{trait.description}</p>
                  {isEditing && (
                    <Slider
                      value={[
                        localProfile.personalityTraits[
                          trait.key as keyof PersonalityTraits
                        ] as number,
                      ]}
                      onValueChange={([value]) =>
                        updatePersonalityTrait(
                          trait.key as keyof PersonalityTraits,
                          value,
                        )
                      }
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  )}
                </Card>
              ))}
            </div>

            {/* Learning Style */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">
                Primary Learning Style
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.values(LearningStyle).map((style) => (
                  <Button
                    key={style}
                    variant={
                      localProfile.personalityTraits.learningStyle === style
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      isEditing &&
                      updatePersonalityTrait("learningStyle", style)
                    }
                    disabled={!isEditing}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                  >
                    <div className="text-lg">
                      {style === LearningStyle.Visual && "👁️"}
                      {style === LearningStyle.Auditory && "👂"}
                      {style === LearningStyle.Kinesthetic && "✋"}
                      {style === LearningStyle.ReadingWriting && "📝"}
                      {style === LearningStyle.Multimodal && "🔄"}
                    </div>
                    <span className="text-xs">{style}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Strengths and Growth Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Strengths
                </Label>
                <div className="space-y-2">
                  {(localProfile?.personalityTraits?.strengths || []).map(
                    (strength, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-green-50 rounded"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ),
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Growth Areas
                </Label>
                <div className="space-y-2">
                  {(localProfile?.personalityTraits?.growthAreas || []).map(
                    (area, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-blue-50 rounded"
                      >
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{area}</span>
                      </div>
                    ),
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Preferences Tab */}
          <TabsContent value="learning" className="space-y-6">
            <h3 className="text-lg font-medium">Learning Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pace and Difficulty */}
              <Card className="p-4 space-y-4">
                <h4 className="font-medium">Learning Pace & Difficulty</h4>

                <div>
                  <Label className="text-sm">Preferred Learning Pace</Label>
                  <Select
                    value={localProfile.learningPreferences.preferredPace}
                    onValueChange={(value) =>
                      isEditing &&
                      updateLearningPreference("preferredPace", value)
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow & Steady</SelectItem>
                      <SelectItem value="medium">Moderate</SelectItem>
                      <SelectItem value="fast">Fast-Paced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Preferred Difficulty Level</Label>
                  <Select
                    value={localProfile.learningPreferences.preferredDifficulty}
                    onValueChange={(value) =>
                      isEditing &&
                      updateLearningPreference("preferredDifficulty", value)
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy & Gentle</SelectItem>
                      <SelectItem value="medium">Moderate Challenge</SelectItem>
                      <SelectItem value="challenging">Challenging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm mb-2 block">
                    Attention Span:{" "}
                    {localProfile.learningPreferences.attentionSpan} minutes
                  </Label>
                  <Slider
                    value={[localProfile.learningPreferences.attentionSpan]}
                    onValueChange={([value]) =>
                      isEditing &&
                      updateLearningPreference("attentionSpan", value)
                    }
                    min={15}
                    max={120}
                    step={5}
                    disabled={!isEditing}
                  />
                </div>
              </Card>

              {/* Modalities and Time */}
              <Card className="p-4 space-y-4">
                <h4 className="font-medium">Learning Environment</h4>

                <div>
                  <Label className="text-sm">Preferred Time of Day</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["morning", "afternoon", "evening"].map((time) => (
                      <Button
                        key={time}
                        variant={
                          localProfile.learningPreferences
                            .preferredTimeOfDay === time
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          isEditing &&
                          updateLearningPreference("preferredTimeOfDay", time)
                        }
                        disabled={!isEditing}
                        className="capitalize"
                      >
                        {time === "morning" && <Sun className="w-4 h-4 mr-1" />}
                        {time === "afternoon" && (
                          <Clock className="w-4 h-4 mr-1" />
                        )}
                        {time === "evening" && (
                          <Moon className="w-4 h-4 mr-1" />
                        )}
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Collaboration Preference</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {["solo", "pairs", "groups"].map((collab) => (
                      <Button
                        key={collab}
                        variant={
                          localProfile.learningPreferences
                            .collaborationPreference === collab
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          isEditing &&
                          updateLearningPreference(
                            "collaborationPreference",
                            collab,
                          )
                        }
                        disabled={!isEditing}
                        className="capitalize"
                      >
                        {collab === "solo" && <User className="w-4 h-4 mr-1" />}
                        {collab === "pairs" && (
                          <Users className="w-4 h-4 mr-1" />
                        )}
                        {collab === "groups" && (
                          <Users className="w-4 h-4 mr-1" />
                        )}
                        {collab}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Learning Modalities */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">
                Preferred Learning Modalities
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(LearningModality).map((modality) => {
                  const isSelected = (
                    localProfile?.learningPreferences?.preferredModalities || []
                  ).includes(modality);
                  return (
                    <Button
                      key={modality}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (!isEditing) return;
                        const current =
                          localProfile?.learningPreferences
                            ?.preferredModalities || [];
                        const updated = isSelected
                          ? current.filter((m) => m !== modality)
                          : [...current, modality];
                        updateLearningPreference(
                          "preferredModalities",
                          updated,
                        );
                      }}
                      disabled={!isEditing}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <div className="text-lg">
                        {modality === LearningModality.Video && (
                          <Video className="w-5 h-5" />
                        )}
                        {modality === LearningModality.Text && (
                          <PenTool className="w-5 h-5" />
                        )}
                        {modality === LearningModality.Audio && (
                          <Headphones className="w-5 h-5" />
                        )}
                        {modality === LearningModality.Interactive && (
                          <Activity className="w-5 h-5" />
                        )}
                        {modality === LearningModality.Hands_On && (
                          <Target className="w-5 h-5" />
                        )}
                        {modality === LearningModality.Discussion && (
                          <Users className="w-5 h-5" />
                        )}
                        {modality === LearningModality.Simulation && (
                          <Zap className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs">
                        {modality.replace("_", " ")}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Emotional State Tab */}
          <TabsContent value="emotional" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Emotional State Monitoring
              </h3>
              <Badge variant="outline">
                Last updated:{" "}
                {new Date(
                  localProfile.emotionalState.lastUpdated,
                ).toLocaleString()}
              </Badge>
            </div>

            {/* Current Mood */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">
                Current Mood
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {Object.values(Mood).map((mood) => (
                  <Button
                    key={mood}
                    variant={
                      localProfile.emotionalState.currentMood === mood
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      isEditing && updateEmotionalState("currentMood", mood)
                    }
                    disabled={!isEditing}
                    className="h-auto p-3 flex flex-col items-center gap-1"
                  >
                    <span className="text-lg">{getMoodIcon(mood)}</span>
                    <span className="text-xs">{mood}</span>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Emotional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "stressLevel",
                  label: "Stress Level",
                  icon: AlertTriangle,
                  color: "red",
                },
                {
                  key: "motivationLevel",
                  label: "Motivation Level",
                  icon: Zap,
                  color: "blue",
                },
                {
                  key: "confidenceLevel",
                  label: "Confidence Level",
                  icon: Star,
                  color: "yellow",
                },
                {
                  key: "engagementLevel",
                  label: "Engagement Level",
                  icon: Activity,
                  color: "green",
                },
                {
                  key: "frustrationLevel",
                  label: "Frustration Level",
                  icon: AlertTriangle,
                  color: "orange",
                },
              ].map((metric) => {
                const Icon = metric.icon;
                const value = localProfile.emotionalState[
                  metric.key as keyof EmotionalState
                ] as number;
                return (
                  <Card key={metric.key} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`w-4 h-4 text-${metric.color}-500`} />
                      <Label className="text-sm font-medium">
                        {metric.label}
                      </Label>
                      <Badge variant="outline">{value}%</Badge>
                    </div>
                    <Progress value={value} className="mb-2" />
                    {isEditing && (
                      <Slider
                        value={[value]}
                        onValueChange={([newValue]) =>
                          updateEmotionalState(
                            metric.key as keyof EmotionalState,
                            newValue,
                          )
                        }
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Privacy Settings Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <h3 className="text-lg font-medium">Privacy & Data Control</h3>
            </div>

            {isMinor && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Some privacy settings require parent/guardian approval for
                  users under 18.
                </span>
              </div>
            )}

            {/* AI and Behavior Settings */}
            <Card className="p-4 space-y-4">
              <h4 className="font-medium">AI Analysis Permissions</h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      AI Personality Analysis
                    </Label>
                    <p className="text-xs text-gray-600">
                      Allow AI to analyze learning patterns and personality
                      traits
                    </p>
                  </div>
                  <Switch
                    checked={localPrivacy.allowAiPersonalityAnalysis}
                    onCheckedChange={(checked) =>
                      isEditing &&
                      updatePrivacySetting(
                        "allowAiPersonalityAnalysis",
                        checked,
                      )
                    }
                    disabled={
                      !isEditing ||
                      (isMinor && !localPrivacy.allowAiPersonalityAnalysis)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Behavior Tracking
                    </Label>
                    <p className="text-xs text-gray-600">
                      Track learning behavior for improvement recommendations
                    </p>
                  </div>
                  <Switch
                    checked={localPrivacy.allowBehaviorTracking}
                    onCheckedChange={(checked) =>
                      isEditing &&
                      updatePrivacySetting("allowBehaviorTracking", checked)
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Interaction Recording
                    </Label>
                    <p className="text-xs text-gray-600">
                      Record AI conversations for quality improvement
                    </p>
                  </div>
                  <Switch
                    checked={localPrivacy.allowInteractionRecording}
                    onCheckedChange={(checked) =>
                      isEditing &&
                      updatePrivacySetting("allowInteractionRecording", checked)
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Parent Notifications
                    </Label>
                    <p className="text-xs text-gray-600">
                      Send progress updates to parents/guardians
                    </p>
                  </div>
                  <Switch
                    checked={localPrivacy.parentNotificationEnabled}
                    onCheckedChange={(checked) =>
                      isEditing &&
                      updatePrivacySetting("parentNotificationEnabled", checked)
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </Card>

            {/* Data Sharing Level */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-3 block">
                Data Sharing Level
              </Label>
              <div className="space-y-3">
                {Object.values(DataSharingLevel).map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-colors",
                      localPrivacy.dataSharingLevel === level
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200",
                    )}
                    onClick={() =>
                      isEditing &&
                      updatePrivacySetting("dataSharingLevel", level)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">{level}</Label>
                      <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                        {localPrivacy.dataSharingLevel === level && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {level === DataSharingLevel.Minimal &&
                        "Only essential data for core functionality"}
                      {level === DataSharingLevel.Standard &&
                        "Standard educational data and progress"}
                      {level === DataSharingLevel.Enhanced &&
                        "Include behavior analytics for personalization"}
                      {level === DataSharingLevel.Full &&
                        "All available data for research and improvement"}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Parent Contact Tab */}
          <TabsContent value="parents" className="space-y-6">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              <h3 className="text-lg font-medium">
                Parent/Guardian Information
              </h3>
            </div>

            {!isMinor && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  Parent contact information is optional for users 18 and older.
                </p>
              </div>
            )}

            {/* Primary Parent */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Primary Parent/Guardian</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Full Name</Label>
                  <Input
                    value={
                      localProfile.parentContactInfo?.primaryParent.name || ""
                    }
                    disabled={!isEditing}
                    placeholder="Parent/Guardian Name"
                  />
                </div>
                <div>
                  <Label className="text-sm">Relationship</Label>
                  <Select disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Email Address</Label>
                  <Input
                    type="email"
                    value={
                      localProfile.parentContactInfo?.primaryParent.email || ""
                    }
                    disabled={!isEditing}
                    placeholder="parent@example.com"
                  />
                </div>
                <div>
                  <Label className="text-sm">Phone Number</Label>
                  <Input
                    type="tel"
                    value={
                      localProfile.parentContactInfo?.primaryParent.phone || ""
                    }
                    disabled={!isEditing}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </Card>

            {/* Communication Preferences */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Communication Preferences</h4>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Progress Report Frequency</Label>
                  <Select disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm mb-3 block">Alert Types</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(AlertType).map((alertType) => (
                      <div
                        key={alertType}
                        className="flex items-center space-x-2"
                      >
                        <Switch id={alertType} disabled={!isEditing} />
                        <Label htmlFor={alertType} className="text-sm">
                          {alertType.replace(/([A-Z])/g, " $1").trim()}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StudentProfileManager;
