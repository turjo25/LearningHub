# Learning Hub — API Documentation

Base URL: `http://localhost:8000/api`

All endpoints (except `/register/` and `/login/`) require a JWT access token:

```
Authorization: Bearer <access_token>
```

---

## Authentication

### Register
`POST /register/`

Creates a new user account and automatically creates the matching `Student` or `Teacher` record.

**Request body**
```json
{
  "username": "johndoe",
  "password": "secret123",
  "phone": "+1234567890",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student"   // "student" | "teacher" | "admin"
}
```

**Response `201`**
```json
{ "id": 1, "username": "johndoe" }
```

---

### Login
`POST /login/`

Authenticates with phone + password and returns JWT tokens.

**Request body**
```json
{ "phone": "+1234567890", "password": "secret123" }
```

**Response `200`**
```json
{
  "message": "Login successful",
  "user_id": 1,
  "username": "johndoe",
  "tokens": {
    "access": "<jwt_access_token>",
    "refresh": "<jwt_refresh_token>"
  }
}
```

---

### Get Current User
`GET /protected/`  🔒

Returns the authenticated user's profile including role.

**Response `200`**
```json
{
  "message": "successfully fetched this user",
  "user": {
    "user_id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student"
  }
}
```

---

### Update Profile
`PATCH /users/<id>/`  🔒

Updates `first_name`, `last_name`, and/or `email` for the authenticated user. Users can only update their own profile.

**Request body** (all fields optional)
```json
{
  "first_name": "Johnny",
  "last_name": "Doe",
  "email": "johnny@example.com"
}
```

**Response `200`** — returns updated user object (same shape as `/protected/`).

---

### Refresh Token
`POST /token/refresh/`

Exchanges a refresh token for a new access token.

**Request body**
```json
{ "refresh": "<jwt_refresh_token>" }
```

**Response `200`**
```json
{ "access": "<new_jwt_access_token>" }
```

---

## Teachers

### List / Create Teachers
`GET /teacher/`  🔒  
`POST /teacher/`  🔒

**Query params (GET)**
- `?user=<user_id>` — filter by Django user ID

**Response item shape**
```json
{
  "id": 1,
  "user": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Mathematics",
  "is_active": true
}
```

### Get / Update / Delete Teacher
`GET /teacher/<id>/`  🔒  
`PUT /teacher/<id>/`  🔒  
`PATCH /teacher/<id>/`  🔒  
`DELETE /teacher/<id>/`  🔒

---

## Students

### List / Create Students
`GET /student/`  🔒  
`POST /student/`  🔒

**Query params (GET)**
- `?user=<user_id>` — filter by Django user ID

**Response item shape**
```json
{
  "id": 1,
  "user": 3,
  "name": "Alice Brown",
  "email": "alice@example.com",
  "enrollment_date": "2025-01-15",
  "is_active": true,
  "roll_number": null
}
```

### Get / Update / Delete Student
`GET /student/<id>/`  🔒  
`PUT /student/<id>/`  🔒  
`PATCH /student/<id>/`  🔒  
`DELETE /student/<id>/`  🔒

---

## Categories

### List / Create Categories
`GET /category/`  🔒  
`POST /category/`  🔒 *(teacher or admin only)*

**Response item shape**
```json
{
  "id": 1,
  "name": "Programming",
  "description": "Software development courses",
  "icon": "💻",
  "course_count": 5
}
```

### Get / Update / Delete Category
`GET /category/<id>/`  🔒  
`PUT /category/<id>/`  🔒 *(teacher or admin only)*  
`DELETE /category/<id>/`  🔒 *(teacher or admin only)*

---

## Courses

### List / Create Courses
`GET /course/`  🔒  
`POST /course/`  🔒 *(teacher only)*

**Query params (GET)**
- `?teacher=<teacher_id>`
- `?category=<category_id>`
- `?level=beginner|intermediate|advanced`
- `?search=<text>` — searches title, description, teacher name

**Request body (POST)**
```json
{
  "title": "Python for Beginners",
  "description": "Learn Python from scratch.",
  "teacher": 1,
  "category": 2,
  "level": "beginner",
  "thumbnail": "https://example.com/thumb.jpg"
}
```

**Response item shape**
```json
{
  "id": 1,
  "title": "Python for Beginners",
  "description": "Learn Python from scratch.",
  "teacher": 1,
  "teacher_name": "Jane Smith",
  "category": 2,
  "category_name": "Programming",
  "level": "beginner",
  "thumbnail": "https://example.com/thumb.jpg",
  "average_rating": 4.5,
  "review_count": 12,
  "lesson_count": 8
}
```

### Get / Update / Delete Course
`GET /course/<id>/`  🔒  
`PUT /course/<id>/`  🔒 *(teacher only)*  
`PATCH /course/<id>/`  🔒 *(teacher only)*  
`DELETE /course/<id>/`  🔒 *(teacher only)*

---

## Enrollments

### List / Create Enrollments
`GET /enrollment/`  🔒  
`POST /enrollment/`  🔒

**Query params (GET)**
- `?student=<student_id>`
- `?course=<course_id>`

**Request body (POST)**
```json
{ "student": 1, "course": 3 }
```

**Response item shape**
```json
{
  "id": 1,
  "student": 1,
  "course": 3,
  "enrollment_date": "2025-05-13"
}
```

### Get / Delete Enrollment
`GET /enrollment/<id>/`  🔒  
`DELETE /enrollment/<id>/`  🔒

---

## Lessons

### List / Create Lessons
`GET /lesson/`  🔒  
`POST /lesson/`  🔒 *(course owner teacher only)*

**Query params (GET)**
- `?course=<course_id>`

**Request body (POST)**
```json
{
  "title": "Variables and Data Types",
  "description": "Learn about Python variables.",
  "course": 1,
  "video_url": "https://youtube.com/watch?v=abc123",
  "order": 0
}
```

**Response item shape**
```json
{
  "id": 1,
  "title": "Variables and Data Types",
  "description": "Learn about Python variables.",
  "course": 1,
  "video_url": "https://youtube.com/watch?v=abc123",
  "attachment": null,
  "order": 0
}
```

### Get / Update / Delete Lesson
`GET /lesson/<id>/`  🔒  
`PUT /lesson/<id>/`  🔒 *(course owner teacher only)*  
`PATCH /lesson/<id>/`  🔒 *(course owner teacher only)*  
`DELETE /lesson/<id>/`  🔒 *(course owner teacher only)*

---

## Assignments

### List / Create Assignments
`GET /assignment/`  🔒  
`POST /assignment/`  🔒 *(course owner teacher only)*

**Query params (GET)**
- `?course=<course_id>`
- `?lesson=<lesson_id>`

**Request body (POST)**
```json
{
  "title": "Build a Calculator",
  "description": "Create a CLI calculator in Python.",
  "lesson": 1,
  "course": 1,
  "due_date": "2025-06-01T23:59:00Z"
}
```

### Get / Update / Delete Assignment
`GET /assignment/<id>/`  🔒  
`PUT /assignment/<id>/`  🔒 *(course owner teacher only)*  
`DELETE /assignment/<id>/`  🔒 *(course owner teacher only)*

---

## Submissions

### List / Create Submissions
`GET /submission/`  🔒  
`POST /submission/`  🔒

**Query params (GET)**
- `?student=<student_id>`
- `?assignment=<assignment_id>`

**Request body (POST)**
```json
{
  "assignment": 1,
  "student": 1,
  "content": "Here is my solution: ..."
}
```

**Response item shape**
```json
{
  "id": 1,
  "assignment": 1,
  "student": 1,
  "submitted_at": "2025-05-13T10:30:00Z",
  "content": "Here is my solution: ..."
}
```

### Get / Update / Delete Submission
`GET /submission/<id>/`  🔒  
`PUT /submission/<id>/`  🔒  
`DELETE /submission/<id>/`  🔒

---

## Results (Grades)

> [!IMPORTANT]
> **Grading Business Logic**: Any assignment score **below 40** is considered insufficient for course completion. The frontend UI will automatically flag the assignment, notify the student, block course completion/certificate acquisition, and prompt the student to submit a revised answer.

### List / Create Results
`GET /results/`  🔒  
`POST /results/`  🔒 *(teacher only)*

**Query params (GET)**
- `?submission=<submission_id>` — always filter to avoid data leaks

**Request body (POST)**
```json
{
  "submission": 1,
  "score": 87.5,
  "feedback": "Great work! Consider edge cases."
}
```

**Response item shape**
```json
{
  "id": 1,
  "submission": 1,
  "score": 87.5,
  "feedback": "Great work! Consider edge cases."
}
```

### Get / Update / Delete Result
`GET /results/<id>/`  🔒  
`PUT /results/<id>/`  🔒 *(teacher only)*  
`DELETE /results/<id>/`  🔒 *(teacher only)*

---

## Lesson Progress

### List / Create Progress Records
`GET /lesson-progress/`  🔒  
`POST /lesson-progress/`  🔒

**Query params (GET)**
- `?student=<student_id>`
- `?lesson=<lesson_id>`
- `?course=<course_id>`

**Request body (POST)**
```json
{ "student": 1, "lesson": 3, "completed": true }
```

**Response item shape**
```json
{
  "id": 1,
  "student": 1,
  "lesson": 3,
  "lesson_title": "Variables and Data Types",
  "course_id": 1,
  "completed": true,
  "completed_at": "2025-05-13T11:00:00Z"
}
```

### Get / Update Progress Record
`GET /lesson-progress/<id>/`  🔒  
`PATCH /lesson-progress/<id>/`  🔒

---

## Course Reviews

### List / Create Reviews
`GET /review/`  🔒  
`POST /review/`  🔒

**Query params (GET)**
- `?course=<course_id>`
- `?student=<student_id>`

**Request body (POST)**
```json
{
  "student": 1,
  "course": 1,
  "rating": 5,
  "review": "Excellent course, very well structured!"
}
```

**Response item shape**
```json
{
  "id": 1,
  "student": 1,
  "course": 1,
  "rating": 5,
  "review": "Excellent course, very well structured!",
  "student_name": "Alice Brown",
  "created_at": "2025-05-13T12:00:00Z"
}
```

### Get / Update / Delete Review
`GET /review/<id>/`  🔒  
`PATCH /review/<id>/`  🔒  
`DELETE /review/<id>/`  🔒

---

## Error Responses

All endpoints return standard DRF error shapes:

```json
{ "detail": "Authentication credentials were not provided." }
```

Common HTTP status codes:
- `400` — Validation error (check `response.data` for field-level errors)
- `401` — Missing or expired token
- `403` — Authenticated but not authorized (wrong role or not the owner)
- `404` — Resource not found
- `409` / `400` — Duplicate (e.g. enrolling twice in the same course)

---

## Role Summary

| Role    | Can do |
|---------|--------|
| student | Read courses/lessons, enroll, submit assignments, leave reviews, track progress |
| teacher | All student permissions + create/edit/delete own courses, lessons, assignments, grade submissions |
| admin   | All permissions + manage categories, create enrollments via admin panel |
