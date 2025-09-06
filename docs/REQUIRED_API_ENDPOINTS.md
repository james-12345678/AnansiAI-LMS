# 🚀 Required API Endpoints for AnansiAI System

## 📋 **Complete Endpoint Reference**

Your backend needs to implement these endpoints for the AnansiAI system to work fully:

## 🔐 **Authentication Endpoints**

### **1. Regular User Login**

```http
POST /auth/login
Content-Type: application/json

{
  "userId": "NAC-STU-001",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@nairobiacademy.ac.ke",
      "userId": "NAC-STU-001",
      "role": "student",
      "status": "active",
      "lastActive": "2024-01-15T10:30:00Z"
    },
    "school": {
      "id": 1,
      "name": "Nairobi Academy",
      "code": "NAC",
      "county": "Nairobi"
    }
  }
}
```

### **2. Super Admin Login**

```http
POST /auth/super-admin/login
Content-Type: application/json

{
  "loginId": "SUP-ADM-001",
  "password": "admin123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Dr. Robert Martinez",
      "email": "superadmin@education.go.ke",
      "userId": "SUP-ADM-001",
      "role": "superadmin",
      "status": "active",
      "lastActive": "2024-01-15T10:30:00Z"
    }
  }
}
```

## 🏫 **School Management Endpoints**

### **3. Get All Schools**

```http
GET /schools
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nairobi Academy",
      "code": "NAC",
      "county": "Nairobi",
      "subcounty": "Westlands",
      "ward": "Parklands",
      "students": 1250,
      "teachers": 85,
      "status": "active",
      "performance": 89,
      "aiAccuracy": 94,
      "lastSync": "2 hours ago",
      "adminName": "Dr. Sarah Johnson",
      "adminEmail": "admin@nairobiacademy.ac.ke",
      "adminPhone": "+254 701 234 567",
      "establishedYear": 1985,
      "type": "secondary",
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### **4. Create New School**

```http
POST /schools
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New School Name",
  "code": "NSW",
  "county": "Nairobi",
  "subcounty": "Central",
  "ward": "Central",
  "adminName": "Admin Name",
  "adminEmail": "admin@newschool.ac.ke",
  "adminPhone": "+254 700 000 000",
  "type": "secondary",
  "establishedYear": 2024
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "name": "New School Name",
    "code": "NSW",
    "adminCredentials": {
      "userId": "NSW-ADM-001",
      "password": "TempPassword123!",
      "loginUrl": "https://anansi-ai.com/login"
    }
    // ... other school fields
  }
}
```

## 📊 **System Statistics Endpoints**

### **5. System Statistics**

```http
GET /super-admin/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "totalSchools": 1247,
    "totalStudents": 342156,
    "totalTeachers": 23891,
    "avgPerformance": 78.3,
    "systemUptime": 99.8,
    "dataStorage": 67.3,
    "activeUsers": 15234,
    "dailyLogins": 8945
  }
}
```

### **6. System Alerts**

```http
GET /super-admin/alerts
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "warning",
      "title": "High Server Load",
      "message": "Server CPU usage is at 85%. Consider scaling resources.",
      "school": "System Wide",
      "time": "2024-01-15T09:30:00Z",
      "priority": "high",
      "actionRequired": true,
      "isResolved": false
    }
  ]
}
```

### **7. Super Admin Profile**

```http
GET /super-admin/profile
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "name": "Dr. Robert Martinez",
    "id": "SUP-ADM-001",
    "role": "Super Administrator",
    "avatar": "",
    "lastLogin": "2 hours ago",
    "region": "Kenya",
    "permissions": ["all"]
  }
}
```

## �� **User Management Endpoints**

### **8. Get Users by School**

```http
GET /schools/{schoolId}/users
Authorization: Bearer <token>
```

### **9. Create User**

```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@school.ac.ke",
  "role": "student",
  "schoolId": 1
}
```

### **10. Update User**

```http
PUT /users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@school.ac.ke",
  "status": "active"
}
```

### **11. Delete User**

```http
DELETE /users/{userId}
Authorization: Bearer <token>
```

## 🎓 **Student Dashboard Endpoints**

### **12. Student Dashboard Data**

```http
GET /students/dashboard
Authorization: Bearer <token>
```

### **13. Student Courses**

```http
GET /students/courses
Authorization: Bearer <token>
```

### **14. Course Lessons**

```http
GET /students/courses/{courseId}/lessons
Authorization: Bearer <token>
```

## 👩‍🏫 **Teacher Dashboard Endpoints**

### **15. Teacher Dashboard Data**

```http
GET /teachers/dashboard
Authorization: Bearer <token>
```

### **16. Teacher Classes**

```http
GET /teachers/classes
Authorization: Bearer <token>
```

### **17. Create Assignment**

```http
POST /teachers/assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Math Assignment",
  "description": "Complete exercises 1-10",
  "classId": 1,
  "dueDate": "2024-01-20T23:59:00Z"
}
```

## 🔔 **Notification Endpoints**

### **18. Get Notifications**

```http
GET /notifications
Authorization: Bearer <token>
```

### **19. Mark Notification as Read**

```http
PUT /notifications/{notificationId}/read
Authorization: Bearer <token>
```

### **20. Mark All Notifications as Read**

```http
PUT /notifications/read-all
Authorization: Bearer <token>
```

## 🏥 **Health Check Endpoint**

### **21. Health Check**

```http
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

## 🎯 **Priority Implementation Order**

### **Phase 1: Essential (Required for basic functionality)**

1. `POST /auth/login` - User login
2. `POST /auth/super-admin/login` - Super admin login
3. `GET /health` - Health check
4. `GET /super-admin/profile` - User profile

### **Phase 2: Core Features**

5. `GET /schools` - School listing
6. `POST /schools` - School creation
7. `GET /super-admin/stats` - System statistics
8. `GET /super-admin/alerts` - System alerts

### **Phase 3: Advanced Features**

9. `GET /notifications` - Notifications
10. `GET /students/dashboard` - Student dashboard
11. `GET /teachers/dashboard` - Teacher dashboard
12. User management endpoints

## 🛠️ **Implementation Notes**

### **Authentication**

- All endpoints (except `/health` and login endpoints) require JWT Bearer token
- Token should be included in `Authorization: Bearer <token>` header

### **Error Responses**

All endpoints should return error responses in this format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

### **HTTP Status Codes**

- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### **Rate Limiting**

Consider implementing rate limiting:

- Login endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute

## 🔧 **Quick Backend Setup Examples**

### **Node.js/Express Example**

```javascript
// Authentication endpoint
app.post("/auth/login", async (req, res) => {
  const { userId, password } = req.body;

  // Validate credentials
  const user = await User.findOne({ userId });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.json({ success: false, error: "Invalid credentials" });
  }

  // Generate JWT
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userId: user.userId,
        role: user.role,
        status: user.status,
        lastActive: new Date(),
      },
    },
  });
});
```

### **.NET Core Example**

```csharp
[HttpPost("auth/login")]
public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
{
    var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);

    if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
    {
        return Ok(new ApiResponse<LoginResponse>
        {
            Success = false,
            Error = "Invalid credentials"
        });
    }

    var token = GenerateJwtToken(user);

    return Ok(new ApiResponse<LoginResponse>
    {
        Success = true,
        Data = new LoginResponse
        {
            Token = token,
            User = MapToUserDto(user)
        }
    });
}
```

## 🎉 **Ready to Go!**

Implement these endpoints in your preferred backend technology and your AnansiAI system will work perfectly with real data! The frontend will automatically detect when your backend is available and switch from mock data to real API calls.
