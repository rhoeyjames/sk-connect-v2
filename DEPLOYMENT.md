# SKConnect Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally `npm i -g vercel`
3. **Git Repository**: Your code should be in a Git repository

## Quick Start with Builder.io MCP

### Connect Vercel via Builder.io (Recommended)
1. [Open MCP popover](#open-mcp-popover) in Builder.io
2. Connect to **Vercel** integration
3. This allows you to:
   - Deploy directly from Builder.io
   - Manage environment variables
   - Monitor deployments
   - Configure domains

## Manual Deployment Steps

### Step 1: Prepare Your Project

Your project is now configured with:
- ✅ `vercel.json` - Deployment configuration
- ✅ Updated `next.config.mjs` - Production optimizations
- ✅ `.env.example` - Environment variables template

### Step 2: Set Up Environment Variables

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add these variables:

```bash
# Required Variables
NEXT_PUBLIC_API_URL=https://your-vercel-app.vercel.app/api
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app

# Optional: If using external backend
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com

# Database (if needed)
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret

# File uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

### Step 3: Deploy Methods

#### Option A: Git Integration (Recommended)
1. Connect your GitHub/GitLab repository to Vercel
2. Push to main branch → automatic deployment
3. Pull requests → preview deployments

#### Option B: Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or use our deployment script
./scripts/deploy.sh
```

#### Option C: Builder.io MCP Integration
Use the Vercel MCP integration for streamlined deployment.

### Step 4: Configure Your Deployment

1. **Custom Domain** (Optional):
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Performance Settings**:
   - Functions: Already configured for 30s timeout
   - Regions: Set to `iad1` (can be changed)

3. **Security Headers**: Already configured in `vercel.json`

### Step 5: Backend Integration

#### Option A: Use Built-in API Routes
Your Next.js app includes API routes in `app/api/`. These will work automatically on Vercel.

#### Option B: External Backend
If you have a separate backend:
1. Deploy your backend separately
2. Update `NEXT_PUBLIC_BACKEND_URL` environment variable
3. Configure CORS on your backend to allow your Vercel domain

## File Structure After Deployment

```
your-app/
├── vercel.json          # Deployment config
├── next.config.mjs      # Next.js config (updated)
├── .env.example         # Environment template
├── scripts/
│   └── deploy.sh        # Deployment script
└── DEPLOYMENT.md        # This guide
```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | API endpoint URL | Yes | `https://app.vercel.app/api` |
| `NEXT_PUBLIC_APP_URL` | Your app's URL | Yes | `https://app.vercel.app` |
| `NEXT_PUBLIC_BACKEND_URL` | External backend URL | No | `https://api.example.com` |
| `MONGODB_URI` | Database connection | No | `mongodb://...` |
| `JWT_SECRET` | JWT signing secret | No | `your-secret-key` |

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Custom domain set up (if needed)
- [ ] SSL certificate active
- [ ] API routes working
- [ ] Database connections working
- [ ] File uploads working
- [ ] Authentication working
- [ ] Performance monitoring set up

## Common Issues & Solutions

### Build Errors
- Check TypeScript errors: `npm run build`
- Fix ESLint issues: `npm run lint`

### Environment Variables Not Working
- Make sure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new environment variables

### API Routes 404
- Ensure your API routes are in `app/api/` directory
- Check `vercel.json` function configuration

### CORS Issues
- Configure your backend to allow your Vercel domain
- Update API URLs in environment variables

## Monitoring & Maintenance

1. **Analytics**: Enable Vercel Analytics in project settings
2. **Logs**: View function logs in Vercel dashboard
3. **Performance**: Monitor Core Web Vitals
4. **Updates**: Set up automatic deployments via Git integration

## Support

- **Technical Issues**: Check [Vercel Documentation](https://vercel.com/docs)
- **Builder.io Integration**: Use the Vercel MCP integration
- **Project Issues**: Check this repository's issues

---

🎉 **Your SKConnect app is now ready for Vercel deployment!**
