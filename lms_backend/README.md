# LMS (Learning Management System)

A Django-based API for managing learning resources, users, and courses.

---

## 🚀 Getting Started

### 1. Clone the Repository
```
git clone <REPO_URL>
cd lms
```
Replace `<REPO_URL>` with your actual repository URL.

### 2. Set Up a Virtual Environment (Recommended)
```
python -m venv venv
.\venv\Scripts\activate
```

### 3. Install Dependencies
```
pip install -r requirements.txt
```
If `requirements.txt` is missing, ask your team lead for the required packages (typically Django and djangorestframework).

### 4. Apply Database Migrations
```
python manage.py migrate
```

### 5. Run the Development Server
```
python manage.py runserver
```

---

## 🛠️ Useful Commands
- Create a superuser:
  ```
  python manage.py createsuperuser
  ```
- Collect static files:
  ```
  python manage.py collectstatic
  ```

---


## 📚 API Overview

API endpoints are defined in `lmsapp/urls.py` and `lmsapp/views.py`.

### User Registration
- **Endpoint:** `POST /api/register/` (if implemented, otherwise check with your team)
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "password": "yourpassword",
    "phone": "1234567890",
    "first_name": "John",
    "last_name": "Doe"
  }
  ```
- **Response:**
  - `201 Created` on success
  - User object or success message

### User Login
- **Endpoint:** `POST /api/login/`
- **Request Body:**
  ```json
  {
    "phone": "1234567890",
    "password": "yourpassword"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "user_id": 1,
    "username": "johndoe",
    "tokens": {
      "refresh": "<refresh_token>",
      "access": "<access_token>"
    }
  }
  ```
  - On error: `{ "error": "Invalid phone or password" }`

### Example Resource Endpoints
- `GET /api/resources/` — List resources
- `POST /api/resources/` — Create resource
- `GET /api/resources/<id>/` — Retrieve resource
- `PUT /api/resources/<id>/` — Update resource
- `DELETE /api/resources/<id>/` — Delete resource

> Replace `resources` with the actual model name (e.g., `students`, `courses`).

---

## 🐞 Troubleshooting
- If you see `ModuleNotFoundError`, ensure all dependencies are installed.
- If migrations fail, try deleting `db.sqlite3` and the `migrations` folder (except `__init__.py`), then run migrations again.
- For other issues, check the error message or ask your team lead.

---

## 🔗 Resources
- [Django Documentation](https://docs.djangoproject.com/en/4.0/)
- [Django REST Framework](https://www.django-rest-framework.org/)

---

*For questions, contact your team lead or a senior developer.*
