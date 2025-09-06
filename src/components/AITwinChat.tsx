import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  Heart,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Smile,
  Frown,
  Meh,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TwinInteraction,
  InteractionType,
  Mood,
  ChatMessage,
} from "@/types/education";

interface AITwinChatProps {
  studentId?: string;
  currentLessonId?: number;
  emotionalState?: Mood;
  onInteractionLogged?: (interaction: TwinInteraction) => void;
  className?: string;
}

interface ChatMessageUI extends ChatMessage {
  id: string;
  sender: "student" | "ai";
  timestamp: Date;
  interactionType: InteractionType;
  sentiment?: number;
}

const AITwinChat: React.FC<AITwinChatProps> = ({
  studentId = "student_default",
  currentLessonId,
  emotionalState = Mood.Neutral,
  onInteractionLogged,
  className,
}) => {
  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId] = useState(
    () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock AI personality based on emotional state
  const getAIPersonality = () => {
    switch (emotionalState) {
      case Mood.Frustrated:
      case Mood.Anxious:
        return {
          tone: "supportive",
          style: "encouraging",
          focus: "emotional_support",
          icon: Heart,
          color: "text-pink-600",
          bgColor: "bg-pink-50",
        };
      case Mood.Confused:
        return {
          tone: "patient",
          style: "explanatory",
          focus: "concept_clarification",
          icon: Lightbulb,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
        };
      case Mood.Bored:
        return {
          tone: "engaging",
          style: "energetic",
          focus: "motivation",
          icon: Zap,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
        };
      case Mood.Excited:
      case Mood.Happy:
        return {
          tone: "enthusiastic",
          style: "celebratory",
          focus: "momentum_building",
          icon: Sparkles,
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      default:
        return {
          tone: "balanced",
          style: "adaptive",
          focus: "learning_support",
          icon: Brain,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        };
    }
  };

  const aiPersonality = getAIPersonality();
  const AIIcon = aiPersonality.icon;

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = generateWelcomeMessage();
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateWelcomeMessage = (): ChatMessageUI => {
    const welcomeMessages = {
      [Mood.Frustrated]:
        "I can sense you might be feeling a bit frustrated. That's completely normal when learning! I'm here to help you work through any challenges. What's on your mind?",
      [Mood.Anxious]:
        "Hi there! I notice you might be feeling a little anxious. Remember, learning is a journey and I'm here to support you every step of the way. How can I help you feel more confident?",
      [Mood.Confused]:
        "Hello! I'm here to help clarify any concepts that might seem unclear. No question is too small - let's figure this out together! What would you like to understand better?",
      [Mood.Bored]:
        "Hey! Let's make this learning session more exciting! I have some engaging activities and fun ways to explore your subjects. What interests you most right now?",
      [Mood.Excited]:
        "Fantastic energy! I love seeing students excited about learning. Let's channel that enthusiasm into some amazing discoveries. What are you most curious about today?",
      [Mood.Happy]:
        "Great to see you in such a positive mood! This is perfect for learning. I'm excited to explore new concepts with you. Where shall we start?",
      default:
        "Hello! I'm your AI learning companion, here to support your educational journey. I adapt to your learning style and current needs. How can I help you today?",
    };

    return {
      id: `ai_${Date.now()}`,
      sender: "ai",
      content: welcomeMessages[emotionalState] || welcomeMessages.default,
      type: "text",
      metadata: {
        wordCount: 0,
        readingLevel: 8,
        topics: ["welcome", "support"],
        entities: [],
      },
      timestamp: new Date(),
      interactionType: InteractionType.MotivationalSupport,
    };
  };

  const generateAIResponse = async (
    userMessage: string,
  ): Promise<ChatMessageUI> => {
    // Simulate AI processing delay
    setIsTyping(true);
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );
    setIsTyping(false);

    // Mock AI response generation based on user input and emotional state
    const responses = generateContextualResponse(userMessage);

    return {
      id: `ai_${Date.now()}`,
      sender: "ai",
      content: responses.content,
      type: "text",
      metadata: {
        wordCount: responses.content.split(" ").length,
        readingLevel: 8,
        topics: responses.topics,
        entities: responses.entities,
      },
      timestamp: new Date(),
      interactionType: responses.interactionType,
      sentiment: responses.sentiment,
    };
  };

  const generateContextualResponse = (userMessage: string) => {
    const lowercaseMessage = userMessage.toLowerCase();

    // Detect question patterns
    if (
      lowercaseMessage.includes("how") ||
      lowercaseMessage.includes("what") ||
      lowercaseMessage.includes("why") ||
      lowercaseMessage.includes("?")
    ) {
      return {
        content:
          "That's a great question! Let me break this down for you step by step. Based on what we've been learning, here's how I'd explain it...",
        topics: ["question-answering", "explanation"],
        entities: ["concept"],
        interactionType: InteractionType.ConceptExplanation,
        sentiment: 0.7,
      };
    }

    // Detect frustration
    if (
      lowercaseMessage.includes("hard") ||
      lowercaseMessage.includes("difficult") ||
      lowercaseMessage.includes("stuck") ||
      lowercaseMessage.includes("confused")
    ) {
      return {
        content:
          "I understand this feels challenging right now. Let's take a step back and approach this differently. Sometimes breaking big problems into smaller pieces helps. What specific part feels most difficult?",
        topics: ["support", "encouragement", "problem-solving"],
        entities: ["challenge", "strategy"],
        interactionType: InteractionType.MotivationalSupport,
        sentiment: 0.8,
      };
    }

    // Detect achievement/success
    if (
      lowercaseMessage.includes("got it") ||
      lowercaseMessage.includes("understand") ||
      lowercaseMessage.includes("thanks") ||
      lowercaseMessage.includes("correct")
    ) {
      return {
        content:
          "Excellent work! 🎉 I can tell you're really grasping this concept. This kind of progress shows your dedication to learning. Ready to tackle the next challenge?",
        topics: ["achievement", "encouragement", "progress"],
        entities: ["success", "understanding"],
        interactionType: InteractionType.MotivationalSupport,
        sentiment: 0.9,
      };
    }

    // Detect help requests
    if (
      lowercaseMessage.includes("help") ||
      lowercaseMessage.includes("assist") ||
      lowercaseMessage.includes("support")
    ) {
      return {
        content:
          "Absolutely! I'm here to help. Can you tell me more about what you're working on? The more specific you can be, the better I can tailor my assistance to your needs.",
        topics: ["help", "assistance", "support"],
        entities: ["request", "guidance"],
        interactionType: InteractionType.QuestionAnswering,
        sentiment: 0.8,
      };
    }

    // Default response
    return {
      content:
        "I appreciate you sharing that with me. Based on your current learning journey and emotional state, I think we can explore this topic in a way that matches your learning style. Would you like me to suggest some approaches?",
      topics: ["general", "learning", "adaptation"],
      entities: ["conversation", "learning-style"],
      interactionType: InteractionType.GeneralConversation,
      sentiment: 0.6,
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessageUI = {
      id: `user_${Date.now()}`,
      sender: "student",
      content: inputMessage,
      type: "text",
      metadata: {
        wordCount: inputMessage.split(" ").length,
        readingLevel: 0,
        topics: [],
        entities: [],
      },
      timestamp: new Date(),
      interactionType: InteractionType.GeneralConversation,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Generate AI response
    const aiResponse = await generateAIResponse(inputMessage);
    setMessages((prev) => [...prev, aiResponse]);

    // Log interaction (would send to backend)
    if (onInteractionLogged) {
      const interaction: TwinInteraction = {
        interactionId: 0, // Would be generated by backend
        studentId,
        lessonId: currentLessonId,
        sessionId,
        interactionType: aiResponse.interactionType,
        studentMessage: {
          content: userMessage.content,
          type: userMessage.type,
          metadata: userMessage.metadata,
        },
        twinResponse: {
          content: aiResponse.content,
          type: aiResponse.type,
          metadata: aiResponse.metadata,
        },
        contextData: {
          currentLesson: currentLessonId,
          recentPerformance: [],
          emotionalState,
          timeOfDay:
            new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening",
          sessionDuration: 0,
          previousInteractions: messages.length,
        },
        sentimentScore: aiResponse.sentiment || 0,
        flagged: false,
        createdAt: new Date(),
        student: {} as any, // Would be populated by backend
      };
      onInteractionLogged(interaction);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(timestamp);
  };

  const getMoodIcon = () => {
    switch (emotionalState) {
      case Mood.Happy:
      case Mood.Excited:
        return <Smile className="w-4 h-4 text-green-500" />;
      case Mood.Frustrated:
      case Mood.Anxious:
        return <Frown className="w-4 h-4 text-red-500" />;
      case Mood.Confused:
      case Mood.Bored:
        return <Meh className="w-4 h-4 text-yellow-500" />;
      default:
        return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className={cn(
            "relative",
            aiPersonality.color,
            "hover:shadow-lg transition-all duration-200",
            className,
          )}
        >
          <Brain className="w-5 h-5 mr-2" />
          AI Learning Companion
          <Badge variant="secondary" className="ml-2">
            {getMoodIcon()}
          </Badge>
          {messages.length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className={cn("p-6 pb-4", aiPersonality.bgColor)}>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/ai-avatar.png" />
              <AvatarFallback
                className={cn(
                  "text-white",
                  aiPersonality.color.replace("text-", "bg-"),
                )}
              >
                <AIIcon className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2">
                AI Learning Companion
                <Badge variant="outline" className="text-xs">
                  {aiPersonality.tone} mode
                </Badge>
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                Personalized for your{" "}
                {emotionalState?.toLowerCase() || "neutral"} mood{" "}
                {getMoodIcon()}
                {currentLessonId && (
                  <Badge variant="secondary" className="text-xs">
                    Lesson Context
                  </Badge>
                )}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="text-gray-500"
              >
                {voiceEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6 max-h-[400px]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.sender === "student"
                      ? "justify-end"
                      : "justify-start",
                  )}
                >
                  {message.sender === "ai" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        className={cn(
                          "text-white text-xs",
                          aiPersonality.color.replace("text-", "bg-"),
                        )}
                      >
                        <AIIcon className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3 space-y-1",
                      message.sender === "student"
                        ? "bg-blue-500 text-white ml-auto"
                        : cn("text-gray-900", aiPersonality.bgColor),
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between text-xs opacity-70">
                      <span>{formatTimestamp(message.timestamp)}</span>
                      {message.sentiment && (
                        <Badge variant="outline" className="text-xs">
                          {message.sentiment > 0.7
                            ? "😊"
                            : message.sentiment > 0.3
                              ? "😐"
                              : "😔"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {message.sender === "student" && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-500 text-white text-xs">
                        {studentId.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback
                      className={cn(
                        "text-white text-xs",
                        aiPersonality.color.replace("text-", "bg-"),
                      )}
                    >
                      <AIIcon className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("rounded-lg p-3", aiPersonality.bgColor)}>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your learning..."
                  className="pr-12"
                  disabled={isTyping}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setIsListening(!isListening)}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className={aiPersonality.color.replace("text-", "bg-")}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-2 text-xs text-gray-500 text-center">
              AI responses are personalized based on your learning profile and
              current emotional state
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AITwinChat;
