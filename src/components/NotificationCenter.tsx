import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  Clock,
  User,
  BookOpen,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface SystemNotification {
  id: string;
  type: "system" | "ai" | "student" | "class" | "content" | "alert";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionRequired?: boolean;
  actions?: NotificationAction[];
  metadata?: {
    studentId?: string;
    studentName?: string;
    classId?: string;
    className?: string;
    contentId?: string;
    contentTitle?: string;
  };
}

export interface NotificationAction {
  id: string;
  label: string;
  variant: "default" | "destructive" | "outline" | "secondary";
  action: () => void;
}

interface NotificationCenterProps {
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onClearAll,
  className,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<string>("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const priorityNotifications = notifications.filter(
    (n) => n.priority === "high" || n.priority === "critical",
  );

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === "critical")
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (priority === "high")
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;

    switch (type) {
      case "ai":
        return (
          <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        );
      case "student":
        return <User className="h-4 w-4 text-blue-500" />;
      case "class":
        return <Calendar className="h-4 w-4 text-green-500" />;
      case "content":
        return <BookOpen className="h-4 w-4 text-indigo-500" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      default:
        return "border-l-blue-500 bg-blue-50";
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    if (filter === "priority")
      return (
        notification.priority === "high" || notification.priority === "critical"
      );
    return notification.type === filter;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn("bg-white rounded-lg border shadow-lg", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "priority", label: "Priority" },
            { id: "ai", label: "AI" },
            { id: "student", label: "Students" },
            { id: "class", label: "Classes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                filter === tab.id
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              {tab.label}
              {tab.id === "unread" && unreadCount > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1">
                  {unreadCount}
                </span>
              )}
              {tab.id === "priority" && priorityNotifications.length > 0 && (
                <span className="ml-1 text-xs bg-orange-500 text-white rounded-full px-1">
                  {priorityNotifications.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-96">
        <div className="p-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "relative p-3 rounded-lg border-l-4 transition-all hover:shadow-md cursor-pointer",
                    getPriorityColor(notification.priority),
                    !notification.isRead && "ring-1 ring-blue-200",
                  )}
                  onClick={() =>
                    !notification.isRead && onMarkAsRead(notification.id)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getNotificationIcon(
                        notification.type,
                        notification.priority,
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4
                            className={cn(
                              "text-sm font-medium",
                              !notification.isRead && "font-semibold",
                            )}
                          >
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDismiss(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>

                        {/* Metadata */}
                        {notification.metadata && (
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {notification.metadata.studentName && (
                              <span className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{notification.metadata.studentName}</span>
                              </span>
                            )}
                            {notification.metadata.className && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{notification.metadata.className}</span>
                              </span>
                            )}
                            {notification.metadata.contentTitle && (
                              <span className="flex items-center space-x-1">
                                <BookOpen className="h-3 w-3" />
                                <span>
                                  {notification.metadata.contentTitle}
                                </span>
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </span>

                          {/* Action Buttons */}
                          {notification.actions &&
                            notification.actions.length > 0 && (
                              <div className="flex space-x-2">
                                {notification.actions.map((action) => (
                                  <Button
                                    key={action.id}
                                    variant={action.variant}
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.action();
                                    }}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
