# System Architecture

## Overview

The Vehicle Maintenance System is a comprehensive, production-ready application with **enhanced timeline tracking**, **multi-role dashboards**, and **company-based access control**. The architecture balances security, usability, and scalability.

## Architecture Principles

### 1. Multi-Tenant Security
- **Company-Based Segregation**: Data isolation by company with secure access control
- **Role-Based Authentication**: Supervisor authentication with email/username/phone login
- **Admin Oversight**: Full system access with cross-company management capabilities
- **Database Security**: Row Level Security (RLS) with comprehensive permission system

### 2. Enhanced Timeline System
- **6-Stage Milestone Tracking**: Comprehensive progress monitoring from inspection to delivery
- **Visual Progress Indicators**: Real-time completion percentages and status updates
- **Role-Based Permissions**: Appropriate access levels for Admin, Supervisor, and Technician roles
- **Auto-Generated Milestones**: Database triggers create default timeline for all new requests

### 3. Real-Time Collaboration
- **Live Data Synchronization**: Supabase real-time updates across all dashboards
- **Cross-Role Visibility**: Appropriate data sharing between roles while maintaining security
- **Interactive Timeline**: Dynamic milestone updates with immediate visual feedback

## System Components

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                       │
├─────────────────────────────────────────────────────────────┤
│  App.tsx (Main Router & Authentication)                    │
│  ├── Home Page (Role selection)                            │
│  ├── AdminPanel (Full system access)                       │
│  ├── SupervisorDashboard (Company-specific access)         │
│  └── TechnicianDashboard (Assignment-focused access)       │
├─────────────────────────────────────────────────────────────┤
│  Timeline System                                            │
│  ├── EnhancedTimelineViewer (Main timeline component)      │
│  ├── ProgressTracker (Milestone progress)                  │
│  ├── VehicleStatusTracker (Vehicle-specific tracking)      │
│  └── CommentSystem (Progress communication)                │
├─────────────────────────────────────────────────────────────┤
│  Shared Components                                          │
│  ├── MaintenanceRequestForm (Request creation)             │
│  ├── TechnicianAssignment (Technician management)          │
│  ├── IssueReporting (Problem reporting)                    │
│  └── SupervisorManagement (User management)                │
├─────────────────────────────────────────────────────────────┤
│  Permission System                                          │
│  ├── permissions.ts (Role-based access control)            │
│  ├── getTimelinePermissions (Timeline access rules)        │
│  ├── getVisibleMilestones (Milestone filtering)            │
│  └── canUserUpdateMilestone (Update permissions)           │
├─────────────────────────────────────────────────────────────┤
│  API Layer                                                  │
│  ├── supabase.ts (Database operations)                     │
│  ├── getTimelineData (Timeline data fetching)              │
│  ├── createMilestone (Milestone creation)                  │
│  └── updateMilestoneProgress (Progress updates)            │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                         │
├─────────────────────────────────────────────────────────────┤
│  Authentication                                             │
│  ├── Admin Users Only                                       │
│  └── Email/Password Authentication                          │
├─────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL)                                      │
│  ├── maintenance_requests (core data)                       │
│  ├── maintenance_vehicles (vehicle details)                 │
│  └── admin_users (minimal admin profiles)                   │
├─────────────────────────────────────────────────────────────┤
│  Row Level Security                                         │
│  ├── Open Policies (supervisor/technician access)          │
│  └── Admin Policies (restricted admin access)              │
├─────────────────────────────────────────────────────────────┤
│  Real-time Features                                         │
│  ├── Live Updates                                           │
│  └── Change Notifications                                   │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Maintenance Request Lifecycle

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Supervisor │───▶│   Create    │───▶│ Technician  │───▶│  Complete   │
│  Dashboard  │    │  Request    │    │  Dashboard  │    │  Request    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browse    │    │    Add      │    │   Update    │    │   Archive   │
│  Requests   │    │  Vehicles   │    │   Status    │    │  Request    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### 2. Access Control Flow

```
┌─────────────┐
│ User Access │
└──────┬──────┘
       │
       ▼
┌─────────────┐    ┌─────────────┐
│ Home Page   │───▶│ Role Select │
└─────────────┘    └──────┬──────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Admin     │    │ Supervisor  │    │ Technician  │
│ (Auth Req.) │    │ (Direct)    │    │ (Direct)    │
└─────────────┘    └─────────────┘    └─────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Login Form  │    │ Dashboard   │    │ Dashboard   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Security Model

### 1. Authentication Layers

| Component | Authentication | Authorization |
|-----------|----------------|---------------|
| Admin Panel | Supabase Auth | Admin role check |
| Supervisor Dashboard | None | Open access |
| Technician Dashboard | None | Open access |
| Database Operations | RLS Policies | Table-level permissions |

### 2. Database Security

```sql
-- Open access for operational tables
maintenance_requests: anon, authenticated (ALL)
maintenance_vehicles: anon, authenticated (ALL)

-- Restricted access for admin tables  
admin_users: authenticated (own records only)
auth.users: system managed
```

## Deployment Architecture

### Development Environment
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vite Dev  │───▶│  Supabase   │───▶│ PostgreSQL  │
│   Server    │    │   Cloud     │    │  Database   │
│ :5174       │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Production Environment
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Static    │───▶│  Supabase   │───▶│ PostgreSQL  │
│   Hosting   │    │   Cloud     │    │  Database   │
│ (Vercel)    │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Performance Considerations

### 1. Frontend Optimization
- **Code Splitting**: Lazy loading for dashboard components
- **Caching**: React Query for API response caching
- **Bundle Size**: Tree shaking and minimal dependencies

### 2. Database Optimization
- **Indexes**: Strategic indexing on frequently queried columns
- **RLS**: Efficient policies to minimize query overhead
- **Real-time**: Selective subscriptions to reduce bandwidth

### 3. Network Optimization
- **API Calls**: Batched operations where possible
- **Payload Size**: Minimal data transfer
- **Caching**: Browser and CDN caching strategies

## Scalability

### Horizontal Scaling
- **Frontend**: Static hosting with global CDN
- **Backend**: Supabase auto-scaling
- **Database**: PostgreSQL connection pooling

### Vertical Scaling
- **Database**: Supabase tier upgrades
- **Storage**: Automatic scaling
- **Bandwidth**: Usage-based scaling

## Monitoring and Observability

### Application Monitoring
- **Error Tracking**: Console logging and error boundaries
- **Performance**: Core Web Vitals monitoring
- **Usage**: Analytics integration

### Database Monitoring
- **Query Performance**: Supabase dashboard
- **Connection Health**: Built-in monitoring
- **Storage Usage**: Automatic alerts

## Migration Strategy

### From Complex to Simple
The system was migrated from a complex user management system:

1. **Removed Components**:
   - User profiles and role management
   - Complex authentication flows
   - User assignment systems

2. **Simplified Components**:
   - Single admin authentication
   - Open access dashboards
   - Streamlined database schema

3. **Maintained Components**:
   - Core maintenance functionality
   - Vehicle management
   - Request lifecycle

This architecture provides a balance of functionality, security, and simplicity suitable for the target use case.
