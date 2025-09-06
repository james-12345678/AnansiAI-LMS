# Teacher Role Assignment Fix Implementation

## Problem Summary
Users created with "Teacher" role are appearing as "Admin" in the user table, indicating a role assignment issue.

## Root Cause Analysis
The issue was likely occurring due to:
1. **API Base URL**: Using outdated endpoint URL
2. **Role Assignment Logic**: Potential mismatch between frontend role handling and backend expectations
3. **Subject Assignment**: Teachers not being properly assigned to curriculum-based subjects

## Fixes Implemented

### 1. Updated API Base URL
- **File**: `src/services/axiosClient.ts`
- **Change**: Updated from `http://13.60.46.125/anansiai` to `http://13.61.173.139/anansiai`
- **Impact**: Ensures connection to the correct backend server

### 2. Enhanced Subject Assignment Logic
- **File**: `src/pages/AdminDashboard.tsx` 
- **Function**: `fetchSubjectsForTeacher()`
- **Enhancement**: 
  - Now fetches curriculum-based subjects first using `getCurriculumsByInstitution()` and `getSubjectsByCurriculum()`
  - Falls back to institution-based subjects if curriculum approach fails
  - Provides better fallback subjects with enhanced structure

### 3. Improved Teacher Creation Process
- **File**: `src/pages/AdminDashboard.tsx`
- **Function**: `createUser()`
- **Enhancements**:
  - Enhanced debugging for role assignment tracking
  - Better teacher ID resolution for subject assignment
  - Improved error handling for subject assignment failures
  - Enhanced validation of assignment payload

### 4. Enhanced Subject Assignment API Support
- **File**: `src/services/adminApiService.ts`
- **New Methods**:
  - `getTeacherSubjectsWithMilestonesAndGoals()`
  - Enhanced level management methods (`createLevel`, `updateLevel`, `deleteLevel`)
  - Better subject assignment type definitions

### 5. Added Comprehensive Debugging
- **Files**: `src/services/adminApiService.ts`, `src/pages/AdminDashboard.tsx`
- **Debugging Added**:
  - Role assignment tracking in `getUsersByRole()`
  - User processing debugging in `fetchDashboardData()`
  - Subject assignment payload validation
  - API response structure analysis

## Key Code Changes

### Role Assignment Debug Tracking
```typescript
// In createUser function
console.log("🔍 Role check - userData.role.name:", userData.role.name);
console.log("🔧 Using register endpoint for non-admin role:", userData.role.name);
```

### Enhanced Subject Fetching
```typescript
// Curriculum-based subject fetching
const curriculums = await adminApiService.getCurriculumsByInstitution(institutionId);
for (const curriculum of curriculums) {
  const curriculumSubjects = await adminApiService.getSubjectsByCurriculum(
    curriculum.curriculumId, 
    institutionId
  );
  allSubjects = [...allSubjects, ...curriculumSubjects];
}
```

### Improved Teacher Subject Assignment
```typescript
const teacherId = response.data.userId || 
                response.data.id || 
                response.data.user?.id ||
                response.data.user?.userId ||
                userData.email;

const assignmentPayload = {
  teacherId: teacherId,
  subjectId: parseInt(userData.selectedSubjectId),
  levelId: parseInt(userData.selectedLevelId),
  institutionId: institutionId,
};
```

## Testing Instructions

1. **Create a New Teacher**:
   - Open Admin Dashboard
   - Click "Add User"
   - Select "Teacher" role
   - Fill in required fields
   - Select subject and level
   - Submit

2. **Check Console Logs**:
   - Open browser developer tools
   - Check console for debugging output
   - Look for role assignment tracking
   - Verify subject assignment success

3. **Verify User Table**:
   - Check that new teacher appears with "Teacher" role
   - Verify assigned subjects are displayed
   - Confirm no role confusion

## Expected Console Output

```
🔄 Role selection changed to: Teacher
🎯 Selected role object: {id: "3", name: "Teacher"}
💾 Setting role data: {id: "3", name: "Teacher"}
👨‍🏫 Teacher role selected, fetching subjects and levels...
📚 Fetching subjects for teacher assignment from curriculum...
🔍 Using institution ID for subjects: 1
📖 Found curriculums: [...]
🎯 Unique curriculum-based subjects: [...]
✅ Using curriculum-based subjects for teacher assignment
🔧 Using register endpoint for non-admin role: Teacher
✅ User creation API response: [...]
🔄 Assigning subject to teacher...
🆔 Resolved teacher ID: [user_id]
📤 Subject assignment payload: {...}
✅ Subject assigned to teacher successfully
```

## Next Steps

1. **Test the Implementation**: Create a teacher user and monitor console logs
2. **Verify Role Assignment**: Confirm teacher appears with correct role in table
3. **Check Subject Assignment**: Verify teacher is assigned to selected curriculum subject
4. **Monitor API Responses**: Ensure backend is returning correct role data

## Rollback Plan

If issues persist, revert changes to:
- `src/services/axiosClient.ts` (API URL)
- `src/pages/AdminDashboard.tsx` (fetchSubjectsForTeacher, createUser functions)
- `src/services/adminApiService.ts` (debugging additions)

## Files Modified

1. `src/services/axiosClient.ts` - Updated API base URL
2. `src/services/adminApiService.ts` - Enhanced debugging and new methods
3. `src/pages/AdminDashboard.tsx` - Improved user creation and subject fetching
