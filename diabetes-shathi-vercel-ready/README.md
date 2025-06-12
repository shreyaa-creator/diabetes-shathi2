# Diabetes Shathi - Production Deployment Guide

A comprehensive diabetes management application with Bengali language support.

## Features

- 📊 Glucose level tracking with interactive charts
- 💊 Medicine reminder and adherence tracking
- 🍽️ Comprehensive Bangladeshi food database (500+ items)
- 📱 Progressive Web App (PWA) support
- 🌙 Dark/Light theme toggle
- 📄 PDF report generation
- 🔒 Secure in-memory data storage
- 🌐 Bengali language interface

## Quick Start

1. **Install Node.js** (version 18 or higher)
   ```bash
   # Check if Node.js is installed
   node --version
   npm --version
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your settings
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the app**
   Open your browser to: http://localhost:5000

## Deployment Options

### Option 1: Shared Hosting / VPS

**Requirements:**
- Node.js 18+ installed
- SSH access to your server
- At least 512MB RAM

**Steps:**
1. Upload all files to your server
2. Connect via SSH
3. Navigate to your app directory
4. Install dependencies: `npm install --production`
5. Set environment variables in `.env`
6. Start the app: `npm start`

**For production server management, use PM2:**
```bash
# Install PM2 globally
npm install -g pm2

# Start the app with PM2
pm2 start npm --name "diabetes-app" -- start

# Save PM2 process list
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Option 2: Vercel (Recommended - Free)

**Steps:**
1. Push your code to GitHub
2. Go to vercel.com and import your GitHub repository
3. Configure these settings:
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add environment variables in Vercel dashboard:
   - `NODE_ENV`: `production`
   - `SESSION_SECRET`: `your-secure-random-string`
5. Deploy

**Important for Vercel:**
- The `vercel.json` file is already configured for proper routing
- API routes will be handled by Vercel Functions
- Static files will be served from the `dist` directory

### Option 3: Railway (Easy Deployment)

**Steps:**
1. Push code to GitHub
2. Connect Railway to your repository
3. Railway will auto-deploy
4. Set environment variables in Railway dashboard

### Option 4: DigitalOcean App Platform

**Steps:**
1. Connect your GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. Set environment variables
4. Deploy

### Option 5: Heroku

**Steps:**
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set NODE_ENV=production`
4. Deploy: `git push heroku main`

## Environment Variables

Create a `.env` file with these variables:

```env
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-very-secure-random-string
ALLOWED_ORIGINS=https://yourdomain.com
```

**Important Security Notes:**
- Change `SESSION_SECRET` to a random 32+ character string
- Update `ALLOWED_ORIGINS` with your actual domain
- Never commit `.env` files to version control

## Database Configuration (Optional)

The app uses in-memory storage by default. For persistent data, configure PostgreSQL:

1. **Add to .env:**
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

2. **The app will automatically use PostgreSQL when DATABASE_URL is provided**

## File Structure

```
diabetes-shathi-production/
├── server/           # Backend Express.js server
├── client/           # Frontend React application
├── shared/           # Shared TypeScript schemas
├── package.json      # Dependencies and scripts
├── .env.example      # Environment variables template
├── README.md         # This file
└── ...
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run check` - Type checking

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js, TypeScript
- **Charts:** Chart.js, Recharts
- **PDF Generation:** jsPDF
- **Database:** In-memory (PostgreSQL optional)
- **Authentication:** Session-based

## Performance Optimization

**For production:**
1. Enable gzip compression in your server
2. Use a CDN for static assets
3. Enable caching headers
4. Consider using Redis for sessions (in high-traffic scenarios)

## Troubleshooting

**Common Issues:**

1. **Port already in use**
   ```bash
   # Change PORT in .env file or kill existing process
   lsof -ti:5000 | xargs kill -9
   ```

2. **Module not found errors**
   ```bash
   # Clear npm cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build failures**
   ```bash
   # Check Node.js version (should be 18+)
   node --version
   
   # Update npm
   npm install -g npm@latest
   ```

4. **Memory issues on small servers**
   - Increase server RAM to at least 1GB
   - Add swap file if needed

## Domain Setup

**To use your own domain:**

1. **DNS Configuration:**
   - Point A record to your server IP
   - Or point CNAME to your hosting platform

2. **SSL Certificate:**
   - Use Let's Encrypt for free SSL
   - Or configure SSL through your hosting provider

3. **Update environment variables:**
   ```env
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

## Backup Recommendations

**For production use:**
1. Regular database backups (if using PostgreSQL)
2. Code repository backups
3. Environment configuration backups
4. Server snapshots

## Support

The application includes:
- Comprehensive error handling
- User-friendly Bengali interface
- Responsive design for mobile/desktop
- Data validation and security measures

For technical issues:
1. Check server logs
2. Verify environment variables
3. Ensure all dependencies are installed
4. Check Node.js version compatibility

## License

This project is licensed under the MIT License.