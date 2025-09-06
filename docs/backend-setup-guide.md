# AnansiAI Backend API Setup Guide

## 📌 Frontend Status Update

### ✅ Frontend is Fully Functional

The React frontend is production-ready and includes:

- **Complete Dashboard**: SuperAdminDashboard with all features working
- **Mock Data System**: Comprehensive fallback data for development
- **Error Handling**: Robust null safety and automatic fallback
- **Stable Operation**: No crashes, works offline without backend

### 🎯 When You Need This Backend

This backend setup is needed when you want to:

- Replace mock data with real database storage
- Add user authentication with real JWT tokens
- Enable real CRUD operations (create, edit, delete schools/users)
- Store actual analytics and performance data
- Deploy to production with persistent data

### 🔄 Current System Behavior

- **Development Mode**: Frontend automatically uses mock data
- **API Errors**: Expected and handled gracefully
- **Console Messages**: Informational warnings about fallback mode
- **Zero Downtime**: Application works regardless of backend status

## 🚀 Quick Start with Node.js + Express

### 1. Create Backend Project

```bash
mkdir anansi-api
cd anansi-api
npm init -y
npm install express cors helmet morgan jsonwebtoken bcryptjs dotenv
npm install -D nodemon @types/node typescript ts-node
```

### 2. Basic Server Structure

```
anansi-api/
├── src/
│   ├─�� controllers/
│   │   ├── authController.js
│   │   ├── schoolController.js
│   │   ├── userController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── School.js
│   │   ├── User.js
│   │   └── Analytics.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── schools.js
│   │   ├── users.js
│   │   └── analytics.js
│   ├── database/
│   │   └── connection.js
│   └── app.js
├── .env
└── package.json
```

### 3. Environment Variables (.env)

```
PORT=3001
JWT_SECRET=your-super-secret-key
DB_CONNECTION_STRING=mongodb://localhost:27017/anansi-ai
# or for PostgreSQL: postgresql://username:password@localhost:5432/anansi-ai

# Email Service (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AI Service Integration (optional)
OPENAI_API_KEY=your-openai-key
```

### 4. Basic Express Server (app.js)

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const schoolRoutes = require("./routes/schools");
const userRoutes = require("./routes/users");
const analyticsRoutes = require("./routes/analytics");

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:8080", // Your frontend URL
    credentials: true,
  }),
);
app.use(morgan("combined"));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "AnansiAI API is running" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 AnansiAI API running on port ${PORT}`);
});
```

### 5. Database Models

#### School Model (MongoDB example)

```javascript
const mongoose = require("mongoose");

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  status: {
    type: String,
    enum: ["active", "maintenance", "inactive"],
    default: "active",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("School", schoolSchema);
```

#### User Model

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  userId: { type: String, required: true, unique: true }, // LHS-STU-001
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "teacher", "admin", "superadmin"],
    required: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: function () {
      return this.role !== "superadmin";
    },
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

### 6. API Controllers

#### Auth Controller

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const School = require("../models/School");

exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Find user by userId
    const user = await User.findOne({ userId }).populate("schoolId");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          userId: user.userId,
        },
        school: user.schoolId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
};
```

#### School Controller

```javascript
const School = require("../models/School");
const User = require("../models/User");

exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.find();

    // Add student/teacher counts
    const schoolsWithCounts = await Promise.all(
      schools.map(async (school) => {
        const studentCount = await User.countDocuments({
          schoolId: school._id,
          role: "student",
        });
        const teacherCount = await User.countDocuments({
          schoolId: school._id,
          role: "teacher",
        });

        return {
          ...school.toObject(),
          students: studentCount,
          teachers: teacherCount,
          performance: Math.floor(Math.random() * 30) + 70, // Mock for now
          aiAccuracy: Math.floor(Math.random() * 10) + 85, // Mock for now
          lastSync: new Date().toISOString(),
        };
      }),
    );

    res.json({
      success: true,
      data: schoolsWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch schools",
    });
  }
};

exports.createSchool = async (req, res) => {
  try {
    const school = new School(req.body);
    await school.save();

    res.status(201).json({
      success: true,
      data: school,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: "Failed to create school",
    });
  }
};

exports.deleteSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Check if school has users
    const userCount = await User.countDocuments({ schoolId });
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete school with existing users",
      });
    }

    await School.findByIdAndDelete(schoolId);

    res.json({
      success: true,
      message: "School deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to delete school",
    });
  }
};
```

### 7. API Routes

#### Schools Routes

```javascript
const express = require("express");
const router = express.Router();
const schoolController = require("../controllers/schoolController");
const { authenticateToken, requireSuperAdmin } = require("../middleware/auth");

router.get(
  "/",
  authenticateToken,
  requireSuperAdmin,
  schoolController.getAllSchools,
);
router.post(
  "/",
  authenticateToken,
  requireSuperAdmin,
  schoolController.createSchool,
);
router.delete(
  "/:schoolId",
  authenticateToken,
  requireSuperAdmin,
  schoolController.deleteSchool,
);

module.exports = router;
```

### 8. Authentication Middleware

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, error: "Invalid token" });
  }
};

exports.requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      error: "Super admin access required",
    });
  }
  next();
};
```

### 9. Start Your API

```bash
# Development
npm run dev

# Production
npm start
```

## 🔌 Database Options

### MongoDB (Recommended)

```bash
# Install MongoDB locally or use MongoDB Atlas (cloud)
npm install mongoose
```

### PostgreSQL

```bash
npm install pg sequelize
```

### Supabase (Easy Setup)

```bash
npm install @supabase/supabase-js
# Sign up at supabase.com for hosted database + API
```

## 🚀 Quick Deploy Options

### Heroku

1. `heroku create anansi-api`
2. `git push heroku main`

### Railway

1. Connect GitHub repo
2. Auto-deploy

### DigitalOcean App Platform

1. Connect GitHub repo
2. Configure environment variables

## 📡 API Endpoints You'll Have

```
POST   /api/auth/login          - User login
GET    /api/schools             - Get all schools (Super Admin)
POST   /api/schools             - Create school (Super Admin)
DELETE /api/schools/:id         - Delete school (Super Admin)
GET    /api/users               - Get users
POST   /api/users               - Create user
GET    /api/analytics/platform  - Platform analytics
GET    /api/system/status       - System health
```
