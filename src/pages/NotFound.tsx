import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Brain,
  ArrowLeft,
  Home,
  Shield,
  GraduationCap,
  Users,
  Settings,
} from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [defaultRoute, setDefaultRoute] = useState("/login");

  useEffect(() => {
    // Detect user role from localStorage or URL patterns
    const role = localStorage.getItem("userRole");
    const superAdminId = localStorage.getItem("superAdminId");
    const currentPath = window.location.pathname;

    // Determine user context and appropriate home route
    // Priority: Check for authenticated super admin first
    if (role === "SUPER_ADMIN" || superAdminId) {
      setUserRole("SUPER_ADMIN");
      setDefaultRoute("/super-admin-dashboard");
    } else if (currentPath.includes("super-admin")) {
      // If accessing super-admin URLs but not authenticated, check if coming from dashboard
      if (
        currentPath.includes("dashboard") ||
        document.referrer.includes("super-admin-dashboard")
      ) {
        setUserRole("SUPER_ADMIN");
        setDefaultRoute("/super-admin-dashboard");
      } else {
        setUserRole("SUPER_ADMIN");
        setDefaultRoute("/login");
      }
    } else if (currentPath.includes("admin")) {
      setUserRole("ADMIN");
      setDefaultRoute("/admin-dashboard");
    } else if (currentPath.includes("teacher")) {
      setUserRole("TEACHER");
      setDefaultRoute("/teacher-dashboard");
    } else if (currentPath.includes("student")) {
      setUserRole("STUDENT");
      setDefaultRoute("/student-dashboard");
    } else {
      setUserRole("GUEST");
      setDefaultRoute("/login");
    }
  }, []);

  const handleGoBack = () => {
    // Smart navigation based on browser history and user context
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to appropriate dashboard based on user role
      navigate(defaultRoute);
    }
  };

  const handleGoHome = () => {
    navigate(defaultRoute);
  };

  const getRoleInfo = () => {
    switch (userRole) {
      case "SUPER_ADMIN":
        return {
          icon: <Shield className="w-6 h-6 text-primary-600" />,
          title: "Super Administrator",
          description: "National Education Platform Access",
          homeLabel: "Go to Super Admin Portal",
        };
      case "ADMIN":
        return {
          icon: <Settings className="w-6 h-6 text-accent-600" />,
          title: "School Administrator",
          description: "School Management Portal",
          homeLabel: "Go to Admin Dashboard",
        };
      case "TEACHER":
        return {
          icon: <Users className="w-6 h-6 text-warning-600" />,
          title: "Teacher",
          description: "Teaching and Class Management",
          homeLabel: "Go to Teacher Dashboard",
        };
      case "STUDENT":
        return {
          icon: <GraduationCap className="w-6 h-6 text-blue-600" />,
          title: "Student",
          description: "Learning and Study Portal",
          homeLabel: "Go to Student Dashboard",
        };
      default:
        return {
          icon: <Home className="w-6 h-6 text-secondary-600" />,
          title: "Guest",
          description: "Please sign in to continue",
          homeLabel: "Go to Login",
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animate-delay-2s"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animate-delay-4s"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-warning-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-float animate-delay-6s"></div>
      </div>

      <div className="relative text-center space-y-8 max-w-lg">
        <div className="space-y-6">
          <div className="mx-auto p-4 bg-white rounded-2xl shadow-lg w-fit">
            <img
              src="https://cdn.builder.io/api/v1/assets/2d09da496e544a1eab05e596d02031d8/twinternet-logo-b18833?format=webp&width=800"
              alt="AnansiAI Logo"
              className="w-20 h-20 object-contain"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-3xl font-bold text-secondary-800">
              Oops! Page Not Found
            </h2>
            <p className="text-secondary-600 text-lg">
              The page you're looking for seems to have wandered off. Let's get
              you back on track!
            </p>
          </div>

          {/* User Role Context */}
          {userRole && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-secondary-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                {roleInfo.icon}
                <div className="text-left">
                  <h3 className="font-semibold text-secondary-800">
                    {roleInfo.title}
                  </h3>
                  <p className="text-sm text-secondary-600">
                    {roleInfo.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoHome}
            className="btn-primary w-full sm:w-auto"
          >
            <Home className="w-4 h-4 mr-2" />
            {roleInfo.homeLabel}
          </Button>

          <Button
            variant="outline"
            onClick={handleGoBack}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Contact Information */}
        <div className="pt-6 border-t border-secondary-200 space-y-4">
          <div className="text-xs text-secondary-400">
            <p>Contact your system administrator for technical support</p>
            <p className="mt-1">
              AnansiAI Educational Platform • Ministry of Education, Kenya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
