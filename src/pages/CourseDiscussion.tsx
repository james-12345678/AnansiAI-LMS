import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Pin,
  Users,
  Clock,
  Search,
  Filter,
  Plus,
  BookOpen,
  User,
  Heart,
  Flag,
} from "lucide-react";

interface DiscussionPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: "student" | "teacher" | "ta";
  };
  title: string;
  content: string;
  timestamp: Date;
  likes: number;
  replies: DiscussionReply[];
  isPinned: boolean;
  tags: string[];
  isLiked: boolean;
}

interface DiscussionReply {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role: "student" | "teacher" | "ta";
  };
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

const CourseDiscussion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { course } = location.state || {};

  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, questions, announcements, general
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>(
    {},
  );
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);

  useEffect(() => {
    const loadDiscussionData = async () => {
      if (course) {
        try {
          // Load real discussion data from API
          const response = await apiService.getCourseDiscussion(course.id);

          if (response.success && response.data) {
            setPosts(response.data.posts);
          } else {
            // Fallback to mock data
            loadMockDiscussionData();
          }
        } catch (error) {
          console.error("Failed to load discussion data:", error);
          // Use mock data as fallback
          loadMockDiscussionData();
        }
      }
    };

    const loadMockDiscussionData = () => {
      const mockPosts: DiscussionPost[] = [
        {
          id: "post_1",
          author: {
            name: "Dr. Sarah Johnson",
            role: "teacher",
            avatar: "",
          },
          title: "Welcome to the Course Discussion!",
          content: `Welcome everyone to our course discussion forum!

This is your space to:
• Ask questions about the course material
• Share insights and discoveries
• Collaborate with your classmates
• Get help from teaching assistants

Please remember to:
- Be respectful and constructive
- Search before posting to avoid duplicates
- Use clear, descriptive titles
- Tag your posts appropriately

Looking forward to great discussions!`,
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          likes: 23,
          replies: [
            {
              id: "reply_1_1",
              author: { name: "Alex Chen", role: "student" },
              content:
                "Thank you Dr. Johnson! Really excited to be part of this course.",
              timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
              likes: 5,
              isLiked: false,
            },
          ],
          isPinned: true,
          tags: ["announcement", "welcome"],
          isLiked: true,
        },
        {
          id: "post_2",
          author: {
            name: "Marcus Rodriguez",
            role: "student",
            avatar: "",
          },
          title: "Question about Lesson 3 - Advanced Concepts",
          content: `Hi everyone! I'm having trouble understanding the concept covered in Lesson 3, specifically the part about advanced principles.

Could someone explain how these connect to the examples we saw in Lesson 2? I feel like I'm missing something fundamental.

Any help would be appreciated!`,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          likes: 8,
          replies: [
            {
              id: "reply_2_1",
              author: { name: "Teaching Assistant", role: "ta" },
              content: `Great question Marcus! The connection between Lesson 2 and 3 is indeed subtle. Let me break it down:

1. In Lesson 2, we established the basic framework
2. Lesson 3 builds on that by introducing complexity layers
3. The key is to see how each principle amplifies the previous ones

Would you like to schedule office hours to go through this together?`,
              timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              likes: 12,
              isLiked: true,
            },
            {
              id: "reply_2_2",
              author: { name: "Emma Thompson", role: "student" },
              content:
                "I had the same question! The TA's explanation really helped me understand it better. Thanks!",
              timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
              likes: 3,
              isLiked: false,
            },
          ],
          isPinned: false,
          tags: ["question", "lesson-3"],
          isLiked: false,
        },
        {
          id: "post_3",
          author: {
            name: "Riley Kim",
            role: "student",
            avatar: "",
          },
          title: "Study Group Formation - Anyone Interested?",
          content: `Hey classmates!

I'm thinking of forming a study group for this course. We could meet once a week (virtually or in-person) to:
- Review challenging concepts together
- Work through practice problems
- Prepare for upcoming assignments
- Share different perspectives and learning strategies

If you're interested, please reply below with your availability! I'm thinking weekends might work best for most people.

Looking forward to collaborating! 📚`,
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          likes: 15,
          replies: [
            {
              id: "reply_3_1",
              author: { name: "Jordan Wu", role: "student" },
              content:
                "Count me in! Weekends work great for me. Saturdays are my preference.",
              timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
              likes: 2,
              isLiked: false,
            },
            {
              id: "reply_3_2",
              author: { name: "Sam Patel", role: "student" },
              content:
                "This sounds awesome! Sunday afternoons would be perfect for me.",
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
              likes: 1,
              isLiked: false,
            },
          ],
          isPinned: false,
          tags: ["study-group", "collaboration"],
          isLiked: true,
        },
      ];

      setPosts(mockPosts);
    };

    loadDiscussionData();
  }, [course]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "teacher":
        return "text-blue-600 bg-blue-100";
      case "ta":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "teacher":
        return "Instructor";
      case "ta":
        return "TA";
      default:
        return "Student";
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  const handleLikeReply = (postId: string, replyId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: post.replies.map((reply) =>
                reply.id === replyId
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    }
                  : reply,
              ),
            }
          : post,
      ),
    );
  };

  const handleSubmitReply = (postId: string) => {
    const content = replyContent[postId];
    if (!content?.trim()) return;

    const newReply: DiscussionReply = {
      id: `reply_${postId}_${Date.now()}`,
      author: {
        name: "You",
        role: "student",
      },
      content: content.trim(),
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, replies: [...post.replies, newReply] }
          : post,
      ),
    );

    setReplyContent((prev) => ({ ...prev, [postId]: "" }));
    setShowReplyForm(null);
  };

  const handleSubmitNewPost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: DiscussionPost = {
      id: `post_${Date.now()}`,
      author: {
        name: "You",
        role: "student",
      },
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      timestamp: new Date(),
      likes: 0,
      replies: [],
      isPinned: false,
      tags: ["general"],
      isLiked: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostTitle("");
    setNewPostContent("");
    setShowNewPostForm(false);
  };

  const getFilteredPosts = () => {
    let filtered = posts;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((post) => post.tags.includes(selectedFilter));
    }

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading discussion...</p>
        </div>
      </div>
    );
  }

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
                  {course.title} - Discussion
                </h1>
                <p className="text-sm text-gray-600">
                  Course discussion and Q&A
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowNewPostForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filter discussion posts"
                title="Filter posts"
              >
                <option value="all">All Posts</option>
                <option value="announcement">Announcements</option>
                <option value="question">Questions</option>
                <option value="study-group">Study Groups</option>
                <option value="general">General</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* New Post Form */}
        {showNewPostForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Enter a descriptive title..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Write your post content..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSubmitNewPost} className="flex-1">
                  Post Discussion
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewPostForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Discussion Posts */}
        <div className="space-y-6">
          {getFilteredPosts().map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>
                        {post.author.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{post.author.name}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getRoleColor(post.author.role)}`}
                        >
                          {getRoleLabel(post.author.role)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {post.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Pin className="w-3 h-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  <div className="text-gray-700 whitespace-pre-line">
                    {post.content}
                  </div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                      post.isLiked
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`}
                    />
                    {post.likes}
                  </button>
                  <button
                    onClick={() =>
                      setShowReplyForm(
                        showReplyForm === post.id ? null : post.id,
                      )
                    }
                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    Reply ({post.replies.length})
                  </button>
                </div>

                {/* Replies */}
                {post.replies.length > 0 && (
                  <div className="mt-6 space-y-4 pl-4 border-l-2 border-gray-100">
                    {post.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.author.avatar} />
                              <AvatarFallback className="text-xs">
                                {reply.author.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {reply.author.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getRoleColor(reply.author.role)}`}
                            >
                              {getRoleLabel(reply.author.role)}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {reply.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 mb-2 whitespace-pre-line">
                          {reply.content}
                        </div>
                        <button
                          onClick={() => handleLikeReply(post.id, reply.id)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                            reply.isLiked
                              ? "bg-red-100 text-red-600"
                              : "bg-white text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Heart
                            className={`w-3 h-3 ${reply.isLiked ? "fill-current" : ""}`}
                          />
                          {reply.likes}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {showReplyForm === post.id && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <textarea
                      value={replyContent[post.id] || ""}
                      onChange={(e) =>
                        setReplyContent((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      placeholder="Write your reply..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => handleSubmitReply(post.id)}
                        disabled={!replyContent[post.id]?.trim()}
                        size="sm"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Reply
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowReplyForm(null)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {getFilteredPosts().length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No discussions found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms or filters"
                    : "Be the first to start a discussion!"}
                </p>
                <Button
                  onClick={() => setShowNewPostForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDiscussion;
