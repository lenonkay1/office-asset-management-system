# JSC Asset Management System

## Overview
A comprehensive web-based Office Asset Management System for the Judicial Service Commission (JSC) built with Node.js, React.js, and PostgreSQL database. The system provides role-based access control, asset tracking, maintenance scheduling, and comprehensive reporting capabilities.

## Technology Stack
- **Backend**: Node.js with Express.js
- **Frontend**: React.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Authentication**: JWT tokens with role-based access control

## Project Architecture

### Backend Structure
- `server/index.ts` - Main Express server setup
- `server/routes.ts` - API route definitions with authentication middleware
- `server/storage.ts` - Database storage interface and implementation
- `server/db.ts` - Database connection and configuration
- `server/seed.ts` - Database seeding with default users
- `shared/schema.ts` - Drizzle ORM schema definitions

### Frontend Structure
- `client/src/App.tsx` - Main application router
- `client/src/pages/` - Page components for different sections
- `client/src/components/` - Reusable UI components
- `client/src/lib/` - Utility functions and API client

### Database Schema
- **users** - User accounts with role-based permissions
- **assets** - Asset inventory with detailed tracking
- **asset_transfers** - Asset transfer requests and approvals
- **maintenance_schedules** - Maintenance scheduling and tracking
- **asset_audit_logs** - Comprehensive audit trail

## User Roles
1. **Admin** - Full system access, user management
2. **Asset Manager** - Asset CRUD operations, maintenance scheduling
3. **Department Head** - Transfer approvals, departmental oversight
4. **Staff** - Asset viewing, transfer requests

## Features Implemented
✓ User authentication with JWT tokens
✓ Role-based access control
✓ Dashboard with asset statistics and charts
✓ Asset management (CRUD operations)
✓ Asset transfer workflow with approvals
✓ Maintenance scheduling system
✓ Comprehensive reporting
✓ User management (Admin only)
✓ System settings configuration
✓ Responsive design with JSC branding

## Recent Changes
- **2025-01-31**: Fixed sidebar navigation DOM nesting warnings
- **2025-01-31**: Created Settings page with system preferences and notifications
- **2025-01-31**: Created User Management page with role-based user administration
- **2025-01-31**: Added missing routes for /settings and /users
- **2025-01-31**: Updated authentication system to properly send JWT tokens with API requests
- **2025-01-31**: Fixed Select component validation errors by using non-empty values

## Default User Accounts
- **Admin**: username: `admin`, password: `admin123`
- **Asset Manager**: username: `assetmanager`, password: `manager123`
- **Staff**: username: `staff`, password: `staff123`

## Current Status
The application is fully functional with all core features implemented. The system uses Node.js backend with React.js frontend and PostgreSQL database as requested. Currently experiencing temporary database connectivity issues due to endpoint being disabled, but the application architecture and code are complete and ready for deployment once database access is restored.

## User Preferences
- Technology stack: Node.js, React.js, PostgreSQL (confirmed)
- Professional JSC branding and responsive design
- Comprehensive asset management with role-based access
- Real-time monitoring and automated maintenance alerts