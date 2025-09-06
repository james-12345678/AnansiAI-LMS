import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import DevelopmentBanner from "@/components/DevelopmentBanner";
import SchoolLogin from "./pages/SchoolLogin";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import LessonContent from "./pages/LessonContent";
import CourseDiscussion from "./pages/CourseDiscussion";
import NotFound from "./pages/NotFound";

// Create QueryClient with proper configuration to prevent React context issues
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            {process.env.NODE_ENV !== "production" && <DevelopmentBanner />}
            <Routes>
              {/* Redirect root to school login - but allow direct teacher dashboard access in dev */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/dev-teacher" element={<TeacherDashboard />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<SchoolLogin />} />
              <Route path="/signup" element={<Signup />} />

              {/* Dashboard Routes */}
              <Route
                path="/student-dashboard"
                element={
                  <ErrorBoundary>
                    <StudentDashboard />
                  </ErrorBoundary>
                }
              />
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route
                path="/super-admin-dashboard"
                element={<SuperAdminDashboard />}
              />

              {/* Route aliases for capitalized URLs */}
              <Route path="/TeacherDashboard" element={<Navigate to="/teacher-dashboard" replace />} />
              <Route path="/AdminDashboard" element={<Navigate to="/admin-dashboard" replace />} />
              <Route path="/StudentDashboard" element={<Navigate to="/student-dashboard" replace />} />
              <Route path="/SuperAdminDashboard" element={<Navigate to="/super-admin-dashboard" replace />} />

              {/* Course Content Routes */}
              <Route
                path="/lesson-content"
                element={
                  <ErrorBoundary>
                    <LessonContent />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/course-discussion"
                element={
                  <ErrorBoundary>
                    <CourseDiscussion />
                  </ErrorBoundary>
                }
              />

              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
