import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SystemMessage {
  id: string;
  type:
    | "info"
    | "warning"
    | "error"
    | "success"
    | "announcement"
    | "ai_insight"
    | "student_alert"
    | "system_update";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  details?: string;
  timestamp: string;
  from?: {
    type: "system" | "ai" | "admin" | "teacher";
    name: string;
    avatar?: string;
  };
  actions?: MessageAction[];
  metadata?: {
    studentId?: string;
    studentName?: string;
    classId?: string;
    className?: string;
    contentId?: string;
    riskScore?: number;
    deadline?: string;
  };
  attachments?: MessageAttachment[];
  requiresResponse?: boolean;
  category?: string;
}

export interface MessageAction {
  id: string;
  label: string;
  variant: "default" | "destructive" | "outline" | "secondary";
  primary?: boolean;
  action: () => void | Promise<void>;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: "document" | "image" | "link" | "report";
  url: string;
  size?: string;
}

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: SystemMessage | null;
  onAction?: (actionId: string, message: SystemMessage) => void;
  onReply?: (messageId: string, reply: string) => void;
  className?: string;
}

export function MessageModal({
  isOpen,
  onClose,
  message,
  onAction,
  onReply,
  className,
}: MessageModalProps) {
  const [reply, setReply] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setReply("");
      setIsReplying(false);
      setIsActionLoading(null);
    }
  }, [isOpen]);

  if (!message) return null;

  const getMessageIcon = () => {
    switch (message.type) {
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "ai_insight":
        return (
          <div className="h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Star className="h-3 w-3 text-white" />
          </div>
        );
      case "student_alert":
        return <User className="h-6 w-6 text-blue-500" />;
      case "announcement":
        return <MessageCircle className="h-6 w-6 text-indigo-500" />;
      case "system_update":
        return <Info className="h-6 w-6 text-gray-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getPriorityBadge = () => {
    const variants = {
      critical: "destructive",
      high: "destructive",
      medium: "secondary",
      low: "outline",
    } as const;

    const colors = {
      critical: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-blue-500",
    };

    return (
      <Badge variant={variants[message.priority]} className="capitalize">
        <div
          className={cn("h-2 w-2 rounded-full mr-1", colors[message.priority])}
        />
        {message.priority}
      </Badge>
    );
  };

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

  const handleReply = () => {
    if (!reply.trim() || !onReply) return;

    onReply(message.id, reply);
    setReply("");
    setIsReplying(false);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Use AlertDialog for critical/destructive messages, Dialog for others
  if (message.priority === "critical" || message.type === "error") {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent className={cn("max-w-2xl", className)}>
          <AlertDialogHeader>
            <div className="flex items-center space-x-3">
              {getMessageIcon()}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <AlertDialogTitle className="text-xl">
                    {message.title}
                  </AlertDialogTitle>
                  {getPriorityBadge()}
                </div>
                {message.from && (
                  <p className="text-sm text-gray-500 mt-1">
                    From {message.from.name} •{" "}
                    {formatTimestamp(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-gray-700">{message.message}</p>

              {message.details && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                  <p className="text-sm text-gray-600">{message.details}</p>
                </div>
              )}

              {message.metadata && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Additional Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {message.metadata.studentName && (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span>Student: {message.metadata.studentName}</span>
                      </div>
                    )}
                    {message.metadata.className && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span>Class: {message.metadata.className}</span>
                      </div>
                    )}
                    {message.metadata.riskScore && (
                      <div className="flex items-center space-x-2">
                        <Flag className="h-4 w-4 text-red-500" />
                        <span>Risk Score: {message.metadata.riskScore}%</span>
                      </div>
                    )}
                    {message.metadata.deadline && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>
                          Deadline:{" "}
                          {new Date(
                            message.metadata.deadline,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {message.actions?.map((action) => (
              <AlertDialogAction
                key={action.id}
                onClick={() => handleAction(action.id)}
                disabled={isActionLoading === action.id}
                className={cn(
                  action.variant === "destructive" &&
                    "bg-red-600 hover:bg-red-700",
                  action.primary && "bg-primary hover:bg-primary/90",
                )}
              >
                {isActionLoading === action.id ? "Processing..." : action.label}
              </AlertDialogAction>
            ))}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-3xl max-h-[80vh]", className)}>
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {getMessageIcon()}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">{message.title}</DialogTitle>
                <div className="flex items-center space-x-2">
                  {getPriorityBadge()}
                  {message.category && (
                    <Badge variant="outline">{message.category}</Badge>
                  )}
                </div>
              </div>
              {message.from && (
                <DialogDescription className="mt-1">
                  From {message.from.name} •{" "}
                  {formatTimestamp(message.timestamp)}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700">{message.message}</p>
            </div>

            {message.details && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Additional Details
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {message.details}
                </p>
              </div>
            )}

            {message.metadata && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">
                  Context Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {message.metadata.studentName && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span>Student: {message.metadata.studentName}</span>
                    </div>
                  )}
                  {message.metadata.className && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span>Class: {message.metadata.className}</span>
                    </div>
                  )}
                  {message.metadata.riskScore && (
                    <div className="flex items-center space-x-2">
                      <Flag className="h-4 w-4 text-red-500" />
                      <span>Risk Score: {message.metadata.riskScore}%</span>
                    </div>
                  )}
                  {message.metadata.deadline && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>
                        Deadline:{" "}
                        {new Date(
                          message.metadata.deadline,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {message.attachments && message.attachments.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Attachments</h4>
                <div className="space-y-2">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {attachment.name}
                        </span>
                        {attachment.size && (
                          <span className="text-xs text-gray-500">
                            ({attachment.size})
                          </span>
                        )}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message.requiresResponse && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">
                    Response Required
                  </h4>
                </div>
                <p className="text-sm text-yellow-700">
                  This message requires your response or acknowledgment.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col space-y-4">
          {/* Reply Section */}
          {(message.requiresResponse || isReplying) && (
            <div className="w-full space-y-2">
              <Label htmlFor="reply">Your Response</Label>
              <Textarea
                id="reply"
                placeholder="Type your response..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              {!isReplying && !message.requiresResponse && (
                <Button variant="outline" onClick={() => setIsReplying(true)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {(isReplying || message.requiresResponse) && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsReplying(false);
                      setReply("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleReply} disabled={!reply.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </Button>
                </>
              )}

              {message.actions?.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  onClick={() => handleAction(action.id)}
                  disabled={isActionLoading === action.id}
                  className={cn(
                    action.primary && "bg-primary hover:bg-primary/90",
                  )}
                >
                  {isActionLoading === action.id
                    ? "Processing..."
                    : action.label}
                </Button>
              ))}

              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
