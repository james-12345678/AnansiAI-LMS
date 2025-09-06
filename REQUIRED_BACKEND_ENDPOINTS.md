# Required Backend Endpoints for Full AnansiAI Functionality

## ✅ Current Working Endpoints

Your API already provides these endpoints that the frontend uses:

- `POST /api/Auth/login` ✅
- `POST /api/Auth/register` ✅
- `GET /api/Institutions` ✅
- `POST /api/Institutions` ✅
- `GET /api/Institutions/{id}` ✅
- `PUT /api/Institutions/{id}` ✅
- `DELETE /api/Institutions/{id}` ✅
- `GET /api/subjects` ✅
- `POST /api/subjects` ✅
- `GET /api/subjects/{subjectId}` ✅
- `PUT /api/subjects/{subjectId}` ✅
- `DELETE /api/subjects/{subjectId}` ✅
- `GET /api/lessons` ✅
- `POST /api/lessons` ✅
- `GET /api/lessons/{lessonId}` ✅
- `PUT /api/lessons/{lessonId}` ✅
- `DELETE /api/lessons` ✅
- `GET /api/Users/get-users-by-role` ✅
- `POST /api/Users` ✅

## ❌ Missing Endpoints Needed

### 1. Super Admin Dashboard

```csharp
[Route("api/[controller]")]
[ApiController]
public class SuperAdminController : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetSystemStats()
    {
        var stats = new
        {
            totalSchools = 156,
            totalStudents = 45231,
            totalTeachers = 2847,
            totalSubjects = 18,
            avgPerformance = 78.3,
            systemUptime = 99.8,
            dataStorage = 67.3,
            activeUsers = 8945,
            dailyLogins = 2341,
            lastUpdated = DateTime.UtcNow
        };
        return Ok(new { success = true, data = stats });
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var profile = new
        {
            name = "Dr. Robert Martinez",
            id = "SUP-ADM-001",
            role = "Super Administrator",
            avatar = "",
            lastLogin = DateTime.UtcNow.AddHours(-2),
            region = "Kenya",
            permissions = new[] { "all" }
        };
        return Ok(new { success = true, data = profile });
    }

    [HttpGet("alerts")]
    public async Task<IActionResult> GetSystemAlerts()
    {
        var alerts = new[]
        {
            new
            {
                id = 1,
                type = "warning",
                title = "High Server Load",
                message = "Server CPU usage is at 85%",
                school = "System Wide",
                time = DateTime.UtcNow.AddMinutes(-30),
                priority = "high",
                actionRequired = true,
                isResolved = false
            }
        };
        return Ok(new { success = true, data = alerts });
    }
}
```

### 2. Admin Dashboard

```csharp
[Route("api/[controller]")]
[ApiController]
public class AdminController : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetAdminDashboard()
    {
        var dashboard = new
        {
            adminProfile = new
            {
                fullName = "Dr. Sarah Johnson",
                email = "admin@school.edu",
                phoneNumber = "+254 701 234 567",
                schoolName = "Westfield High School",
                role = "Administrator",
                lastLogin = DateTime.UtcNow.AddHours(-1).ToString()
            },
            schoolStats = new
            {
                totalStudents = 1247,
                totalTeachers = 89,
                totalSubjects = 12,
                totalLessons = 245,
                totalAssignments = 156,
                pendingSubmissions = 34,
                pendingReviews = 12,
                systemUptime = 99.8,
                dataStorage = 45.2,
                activeUsers = 234,
                dailyLogins = 456,
                avgPerformance = 87
            },
            users = new[]
            {
                new
                {
                    id = "1",
                    fullName = "John Doe",
                    email = "john@school.edu",
                    phoneNumber = "+254 701 234 567",
                    role = "TEACHER",
                    isActive = true,
                    lastLogin = DateTime.UtcNow.AddHours(-2).ToString(),
                    createdAt = DateTime.UtcNow.AddMonths(-6).ToString()
                }
            },
            systemAlerts = new[]
            {
                new
                {
                    id = 1,
                    type = "info",
                    title = "System Update",
                    message = "New features available",
                    priority = "medium",
                    timestamp = DateTime.UtcNow
                }
            }
        };
        return Ok(new { success = true, data = dashboard });
    }
}
```

### 3. Student Dashboard

```csharp
[Route("api/[controller]")]
[ApiController]
public class StudentController : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetStudentDashboard()
    {
        var dashboard = new
        {
            profile = new
            {
                id = "student_001",
                personalityTraits = new
                {
                    openness = 0.8,
                    conscientiousness = 0.7,
                    extraversion = 0.6,
                    agreeableness = 0.9,
                    neuroticism = 0.3
                },
                learningPreferences = new
                {
                    preferredStyle = "Visual",
                    preferredModalities = new[] { "Interactive", "Visual" },
                    difficultyPreference = "adaptive",
                    pacePreference = "moderate"
                },
                emotionalState = new
                {
                    currentMood = "Neutral",
                    stressLevel = 0.3,
                    motivationLevel = 0.8,
                    confidenceLevel = 0.7
                }
            },
            enrolledCourses = new[]
            {
                new
                {
                    id = "course_001",
                    title = "Advanced Mathematics",
                    instructor = "Dr. Sarah Chen",
                    progress = 75,
                    completedLessons = 36,
                    totalLessons = 48,
                    recentGrade = 94
                }
            },
            upcomingAssignments = new[]
            {
                new
                {
                    id = "assign_001",
                    title = "Calculus Problem Set",
                    subject = "Mathematics",
                    dueDate = DateTime.UtcNow.AddDays(3),
                    priority = "high",
                    status = "pending"
                }
            }
        };
        return Ok(new { success = true, data = dashboard });
    }
}
```

### 4. Teacher Dashboard

```csharp
[Route("api/[controller]")]
[ApiController]
public class TeacherController : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetTeacherDashboard()
    {
        var dashboard = new
        {
            profile = new
            {
                id = "teacher_001",
                fullName = "Dr. Michael Johnson",
                email = "michael@school.edu",
                specializations = new[] { "Mathematics", "Physics" },
                experienceYears = 12,
                currentLoad = new
                {
                    totalStudents = 156,
                    totalSubjects = 3,
                    totalLessons = 45,
                    weeklyHours = 24
                }
            },
            teachingAssignments = new[]
            {
                new
                {
                    id = "subject_001",
                    name = "Advanced Mathematics",
                    students = 32,
                    lessons = 15,
                    avgPerformance = 87.5,
                    status = "active"
                }
            },
            pendingGrading = new[]
            {
                new
                {
                    id = "submission_001",
                    studentName = "John Doe",
                    assignmentTitle = "Calculus Assignment",
                    submittedAt = DateTime.UtcNow.AddHours(-6),
                    priority = "high"
                }
            }
        };
        return Ok(new { success = true, data = dashboard });
    }
}
```

### 5. Assignment Management

```csharp
[Route("api/[controller]")]
[ApiController]
public class AssignmentsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAssignments([FromQuery] int? subjectId = null)
    {
        // Return assignments, optionally filtered by subject
        return Ok(new { success = true, data = new[] { /* assignments */ } });
    }

    [HttpPost]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentDto dto)
    {
        // Create new assignment
        return Ok(new { success = true, data = new { /* created assignment */ } });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAssignment(int id)
    {
        // Return specific assignment
        return Ok(new { success = true, data = new { /* assignment */ } });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAssignment(int id, [FromBody] UpdateAssignmentDto dto)
    {
        // Update assignment
        return Ok(new { success = true, data = new { /* updated assignment */ } });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAssignment(int id)
    {
        // Delete assignment
        return Ok(new { success = true, message = "Assignment deleted" });
    }
}
```

### 6. User Management (Enhanced)

```csharp
// Add to existing UsersController
[HttpGet]
public async Task<IActionResult> GetAllUsers([FromQuery] string? role = null)
{
    // Return all users, optionally filtered by role
    return Ok(new { success = true, data = new[] { /* users */ } });
}

[HttpGet("{id}")]
public async Task<IActionResult> GetUser(string id)
{
    // Return specific user
    return Ok(new { success = true, data = new { /* user */ } });
}

[HttpPut("{id}")]
public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
{
    // Update user
    return Ok(new { success = true, data = new { /* updated user */ } });
}

[HttpDelete("{id}")]
public async Task<IActionResult> DeleteUser(string id)
{
    // Delete user
    return Ok(new { success = true, message = "User deleted" });
}
```

### 7. Authentication Enhancements

```csharp
// Add to existing AuthController
[HttpPost("forgot-password")]
public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
{
    // Send password reset email
    return Ok(new { success = true, message = "Reset email sent" });
}

[HttpPost("reset-password")]
public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
{
    // Reset password with token
    return Ok(new { success = true, message = "Password reset successfully" });
}

[HttpPost("change-password")]
public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
{
    // Change password for authenticated user
    return Ok(new { success = true, message = "Password changed successfully" });
}
```

## 📋 Required DTOs

```csharp
public class CreateAssignmentDto
{
    public int SubjectId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime DueDate { get; set; }
    public string Type { get; set; }
    public int MaxPoints { get; set; }
}

public class UpdateUserDto
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Address { get; set; }
    public bool IsActive { get; set; }
}

public class ForgotPasswordDto
{
    public string Email { get; set; }
}

public class ResetPasswordDto
{
    public string Token { get; set; }
    public string NewPassword { get; set; }
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
}
```

## 🔄 CORS Configuration

Make sure your backend has CORS configured to allow requests from your frontend:

```csharp
// In Program.cs or Startup.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://192.168.1.188:8080", "http://localhost:8080")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Use CORS
app.UseCors("AllowFrontend");
```

## 🚀 Implementation Priority

1. **High Priority** (Core functionality):

   - SuperAdminController (stats, profile, alerts)
   - AdminController (dashboard)
   - Enhanced Authentication (forgot/reset password)

2. **Medium Priority** (Enhanced features):

   - StudentController (dashboard)
   - TeacherController (dashboard)
   - AssignmentsController

3. **Low Priority** (Nice to have):
   - Enhanced user management endpoints
   - Advanced analytics endpoints

## 📝 Frontend Status

✅ **Already Updated**: The frontend has been configured to work with your existing API endpoints:

- Uses `/api/Institutions` instead of `/api/schools`
- Uses `/api/Auth/login` for authentication
- Proper fallback to mock data when endpoints are missing

🎯 **Ready for Integration**: Once you add the missing endpoints above, the frontend will automatically connect to your real backend data.
