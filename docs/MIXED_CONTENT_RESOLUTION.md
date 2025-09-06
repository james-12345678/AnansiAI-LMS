# Mixed Content Resolution Guide

## What is Mixed Content?

Mixed content occurs when an HTTPS webpage tries to load resources (like API calls) over HTTP. Modern browsers block these requests for security reasons, preventing man-in-the-middle attacks.

## The Problem

Your AnansiAI admin dashboard is deployed on:

- **Frontend**: `https://your-app.fly.dev` (HTTPS) ✅
- **API Server**: `http://13.60.98.134/anansiai` (HTTP) ❌

This creates a **Mixed Content Security Error** that prevents the dashboard from loading data.

## Solutions

### 1. Configure SSL on API Server (Recommended for Production)

Install an SSL certificate on your API server to enable HTTPS:

```bash
# Using Let's Encrypt (free SSL certificate)
sudo certbot --nginx -d 13.60.98.134

# Or configure your web server with an SSL certificate
```

**Pros:**

- ✅ Most secure solution
- ✅ Works with all browsers
- ✅ Production-ready

**Cons:**

- ⚠️ Requires server configuration
- ⚠️ May need domain name instead of IP

### 2. Use Domain Name with SSL

Replace the IP address with a domain name and configure SSL:

```bash
# Point domain to your API server
api.yourdomain.com -> 13.60.98.134

# Configure SSL for the domain
```

### 3. Deploy Frontend on HTTP (Development Only)

For development environments, deploy the frontend on HTTP to match the API:

```bash
# Deploy to HTTP instead of HTTPS
http://your-app.example.com
```

**⚠️ Warning:** Only use this for development. Never use HTTP in production.

### 4. Use CORS Proxy (Temporary Solution)

Set up a CORS proxy to forward requests:

```javascript
// Example proxy configuration
const proxyUrl = "https://cors-anywhere.herokuapp.com/";
const apiUrl = "http://13.60.98.134/anansiai";
```

## Automatic Detection and Resolution

The admin dashboard includes automatic mixed content detection:

1. **Detection**: The app automatically detects when it's running on HTTPS trying to access HTTP APIs
2. **User Guidance**: A `MixedContentResolver` component appears with step-by-step solutions
3. **HTTPS Testing**: Automatically test if your API supports HTTPS
4. **Fallback Options**: Provides demo mode and alternative solutions

## Configuration Files

The following files handle mixed content resolution:

- `src/services/axiosClient.ts` - Smart protocol selection
- `src/services/mixedContentHelper.ts` - Mixed content detection and resolution
- `src/components/MixedContentResolver.tsx` - User interface for resolution
- `src/pages/AdminDashboard.tsx` - Displays resolver when connection fails

## Testing Your API

To test if your API supports HTTPS:

```bash
# Test HTTPS connection
curl -k https://13.60.98.134/anansiai/api/Institutions

# Test HTTP connection (for comparison)
curl http://13.60.98.134/anansiai/api/Institutions
```

## Browser Developer Tools

Check the browser console for mixed content errors:

```
Mixed Content: The page at 'https://your-app.fly.dev/' was loaded over HTTPS,
but requested an insecure XMLHttpRequest endpoint 'http://13.60.98.134/anansiai/api/Institutions'.
This request has been blocked; the content must be served over HTTPS.
```

## Quick Fix Checklist

1. ✅ Check if API server supports HTTPS: `https://13.60.98.134/anansiai/api/Institutions`
2. ✅ Configure SSL certificate on API server if needed
3. ✅ Update API configuration to use HTTPS
4. ✅ Test the connection with the built-in resolver
5. ✅ Refresh the dashboard to use the new configuration

## Production Deployment

For production deployments:

1. **Always use HTTPS** for both frontend and backend
2. **Configure proper SSL certificates** (Let's Encrypt is free)
3. **Use domain names** instead of IP addresses when possible
4. **Test thoroughly** before deploying

## Development vs Production

| Environment | Frontend | Backend | Status      |
| ----------- | -------- | ------- | ----------- |
| Development | HTTP     | HTTP    | ✅ Works    |
| Development | HTTPS    | HTTP    | ❌ Blocked  |
| Production  | HTTPS    | HTTPS   | ✅ Secure   |
| Production  | HTTP     | HTTP    | ⚠️ Insecure |

## Getting Help

If you continue experiencing mixed content issues:

1. Check the browser console for specific error messages
2. Use the built-in MixedContentResolver component
3. Verify your API server configuration
4. Consider using a reverse proxy with SSL termination

## Related Documentation

- [API Integration Guide](./API_INTEGRATION_GUIDE.md)
- [Backend Setup Guide](./backend-setup-guide.md)
- [CORS Error Helper](../src/components/CorsErrorHelper.tsx)
