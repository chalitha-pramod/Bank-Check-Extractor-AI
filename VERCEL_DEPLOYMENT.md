# Vercel Deployment Guide

This guide will help you deploy your Bank Check AI application separately on Vercel - frontend and backend as separate projects.

## Prerequisites

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

## Step 1: Deploy Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Set project name: `bank-check-ai-backend`
   - Set directory: `./` (current directory)
   - Override settings: `No`
   - Deploy: `Yes`

4. Note the deployment URL (e.g., `https://bank-check-ai-backend.vercel.app`)

## Step 2: Configure Backend Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project
3. Go to Settings → Environment Variables
4. Add the following variables:
   - `NODE_ENV`: `production`
   - `GOOGLE_API_KEY`: Your Google Gemini API key
   - Any other environment variables your app needs

## Step 3: Deploy Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Update the API URL in `env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-domain.vercel.app
   ```
   Replace `your-backend-domain.vercel.app` with your actual backend URL.

3. Deploy to Vercel:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set project name: `bank-check-ai-frontend`
   - Set directory: `./` (current directory)
   - Override settings: `No`
   - Deploy: `Yes`

## Step 4: Configure Frontend Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your frontend project
3. Go to Settings → Environment Variables
4. Add:
   - `REACT_APP_API_URL`: Your backend Vercel URL

## Step 5: Update CORS in Backend (if needed)

If you encounter CORS issues, update the CORS configuration in `backend/vercel-server.js`:

```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

## Step 6: Test Your Deployment

1. Test backend endpoints:
   - `https://your-backend.vercel.app/api/health`
   - `https://your-backend.vercel.app/api/test-db`

2. Test frontend:
   - Navigate to your frontend URL
   - Try uploading a check image
   - Verify API calls work

## Important Notes

### Database Considerations
- SQLite files are not persistent on Vercel
- Consider migrating to a cloud database (PostgreSQL, MongoDB Atlas, etc.)
- Update database connection in production

### File Uploads
- Vercel has limitations with file storage
- Consider using cloud storage (AWS S3, Cloudinary, etc.)
- Update upload handling accordingly

### Environment Variables
- Never commit sensitive data to Git
- Use Vercel's environment variable system
- Keep development and production configs separate

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check package.json scripts
   - Verify all dependencies are installed
   - Check for syntax errors

2. **API Connection Issues**:
   - Verify CORS configuration
   - Check environment variables
   - Ensure backend is deployed and running

3. **Database Connection**:
   - SQLite won't work on Vercel
   - Migrate to cloud database
   - Update connection strings

### Useful Commands

```bash
# View deployment logs
vercel logs

# Redeploy
vercel --prod

# Remove deployment
vercel remove

# View project info
vercel ls
```

## Next Steps

1. Set up custom domains (optional)
2. Configure automatic deployments from Git
3. Set up monitoring and analytics
4. Implement CI/CD pipeline
5. Add SSL certificates (automatic with Vercel)

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Vercel Support](https://vercel.com/support)
