# Admin Dashboard API Integration

This document describes the comprehensive API integration implemented for the Admin Dashboard, connecting all available AnansiAI backend endpoints.

## Overview

The Admin Dashboard now uses a comprehensive API service (`adminApiService`) that integrates with all available endpoints from the AnansiAI backend. This replaces the previous partial API integration and provides full CRUD operations for all entities.

## Integrated Endpoints

### 🏫 Institutions Management

- `GET /api/Institutions` - Get all institutions
- `GET /api/Institutions/{id}` - Get institution by ID
- `POST /api/Institutions` - Create new institution
- `PUT /api/Institutions/{id}` - Update institution
- `DELETE /api/Institutions/{id}` - Delete institution

### 📚 Subjects Management

- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/{subjectId}` - Get subject by ID
- `POST /api/subjects/add-subject` - Create new subject
- `PUT /api/subjects/{subjectId}` - Update subject
- `DELETE /api/subjects/{subjectId}` - Delete subject
- `GET /api/subjects/by-institution` - Get subjects by institution
- `GET /api/subjects/by-curriculum` - Get subjects by curriculum

### 📖 Lessons Management

- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/{lessonId}` - Get lesson by ID
- `POST /api/lessons/add-lesson` - Create new lesson
- `PUT /api/lessons/{lessonId}` - Update lesson
- `DELETE /api/lessons` - Delete lesson (with lessonId parameter)

### 📝 Assignments Management

- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/{assignmentId}` - Get assignment by ID
- `POST /api/assignments/add-assignment` - Create new assignment
- `PUT /api/assignments/{assignmentId}` - Update assignment
- `DELETE /api/assignments/{assignmentId}` - Delete assignment

### 🎯 Goals Management

- `GET /api/goals` - Get all goals
- `GET /api/goals/{goalId}` - Get goal by ID
- `POST /api/goals/add-goal` - Create new goal
- `PUT /api/goals/{goalId}` - Update goal
- `DELETE /api/goals/{goalId}` - Delete goal

### 🏆 Milestones Management

- `GET /api/milestones` - Get all milestones
- `GET /api/milestones/{milestoneId}` - Get milestone by ID
- `POST /api/milestones/add-milestone` - Create new milestone
- `PUT /api/milestones/{milestoneId}` - Update milestone
- `DELETE /api/milestones/{milestoneId}` - Delete milestone

### 📅 Terms Management

- `GET /api/terms` - Get all terms
- `GET /api/terms/{termId}` - Get term by ID
- `POST /api/terms/add-term` - Create new term
- `PUT /api/terms/{termId}` - Update term
- `DELETE /api/terms/{termId}` - Delete term
- `GET /api/terms/by-institution` - Get terms by institution

### 🎓 Curriculum Management

- `GET /api/curriculums` - Get all curriculums
- `GET /api/curriculums/{curriculumId}` - Get curriculum by ID
- `POST /api/curriculums/add-curriculum` - Create new curriculum
- `PUT /api/curriculums/{curriculumId}` - Update curriculum
- `DELETE /api/curriculums/{curriculumId}` - Delete curriculum
- `GET /api/curriculums/by-institution` - Get curriculums by institution

### 👥 User Management

- `GET /api/Users/get-users-by-role` - Get users by role
- `POST /api/Users/add-users-as-admin` - Add user as admin
- `POST /api/Users/add-users-as-super-admin` - Add user as super admin
- `GET /api/Users/all-roles` - Get all available roles

### 🔐 Authentication

- `POST /api/Auth/register` - User registration
- `POST /api/Auth/login` - User login

### 📊 System Information

- `GET /api/enums/all-enums` - Get all system enums and constants

## Key Features

### 🚀 Comprehensive API Service

- **Complete CRUD Operations**: All entities support Create, Read, Update, Delete operations
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Robust error handling with meaningful error messages
- **Singleton Pattern**: Efficient singleton instance for optimal performance

### 📈 Dashboard Data Aggregation

- **Real-time Data**: Live data from all API endpoints
- **Parallel Loading**: Efficient parallel API calls for better performance
- **Fallback Handling**: Graceful degradation when API is unavailable
- **Statistics Calculation**: Real-time statistics from API data

### 🔍 Advanced Features

- **Search Functionality**: Search across all entities (institutions, subjects, lessons, assignments)
- **Health Monitoring**: API health status and endpoint availability checking
- **Institution-specific Data**: Fetch related data for specific institutions
- **Enum Support**: Full support for API enums (approval status, question types, etc.)

## File Structure

```
src/services/
├─��� adminApiService.ts          # Main comprehensive API service
├── adminApiService.test.ts     # Test file for API service
├── axiosClient.ts             # HTTP client configuration
└── ...

src/pages/
├── AdminDashboard.tsx         # Updated to use new API service
└── ...
```

## Usage Examples

### Basic Usage

```typescript
import { adminApiService } from "@/services/adminApiService";

// Get all institutions
const institutions = await adminApiService.getInstitutions();

// Create a new subject
const newSubject = await adminApiService.createSubject({
  institutionId: 1,
  subjectName: "Mathematics",
  description: "Advanced Mathematics Course",
  isActive: true,
  curriculumId: 1,
});

// Get comprehensive dashboard data
const dashboardData = await adminApiService.getDashboardData();
```

### Error Handling

```typescript
try {
  const subjects = await adminApiService.getSubjects();
  console.log("Subjects loaded:", subjects);
} catch (error) {
  console.error("Failed to load subjects:", error);
  // Handle error appropriately
}
```

### Health Checking

```typescript
// Test API connection
const { success, message } = await adminApiService.testConnection();
console.log(
  `API Status: ${success ? "Connected" : "Disconnected"} - ${message}`,
);

// Get detailed health status
const health = await adminApiService.getHealthStatus();
console.log("API Health:", health);
```

## Type Definitions

The service includes comprehensive TypeScript definitions for all API entities:

- `Institution` - Educational institutions
- `Subject` - Academic subjects
- `Lesson` - Individual lessons
- `Assignment` - Student assignments
- `Goal` - Educational goals
- `Milestone` - Achievement milestones
- `Term` - Academic terms
- `Curriculum` - Course curricula
- `Role` - User roles
- `EnumsResponse` - System enums

## Benefits

1. **Unified API Access**: Single service for all API operations
2. **Type Safety**: Full TypeScript support prevents runtime errors
3. **Consistent Error Handling**: Standardized error handling across all endpoints
4. **Performance**: Optimized parallel loading and singleton pattern
5. **Maintainability**: Clear separation of concerns and modular design
6. **Extensibility**: Easy to add new endpoints and functionality
7. **Testing**: Comprehensive test coverage for reliability

## Integration Status

✅ **Completed Integrations:**

- All CRUD operations for all entities
- User management and authentication
- Dashboard data aggregation
- System enums and constants
- Health monitoring and testing
- Search functionality
- TypeScript definitions

🔄 **Ready for Extension:**

- Additional custom endpoints
- Real-time updates (WebSocket integration)
- Caching layer
- Offline support
- Batch operations

## Testing

The integration includes comprehensive tests:

```bash
npm test  # Run all tests including API service tests
```

Test coverage includes:

- Service instantiation and singleton pattern
- Method availability verification
- CRUD operation structure
- Utility method presence

## Configuration

The API service uses the existing `axiosClient` configuration:

- Base URL: Automatically configured based on environment
- Authentication: Bearer token support
- Timeout: 30 seconds for API calls
- Error interceptors: Automatic error handling

## Future Enhancements

Potential future enhancements include:

- Real-time data updates via WebSocket
- Offline data caching
- Batch operation support
- Advanced search and filtering
- Data export functionality
- Audit logging
- Performance analytics

This comprehensive integration provides a solid foundation for the Admin Dashboard with full API connectivity and room for future enhancements.
