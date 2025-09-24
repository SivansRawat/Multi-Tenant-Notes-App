# Multi-Tenant SaaS Notes Application

A complete multi-tenant SaaS Notes application built with Node.js, Express.js, PostgreSQL, and React. This application demonstrates modern SaaS architecture patterns including multi-tenancy, JWT authentication, role-based access control, and subscription management.

## 🚀 Features

### Core Features
- **Multi-tenancy**: Shared database with tenant isolation using tenant_id
- **Authentication**: JWT-based authentication with secure token management
- **Role-Based Access Control**: Admin and Member roles with different permissions
- **Subscription Management**: Free (3 notes max) and Pro (unlimited) plans
- **Notes CRUD**: Complete notes management with create, read, update, delete
- **Security**: Tenant data isolation, CORS configuration, input validation

### Technical Features
- **Backend**: Node.js + Express.js + PostgreSQL
- **Frontend**: React.js with modern hooks and context
- **Database**: PostgreSQL with optimized schema and indexing
- **Deployment**: Ready for Vercel deployment
- **API**: RESTful API with proper error handling
- **UI/UX**: Responsive design with modern CSS

## 🏗️ Architecture

### Multi-Tenancy Model
This application uses the **Shared Database, Shared Schema** approach:
- All tenants share the same database and tables
- Each row includes a `tenant_id` to identify data ownership
- Application-level tenant isolation ensures data security
- Cost-effective and simple to maintain

### Database Schema
```sql
-- Tenants table
CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon for cloud)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **CORS**: Configured for cross-origin requests

### Frontend
- **Framework**: React.js 18
- **Routing**: React Router v6
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios with interceptors
- **Styling**: Pure CSS with modern techniques

### Deployment
- **Platform**: Vercel (both frontend and backend)
- **Database**: Neon PostgreSQL (recommended)
- **Environment**: Production-ready configurations

## 📦 Project Structure

```
multi-tenant-notes-app/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── vercel.json
│   ├── .env.example
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── tenant.js
│   │   └── rbac.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notes.js
│   │   └── tenants.js
│   └── README.md
├── frontend/
│   ├── package.json
│   ├── vercel.json
│   ├── .env.example
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── components/
│       │   ├── Login.js
│       │   ├── Dashboard.js
│       │   ├── NotesList.js
│       │   ├── NoteForm.js
│       │   └── UpgradeModal.js
│       ├── context/
│       │   └── AuthContext.js
│       ├── services/
│       │   └── api.js
│       └── utils/
│           └── auth.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- Git

### Local Development

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd multi-tenant-notes-app
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm start
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 🔑 Test Accounts

The application comes with pre-configured test accounts:

| Email | Password | Role | Tenant | Description |
|-------|----------|------|--------|-------------|
| admin@acme.test | password | Admin | Acme | Can upgrade subscriptions |
| user@acme.test | password | Member | Acme | Can manage notes only |
| admin@globex.test | password | Admin | Globex | Can upgrade subscriptions |
| user@globex.test | password | Member | Globex | Can manage notes only |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Notes Management
- `GET /api/notes` - List all notes for tenant
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tenant Management
- `GET /api/tenants/:slug` - Get tenant information
- `POST /api/tenants/:slug/upgrade` - Upgrade to Pro plan (Admin only)

### System
- `GET /health` - API health check

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with secure token storage
- Role-based access control (Admin/Member)
- Password hashing with bcryptjs
- Token expiration and refresh handling

### Multi-Tenant Security
- Strict tenant data isolation
- Application-level access control
- Parameterized SQL queries to prevent injection
- Request-level tenant validation

### CORS & API Security
- Configurable CORS for production deployment
- Request rate limiting (configurable)
- Input validation and sanitization
- Secure headers configuration

## 📈 Subscription Plans

### Free Plan
- Up to 3 notes per tenant
- Basic note creation and editing
- Multi-user access within tenant
- Standard support

### Pro Plan
- Unlimited notes
- Advanced features (ready for extension)
- Priority support
- Enhanced collaboration tools

### Plan Management
- Admins can upgrade tenant subscriptions
- Instant plan limit updates
- Usage tracking and enforcement
- Upgrade prompts when limits reached

## 🚀 Deployment

### Vercel Deployment (Recommended)

#### Backend Deployment
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secure random string
   - `NODE_ENV`: production
4. Deploy with automatic CORS configuration

#### Frontend Deployment
1. Connect frontend folder to Vercel
2. Configure environment variables:
   - `REACT_APP_API_URL`: Backend API URL
3. Deploy with automatic React build

#### Database Setup (Neon)
1. Create account at neon.tech
2. Create new PostgreSQL database
3. Copy connection string to backend environment
4. Application will auto-create tables and seed data

### Alternative Deployment Options
- **Railway**: Backend deployment
- **Netlify**: Frontend deployment
- **Heroku**: Full-stack deployment
- **AWS/GCP**: Cloud deployment

## 🧪 Testing

### Manual Testing
1. **Authentication Flow**
   - Test login with all provided accounts
   - Verify JWT token handling
   - Test logout functionality

2. **Multi-Tenancy**
   - Login as different tenants
   - Verify data isolation
   - Test tenant switching

3. **Notes Management**
   - Create, read, update, delete notes
   - Test plan limits (free plan)
   - Verify permission controls

4. **Subscription Management**
   - Test upgrade functionality (admin only)
   - Verify plan limit enforcement
   - Test post-upgrade behavior

### API Testing
```bash
# Health check
curl https://your-backend.vercel.app/health

# Login
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.test","password":"password"}'

# Create note (with token)
curl -X POST https://your-backend.vercel.app/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Note","content":"Test content"}'
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secure-secret-key
NODE_ENV=production
PORT=5000
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-backend.vercel.app
```

### Customization Options
- **Tenant Plans**: Modify plan limits in notes routes
- **UI Theme**: Update CSS custom properties
- **Feature Flags**: Add environment-based feature toggles
- **Email Integration**: Add email notifications
- **Analytics**: Integrate usage tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

1. **CORS Errors**: Ensure frontend API URL matches backend deployment
2. **Database Connection**: Verify DATABASE_URL format and credentials
3. **JWT Errors**: Check JWT_SECRET consistency between deployments
4. **Plan Limits**: Verify tenant plan status and note counts

### Getting Help
- Check the [Issues](issues) section
- Review deployment logs in Vercel dashboard
- Verify environment variable configuration
- Test API endpoints independently

## 🚀 Future Enhancements

### Planned Features
- **Email Notifications**: User invitations and updates
- **Advanced Search**: Full-text search with filters
- **File Attachments**: Note attachments and media
- **Team Collaboration**: Real-time editing and comments
- **Analytics Dashboard**: Usage metrics and insights
- **API Rate Limiting**: Advanced throttling
- **Audit Logs**: Activity tracking and compliance

### Scaling Considerations
- **Database Sharding**: For large-scale deployments
- **Caching Layer**: Redis for session management
- **CDN Integration**: Static asset optimization
- **Microservices**: Service decomposition
- **Monitoring**: Application performance monitoring

---

**Built with ❤️ for learning and production use**

This application demonstrates modern SaaS architecture patterns and can serve as a foundation for building scalable multi-tenant applications.
