# Deployment Guide

## Overview

This guide covers deploying the Vehicle Maintenance System to production environments. The system uses a static frontend with Supabase backend.

## Prerequisites

- Node.js 18+
- Supabase account
- Domain name (optional)
- Hosting platform account (Vercel, Netlify, etc.)

## Environment Setup

### 1. Supabase Configuration

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and API keys

#### Database Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push database schema
supabase db push
```

#### Environment Variables
Create production environment variables:

```env
# Production .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
service_rolesecret=your-service-role-key
```

### 2. Admin User Setup

Run the admin setup script:
```bash
node setup-admin.js
```

Or manually create admin user in Supabase dashboard:
1. Go to Authentication > Users
2. Create user with email: `admin@abc.com`
3. Set password: `admin@abc.com`
4. Update user metadata with admin role

## Deployment Options

### Option 1: Vercel (Recommended)

#### Automatic Deployment
1. **Connect Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

#### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Build project
npm run build

# Deploy
vercel --prod
```

#### Environment Variables in Vercel
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Option 2: Netlify

#### Automatic Deployment
1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

#### Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build project
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: Static Hosting

#### Build for Production
```bash
npm run build
```

#### Upload to Hosting
Upload the `dist/` folder contents to your hosting provider:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- GitHub Pages

## Domain Configuration

### Custom Domain Setup

#### Vercel
1. Go to project settings
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS

#### Netlify
1. Go to domain settings
2. Add custom domain
3. Configure DNS
4. Enable HTTPS

### DNS Configuration
```
# A Record
@ -> your-hosting-ip

# CNAME Record  
www -> your-app.vercel.app
```

## Security Configuration

### 1. Supabase Security

#### RLS Policies
Verify Row Level Security policies are enabled:
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename IN (
  'maintenance_requests', 
  'maintenance_vehicles', 
  'admin_users'
);
```

#### API Keys
- Use anon key for frontend
- Keep service role key secure
- Rotate keys regularly

### 2. CORS Configuration

Supabase CORS is configured automatically. For custom domains:
1. Go to Supabase Dashboard
2. Settings > API
3. Add your domain to allowed origins

### 3. Environment Security

#### Production Environment Variables
```bash
# Never commit these to version control
VITE_SUPABASE_URL=production-url
VITE_SUPABASE_ANON_KEY=production-anon-key
service_rolesecret=production-service-key
```

#### Security Headers
Add security headers to hosting platform:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Performance Optimization

### 1. Build Optimization

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
})
```

### 2. CDN Configuration

#### Static Assets
- Enable CDN for static assets
- Configure cache headers
- Optimize images

#### Caching Strategy
```
# Cache static assets
*.js, *.css, *.png, *.jpg -> 1 year
index.html -> no cache
```

## Monitoring Setup

### 1. Application Monitoring

#### Error Tracking
```typescript
// Add error tracking
window.addEventListener('error', (event) => {
  console.error('Application error:', event.error)
  // Send to monitoring service
})
```

#### Performance Monitoring
```typescript
// Monitor Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

### 2. Database Monitoring

#### Supabase Dashboard
- Monitor query performance
- Track API usage
- Set up alerts

#### Custom Monitoring
```typescript
// API response time monitoring
const startTime = performance.now()
await supabase.from('maintenance_requests').select()
const endTime = performance.now()
console.log(`Query took ${endTime - startTime} milliseconds`)
```

## Backup and Recovery

### 1. Database Backup

#### Automatic Backups
Supabase provides automatic backups:
- Point-in-time recovery
- Daily snapshots
- Cross-region replication

#### Manual Backup
```bash
# Export data
supabase db dump --data-only > backup.sql

# Import data
supabase db reset --with-data backup.sql
```

### 2. Application Backup

#### Code Repository
- Use Git for version control
- Tag releases
- Maintain deployment history

#### Configuration Backup
- Document environment variables
- Save deployment configurations
- Backup custom domain settings

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

#### Environment Variable Issues
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### Database Connection Issues
```typescript
// Test database connection
const { data, error } = await supabase
  .from('maintenance_requests')
  .select('count')
  .limit(1)

if (error) {
  console.error('Database connection failed:', error)
}
```

### Support Resources

- **Supabase Documentation**: [docs.supabase.com](https://docs.supabase.com)
- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)

## Maintenance

### Regular Tasks

#### Weekly
- Monitor application performance
- Check error logs
- Review database usage

#### Monthly
- Update dependencies
- Review security settings
- Backup configurations

#### Quarterly
- Security audit
- Performance optimization
- Capacity planning

### Updates

#### Application Updates
```bash
# Update dependencies
npm update

# Test changes
npm run build
npm run preview

# Deploy
git push origin main
```

#### Database Updates
```bash
# Create migration
supabase migration new update_name

# Apply migration
supabase db push
```

This deployment guide ensures a smooth transition from development to production while maintaining security and performance standards.
