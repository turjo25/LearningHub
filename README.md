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
│   ├── accounts/         # User authentication & profiles
│   ├── lms_core/         # Core LMS functionality
│   ├── lmsapp/           # Courses, lessons, assignments
│   └── manage.py         # Django management
└── lms_frontend/         # React application
    ├── components/       # UI components
    ├── services/         # API calls
    └── contexts/         # State management
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
