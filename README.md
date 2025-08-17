# 🚗 Vehicle Maintenance Management System

A comprehensive, production-ready vehicle maintenance management system with **enhanced timeline tracking**, **multi-role dashboards**, and **company-based access control** built with React, TypeScript, and Supabase.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
![Supabase](https://img.shields.io/badge/Supabase-2.55.0-green.svg)
![Vite](https://img.shields.io/badge/Vite-5.4.2-purple.svg)

## 🎯 **System Overview**

This is a **production-ready** vehicle maintenance management system that provides:

- 🔐 **Secure Authentication** - Multi-method login (email/username/phone)
- 🏢 **Multi-Tenant Architecture** - Company-based data segregation
- 📊 **Enhanced Timeline System** - 6-stage milestone tracking with visual progress
- 👥 **Role-Based Access Control** - Admin, Supervisor, and Technician dashboards
- 🔄 **Real-Time Updates** - Live data synchronization across all users
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## ✨ **Key Features**

### 🔐 **Authentication & Security**
- **Multi-Method Login**: Email, username, or phone + password
- **Session Management**: 24-hour sessions with automatic expiry
- **Account Security**: 5 failed attempts = 15-minute lockout
- **Admin User Management**: Complete supervisor account lifecycle
- **Password Reset**: Admin-controlled password management

### 🏢 **Company Management**
- **Multi-Tenant Support**: Multiple companies with unique codes
- **Data Isolation**: Company-specific request segregation
- **Supervisor Profiles**: Company-linked supervisor accounts
- **Cross-Company Admin**: Admin oversight across all companies

### 📋 **Request Lifecycle Management**
- **Status Flow**: `pending` → `approved` → `in_progress` → `completed`
- **Priority System**: Low, Medium, High, Urgent classifications
- **Vehicle Tracking**: Detailed vehicle information and issue tracking
- **Assignment System**: Technician assignment and workload management

### 📊 **Enhanced Timeline System**
- **6-Stage Milestones**: Comprehensive progress tracking
  1. **Initial Inspection** - Vehicle assessment and diagnostics
  2. **Parts Procurement** - Order and receive necessary parts
  3. **Repair/Maintenance Work** - Execute primary maintenance tasks
  4. **Testing & Calibration** - System testing and calibration
  5. **Quality Assurance** - Final inspection and verification
  6. **Delivery Preparation** - Prepare vehicle for customer delivery
- **Visual Progress Tracking** - Interactive timeline with completion percentages
- **Role-Based Permissions** - Appropriate access levels for each user type
- **Real-Time Updates** - Live milestone progress synchronization

### 👥 **Role-Based Dashboards**
- **Admin Dashboard**: Full system access with company filtering and user management
- **Supervisor Dashboard**: Company-specific request management with timeline overview
- **Technician Dashboard**: Assigned requests with interactive timeline and progress tracking

## 🛠️ **Tech Stack**

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend** | React | 18.3.1 |
| **Language** | TypeScript | 5.5.3 |
| **Styling** | Tailwind CSS | 3.4.1 |
| **Backend** | Supabase | 2.55.0 |
| **Database** | PostgreSQL | (via Supabase) |
| **Icons** | Lucide React | 0.344.0 |
| **Build Tool** | Vite | 5.4.2 |
| **Authentication** | Custom + Supabase Auth | - |

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Supabase account

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/vehicle-maintenance-system.git
   cd vehicle-maintenance-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   service_rolesecret=your_service_role_key
   ```

4. **Database Setup**
   Run the migration file in your Supabase SQL Editor:
   ```sql
   -- File: supabase/migrations/production/20250816300000_complete_vehicle_maintenance_system.sql
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   | Role | URL | Credentials |
   |------|-----|-------------|
   | **Admin** | `http://localhost:5174/#admin` | admin@abc.com / admin@abc.com |
   | **Supervisor** | `http://localhost:5174/#supervisor` | john@abc-transport.com / password123 |
   | **Technician** | `http://localhost:5174/#technician` | Enter any name (e.g., "John Doe") |

## 📊 **Dashboard Features**

### 🔧 **Admin Dashboard**
- **Full System Access**: Manage all companies and users
- **User Management**: Create, edit, delete supervisor accounts
- **Request Oversight**: Approve requests and assign technicians
- **Company Filtering**: Filter data by specific companies
- **Timeline Management**: Full timeline access and control
- **Analytics**: System-wide reporting and insights

### 👨‍💼 **Supervisor Dashboard**
- **Company-Specific Access**: View only your company's data
- **Request Creation**: Create new maintenance requests instantly
- **Progress Tracking**: Monitor request status and timeline progress
- **Timeline Overview**: "Project timeline and team progress overview"
- **Authentication**: Secure login with email/username/phone

### 🔧 **Technician Dashboard**
- **Assignment Focus**: View only assigned requests
- **Interactive Timeline**: "Your assigned milestones and progress updates"
- **Progress Updates**: Update milestone completion and status
- **Issue Reporting**: Report problems and add progress comments
- **Status Management**: Update request status as work progresses

## 👥 **User Accounts & Access**

### **🔑 Sample Credentials**

#### **Admin Access**
```
URL: http://localhost:5174/#admin
Email: admin@abc.com
Password: admin@abc.com
```

#### **Supervisor Accounts**
```
URL: http://localhost:5174/#supervisor

john@abc-transport.com / password123 (ABC Transport Company)
sarah@xyz-logistics.com / password123 (XYZ Logistics)
mike@deltafleet.com / password123 (Delta Fleet Services)
lisa@omegashipping.com / password123 (Omega Shipping Corp)
```

#### **Technician Access**
```
URL: http://localhost:5174/#technician
Setup: Enter any name (e.g., "John Doe", "Test Technician")
Note: Timeline shows in read-only mode until name is entered
```

## 🔄 **Workflow Examples**

### **📋 Supervisor Workflow**
1. **Login** → Use email/username/phone + password
2. **Create Request** → Click "New Maintenance Request" → Fill form → Submit
3. **Track Progress** → Request appears immediately with "PENDING" status
4. **Monitor Timeline** → View 6-stage milestone progress
5. **Review Updates** → Watch status changes as work progresses

### **⚙️ Admin Workflow**
1. **Login** → Use admin credentials
2. **Manage Users** → Go to "Supervisors" tab → Create/edit accounts
3. **Approve Requests** → Review pending → Approve → Assign technician
4. **Monitor System** → Use company filtering and timeline oversight
5. **Manage Accounts** → Reset passwords and manage access

### **🔧 Technician Workflow**
1. **Enter Name** → Provide name for assignment tracking
2. **View Timeline** → See complete project timeline with milestones
3. **Update Progress** → Mark milestones complete and update status
4. **Report Issues** → Add comments and progress updates
5. **Complete Work** → Update final status and delivery preparation

## 📊 **Sample Data Included**

The system comes with comprehensive sample data:
- **4 Companies**: ABC Transport, XYZ Logistics, Delta Fleet, Omega Shipping
- **4 Supervisor Accounts**: Fully authenticated with company associations
- **13 Sample Requests**: Various statuses and priorities across companies
- **78 Timeline Milestones**: 6 milestones per request (automatically created)
- **Vehicle Data**: Detailed vehicle information and maintenance history

## 🛠️ **Development**

### **Available Scripts**
```bash
npm run dev              # Start development server (http://localhost:5174)
npm run build            # Build for production
npm run build:analyze    # Build with bundle analysis
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run test:system      # Run system tests
npm run clean            # Clean build directory
```

### **Project Structure**
```
src/
├── components/          # React components
│   ├── AdminPanel.tsx          # Admin dashboard
│   ├── SupervisorDashboard.tsx # Supervisor dashboard
│   ├── TechnicianDashboard.tsx # Technician dashboard
│   ├── EnhancedTimelineViewer.tsx # Timeline component
│   └── ...
├── lib/                # Utilities and API
│   ├── supabase.ts            # Database operations
│   ├── permissions.ts         # Role-based permissions
│   └── ...
└── hooks/              # Custom React hooks

supabase/
└── migrations/         # Database migrations
    └── production/     # Production-ready migrations

docs/                   # Documentation
├── API.md             # API documentation
├── ARCHITECTURE.md    # System architecture
└── ...
```

## 📚 **Documentation**

| Document | Description |
|----------|-------------|
| [`docs/API.md`](docs/API.md) | API endpoints and database operations |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture and design patterns |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Production deployment guide |
| [`docs/IMPLEMENTATION_GUIDE.md`](docs/IMPLEMENTATION_GUIDE.md) | Implementation details and setup |

## 🚀 **Production Deployment**

### **Build for Production**
```bash
npm run build
```

### **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Deploy to Netlify**
```bash
# Build and deploy
npm run build
# Upload dist/ folder to Netlify
```

### **Environment Variables for Production**
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## ✅ **Production Status**

**🎉 FULLY OPERATIONAL & PRODUCTION-READY**

- ✅ **Enhanced Timeline System** - 6-stage milestone tracking with visual progress
- ✅ **Multi-Role Dashboards** - Admin, Supervisor, and Technician interfaces
- ✅ **Company-Based Multi-Tenancy** - Secure data segregation
- ✅ **Real-Time Updates** - Live data synchronization
- ✅ **Responsive Design** - Mobile and desktop optimized
- ✅ **Role-Based Security** - Comprehensive permission system
- ✅ **Comprehensive Testing** - Verified functionality across all roles

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 **Useful Links**

- **Live Demo**: [Coming Soon]
- **Documentation**: [`docs/`](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/vehicle-maintenance-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/vehicle-maintenance-system/discussions)

## 🙏 **Acknowledgments**

- [Supabase](https://supabase.com/) for the backend infrastructure
- [React](https://reactjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for beautiful icons
- [Vite](https://vitejs.dev/) for the blazing fast build tool

---

**Built with ❤️ for efficient vehicle maintenance management**
