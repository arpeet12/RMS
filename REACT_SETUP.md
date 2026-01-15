# React Frontend Setup Guide

## Complete React + Tailwind CSS Frontend for Manpower System

I've created a complete React frontend with Tailwind CSS for your Manpower Management System!

## 📁 Project Structure

```
react-frontend/
├── src/
│   ├── components/          # Reusable components (Navbar, PrivateRoute)
│   ├── contexts/            # React contexts (AuthContext)
│   ├── pages/               # All page components
│   │   ├── candidate/       # Candidate pages
│   │   └── admin/           # Admin pages
│   ├── services/            # API service layer
│   ├── App.js              # Main app component with routing
│   └── index.js            # Entry point
├── public/
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd react-frontend
npm install
```

### 2. Configure API URL

Create a `.env` file in the `react-frontend` directory:

```
REACT_APP_API_URL=http://localhost:8080
```

### 3. Start Development Server

```bash
npm start
```

The React app will run on `http://localhost:3000`

### 4. Start Backend

Make sure your Spring Boot backend is running on `http://localhost:8080`

## ✨ Features Implemented

### Backend (REST API)
- ✅ `AuthApiController` - Authentication endpoints
- ✅ `CandidateApiController` - Candidate profile & dashboard
- ✅ `AdminApiController` - Admin candidate management & document uploads
- ✅ `JobApiController` - Job listings
- ✅ CORS configuration for React frontend
- ✅ Security configuration updated for API endpoints

### Frontend (React + Tailwind)
- ✅ **HomePage** - Job listings with beautiful cards
- ✅ **Login/Register** - Modern authentication forms
- ✅ **Candidate Dashboard** - Progress tracker with icons
- ✅ **Candidate Profile** - Profile management form
- ✅ **Candidate Documents** - View/download documents
- ✅ **Admin Candidates List** - Table with status badges
- ✅ **Admin Candidate Details** - Document upload & status management
- ✅ **Admin Dashboard** - Quick access cards
- ✅ **Navbar** - Responsive navigation with role-based links
- ✅ **Private Routes** - Protected routes with role checking
- ✅ **Auth Context** - Global authentication state

## 🎨 UI Features

- **Tailwind CSS** - Modern, responsive design
- **React Icons** - Beautiful icons throughout
- **Color-coded Status Badges** - Green (Approved), Red (Rejected), Yellow (Pending)
- **Loading States** - Spinner animations
- **Error/Success Messages** - User-friendly notifications
- **Responsive Design** - Works on mobile, tablet, and desktop

## 📡 API Endpoints

### Authentication
- `GET /api/auth/current-user` - Get current user
- `POST /api/auth/register` - Register new user

### Candidate
- `GET /api/candidate/profile` - Get candidate profile
- `PUT /api/candidate/profile` - Update profile
- `GET /api/candidate/dashboard` - Get dashboard data
- `GET /api/candidate/documents` - Get documents

### Admin
- `GET /api/admin/candidates` - Get all candidates
- `GET /api/admin/candidates/{id}` - Get candidate details
- `POST /api/admin/candidates/{id}/status` - Update status
- `POST /api/admin/candidates/{id}/documents/{type}` - Upload document

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/{id}` - Get job by ID

## 🔐 Authentication Flow

1. User logs in via `/login` (Spring Security form login)
2. React checks authentication via `/api/auth/current-user`
3. Protected routes check user role
4. API calls include credentials via `withCredentials: true`

## 🎯 Next Steps

1. **Install dependencies**: `cd react-frontend && npm install`
2. **Start backend**: Run your Spring Boot application
3. **Start frontend**: `npm start` in react-frontend directory
4. **Test the application**: Navigate to `http://localhost:3000`

## 📝 Notes

- The React app communicates with Spring Boot via REST API
- Authentication uses Spring Security session-based auth
- All API calls include credentials for authenticated requests
- CORS is configured to allow React frontend
- File uploads use FormData for multipart/form-data

## 🐛 Troubleshooting

**CORS Errors**: Make sure `CorsConfig.java` is loaded and backend allows React origin

**Authentication Issues**: Check that Spring Security is configured correctly and session is maintained

**API Connection**: Verify `REACT_APP_API_URL` in `.env` matches your backend URL

Enjoy your modern React frontend! 🎉

