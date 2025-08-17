# API Documentation

## Overview

The Vehicle Maintenance System uses Supabase as the backend with **supervisor authentication** and **company-based access control**. This document outlines the available API operations and database schema.

## Authentication System

### Supervisor Authentication
- **Login Methods**: Email, username, or phone + password
- **Session Management**: 24-hour sessions with automatic expiry
- **Account Security**: 5 failed attempts = 15-minute lockout
- **Company Association**: Automatic company-based data access

### Admin Authentication
- **Admin Panel**: Requires admin credentials
- **User Management**: Complete supervisor account lifecycle
- **Cross-Company Access**: Admin oversight across all companies

### Authentication Functions

#### `authenticate_supervisor(p_login, p_password)`
```typescript
const { data, error } = await supabase.rpc('authenticate_supervisor', {
  p_login: 'john@abc-transport.com',
  p_password: 'password123'
})
```

#### `create_supervisor_account(...)`
Admin function to create new supervisor accounts.

#### `reset_supervisor_password(...)`
Admin function to reset supervisor passwords.

## Database Schema

### 1. maintenance_requests

Primary table for all maintenance requests.

```sql
CREATE TABLE maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name text NOT NULL,
  contact_number text NOT NULL,
  company_name text,
  total_cost numeric NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  priority text DEFAULT 'medium',
  category text DEFAULT 'general',
  estimated_completion timestamptz,
  notes text,
  assigned_to text,
  technician_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Status Values**: `pending`, `approved`, `in_progress`, `completed`, `cancelled`
**Priority Values**: `low`, `medium`, `high`, `urgent`
**Category Values**: `general`, `emergency`, `preventive`, `repair`

### 2. maintenance_vehicles

Vehicle details associated with maintenance requests.

```sql
CREATE TABLE maintenance_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  plate_number text NOT NULL,
  location text NOT NULL,
  maintenance_types text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
```

**Maintenance Types**: `oil_change`, `tire_check`, `brake_service`, `engine_repair`, etc.

### 3. admin_users

Minimal admin user profiles.

```sql
CREATE TABLE admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## API Operations

### Maintenance Requests

#### Get All Requests
```typescript
import { getMaintenanceRequests } from '../lib/supabase'

const { data, error } = await getMaintenanceRequests()
```

#### Create Request
```typescript
import { createMaintenanceRequest } from '../lib/supabase'

const requestData = {
  owner_name: 'John Doe',
  contact_number: '+251911000001',
  company_name: 'ABC Company',
  priority: 'medium',
  notes: 'Regular maintenance check'
}

const vehicles = [
  {
    plate_number: 'AA-12345',
    location: 'Main Office',
    maintenance_types: ['oil_change', 'tire_check']
  }
]

const { error } = await createMaintenanceRequest(requestData, vehicles)
```

#### Update Request Status
```typescript
import { updateMaintenanceRequestStatus } from '../lib/supabase'

const { error } = await updateMaintenanceRequestStatus(requestId, 'in_progress')
```

### Admin Operations

#### Get Admin Profile
```typescript
import { getAdminProfile } from '../lib/auth'

const { data, error } = await getAdminProfile(userId)
```

#### Check Admin Status
```typescript
import { isAdmin } from '../lib/auth'

const hasAdminAccess = isAdmin(user)
```

## Row Level Security (RLS)

### Open Access Policies

The system uses permissive RLS policies for supervisor and technician access:

```sql
-- Maintenance Requests: Full access for all users
CREATE POLICY "Open access for maintenance requests"
  ON maintenance_requests
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Maintenance Vehicles: Full access for all users  
CREATE POLICY "Open access for maintenance vehicles"
  ON maintenance_vehicles
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
```

### Admin-Only Policies

```sql
-- Admin Users: Restricted to authenticated admin users
CREATE POLICY "Admin users can manage their own profile"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

## Error Handling

All API operations return a consistent error format:

```typescript
interface ApiResponse<T> {
  data: T | null
  error: Error | null
}
```

### Common Error Types
- **Authentication Error**: Invalid admin credentials
- **Validation Error**: Missing required fields
- **Database Error**: Constraint violations or connection issues

## Rate Limiting

No rate limiting is currently implemented. Consider adding rate limiting for production deployments.

## Data Validation

### Client-Side Validation
- Phone number format validation
- Required field validation
- Email format validation (admin only)

### Database Constraints
- Foreign key constraints
- Check constraints for status/priority values
- NOT NULL constraints for required fields

## Best Practices

1. **Always handle errors** from API operations
2. **Validate input data** before sending to API
3. **Use TypeScript interfaces** for type safety
4. **Implement loading states** for better UX
5. **Cache data appropriately** to reduce API calls

## Migration Notes

This system has been simplified from a complex user management system:

- **Removed**: User profiles, role-based access control, user assignments
- **Simplified**: Authentication to admin-only
- **Maintained**: Core maintenance request functionality
- **Added**: Open access policies for supervisor/technician dashboards
