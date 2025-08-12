# Troubleshooting Guide for Bank Check Extractor AI

## Common Hosting Issues & Solutions

### 1. Login/Register Not Working

#### Symptoms:
- Users can't log in or register
- "Network Error" messages
- "CORS" errors in browser console
- Authentication failures

#### Solutions:

**A. Check Backend Status**
```bash
# Test if backend is accessible
curl https://bank-check-extractor-ai-backend.vercel.app/api/test-db
```

**B. Verify Environment Variables**
Make sure your hosting platform has these environment variables:
```bash
REACT_APP_API_BASE_URL=https://bank-check-extractor-ai-backend.vercel.app
REACT_APP_ENVIRONMENT=production
```

**C. Check CORS Configuration**
The backend should allow requests from your frontend domain. If you're getting CORS errors, contact backend admin.

### 2. Build Issues

#### Symptoms:
- Build fails during deployment
- Missing dependencies
- Environment variable errors

#### Solutions:

**A. Use Correct Build Command**
```bash
# For Vercel
npm run build:vercel

# For other platforms
npm run build:prod

# For development
npm run build
```

**B. Check Dependencies**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 3. API Connection Issues

#### Symptoms:
- "Failed to fetch" errors
- Timeout errors
- 404/500 server errors

#### Solutions:

**A. Test API Endpoints**
```bash
# Test authentication
curl -X POST https://bank-check-extractor-ai-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Test database connection
curl https://bank-check-extractor-ai-backend.vercel.app/api/test-db
```

**B. Check Network Configuration**
- Ensure your hosting platform allows outbound HTTPS requests
- Check if there are firewall rules blocking external API calls

### 4. Authentication Issues

#### Symptoms:
- Users get logged out unexpectedly
- Token validation failures
- Session timeouts

#### Solutions:

**A. Check Token Storage**
```javascript
// In browser console, check if token exists
localStorage.getItem('token')
```

**B. Verify Token Format**
The token should be a valid JWT string. If it's malformed, clear storage and re-login.

### 5. Mobile/Responsive Issues

#### Symptoms:
- App doesn't work on mobile devices
- Layout breaks on small screens
- Touch events not working

#### Solutions:

**A. Check Viewport Meta Tag**
Ensure your `public/index.html` has:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

**B. Test on Different Devices**
Use browser dev tools to simulate different screen sizes.

### 6. Performance Issues

#### Symptoms:
- Slow loading times
- High memory usage
- Unresponsive UI

#### Solutions:

**A. Optimize Bundle Size**
```bash
# Analyze bundle
npm run build
# Check the build folder size
```

**B. Enable Compression**
Ensure your hosting platform compresses static assets (gzip/brotli).

### 7. Environment-Specific Issues

#### Vercel:
- Use `npm run build:vercel` for builds
- Set environment variables in Vercel dashboard
- Check function logs for backend errors

#### Netlify:
- Use `npm run build:prod` for builds
- Set environment variables in Netlify dashboard
- Check deploy logs for build errors

#### AWS Amplify:
- Use `npm run build` for builds
- Set environment variables in Amplify console
- Check build logs for errors

### 8. Debug Steps

#### A. Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

#### B. Check Network Requests
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to login/register
4. Look for failed requests and their status codes

#### C. Test API Directly
```bash
# Test login endpoint
curl -X POST https://bank-check-extractor-ai-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

### 9. Common Error Codes

- **401**: Authentication failed - check token
- **403**: Access denied - check permissions
- **404**: Endpoint not found - check API URL
- **500**: Server error - check backend logs
- **CORS**: Cross-origin issue - check backend CORS config

### 10. Getting Help

If you're still experiencing issues:

1. **Check the logs**: Look at browser console and hosting platform logs
2. **Test locally**: Try running the app locally to see if it's a hosting issue
3. **Contact support**: Provide error messages, logs, and steps to reproduce
4. **Check backend status**: Ensure the backend API is running and accessible

### 11. Prevention Tips

1. **Always test locally first** before deploying
2. **Use environment variables** for configuration
3. **Monitor API endpoints** for availability
4. **Implement proper error handling** in your code
5. **Use HTTPS** for all production deployments
6. **Regularly update dependencies** to avoid security issues

## Quick Fix Checklist

- [ ] Backend API is accessible
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly
- [ ] Build command is correct for your platform
- [ ] All dependencies are installed
- [ ] Browser console shows no errors
- [ ] Network requests are successful
- [ ] Authentication tokens are valid
- [ ] Mobile viewport is configured
- [ ] Error handling is implemented

## Emergency Rollback

If you need to quickly rollback to a working version:

1. **Revert to previous commit**:
   ```bash
   git log --oneline
   git reset --hard <commit-hash>
   ```

2. **Redeploy**:
   ```bash
   npm run build:vercel  # or appropriate build command
   ```

3. **Clear browser cache** and test again
