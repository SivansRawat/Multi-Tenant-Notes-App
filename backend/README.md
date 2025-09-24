# Multi-Tenant SaaS Notes Backend

A scalable multi-tenant Notes API built with Node.js, Express, and PostgreSQL.

## Features

- **Multi-tenancy**: Shared database with tenant isolation
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (Admin/Member)
- **Subscription Management**: Free and Pro plans with feature gating
- **Notes CRUD**: Complete notes management
- **Security**: Tenant data isolation and CORS configuration

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon for cloud)
- npm or yarn

## Setup

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Database Setup**
   - The application automatically creates tables and seeds test data
   - Ensure your PostgreSQL database is accessible

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Notes
- `GET /api/notes` - List all notes for tenant
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tenants
- `GET /api/tenants/:slug` - Get tenant info
- `POST /api/tenants/:slug/upgrade` - Upgrade to Pro plan

### Health Check
- `GET /health` - API health status

## Test Accounts

| Email | Password | Role | Tenant |
|-------|----------|------|--------|
| admin@acme.test | password | Admin | Acme |
| user@acme.test | password | Member | Acme |
| admin@globex.test | password | Admin | Globex |
| user@globex.test | password | Member | Globex |

## Deployment

### Vercel Deployment

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Set Environment Variables:**
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. **Deploy**

The `vercel.json` configuration handles routing and CORS automatically.

## Architecture

- **Multi-Tenancy Model**: Shared database, shared schema with tenant_id column
- **Database**: PostgreSQL with tenant isolation
- **Authentication**: JWT tokens with 24h expiration
- **Authorization**: Role-based middleware
- **Subscription**: Free plan (3 notes max), Pro plan (unlimited)

## Security Features

- JWT authentication
- Tenant data isolation
- Role-based access control
- CORS configuration
- Input validation
- SQL injection protection (parameterized queries)
