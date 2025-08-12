# Deployment Guide for Bank Check Extractor AI

## Quick Start

1. **Test locally first**: `npm start`
2. **Build for production**: `npm run build:prod`
3. **Deploy to your hosting platform**
4. **Set environment variables**
5. **Test the deployed app**

## Environment Variables

Set these in your hosting platform:

```bash
REACT_APP_API_BASE_URL=https://bank-check-extractor-ai-backend.vercel.app
REACT_APP_ENVIRONMENT=production
```

## Hosting Platform Instructions

### 1. Vercel (Recommended)

**A. Install Vercel CLI**
```bash
npm i -g vercel
```

**B. Deploy**
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Or deploy to production
vercel --prod
```

**C. Set Environment Variables**
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `REACT_APP_API_BASE_URL`: `https://bank-check-extractor-ai-backend.vercel.app`
   - `REACT_APP_ENVIRONMENT`: `production`

**D. Build Command**
```bash
npm run build:vercel
```

### 2. Netlify

**A. Deploy via Git**
1. Connect your GitHub repository
2. Set build command: `npm run build:prod`
3. Set publish directory: `build`
4. Set environment variables in Netlify dashboard

**B. Manual Deploy**
```bash
npm run build:prod
# Drag and drop the 'build' folder to Netlify
```

**C. Environment Variables**
1. Go to Site Settings → Environment Variables
2. Add the required variables

### 3. AWS Amplify

**A. Connect Repository**
1. Connect your Git repository
2. Set build settings:
   - Build command: `npm run build:prod`
   - Output directory: `build`

**B. Environment Variables**
1. Go to App Settings → Environment Variables
2. Add the required variables

### 4. GitHub Pages

**A. Install gh-pages**
```bash
npm install --save-dev gh-pages
```

**B. Add to package.json**
```json
{
  "scripts": {
    "predeploy": "npm run build:prod",
    "deploy": "gh-pages -d build"
  },
  "homepage": "https://yourusername.github.io/your-repo-name"
}
```

**C. Deploy**
```bash
npm run deploy
```

### 5. Firebase Hosting

**A. Install Firebase CLI**
```bash
npm install -g firebase-tools
```

**B. Initialize and Deploy**
```bash
firebase login
firebase init hosting
npm run build:prod
firebase deploy
```

## Pre-Deployment Checklist

- [ ] App works locally (`npm start`)
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build:prod`)
- [ ] Environment variables are set
- [ ] API endpoints are accessible
- [ ] CORS is configured properly
- [ ] HTTPS is enabled
- [ ] Error handling is implemented

## Post-Deployment Testing

1. **Test Authentication**
   - Try to register a new account
   - Try to login with existing account
   - Check if tokens are stored properly

2. **Test API Calls**
   - Check browser console for errors
   - Verify network requests in DevTools
   - Test all major features

3. **Test Responsiveness**
   - Test on different screen sizes
   - Test on mobile devices
   - Check touch interactions

## Common Deployment Issues

### 1. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Try building again
npm run build:prod
```

### 2. Environment Variables Not Working
- Ensure variables start with `REACT_APP_`
- Check if they're set in the correct environment
- Verify the build command uses the right environment

### 3. API Connection Issues
- Test API endpoints directly
- Check CORS configuration
- Verify network connectivity

### 4. Authentication Problems
- Check if tokens are being stored
- Verify API endpoints are accessible
- Check browser console for errors

## Monitoring and Maintenance

### 1. Performance Monitoring
- Use browser DevTools to monitor performance
- Check bundle size and loading times
- Monitor API response times

### 2. Error Tracking
- Implement error logging
- Monitor user-reported issues
- Check hosting platform logs

### 3. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Test updates in staging environment

## Troubleshooting Commands

```bash
# Test API endpoints
node test-api.js

# Check build output
npm run build:prod
ls -la build/

# Test locally with production build
npx serve -s build

# Check environment variables
echo $REACT_APP_API_BASE_URL
echo $REACT_APP_ENVIRONMENT
```

## Support

If you encounter issues:

1. Check the troubleshooting guide (`TROUBLESHOOTING.md`)
2. Review browser console errors
3. Test API endpoints directly
4. Check hosting platform logs
5. Verify environment configuration

## Security Considerations

- Always use HTTPS in production
- Implement proper CORS policies
- Validate all user inputs
- Use secure token storage
- Regular security updates
- Monitor for suspicious activity
