# 🚀 Deployment Guide

This guide covers deploying the Vehicle Maintenance Management System to various platforms.

## 📋 **Pre-Deployment Checklist**

- [ ] Supabase project created and configured
- [ ] Database migration applied
- [ ] Environment variables configured
- [ ] Application tested locally
- [ ] Build process verified (`npm run build`)

## 🌐 **Platform-Specific Deployment**

### **Vercel (Recommended)**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### **Netlify**

1. **Build and Deploy**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Environment Variables**
   In Netlify dashboard, add:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### **GitHub Pages**

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run build
   npm run deploy
   ```

### **Docker Deployment**

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and Run**
   ```bash
   docker build -t vehicle-maintenance-system .
   docker run -p 80:80 vehicle-maintenance-system
   ```

## 🔧 **Environment Configuration**

### **Required Environment Variables**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### **Optional Environment Variables**
```env
VITE_APP_NAME=Vehicle Maintenance System
VITE_APP_VERSION=2.0.0
```

## 🗄️ **Database Setup**

### **Supabase Configuration**

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run Database Migration**
   ```sql
   -- Copy and paste the contents of:
   -- supabase/migrations/production/20250816300000_complete_vehicle_maintenance_system.sql
   -- into your Supabase SQL Editor
   ```

3. **Verify Setup**
   - Check that all tables are created
   - Verify sample data is populated
   - Test authentication works

## 🔒 **Security Configuration**

### **Supabase Security**
- Row Level Security (RLS) is enabled
- Policies are configured for multi-tenant access
- API keys are properly scoped

### **Environment Security**
- Never commit `.env` files to version control
- Use platform-specific environment variable management
- Rotate API keys regularly

## 📊 **Performance Optimization**

### **Build Optimization**
```bash
# Analyze bundle size
npm run build:analyze

# Clean build
npm run clean && npm run build
```

### **CDN Configuration**
For static hosting platforms, configure:
- Gzip compression
- Browser caching headers
- CDN distribution

## 🧪 **Post-Deployment Testing**

### **Functional Testing**
- [ ] Admin login works
- [ ] Supervisor authentication functions
- [ ] Technician dashboard accessible
- [ ] Timeline system displays correctly
- [ ] Real-time updates work
- [ ] Mobile responsiveness verified

### **Performance Testing**
- [ ] Page load times < 3 seconds
- [ ] Timeline interactions responsive
- [ ] Database queries optimized
- [ ] No console errors

## 🔄 **CI/CD Pipeline**

### **GitHub Actions (Included)**
The repository includes a complete CI/CD pipeline:
- Automated testing on push/PR
- Build verification
- Security scanning
- Automatic deployment to staging/production

### **Environment-Specific Deployments**
- **Development**: Auto-deploy from `develop` branch
- **Staging**: Auto-deploy from PR previews
- **Production**: Auto-deploy from `main` branch

## 🚨 **Troubleshooting**

### **Common Issues**

**Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Environment Variables Not Working**
- Ensure variables start with `VITE_`
- Restart development server after changes
- Check platform-specific variable configuration

**Database Connection Issues**
- Verify Supabase URL and key
- Check network connectivity
- Ensure RLS policies are correct

**Timeline Not Loading**
- Check database migration completed
- Verify milestone data exists
- Check browser console for errors

## 📞 **Support**

For deployment issues:
- Check the [troubleshooting guide](docs/TROUBLESHOOTING.md)
- Review [GitHub Issues](https://github.com/your-username/vehicle-maintenance-system/issues)
- Join [GitHub Discussions](https://github.com/your-username/vehicle-maintenance-system/discussions)

## 🎯 **Production Checklist**

- [ ] Database migration completed
- [ ] Environment variables configured
- [ ] SSL certificate configured
- [ ] Domain name configured
- [ ] Monitoring setup (optional)
- [ ] Backup strategy implemented
- [ ] Error tracking configured (optional)

---

**🎉 Your Vehicle Maintenance Management System is ready for production!**
