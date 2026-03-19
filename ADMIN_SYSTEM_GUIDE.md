# 🎛️ StoryType Admin System

A comprehensive admin module for the StoryType website that provides dynamic management of all components with role-based access control.

## 🚀 Features

### ✅ Completed Components

1. **🔐 Admin Authentication System**

   - Role-based access control (Super Admin, Admin, Moderator, Content Manager)
   - JWT-based authentication with HTTP-only cookies
   - Permission-based access to different admin features
   - Secure password hashing and session management

2. **📊 Admin Dashboard**

   - Overview statistics and key metrics
   - Recent activity monitoring
   - Performance insights and trends
   - Quick action buttons for common tasks

3. **👥 User Management**

   - View, edit, and delete user accounts
   - User statistics and performance tracking
   - Search and filter capabilities
   - Bulk user operations

4. **🏆 Tournament Management**

   - Create, edit, and monitor tournaments
   - Tournament configuration and rules
   - Participant management
   - Tournament statistics and analytics

5. **🎯 Training Management**

   - Manage training modules and lessons
   - Content organization and categorization
   - Difficulty and skill-based filtering
   - Training progress tracking

6. **📈 Analytics Dashboard**

   - Comprehensive performance analytics
   - User activity patterns
   - Content usage statistics
   - System health monitoring

7. **📝 Content Management**

   - Dynamic story and text management
   - Content categorization and tagging
   - Usage statistics and performance metrics
   - Bulk content operations

8. **⚙️ System Settings**
   - General application settings
   - Game configuration options
   - Security and authentication settings
   - Administrator management

## 🏗️ Architecture

### Admin Roles & Permissions

| Role                | Permissions                                              |
| ------------------- | -------------------------------------------------------- |
| **Super Admin**     | All permissions (full access)                            |
| **Admin**           | User Management, Tournament Management, Analytics Access |
| **Moderator**       | User Management, Content Management                      |
| **Content Manager** | Content Management, Training Management                  |

### File Structure

```
src/
├── components/admin/
│   └── admin-layout.js          # Main admin layout component
├── lib/
│   └── adminAuth.js             # Admin authentication utilities
├── models/
│   ├── Admin.js                 # Admin user model
│   └── Content.js               # Content management model
├── pages/
│   ├── admin/
│   │   ├── login.js             # Admin login page
│   │   ├── index.js             # Admin dashboard
│   │   ├── users.js             # User management
│   │   ├── tournaments.js       # Tournament management
│   │   ├── training.js          # Training management
│   │   ├── analytics.js         # Analytics dashboard
│   │   ├── content.js           # Content management
│   │   └── settings.js          # System settings
│   └── api/admin/
│       ├── auth/
│       │   ├── login.js         # Admin login endpoint
│       │   ├── logout.js        # Admin logout endpoint
│       │   └── me.js            # Get current admin
│       ├── dashboard/
│       │   ├── stats.js         # Dashboard statistics
│       │   └── activity.js      # Recent activity
│       ├── users/
│       │   ├── index.js         # List users
│       │   └── [id].js          # User operations
│       ├── tournaments/
│       │   ├── index.js         # Tournament CRUD
│       │   └── [id].js          # Tournament operations
│       ├── training/
│       │   ├── modules.js       # Training modules
│       │   ├── lessons.js       # Training lessons
│       │   └── [id].js          # Module/lesson operations
│       ├── analytics.js         # Analytics data
│       ├── content/
│       │   ├── index.js         # Content CRUD
│       │   └── [id].js          # Content operations
│       ├── settings/
│       │   ├── index.js         # System settings
│       │   ├── admins.js        # Admin management
│       │   └── [id].js          # Admin operations
│       └── seed.js              # Initial admin creation
```

## 🚀 Getting Started

### 1. Initial Setup

First, create the initial super administrator:

```bash
# Make a POST request to seed the admin
curl -X POST http://localhost:3000/api/admin/seed
```

This creates a super admin with:

- **Username**: `admin`
- **Email**: `admin@storytype.com`
- **Password**: `admin123`

### 2. Access Admin Panel

Navigate to `/admin/login` and log in with the super admin credentials.

### 3. Configure Permissions

After logging in, go to **Settings > Administrators** to:

- Create additional admin accounts
- Assign specific permissions
- Manage admin roles

## 🔧 API Endpoints

### Authentication

- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/auth/me` - Get current admin

### Dashboard

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/activity` - Recent activity

### User Management

- `GET /api/admin/users` - List users
- `GET /api/admin/users/[id]` - Get user details
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Tournament Management

- `GET /api/admin/tournaments` - List tournaments
- `POST /api/admin/tournaments` - Create tournament
- `PUT /api/admin/tournaments/[id]` - Update tournament
- `DELETE /api/admin/tournaments/[id]` - Delete tournament

### Training Management

- `GET /api/admin/training/modules` - List training modules
- `POST /api/admin/training/modules` - Create module
- `GET /api/admin/training/lessons` - List lessons
- `POST /api/admin/training/lessons` - Create lesson

### Content Management

- `GET /api/admin/content` - List content
- `POST /api/admin/content` - Create content
- `PUT /api/admin/content/[id]` - Update content
- `DELETE /api/admin/content/[id]` - Delete content

### Analytics

- `GET /api/admin/analytics` - Get analytics data

### Settings

- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update settings
- `GET /api/admin/settings/admins` - List administrators
- `POST /api/admin/settings/admins` - Create administrator

## 🎨 UI Components

### Admin Layout

- Responsive sidebar navigation
- Role-based menu items
- User profile dropdown
- Mobile-friendly design

### Data Tables

- Sortable and filterable tables
- Pagination support
- Bulk operations
- Real-time updates

### Modals & Forms

- Dynamic form generation
- Validation and error handling
- File upload support
- Rich text editing

### Charts & Analytics

- Performance metrics visualization
- User activity trends
- Content usage statistics
- System health monitoring

## 🔒 Security Features

### Authentication

- JWT token-based authentication
- HTTP-only cookies for security
- Session timeout management
- Password strength requirements

### Authorization

- Role-based access control
- Permission-based feature access
- Route protection middleware
- API endpoint security

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

## 📊 Analytics & Monitoring

### User Analytics

- User registration trends
- Activity patterns
- Performance metrics
- Engagement statistics

### Content Analytics

- Content usage statistics
- Popular content tracking
- Performance metrics
- User preferences

### System Monitoring

- Database performance
- API response times
- Error tracking
- System health metrics

## 🚀 Deployment

### Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Production Considerations

- Enable HTTPS
- Configure proper CORS settings
- Set up monitoring and logging
- Implement backup strategies
- Configure rate limiting

## 🔄 Future Enhancements

### Planned Features

- Advanced reporting system
- Bulk import/export functionality
- Automated backup system
- Email notification system
- Advanced user analytics
- Content recommendation engine
- Multi-language support
- API documentation interface

### Integration Possibilities

- Third-party analytics services
- Email marketing platforms
- Customer support systems
- Payment processing
- Social media integration

## 📝 Usage Examples

### Creating a New Admin

```javascript
// POST /api/admin/settings/admins
{
  "username": "moderator1",
  "email": "moderator@example.com",
  "password": "securePassword123",
  "role": "moderator",
  "permissions": {
    "userManagement": true,
    "contentManagement": true
  }
}
```

### Creating Tournament Content

```javascript
// POST /api/admin/tournaments
{
  "name": "Weekly Speed Challenge",
  "description": "Test your typing speed against other users",
  "type": "weekly",
  "theme": "speed",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-07T23:59:59Z",
  "registrationDeadline": "2024-01-06T23:59:59Z",
  "rules": {
    "timeLimit": 60,
    "maxParticipants": 100,
    "allowBackspace": true
  }
}
```

### Managing Content

```javascript
// POST /api/admin/content
{
  "title": "Fantasy Adventure Story",
  "description": "An epic fantasy tale for typing practice",
  "content": "Once upon a time in a magical kingdom...",
  "type": "story",
  "genre": "fantasy",
  "difficulty": "intermediate",
  "author": "StoryMaster",
  "tags": ["fantasy", "adventure", "magic"]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This admin system is part of the StoryType project and follows the same licensing terms.

---

**Note**: This admin system provides comprehensive management capabilities for the StoryType application. Always ensure proper security measures are in place when deploying to production environments.
