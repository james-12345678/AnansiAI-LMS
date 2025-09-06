# 📋 How to View Your Created Institutions

## ❌ Current Issue

Your frontend is in "Mock Data Mode" and showing sample institutions instead of the real ones you created via the API.

## ✅ Immediate Solution

### 1. **Use the Refresh Button**

- In the Super Admin Dashboard, find the **Registered Institutions** section
- Click the **"Refresh"** button in the top-right corner
- This will force fetch data from your API

### 2. **Use the Test API Button**

- If you see an error message in the institutions section
- Click **"Test API"** button to diagnose the connection
- This will show you exactly what data your API returns

### 3. **Debug in Browser Console**

Open browser DevTools (F12) and run:

```javascript
// Test API connection directly
window.testApiConnection();

// Or force refresh schools data
window.refetchSchools();
```

## 🔧 What Was Fixed

### 1. **Improved Data Transformation**

- Updated `getSchools()` to properly transform Institution API data to School format
- Your API returns Institution objects, frontend expects School objects
- Added proper field mapping

### 2. **Better Error Handling**

- Added detailed error messages showing API URL and status
- Clear debugging information in console
- Graceful fallback to mock data when API fails

### 3. **Added Debugging Tools**

- **Refresh button**: Manual data refresh
- **Test API button**: Direct API connection test
- **Console functions**: `testApiConnection()` and `refetchSchools()`

## 📡 API Response Mapping

Your API returns:

```json
{
  "institutionId": 1,
  "name": "Your School Name",
  "address": "Your Address",
  "isDeleted": false,
  "createdDate": "2024-01-01T00:00:00Z"
}
```

Frontend transforms to:

```json
{
  "id": 1,
  "name": "Your School Name",
  "code": "YOU",
  "county": "Nairobi",
  "status": "active",
  "adminEmail": "admin@yourschoolname.edu"
}
```

## 🎯 Testing Steps

### Step 1: Check API Response

```bash
curl -X GET http://13.60.98.134/anansiai/api/Institutions \
  -H "Accept: application/json"
```

### Step 2: Force Frontend Refresh

1. Go to Super Admin Dashboard
2. Find "Registered Institutions" section
3. Click **"Refresh"** button
4. Check browser console for logs

### Step 3: Verify Data

- Should see your created institutions
- Check console for transformation logs
- If still showing mock data, check API endpoint

## 🐛 Common Issues

### Issue 1: CORS Error

**Error**: Access blocked by CORS policy
**Fix**: Add CORS configuration to your .NET backend

### Issue 2: 404 Not Found

**Error**: GET /Institutions returns 404
**Fix**: Verify your API endpoint is running and accessible

### Issue 3: Empty Array

**Error**: API returns `[]`
**Fix**: Check if institutions were actually created in database

## 🔍 Debug Checklist

- [ ] API endpoint responds: `GET /api/Institutions`
- [ ] CORS allows frontend domain
- [ ] Database has institution records
- [ ] Frontend transformation works
- [ ] Console shows "✅ Got real institutions data"

## 🚀 Next Steps

1. **Try the refresh button now**
2. **Check browser console for error details**
3. **Use Test API button for direct testing**
4. **If still issues, check backend CORS configuration**

The institutions you created should appear after clicking **Refresh**! 🎉
