from django.urls import path

from lmsapp.views import(LoginView,ProtectedView,TeacherListCreateView,StudentListCreateView,CourseListCreateView,
                         TeacherRetrieveUpdateDestroyAPIView,StudentRetrieveUpdateDestroyAPIView,EnrollmentListCreateView,
                         CourseRetrieveUpdateDestroyAPIView,EnrollmentRetrieveUpdateDestroyAPIView,AssignmentRetrieveUpdateDestroyAPIView,
                         LessonListCreateView,LessonRetrieveUpdateDestroyAPIView,AssignmentListCreateView,
                         SubmissionListCreateView,SubmissionRetrieveUpdateDestroyAPIView,ResultsListCreateView,
                         ResultsRetrieveUpdateDestroyAPIView)

# Mounted under api/ in main urls.py
urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('protected/', ProtectedView.as_view(), name='protected'),
    path('teacher/', TeacherListCreateView.as_view(), name='teacher-list'),
    path('teacher/<int:pk>/', TeacherRetrieveUpdateDestroyAPIView.as_view(), name='teacher-detail'),
    path('student/', StudentListCreateView.as_view(), name='student-list'),
    path('student/<int:pk>/', StudentRetrieveUpdateDestroyAPIView.as_view(), name='student-detail'),
    path('course/', CourseListCreateView.as_view(), name='course-list'),
    path('course/<int:pk>/', CourseRetrieveUpdateDestroyAPIView.as_view(), name='course-detail'),
    path('enrollment/', EnrollmentListCreateView.as_view(), name='enrollment-list'),
    path('enrollment/<int:pk>/', EnrollmentRetrieveUpdateDestroyAPIView.as_view(), name='enrollment-detail'),
    path('lesson/', LessonListCreateView.as_view(), name='lesson-list'),
    path('lesson/<int:pk>/', LessonRetrieveUpdateDestroyAPIView.as_view(), name='lesson-detail'),
    path('assignment/', AssignmentListCreateView.as_view(), name='assignment-list'),
    path('assignment/<int:pk>/', AssignmentRetrieveUpdateDestroyAPIView.as_view(), name='assignment-detail'),
    path('submission/', SubmissionListCreateView.as_view(), name='submission-list'),
    path('submission/<int:pk>/', SubmissionRetrieveUpdateDestroyAPIView.as_view(), name='submission-detail'),
    path('results/', ResultsListCreateView.as_view(), name='result-list'),
    path('results/<int:pk>/', ResultsRetrieveUpdateDestroyAPIView.as_view(), name='result-detail'),
]