from django.urls import path

from lmsapp.views import (
    LoginView, ProtectedView, UserUpdateView, AvatarUploadView,
    CourseThumbnailUploadView,
    TeacherListCreateView, TeacherRetrieveUpdateDestroyAPIView,
    StudentListCreateView, StudentRetrieveUpdateDestroyAPIView,
    CategoryListCreateView, CategoryRetrieveUpdateDestroyAPIView,
    CourseListCreateView, CourseRetrieveUpdateDestroyAPIView,
    EnrollmentListCreateView, EnrollmentRetrieveUpdateDestroyAPIView,
    LessonListCreateView, LessonRetrieveUpdateDestroyAPIView,
    AssignmentListCreateView, AssignmentRetrieveUpdateDestroyAPIView,
    SubmissionListCreateView, SubmissionRetrieveUpdateDestroyAPIView,
    ResultsListCreateView, ResultsRetrieveUpdateDestroyAPIView,
    LessonProgressListCreateView, LessonProgressRetrieveUpdateDestroyAPIView,
    CourseReviewListCreateView, CourseReviewRetrieveUpdateDestroyAPIView,
    NotificationListView, NotificationUpdateView,
)

urlpatterns = [
    # Auth
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/protected/', ProtectedView.as_view(), name='protected'),
    path('api/users/<int:pk>/', UserUpdateView.as_view(), name='user-update'),
    path('api/users/<int:pk>/avatar/', AvatarUploadView.as_view(), name='user-avatar-upload'),

    # Teachers
    path('api/teacher/', TeacherListCreateView.as_view(), name='teacher-list'),
    path('api/teacher/<int:pk>/', TeacherRetrieveUpdateDestroyAPIView.as_view(), name='teacher-detail'),

    # Students
    path('api/student/', StudentListCreateView.as_view(), name='student-list'),
    path('api/student/<int:pk>/', StudentRetrieveUpdateDestroyAPIView.as_view(), name='student-detail'),

    # Categories (NEW)
    path('api/category/', CategoryListCreateView.as_view(), name='category-list'),
    path('api/category/<int:pk>/', CategoryRetrieveUpdateDestroyAPIView.as_view(), name='category-detail'),

    # Courses
    path('api/course/', CourseListCreateView.as_view(), name='course-list'),
    path('api/course/<int:pk>/', CourseRetrieveUpdateDestroyAPIView.as_view(), name='course-detail'),
    path('api/course/<int:pk>/thumbnail/', CourseThumbnailUploadView.as_view(), name='course-thumbnail-upload'),

    # Enrollments
    path('api/enrollment/', EnrollmentListCreateView.as_view(), name='enrollment-list'),
    path('api/enrollment/<int:pk>/', EnrollmentRetrieveUpdateDestroyAPIView.as_view(), name='enrollment-detail'),

    # Lessons
    path('api/lesson/', LessonListCreateView.as_view(), name='lesson-list'),
    path('api/lesson/<int:pk>/', LessonRetrieveUpdateDestroyAPIView.as_view(), name='lesson-detail'),

    # Assignments
    path('api/assignment/', AssignmentListCreateView.as_view(), name='assignment-list'),
    path('api/assignment/<int:pk>/', AssignmentRetrieveUpdateDestroyAPIView.as_view(), name='assignment-detail'),

    # Submissions
    path('api/submission/', SubmissionListCreateView.as_view(), name='submission-list'),
    path('api/submission/<int:pk>/', SubmissionRetrieveUpdateDestroyAPIView.as_view(), name='submission-detail'),

    # Results
    path('api/results/', ResultsListCreateView.as_view(), name='result-list'),
    path('api/results/<int:pk>/', ResultsRetrieveUpdateDestroyAPIView.as_view(), name='result-detail'),

    # Lesson Progress (NEW)
    path('api/lesson-progress/', LessonProgressListCreateView.as_view(), name='lesson-progress-list'),
    path('api/lesson-progress/<int:pk>/', LessonProgressRetrieveUpdateDestroyAPIView.as_view(), name='lesson-progress-detail'),

    # Course Reviews (NEW)
    path('api/review/', CourseReviewListCreateView.as_view(), name='review-list'),
    path('api/review/<int:pk>/', CourseReviewRetrieveUpdateDestroyAPIView.as_view(), name='review-detail'),

    # Notifications (NEW)
    path('api/notifications/', NotificationListView.as_view(), name='notification-list'),
    path('api/notifications/<int:pk>/', NotificationUpdateView.as_view(), name='notification-update'),
]