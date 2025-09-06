import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Shield, UserCheck, ArrowLeft, Mail, Phone } from "lucide-react";

const Signup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animate-delay-2s"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-secondary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float animate-delay-4s"></div>
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Information */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
                <img
                  src="https://cdn.builder.io/api/v1/assets/2d09da496e544a1eab05e596d02031d8/twinternet-logo-b18833?format=webp&width=800"
                  alt="AnansiAI Logo"
                  className="w-24 h-24 object-contain"
                />
                <h1 className="text-4xl font-bold text-gradient">AnansiAI</h1>
              </div>
              <p className="text-xl text-secondary-600 font-medium">
                Account Access Information
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-800">
                    Secure Access Control
                  </h3>
                  <p className="text-secondary-600">
                    All accounts are created and managed by school
                    administrators to ensure security and proper access levels.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-2 bg-accent-100 rounded-lg group-hover:bg-accent-200 transition-colors">
                  <UserCheck className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-800">
                    Pre-configured Profiles
                  </h3>
                  <p className="text-secondary-600">
                    Your account comes with personalized settings, course
                    assignments, and access permissions already configured.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Information Card */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="card-elevated">
              <CardHeader className="space-y-2 text-center">
                <div className="mx-auto p-6 bg-primary-100 rounded-xl w-fit lg:hidden mb-4">
                  <img
                    src="https://cdn.builder.io/api/v1/assets/2d09da496e544a1eab05e596d02031d8/twinternet-logo-b18833?format=webp&width=800"
                    alt="AnansiAI Logo"
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <CardTitle className="text-2xl font-bold text-secondary-800">
                  Join AnansiAI
                </CardTitle>
                <CardDescription className="text-secondary-600">
                  Contact your school administrator to get started
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-primary-50 rounded-lg border border-primary-100">
                  <UserCheck className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-secondary-800 mb-2">
                    School Administrator Access Required
                  </h3>
                  <p className="text-sm text-secondary-600 mb-4">
                    New AnansiAI accounts must be created by your school's IT
                    administrator. This ensures proper security, access levels,
                    and course assignments within your school's learning
                    environment.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-800">
                    To get your account:
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">1</span>
                      </div>
                      <span className="text-secondary-600">
                        Contact your school's IT department
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">2</span>
                      </div>
                      <span className="text-secondary-600">
                        Provide your student/teacher information
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">3</span>
                      </div>
                      <span className="text-secondary-600">
                        Receive your login credentials via email
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-800 text-center">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
                      <Mail className="w-5 h-5 text-primary-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-secondary-800">
                          Email Support
                        </p>
                        <p className="text-sm text-secondary-600">
                          it-support@yourschool.edu
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-accent-50 rounded-lg border border-accent-200">
                      <Phone className="w-5 h-5 text-accent-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-secondary-800">
                          Phone Support
                        </p>
                        <p className="text-sm text-secondary-600">
                          (555) 123-4567
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-secondary-50 rounded-lg">
                    <p className="text-xs text-secondary-600">
                      Your school administrator will provide your AnansiAI login
                      credentials and set up your personalized learning
                      environment.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-secondary-200">
                  <Link to="/login">
                    <Button className="btn-primary w-full">
                      Already have an account? Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
