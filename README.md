# Learning Hub - LMS Project

A full-stack Learning Management System (LMS) where teachers can create and manage courses, and students can enroll and learn.

## 🎯 What It Does

- **For Teachers**: Create courses, add lessons, post assignments, and track student progress
- **For Students**: Browse courses, enroll, view lessons, and submit assignments
- **For Admins**: Manage users and oversee the platform

## 🛠️ Tech Stack

**Backend**: Django + Django REST Framework (Python)

- Database: SQLite
- API Documentation: `API_DOCUMENTATION.md`

**Frontend**: React + Vite (JavaScript)

- Modern, fast UI with component-based architecture

## 📂 Project Structure

```
LMS/
├── lms_backend/          # Django REST API
│   ├── lms/              # Settings and main URL router
│   ├── lmsapp/           # App models, views, serializers, permissions
│   ├── media/            # Uploaded avatars and course thumbnails (git-ignored)
│   └── manage.py         # Django management
└── lms_frontend/         # React application
    ├── src/
    │   ├── components/   # Semantically organized React components
    │   │   ├── layout/   # Common shell elements (Navbar, Sidebar, Footer)
    │   │   ├── auth/     # User login, registration, and profile views
    │   │   ├── dashboard/# Student, Teacher, and Admin control consoles
    │   │   ├── courses/  # Catalog list, details page, certificate visualizer
    │   │   ├── lessons/  # Player views, completed buttons, and lesson builder
    │   │   └── assignments/# Submissions, homework list, gradebook manager
    │   ├── services/     # Axios client and endpoints integration logic
    │   └── contexts/     # AuthProvider session state context
```

## 🚀 Quick Start

### Backend Setup

```bash
cd lms_backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd lms_frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📋 Features

✅ User authentication (Register/Login)
✅ Role-based access (Student/Teacher/Admin)
✅ Course management
✅ Lessons and assignments
✅ Enrollment system
✅ User profiles

## 📚 Learn More

See `lms_backend/API_DOCUMENTATION.md` for detailed API endpoints.
