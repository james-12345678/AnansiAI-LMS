import { useState, useEffect, useCallback } from "react";
import { SystemNotification } from "@/components/NotificationCenter";
import { SystemMessage } from "@/components/MessageModal";
import { useToast } from "@/hooks/use-toast";

interface NotificationHook {
  notifications: SystemNotification[];
  messages: SystemMessage[];
  unreadCount: number;
  urgentCount: number;
  addNotification: (
    notification: Omit<SystemNotification, "id" | "timestamp">,
  ) => void;
  addMessage: (message: Omit<SystemMessage, "id" | "timestamp">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  dismissMessage: (id: string) => void;
  clearAll: () => void;
  getNotificationById: (id: string) => SystemNotification | undefined;
  getMessageById: (id: string) => SystemMessage | undefined;
}

// Mock data for development
const mockNotifications: SystemNotification[] = [
  {
    id: "n1",
    type: "ai",
    priority: "high",
    title: "Student Risk Alert",
    message: "Emma Johnson shows signs of academic struggle in Mathematics",
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 min ago
    isRead: false,
    actionRequired: true,
    metadata: {
      studentId: "student_1",
      studentName: "Emma Johnson",
      classId: "class_math_10a",
      className: "Mathematics 10A",
    },
    actions: [
      {
        id: "contact_student",
        label: "Contact Student",
        variant: "default",
        action: () => console.log("Contacting student..."),
      },
      {
        id: "schedule_meeting",
        label: "Schedule Meeting",
        variant: "secondary",
        action: () => console.log("Scheduling meeting..."),
      },
    ],
  },
  {
    id: "n2",
    type: "student",
    priority: "medium",
    title: "Assignment Submitted",
    message: "Marcus Williams submitted Physics Lab Report",
    timestamp: new Date(Date.now() - 900000).toISOString(), // 15 min ago
    isRead: false,
    metadata: {
      studentId: "student_2",
      studentName: "Marcus Williams",
      contentId: "assignment_physics_1",
      contentTitle: "Physics Lab Report",
    },
  },
  {
    id: "n3",
    type: "class",
    priority: "low",
    title: "Class Schedule Updated",
    message: "Chemistry 11B has been moved to Room 203",
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    isRead: true,
    metadata: {
      classId: "class_chem_11b",
      className: "Chemistry 11B",
    },
  },
  {
    id: "n4",
    type: "alert",
    priority: "critical",
    title: "System Maintenance",
    message: "Scheduled maintenance will begin in 1 hour",
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isRead: false,
    actionRequired: true,
    actions: [
      {
        id: "acknowledge",
        label: "Acknowledge",
        variant: "default",
        action: () => console.log("Acknowledged maintenance..."),
      },
    ],
  },
];

const mockMessages: SystemMessage[] = [
  {
    id: "m1",
    type: "ai_insight",
    priority: "high",
    title: "Weekly AI Analysis Report",
    message:
      "Your class performance analysis for this week is ready. Several students show improvement in engagement metrics.",
    details: `Detailed Analysis:
    
• Overall class engagement: +15% from last week
• Students showing improvement: 8 out of 25
• Students needing attention: 3 students with declining participation
• Recommended actions: Individual check-ins with struggling students

The AI has identified patterns suggesting that interactive lessons yield 23% better engagement rates compared to traditional lectures.`,
    timestamp: new Date().toISOString(),
    from: {
      type: "ai",
      name: "Anansi AI Assistant",
    },
    category: "Analytics",
    actions: [
      {
        id: "view_report",
        label: "View Full Report",
        variant: "default",
        primary: true,
        action: () => console.log("Opening full report..."),
      },
      {
        id: "download_pdf",
        label: "Download PDF",
        variant: "outline",
        action: () => console.log("Downloading PDF..."),
      },
    ],
    attachments: [
      {
        id: "report_pdf",
        name: "Weekly_Analysis_Report.pdf",
        type: "document",
        url: "#",
        size: "2.3 MB",
      },
    ],
  },
  {
    id: "m2",
    type: "student_alert",
    priority: "critical",
    title: "Urgent: Student Behavioral Concern",
    message:
      "Alex Thompson has been flagged for potential academic misconduct during the recent exam.",
    details: `The AI monitoring system detected unusual patterns during Alex Thompson's exam session:

• Multiple instances of looking away from screen
• Rapid answer changes in final 10 minutes
• Performance inconsistent with previous assessments
• Similarity detected with another student's answers

This requires immediate attention and investigation. Please review the evidence and determine appropriate action.`,
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    from: {
      type: "ai",
      name: "Anansi Security Monitor",
    },
    requiresResponse: true,
    category: "Academic Integrity",
    metadata: {
      studentId: "student_alex",
      studentName: "Alex Thompson",
      riskScore: 85,
      deadline: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
    },
    actions: [
      {
        id: "investigate",
        label: "Start Investigation",
        variant: "destructive",
        primary: true,
        action: () => console.log("Starting investigation..."),
      },
      {
        id: "false_positive",
        label: "Mark as False Positive",
        variant: "outline",
        action: () => console.log("Marking as false positive..."),
      },
      {
        id: "schedule_meeting",
        label: "Schedule Meeting",
        variant: "secondary",
        action: () => console.log("Scheduling meeting..."),
      },
    ],
  },
];

export function useNotifications(): NotificationHook {
  const [notifications, setNotifications] =
    useState<SystemNotification[]>(mockNotifications);
  const [messages, setMessages] = useState<SystemMessage[]>(mockMessages);
  const { toast } = useToast();

  // Calculate counts
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const urgentCount = notifications.filter(
    (n) => (n.priority === "high" || n.priority === "critical") && !n.isRead,
  ).length;

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<SystemNotification, "id" | "timestamp">) => {
      const newNotification: SystemNotification = {
        ...notification,
        id: `n_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Show toast for high priority notifications
      if (
        notification.priority === "high" ||
        notification.priority === "critical"
      ) {
        toast({
          title: notification.title,
          description: notification.message,
          variant:
            notification.priority === "critical" ? "destructive" : "default",
        });
      }
    },
    [toast],
  );

  // Add message
  const addMessage = useCallback(
    (message: Omit<SystemMessage, "id" | "timestamp">) => {
      const newMessage: SystemMessage = {
        ...message,
        id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [newMessage, ...prev]);

      // Show toast for critical messages
      if (message.priority === "critical" || message.type === "error") {
        toast({
          title: message.title,
          description: message.message,
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  // Dismiss message
  const dismissMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get notification by ID
  const getNotificationById = useCallback(
    (id: string) => {
      return notifications.find((notification) => notification.id === id);
    },
    [notifications],
  );

  // Get message by ID
  const getMessageById = useCallback(
    (id: string) => {
      return messages.find((message) => message.id === id);
    },
    [messages],
  );

  // Simulate real-time notifications (for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        // 10% chance every 30 seconds
        const types = ["ai", "student", "class", "content"] as const;
        const priorities = ["low", "medium", "high"] as const;

        addNotification({
          type: types[Math.floor(Math.random() * types.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          title: "New Activity",
          message: "Something new happened in your dashboard",
          isRead: false,
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [addNotification]);

  return {
    notifications,
    messages,
    unreadCount,
    urgentCount,
    addNotification,
    addMessage,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissMessage,
    clearAll,
    getNotificationById,
    getMessageById,
  };
}
