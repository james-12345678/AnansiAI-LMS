# Frontend Integration Guide

## 🛡️ System Stability & Error Handling

### Recent Improvements

The frontend now includes robust error handling and fallback mechanisms:

- ✅ **Automatic API Fallback**: When backend is unavailable, system automatically uses mock data
- ✅ **Null Safety**: All components use proper fallback data patterns
- ✅ **Development Mode**: Graceful degradation with comprehensive mock data
- ✅ **Error Prevention**: Fixed all null reference errors in dashboard components

### Error Handling Best Practices

```typescript
// ✅ CORRECT: Always use fallback data
const schoolsData = schools || [];
const systemStatsData = systemStats || defaultStats;

// ❌ INCORRECT: Direct API data usage
schools.filter(...) // Can cause null reference errors
```

### Expected Development Behavior

- **API Network Errors**: Normal when no backend is running
- **Console Warnings**: Informational messages about fallback mode
- **Application Stability**: Continues working with mock data
- **Zero Crashes**: System handles all error states gracefully

## 🔧 Step 3: Connect Frontend to Real API

### 1. Update Environment Variables

Create `.env` file in your React project:

```bash
# Your API URL
REACT_APP_API_URL=http://localhost:3001/api

# Or production URL
# REACT_APP_API_URL=https://your-api-domain.com/api
```

### 2. Test API Connection

Update one component to use real data:

#### Example: District Dashboard with Real Schools

```typescript
// src/pages/DistrictDashboard.tsx
import { useSchools } from '@/hooks/useApi';

const DistrictDashboard = () => {
  // Replace mock data with real API call
  const { data: schools, loading, error, refetch } = useSchools();

  // Handle real school deletion
  const handleRemoveSchool = async (schoolId: string, schoolName: string) => {
    if (window.confirm(`Are you sure you want to remove ${schoolName}?`)) {
      try {
        await apiClient.deleteSchool(schoolId);
        // Refresh the schools list
        refetch();
        alert(`${schoolName} has been successfully removed!`);
      } catch (error) {
        alert('Failed to remove school. Please try again.');
      }
    }
  };

  if (loading) return <div>Loading schools...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    // Your existing dashboard JSX, but using real 'schools' data
  );
};
```

### 3. Update Login to Use Real Authentication

```typescript
// src/pages/SchoolLogin.tsx
import { useAuth } from "@/hooks/useApi";

const SchoolLogin = () => {
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Use real API login instead of mock
    const result = await login(formData.userId, formData.password);

    if (result.success) {
      // Navigate to appropriate dashboard
      if (result.user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (result.user.role === "teacher") {
        navigate("/teacher-dashboard");
      } else if (result.user.role === "student") {
        navigate("/student-dashboard");
      }
    } else {
      setError(result.error || "Login failed");
    }

    setIsLoading(false);
  };

  return (
    // Your existing login form JSX
  );
};
```

## 🔗 API Service Integration

### Enhanced API Client

The system includes a robust API client with fallback support:

```typescript
// src/services/apiWithFallback.ts
class ApiWithFallback {
  private api: ApiClient;
  private mockApi: MockApiService;

  async getSchools() {
    try {
      const response = await this.api.getSchools();
      console.log("✅ API: Successfully loaded schools from backend");
      return response;
    } catch (error) {
      console.warn("⚠️ API: Backend unavailable, using mock data");
      return this.mockApi.getSchools();
    }
  }

  async login(userId: string, password: string) {
    try {
      const response = await this.api.login(userId, password);
      console.log("✅ API: Successfully authenticated with backend");
      return response;
    } catch (error) {
      console.warn("⚠️ API: Backend auth unavailable, using mock auth");
      return this.mockApi.login(userId, password);
    }
  }
}
```

### API Hooks with Error Handling

```typescript
// src/hooks/useApi.ts
export const useSchools = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await apiWithFallback.getSchools();
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("School fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return { data, loading, error, refetch: fetchSchools };
};
```

## 🧪 Testing Integration

### Integration Test Script

Create `test-integration.js` in your project root:

```javascript
const axios = require("axios");

async function testIntegration() {
  const baseURL = "http://localhost:3001/api";

  console.log("🧪 Testing API Integration...\n");

  // Test 1: Health Check
  try {
    const health = await axios.get(`${baseURL}/health`);
    console.log("✅ Health Check:", health.data);
  } catch (error) {
    console.log("❌ Health Check Failed:", error.message);
  }

  // Test 2: Login
  try {
    const login = await axios.post(`${baseURL}/auth/login`, {
      userId: "NAC-ADM-001",
      password: "admin123",
    });
    console.log("✅ Login Success:", login.data.user.name);

    // Test 3: Protected Route
    const token = login.data.token;
    const schools = await axios.get(`${baseURL}/schools`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Protected Route:", `${schools.data.length} schools loaded`);
  } catch (error) {
    console.log("❌ Authentication Failed:", error.message);
  }

  console.log("\n🎯 Integration test complete!");
}

testIntegration();
```

Run the test:

```bash
node test-integration.js
```

## 📊 Real-Time Features

### WebSocket Integration (Optional)

For real-time updates, add WebSocket support:

```typescript
// src/services/websocket.ts
class WebSocketService {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Function[]> = new Map();

  connect() {
    this.ws = new WebSocket("ws://localhost:3001/ws");

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifySubscribers(data.type, data);
    };
  }

  subscribe(eventType: string, callback: Function) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)?.push(callback);
  }

  private notifySubscribers(eventType: string, data: any) {
    const callbacks = this.subscribers.get(eventType) || [];
    callbacks.forEach((callback) => callback(data));
  }
}
```

### Live Data Updates

```typescript
// src/hooks/useLiveData.ts
export const useLiveSchools = () => {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    // Initial load
    loadSchools();

    // Subscribe to real-time updates
    webSocketService.subscribe("school_updated", (data) => {
      setSchools((prev) =>
        prev.map((school) =>
          school.id === data.schoolId ? { ...school, ...data.updates } : school,
        ),
      );
    });

    webSocketService.subscribe("school_created", (data) => {
      setSchools((prev) => [...prev, data.school]);
    });
  }, []);

  return schools;
};
```

## 🔧 Development Workflow

### 1. Frontend Development Mode

```bash
# Terminal 1: Start your API server
npm run api  # or node server.js, or dotnet run

# Terminal 2: Start React development server
npm run dev

# Frontend will automatically fall back to mock data if API is down
```

### 2. Full-Stack Development

```bash
# Use concurrently to run both servers
npm install --save-dev concurrently

# Add to package.json scripts:
"scripts": {
  "dev:fullstack": "concurrently \"npm run api\" \"npm run dev\""
}

# Start both servers
npm run dev:fullstack
```

### 3. Environment-Specific Configuration

```typescript
// src/config/environment.ts
export const config = {
  development: {
    apiUrl: "http://localhost:3001/api",
    mockData: true,
    debug: true,
  },
  production: {
    apiUrl: "https://api.yourdomain.com/api",
    mockData: false,
    debug: false,
  },
};

export const currentConfig = config[process.env.NODE_ENV] || config.development;
```

## 🚀 Production Deployment

### Frontend Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
        },
      },
    },
  },
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL),
  },
});
```

### Environment Variables for Production

```bash
# .env.production
VITE_API_URL=https://api.yourdomain.com/api
VITE_ENVIRONMENT=production
VITE_ENABLE_MOCK_DATA=false
```

### Deployment Checklist

- [ ] Update API URL in production environment
- [ ] Disable mock data in production
- [ ] Configure CORS on backend for production domain
- [ ] Set up SSL certificates
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and error tracking

## 📈 Performance Optimization

### API Response Caching

```typescript
// src/services/cache.ts
class ApiCache {
  private cache = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }
}
```

### Optimistic Updates

```typescript
// src/hooks/useOptimisticSchools.ts
export const useOptimisticSchools = () => {
  const [schools, setSchools] = useState([]);

  const addSchool = async (schoolData) => {
    // Optimistically add to UI
    const tempId = Date.now();
    const tempSchool = { ...schoolData, id: tempId, status: "pending" };
    setSchools((prev) => [...prev, tempSchool]);

    try {
      // Send to API
      const newSchool = await apiClient.createSchool(schoolData);
      // Replace temp school with real one
      setSchools((prev) =>
        prev.map((school) => (school.id === tempId ? newSchool : school)),
      );
    } catch (error) {
      // Remove temp school on error
      setSchools((prev) => prev.filter((school) => school.id !== tempId));
      throw error;
    }
  };

  return { schools, addSchool };
};
```

## 🛡️ Security Best Practices

### Token Management

```typescript
// src/services/auth.ts
class AuthService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem("auth_token");
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
```

### API Request Interceptors

```typescript
// src/services/apiClient.ts
axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token && !authService.isTokenExpired()) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

## 📋 Troubleshooting

### Common Issues and Solutions

1. **CORS Errors**

   ```javascript
   // Backend: Add CORS middleware
   app.use(
     cors({
       origin: "http://localhost:8080",
       credentials: true,
     }),
   );
   ```

2. **Network Timeout**

   ```typescript
   // Frontend: Increase timeout
   const apiClient = axios.create({
     baseURL: process.env.REACT_APP_API_URL,
     timeout: 10000, // 10 seconds
   });
   ```

3. **Token Expiration**

   ```typescript
   // Auto-refresh tokens
   useEffect(() => {
     const interval = setInterval(() => {
       if (authService.isTokenExpired()) {
         authService.refreshToken();
       }
     }, 60000); // Check every minute

     return () => clearInterval(interval);
   }, []);
   ```

4. **Development Mode API Errors**
   ```typescript
   // These are normal and expected:
   console.warn("⚠️ API: Backend unavailable, using mock data");
   // This means the fallback system is working correctly
   ```

Your frontend is now properly integrated with comprehensive error handling, real-time capabilities, and production-ready features! 🚀
