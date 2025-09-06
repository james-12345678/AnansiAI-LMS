import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  CheckCircle,
  BookOpen,
  Video,
  FileText,
  Users,
  Clock,
  Target,
  Lightbulb,
  Star,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: "video" | "reading" | "interactive" | "quiz";
  duration: number; // in minutes
  completed: boolean;
  content: {
    videoUrl?: string;
    textContent?: string;
    quizQuestions?: any[];
    interactiveElements?: any[];
  };
}

interface Course {
  id: string;
  title: string;
  currentLessonId: string;
  lessons: Lesson[];
  progress: number;
}

const LessonContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { course, lessonId } = location.state || {};

  const [isPlaying, setIsPlaying] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [courseData, setCourseData] = useState<Course | null>(null);

  useEffect(() => {
    const loadLessonData = async () => {
      if (course) {
        try {
          // Load real lesson data from API
          const response = await apiService.getCourseLessons(course.id);

          if (response.success && response.data) {
            const mockCourse: Course = {
              id: course.id,
              title: course.title,
              currentLessonId: lessonId || `${course.id}_lesson_1`,
              progress: course.progress,
              lessons: response.data,
            };

            setCourseData(mockCourse);
            const lesson = mockCourse.lessons.find(
              (l) => l.id === (lessonId || mockCourse.currentLessonId),
            );
            setCurrentLesson(lesson || mockCourse.lessons[0]);
          } else {
            // Fallback to mock data
            const mockCourse: Course = {
              id: course.id,
              title: course.title,
              currentLessonId: lessonId || `${course.id}_lesson_1`,
              progress: course.progress,
              lessons: [
                {
                  id: `${course.id}_lesson_1`,
                  title: "Introduction to Advanced Concepts",
                  description:
                    "Learn the fundamental principles that will guide your journey through this course.",
                  type: "video",
                  duration: 15,
                  completed: false,
                  content: {
                    videoUrl: "https://example.com/video1",
                    textContent: `
                Welcome to this comprehensive lesson on advanced concepts!

                In this lesson, you'll learn:
                • Core principles and foundations
                • Key terminology and definitions
                • Practical applications and examples
                • How these concepts connect to real-world scenarios

                This lesson is designed to build your understanding step by step, with interactive elements to help reinforce your learning.
              `,
                  },
                },
                {
                  id: `${course.id}_lesson_2`,
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
                  id: `${course.id}_lesson_3`,
                  title: "Assessment and Review",
                  description: "Test your knowledge with a comprehensive quiz.",
                  type: "quiz",
                  duration: 20,
                  completed: false,
                  content: {
                    quizQuestions: [],
                  },
                },
              ],
            };

            setCourseData(mockCourse);
            const lesson = mockCourse.lessons.find(
              (l) => l.id === (lessonId || mockCourse.currentLessonId),
            );
            setCurrentLesson(lesson || mockCourse.lessons[0]);
          }
        } catch (error) {
          console.error("Failed to load lesson data:", error);
          // Use mock data as fallback
        }
      }
    };

    loadLessonData();
  }, [course, lessonId]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate lesson progress
      const interval = setInterval(() => {
        setLessonProgress((prev) => {
          const newProgress = prev + 2;
          if (newProgress >= 100) {
            setIsPlaying(false);
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    }
  };

  const handleLessonComplete = () => {
    if (currentLesson && courseData) {
      const updatedLessons = courseData.lessons.map((lesson) =>
        lesson.id === currentLesson.id
          ? { ...lesson, completed: true }
          : lesson,
      );

      const nextLessonIndex =
        courseData.lessons.findIndex((l) => l.id === currentLesson.id) + 1;
      if (nextLessonIndex < courseData.lessons.length) {
        setCurrentLesson(courseData.lessons[nextLessonIndex]);
        setLessonProgress(0);
      }
    }
  };

  const handlePreviousLesson = () => {
    if (currentLesson && courseData) {
      const currentIndex = courseData.lessons.findIndex(
        (l) => l.id === currentLesson.id,
      );
      if (currentIndex > 0) {
        setCurrentLesson(courseData.lessons[currentIndex - 1]);
        setLessonProgress(0);
      }
    }
  };

  const handleNextLesson = () => {
    if (currentLesson && courseData) {
      const currentIndex = courseData.lessons.findIndex(
        (l) => l.id === currentLesson.id,
      );
      if (currentIndex < courseData.lessons.length - 1) {
        setCurrentLesson(courseData.lessons[currentIndex + 1]);
        setLessonProgress(0);
      }
    }
  };

  if (!courseData || !currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson content...</p>
        </div>
      </div>
    );
  }

  const currentLessonIndex = courseData.lessons.findIndex(
    (l) => l.id === currentLesson.id,
  );
  const overallProgress =
    (currentLessonIndex / courseData.lessons.length) * 100 +
    lessonProgress / courseData.lessons.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/student-dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  {courseData.title}
                </h1>
                <p className="text-sm text-gray-600">{currentLesson.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">Course Progress</div>
                <div className="text-xs text-gray-600">
                  {Math.round(overallProgress)}% Complete
                </div>
              </div>
              <div className="w-24">
                <Progress value={overallProgress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {currentLesson.type === "video" && (
                        <Video className="w-5 h-5 text-blue-600" />
                      )}
                      {currentLesson.type === "reading" && (
                        <BookOpen className="w-5 h-5 text-green-600" />
                      )}
                      {currentLesson.type === "interactive" && (
                        <Target className="w-5 h-5 text-purple-600" />
                      )}
                      {currentLesson.type === "quiz" && (
                        <Star className="w-5 h-5 text-yellow-600" />
                      )}
                      {currentLesson.title}
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      {currentLesson.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {currentLesson.duration} min
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* Video/Interactive Content Area */}
                <div className="bg-gray-100 rounded-lg p-8 mb-6 text-center">
                  {currentLesson.type === "video" && (
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                        {isPlaying ? (
                          <Pause className="w-12 h-12 text-white" />
                        ) : (
                          <Play className="w-12 h-12 text-white" />
                        )}
                      </div>
                      <p className="text-gray-600">
                        {isPlaying
                          ? "Video is playing..."
                          : "Click to start the video lesson"}
                      </p>
                      <Progress
                        value={lessonProgress}
                        className="w-full max-w-md mx-auto"
                      />
                      <div className="text-sm text-gray-500">
                        {Math.round(lessonProgress)}% complete
                      </div>
                    </div>
                  )}

                  {currentLesson.type !== "video" && (
                    <div className="space-y-4">
                      <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                        <Lightbulb className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-gray-600">Interactive content area</p>
                    </div>
                  )}
                </div>

                {/* Lesson Content */}
                <div className="prose max-w-none">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                      Lesson Content
                    </h3>
                    <div className="text-gray-700 whitespace-pre-line">
                      {currentLesson.content.textContent}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handlePreviousLesson}
                    disabled={currentLessonIndex === 0}
                    className="flex items-center gap-2"
                  >
                    <SkipBack className="w-4 h-4" />
                    Previous
                  </Button>

                  <Button
                    onClick={handlePlayPause}
                    className="flex items-center gap-2 px-8"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        {lessonProgress > 0 ? "Resume" : "Start"} Lesson
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleNextLesson}
                    disabled={
                      currentLessonIndex === courseData.lessons.length - 1
                    }
                    className="flex items-center gap-2"
                  >
                    Next
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                {lessonProgress >= 100 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Lesson Complete!</span>
                    </div>
                    <p className="text-green-700 mt-1">
                      Great job! You've successfully completed this lesson.
                    </p>
                    <Button onClick={handleLessonComplete} className="mt-3">
                      Mark as Complete & Continue
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {courseData.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setLessonProgress(lesson.completed ? 100 : 0);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      lesson.id === currentLesson.id
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        Lesson {index + 1}
                      </span>
                      {lesson.completed && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{lesson.title}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lesson.duration} min
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonContent;
