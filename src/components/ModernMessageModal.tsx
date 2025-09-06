import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
  MessageCircle,
  User,
  Calendar,
  BookOpen,
  Clock,
  Send,
  X,
  Star,
  Flag,
  Zap,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemMessage, MessageAction, MessageAttachment } from "./MessageModal";

interface ModernMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: SystemMessage | null;
  onAction?: (actionId: string, message: SystemMessage) => void;
  className?: string;
}

export function ModernMessageModal({
  isOpen,
  onClose,
  message,
  onAction,
  className,
}: ModernMessageModalProps) {
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsActionLoading(null);
    }
  }, [isOpen]);

  if (!message) return null;

  const getMessageConfig = () => {
    switch (message.type) {
      case "error":
        return {
          icon: <AlertCircle className="h-8 w-8 text-white" />,
          bgGradient: "from-destructive to-destructive/90",
          iconBg: "bg-destructive",
          borderColor: "border-destructive/20",
          textColor: "text-destructive",
          lightBg: "bg-destructive/5",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="h-8 w-8 text-white" />,
          bgGradient: "from-orange-500 to-orange-600",
          iconBg: "bg-orange-500",
          borderColor: "border-orange-200",
          textColor: "text-orange-700",
          lightBg: "bg-orange-50",
        };
      case "success":
        return {
          icon: <CheckCircle className="h-8 w-8 text-white" />,
          bgGradient: "from-primary to-primary/90",
          iconBg: "bg-primary",
          borderColor: "border-primary/20",
          textColor: "text-primary",
          lightBg: "bg-primary/5",
        };
      case "ai_insight":
        return {
          icon: <Zap className="h-8 w-8 text-white" />,
          bgGradient: "from-accent to-accent/90",
          iconBg: "bg-accent",
          borderColor: "border-accent/20",
          textColor: "text-accent",
          lightBg: "bg-accent/5",
        };
      case "student_alert":
        return {
          icon: <User className="h-8 w-8 text-white" />,
          bgGradient: "from-accent to-accent/90",
          iconBg: "bg-accent",
          borderColor: "border-accent/20",
          textColor: "text-accent",
          lightBg: "bg-accent/5",
        };
      case "announcement":
        return {
          icon: <MessageCircle className="h-8 w-8 text-white" />,
          bgGradient: "from-secondary to-secondary/90",
          iconBg: "bg-secondary",
          borderColor: "border-secondary/20",
          textColor: "text-secondary",
          lightBg: "bg-secondary/5",
        };
      default:
        return {
          icon: <Info className="h-8 w-8 text-white" />,
          bgGradient: "from-muted-foreground to-muted-foreground/90",
          iconBg: "bg-muted-foreground",
          borderColor: "border-muted/20",
          textColor: "text-muted-foreground",
          lightBg: "bg-muted/10",
        };
    }
  };

  // Removed priority config as requested

  const messageConfig = getMessageConfig();

  const handleAction = async (actionId: string) => {
    const action = message.actions?.find((a) => a.id === actionId);
    if (!action || !onAction) return;

    setIsActionLoading(actionId);
    try {
      await action.action();
      onAction(actionId, message);
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsActionLoading(null);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-md p-0 overflow-hidden border-0 shadow-2xl",
        className
      )}>
        {/* Header with gradient background */}
        <div className={cn(
          "bg-gradient-to-r p-6 text-white relative overflow-hidden",
          messageConfig.bgGradient
        )}>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-20 w-20 rounded-full bg-white/5" />
          
          <div className="flex items-start space-x-4 relative z-10">
            <div className={cn(
              "p-3 rounded-full shadow-lg",
              messageConfig.iconBg
            )}>
              {messageConfig.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-white">
                {message.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main message */}
          <div className="space-y-3">
            <p className="text-gray-700 leading-relaxed">
              {message.message}
            </p>
            
            {/* Details section */}
            {message.details && (
              <div className={cn(
                "p-4 rounded-lg border",
                messageConfig.lightBg,
                messageConfig.borderColor
              )}>
                <h4 className={cn("font-medium mb-2", messageConfig.textColor)}>
                  Details
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {message.details}
                </p>
              </div>
            )}

            {/* Metadata */}
            {message.metadata && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                <div className="grid gap-2 text-sm">
                  {message.metadata.studentName && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Student: {message.metadata.studentName}</span>
                    </div>
                  )}
                  {message.metadata.className && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>Class: {message.metadata.className}</span>
                    </div>
                  )}
                  {message.metadata.deadline && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {message.metadata.deadline}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formatTimestamp(message.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {message.actions && message.actions.length > 0 && (
          <div className="px-6 pb-6">
            <div className="flex flex-wrap gap-2">
              {message.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  onClick={() => handleAction(action.id)}
                  disabled={isActionLoading !== null}
                  className={cn(
                    action.primary && "shadow-md",
                    "transition-all duration-200"
                  )}
                >
                  {isActionLoading === action.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    action.label
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Default close button if no actions */}
        {(!message.actions || message.actions.length === 0) && (
          <div className="px-6 pb-6">
            <Button
              onClick={onClose}
              className="w-full"
              variant="outline"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
