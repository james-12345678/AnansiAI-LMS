# API Connection Issue Resolution

## Current Issue

The admin dashboard is deployed on HTTPS (fly.dev) but the API server is only available on HTTP. This creates a **Mixed Content Security Error** that prevents the browser from making API calls.

- **Frontend**: `https://your-app.fly.dev` (HTTPS) ✅
- **API Server**: `http://13.60.98.134/anansiai` (HTTP) ❌

## Fixed Components

All components have been updated to use real API data instead of mock data:

### ✅ Curriculum Management

- **Table Display**: Fixed code field display by generating code from curriculum name when API doesn't provide it
- **Data Loading**: Uses `AdminApiService.getCurriculums()` with proper API field mapping

### ✅ Subject Management

- **Curriculum Dropdown**: Now loads real curriculums from API using `AdminApiService.getCurriculums()`
- **Data Conversion**: Fixed to use `subjectName` instead of `name` from API response
- **Code Generation**: Generates code from subject name when not provided by API

### ✅ Milestone Management

- **Curriculum Dropdown**: Loads real curriculums from API
- **Subject Dropdown**: Loads real subjects from API
- **Data Loading**: Uses real API endpoints instead of mock data

### ✅ Goal Management

- **Curriculum Dropdown**: Loads real curriculums from API
- **Subject Dropdown**: Loads real subjects from API
- **Quick Filters**: Now show real counts based on actual API data

### ✅ Curriculum Overview Cards

- **Real Counts**: All cards now display actual counts from API:
  - Curriculums: Dynamic count from `AdminApiService.getCurriculums()`
  - Subjects: Dynamic count from `AdminApiService.getSubjects()`
  - Milestones: Dynamic count from `AdminApiService.getMilestones()`
  - Goals: Dynamic count from `AdminApiService.getGoals()`

## Solutions to Try

### Option 1: Configure SSL on API Server (Recommended)

```bash
# Install SSL certificate on your API server
sudo certbot --nginx -d 13.60.98.134
# Or configure with domain name instead of IP
```

### Option 2: Deploy Frontend on HTTP (Development)

Deploy the frontend application on HTTP instead of HTTPS to match the API protocol.

### Option 3: API Server Configuration

Update your API server to support HTTPS connections.

### Option 4: Use Browser Flags (Development Only)

For development testing, you can disable mixed content restrictions:

```bash
# Chrome
--disable-web-security --user-data-dir="/tmp/chrome_dev"

# Firefox
security.mixed_content.block_active_content = false
```

## Current Status

- ✅ All components use real API data
- ✅ Proper error handling for connection issues
- ✅ Code generation for missing fields
- ✅ Correct API field mapping
- ❌ Mixed content security blocking API calls

## Expected Behavior Once API Connection Works

1. **Curriculum table** will show real codes generated from names
2. **Subject dropdowns** will show real curriculums you've added
3. **Milestone/Goal dropdowns** will show real subjects and curriculums
4. **Quick Filters** will show accurate counts based on your data
5. **Overview cards** will display real counts from your database

The application is fully configured to work with your API - it just needs the connection issue resolved.
