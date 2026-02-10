from django.urls import path
from .views import (
    CategoryListCreateView,
    CategoryRetrieveUpdateDestroyView,
    CourseListCreateView,
    CourseRetrieveUpdateDestroyView,
    EnrollmentListCreateView,
    EnrollmentRetrieveDestroyView,
    DashboardSummaryView,
    InstructorListView,
)

urlpatterns = [
    path('instructors/', InstructorListView.as_view(), name='instructor-list'),
    path('categories/', CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryRetrieveUpdateDestroyView.as_view(), name='category-detail'),
    path('courses/', CourseListCreateView.as_view(), name='course-list'),
    path('courses/<int:pk>/', CourseRetrieveUpdateDestroyView.as_view(), name='course-detail'),
    path('enrollments/', EnrollmentListCreateView.as_view(), name='enrollment-list'),
    path('enrollments/<int:pk>/', EnrollmentRetrieveDestroyView.as_view(), name='enrollment-detail'),
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
]
