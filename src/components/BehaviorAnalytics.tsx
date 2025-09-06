import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  Activity,
  Brain,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Eye,
  Focus,
  Coffee,
  Heart,
  Lightbulb,
  Star,
  ArrowUp,
  ArrowDown,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BehaviorLog,
  BehaviorActionType,
  Mood,
  LearningAnalytics,
  RiskFactor,
} from "@/types/education";

interface BehaviorAnalyticsProps {
  studentId?: string;
  currentMood?: Mood;
  riskScore?: number; // 0-1
  behaviorLogs?: BehaviorLog[];
  analytics?: Partial<LearningAnalytics>;
  onRiskDetected?: (risk: RiskFactor) => void;
  className?: string;
}

interface BehaviorMetric {
  name: string;
  value: number;
  trend: "up" | "down" | "stable";
  status: "good" | "warning" | "critical";
  icon: React.ComponentType<any>;
  description: string;
}

interface EngagementData {
  time: string;
  focus: number;
  engagement: number;
  stress: number;
}

const BehaviorAnalytics: React.FC<BehaviorAnalyticsProps> = ({
  studentId = "student_default",
  currentMood = Mood.Neutral,
  riskScore = 0.2,
  behaviorLogs = [],
  analytics = {},
  onRiskDetected,
  className,
}) => {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">(
    "today",
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    focusLevel: 0,
    engagementLevel: 0,
    stressLevel: 0,
    confidenceLevel: 0,
  });

  // Simulate real-time behavior tracking
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time behavior metrics based on current mood
      const baseMetrics = getMoodBasedMetrics(currentMood);
      const randomVariation = () => (Math.random() - 0.5) * 20;

      setRealtimeMetrics({
        focusLevel: Math.max(
          0,
          Math.min(100, baseMetrics.focus + randomVariation()),
        ),
        engagementLevel: Math.max(
          0,
          Math.min(100, baseMetrics.engagement + randomVariation()),
        ),
        stressLevel: Math.max(
          0,
          Math.min(100, baseMetrics.stress + randomVariation()),
        ),
        confidenceLevel: Math.max(
          0,
          Math.min(100, baseMetrics.confidence + randomVariation()),
        ),
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentMood]);

  const getMoodBasedMetrics = (mood: Mood) => {
    switch (mood) {
      case Mood.Focused:
        return { focus: 85, engagement: 80, stress: 30, confidence: 75 };
      case Mood.Excited:
        return { focus: 70, engagement: 95, stress: 40, confidence: 85 };
      case Mood.Happy:
        return { focus: 75, engagement: 85, stress: 25, confidence: 80 };
      case Mood.Frustrated:
        return { focus: 40, engagement: 45, stress: 80, confidence: 35 };
      case Mood.Anxious:
        return { focus: 35, engagement: 40, stress: 85, confidence: 30 };
      case Mood.Confused:
        return { focus: 50, engagement: 60, stress: 60, confidence: 40 };
      case Mood.Bored:
        return { focus: 30, engagement: 25, stress: 35, confidence: 50 };
      case Mood.Tired:
        return { focus: 35, engagement: 30, stress: 45, confidence: 45 };
      case Mood.Overwhelmed:
        return { focus: 25, engagement: 35, stress: 90, confidence: 25 };
      default:
        return { focus: 60, engagement: 60, stress: 50, confidence: 60 };
    }
  };

  const calculateBehaviorMetrics = (): BehaviorMetric[] => {
    return [
      {
        name: "Focus Level",
        value: realtimeMetrics.focusLevel,
        trend: realtimeMetrics.focusLevel > 70 ? "up" : "down",
        status:
          realtimeMetrics.focusLevel > 70
            ? "good"
            : realtimeMetrics.focusLevel > 40
              ? "warning"
              : "critical",
        icon: Focus,
        description: "How well you're maintaining attention on tasks",
      },
      {
        name: "Engagement",
        value: realtimeMetrics.engagementLevel,
        trend: realtimeMetrics.engagementLevel > 70 ? "up" : "down",
        status:
          realtimeMetrics.engagementLevel > 70
            ? "good"
            : realtimeMetrics.engagementLevel > 40
              ? "warning"
              : "critical",
        icon: Zap,
        description: "Your level of active participation in learning",
      },
      {
        name: "Stress Level",
        value: realtimeMetrics.stressLevel,
        trend: realtimeMetrics.stressLevel < 30 ? "up" : "down",
        status:
          realtimeMetrics.stressLevel < 30
            ? "good"
            : realtimeMetrics.stressLevel < 60
              ? "warning"
              : "critical",
        icon: Heart,
        description: "Your current stress and anxiety levels",
      },
      {
        name: "Confidence",
        value: realtimeMetrics.confidenceLevel,
        trend: realtimeMetrics.confidenceLevel > 70 ? "up" : "down",
        status:
          realtimeMetrics.confidenceLevel > 70
            ? "good"
            : realtimeMetrics.confidenceLevel > 40
              ? "warning"
              : "critical",
        icon: Star,
        description: "Your confidence in understanding the material",
      },
    ];
  };

  const generateEngagementData = (): EngagementData[] => {
    const hours = Array.from({ length: 8 }, (_, i) => i + 9); // 9 AM to 4 PM
    return hours.map((hour) => ({
      time: `${hour}:00`,
      focus: 40 + Math.random() * 50,
      engagement: 35 + Math.random() * 55,
      stress: 20 + Math.random() * 40,
    }));
  };

  const getActivityDistribution = () => {
    const activities = [
      { name: "Reading", value: 30, color: "#8884d8" },
      { name: "Problem Solving", value: 25, color: "#82ca9d" },
      { name: "Video Learning", value: 20, color: "#ffc658" },
      { name: "Discussion", value: 15, color: "#ff7c7c" },
      { name: "Practice", value: 10, color: "#8dd1e1" },
    ];
    return activities;
  };

  const getRiskLevel = () => {
    if (riskScore < 0.3)
      return { level: "Low", color: "green", icon: CheckCircle };
    if (riskScore < 0.6)
      return { level: "Medium", color: "yellow", icon: AlertTriangle };
    return { level: "High", color: "red", icon: AlertTriangle };
  };

  const behaviorMetrics = calculateBehaviorMetrics();
  const engagementData = generateEngagementData();
  const activityData = getActivityDistribution();
  const riskInfo = getRiskLevel();

  return (
    <TooltipProvider>
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <CardTitle className="text-lg">Behavior Analytics</CardTitle>
              <Badge
                variant={
                  riskInfo.level === "Low"
                    ? "default"
                    : riskInfo.level === "Medium"
                      ? "secondary"
                      : "destructive"
                }
                className="flex items-center gap-1"
              >
                <riskInfo.icon className="w-3 h-3" />
                {riskInfo.level} Risk
              </Badge>
            </div>
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Detailed View
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Comprehensive Behavior Analysis</DialogTitle>
                  <DialogDescription>
                    Detailed insights into your learning behavior patterns and
                    emotional state
                  </DialogDescription>
                </DialogHeader>
                <DetailedAnalyticsView
                  metrics={behaviorMetrics}
                  engagementData={engagementData}
                  activityData={activityData}
                  analytics={
                    analytics || {
                      studentId: studentId,
                      overallProgress: 0,
                      subjectProgress: [],
                      strengths: [],
                      improvementAreas: [],
                      recommendedActions: [],
                      riskFactors: [],
                      achievements: [],
                      lastUpdated: new Date(),
                    }
                  }
                  currentMood={currentMood}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Real-time Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {behaviorMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Tooltip key={metric.name}>
                  <TooltipTrigger>
                    <Card
                      className={cn(
                        "p-4 transition-all hover:shadow-md cursor-help",
                        metric.status === "good"
                          ? "border-green-200 bg-green-50"
                          : metric.status === "warning"
                            ? "border-yellow-200 bg-yellow-50"
                            : "border-red-200 bg-red-50",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            metric.status === "good"
                              ? "text-green-600"
                              : metric.status === "warning"
                                ? "text-yellow-600"
                                : "text-red-600",
                          )}
                        />
                        <div className="flex items-center gap-1">
                          {metric.trend === "up" ? (
                            <ArrowUp className="w-3 h-3 text-green-500" />
                          ) : metric.trend === "down" ? (
                            <ArrowDown className="w-3 h-3 text-red-500" />
                          ) : null}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-600">
                          {metric.name}
                        </p>
                        <p className="text-lg font-bold">
                          {Math.round(metric.value)}%
                        </p>
                        <Progress
                          value={metric.value}
                          className={cn(
                            "h-2",
                            metric.status === "good"
                              ? "bg-green-100"
                              : metric.status === "warning"
                                ? "bg-yellow-100"
                                : "bg-red-100",
                          )}
                        />
                      </div>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{metric.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Current Mood & Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium">Current State</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mood</span>
                  <Badge variant="outline">{currentMood}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Score</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={riskScore * 100}
                      className={cn(
                        "w-20 h-2",
                        riskScore < 0.3
                          ? "bg-green-100"
                          : riskScore < 0.6
                            ? "bg-yellow-100"
                            : "bg-red-100",
                      )}
                    />
                    <span className="text-sm font-medium">
                      {Math.round(riskScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium">Recommendations</h4>
              </div>
              <div className="space-y-2 text-sm">
                {(analytics?.recommendedActions || [])
                  .slice(0, 3)
                  .map((action, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          action.priority === "high" ||
                            action.priority === "critical"
                            ? "bg-red-500"
                            : action.priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500",
                        )}
                      />
                      <span className="flex-1">{action.title}</span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          {/* Mini Engagement Chart */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="font-medium">Today's Engagement</h4>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={engagementData.slice(-6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="focus"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

// Detailed Analytics View Component
const DetailedAnalyticsView: React.FC<{
  metrics: BehaviorMetric[];
  engagementData: EngagementData[];
  activityData: any[];
  analytics: Partial<LearningAnalytics>;
  currentMood: Mood;
}> = ({ metrics, engagementData, activityData, analytics, currentMood }) => {
  return (
    <div className="space-y-6">
      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.name} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Icon
                  className={cn(
                    "w-6 h-6",
                    metric.status === "good"
                      ? "text-green-600"
                      : metric.status === "warning"
                        ? "text-yellow-600"
                        : "text-red-600",
                  )}
                />
                <Badge
                  variant={
                    metric.status === "good"
                      ? "default"
                      : metric.status === "warning"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {metric.status}
                </Badge>
              </div>
              <h4 className="font-medium mb-2">{metric.name}</h4>
              <div className="text-2xl font-bold mb-2">
                {Math.round(metric.value)}%
              </div>
              <Progress value={metric.value} className="mb-2" />
              <p className="text-xs text-gray-600">{metric.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Over Time */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Engagement Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Line
                type="monotone"
                dataKey="focus"
                stroke="#8884d8"
                strokeWidth={2}
                name="Focus"
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Engagement"
              />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#ffc658"
                strokeWidth={2}
                name="Stress"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Activity Distribution */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Learning Activity Distribution</h4>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={activityData}
                cx="50%"
                cy="45%"
                outerRadius={85}
                fill="#8884d8"
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={11}
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value, name) => [`${value}%`, name]}
                contentStyle={{
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h4 className="font-medium mb-4">Key Insights</h4>
          <div className="space-y-3">
            {(analytics?.strengths || []).map((strength, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">{strength}</span>
              </div>
            ))}
            {(analytics?.improvementAreas || []).map((area, index) => (
              <div key={index} className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">{area}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-4">Recommended Actions</h4>
          <div className="space-y-3">
            {(analytics?.recommendedActions || []).map((action, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg flex items-start gap-3"
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mt-1",
                    action.priority === "critical"
                      ? "bg-red-500"
                      : action.priority === "high"
                        ? "bg-orange-500"
                        : action.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500",
                  )}
                />
                <div>
                  <h5 className="font-medium text-sm">{action.title}</h5>
                  <p className="text-xs text-gray-600 mt-1">
                    {action.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {action.estimatedTime} min
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BehaviorAnalytics;
