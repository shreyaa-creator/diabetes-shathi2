# Vercel Deployment Guide for Diabetes Shathi

## Quick Vercel Setup

1. **Upload to GitHub**
   - Create new repository on GitHub
   - Upload all files from this package
   - Commit and push

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure settings:
     - Build Command: `npm run vercel-build`
     - Output Directory: `dist`
     - Install Command: `npm install`

3. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   NODE_ENV=production
   SESSION_SECRET=your-secure-random-32-character-string
   ```

4. **Deploy**
   - Click Deploy
   - Your app will be live at: https://your-project-name.vercel.app

## Files Configured for Vercel

- `vercel.json` - Routing configuration
- `api/index.ts` - Serverless API handler
- `public/_redirects` - SPA routing fallback
- `package.json` - Build scripts

## Troubleshooting

**404 Errors:** The vercel.json file handles routing correctly
**API Errors:** Check environment variables are set
**Build Failures:** Ensure Node.js 18+ is selected in Vercel settings

Your diabetes app will work perfectly on Vercel with these configurations!