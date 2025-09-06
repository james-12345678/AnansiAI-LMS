# 🔒 Mixed Content Error - Immediate Fix

## ❌ **The Error You're Seeing**

```
❌ API test failed: AxiosError: Network Error
Mixed Content: Browser blocked HTTPS→HTTP request
```

## 🔍 **What's Happening**

Your browser is **blocking the API request** because:

- **Frontend**: `https://` (secure)
- **API**: `http://` (insecure)

This is a browser security feature called **"Mixed Content Protection"**.

## ✅ **Immediate Solutions**

### **Option 1: Allow Mixed Content (Quickest)**

1. **Click the 🔒 lock icon** in your browser's address bar
2. **Click "Site settings"**
3. **Find "Insecure content"**
4. **Change it to "Allow"**
5. **Refresh the page**
6. **Try the API test again**

### **Option 2: Use HTTP Frontend**

If your frontend is available on HTTP:

- Change: `https://your-frontend.com`
- To: `http://your-frontend.com`

### **Option 3: Direct API Test**

Open a new tab and visit:

```
http://13.60.98.134/anansiai/api/Institutions
```

This will test if your API is working directly.

## 🧪 **Test Steps**

1. **Apply Option 1 above**
2. **Refresh this page**
3. **Go to School Registration**
4. **Click "Test Connection"**
5. **Should now show**: ✅ API Connection Successful!

## 🎯 **Expected Results**

### ✅ **After Allowing Mixed Content:**

```
✅ API Connection Successful!
Found X institutions
You can now register schools normally
```

### ❌ **If Still Blocked:**

```
Mixed Content: Browser blocked request
```

→ Try Option 2 (HTTP frontend) or check if API is actually running

## 🚀 **Once Fixed**

- **School registration** will work with real API
- **Institutions** will appear in Super Admin Dashboard
- **All data** will be saved to your database

## 📝 **For Production**

Set up **HTTPS on your .NET API** server:

```csharp
app.UseHttpsRedirection();
```

**Try Option 1 now** - should fix the issue immediately! 🎉
