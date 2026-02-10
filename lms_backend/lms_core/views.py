"""
LMS core: Category (Admin CRUD), Course (Admin/Instructor CRUD), Enrollment (student enroll, no duplicate).
Dashboard and reports APIs.
"""
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from lmsapp.models import Profile
from .models import Category, Course, Enrollment
from .serializers import CategorySerializer, CourseSerializer, CourseCreateUpdateSerializer, EnrollmentSerializer
from .permissions import IsAdminOnly, IsAdminOrInstructor, IsInstructorOrReadOnly
from accounts.permissions import get_user_role

User = get_user_model()


# ---------- Category: Admin only ----------
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdminOnly]


class CategoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdminOnly]


# ---------- Course: Admin or Instructor; Instructor only their courses ----------
class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsInstructorOrReadOnly]

    def get_queryset(self):
        qs = Course.objects.select_related('category', 'instructor').all()
        role = get_user_role(self.request.user)
        if role == 'instructor':
            qs = qs.filter(instructor=self.request.user)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseCreateUpdateSerializer
        return CourseSerializer

    def perform_create(self, serializer):
        role = get_user_role(self.request.user)
        if role == 'instructor':
            serializer.save(instructor=self.request.user)
        else:
            serializer.save()


class CourseRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsInstructorOrReadOnly]

    def get_queryset(self):
        qs = Course.objects.select_related('category', 'instructor').all()
        role = get_user_role(self.request.user)
        if role == 'instructor':
            qs = qs.filter(instructor=self.request.user)
        return qs

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CourseCreateUpdateSerializer
        return CourseSerializer


# ---------- Enrollment: students enroll themselves; prevent duplicate ----------
class EnrollmentListCreateView(generics.ListCreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = get_user_role(self.request.user)
        if role == 'admin':
            return Enrollment.objects.select_related('user', 'course').all()
        if role == 'instructor':
            return Enrollment.objects.filter(course__instructor=self.request.user).select_related('user', 'course')
        return Enrollment.objects.filter(user=self.request.user).select_related('user', 'course')

    def create(self, request, *args, **kwargs):
        role = get_user_role(request.user)
        if role not in ('admin', 'student'):
            return Response(
                {'error': 'Only students can self-enroll; use admin to create enrollments for others.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        course_id = request.data.get('course')
        if not course_id:
            return Response({'error': 'course is required'}, status=status.HTTP_400_BAD_REQUEST)
        if role == 'student':
            if Enrollment.objects.filter(user=request.user, course_id=course_id).exists():
                return Response(
                    {'error': 'Already enrolled in this course.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = self.get_serializer(data={'user': request.user.id, 'course': course_id})
        else:
            serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if role == 'student':
            serializer.save(user=request.user)
        else:
            serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EnrollmentRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = get_user_role(self.request.user)
        if role == 'admin':
            return Enrollment.objects.select_related('user', 'course').all()
        if role == 'instructor':
            return Enrollment.objects.filter(course__instructor=self.request.user).select_related('user', 'course')
        return Enrollment.objects.filter(user=self.request.user).select_related('user', 'course')


# ---------- Instructors list (for admin when creating course) ----------
class InstructorListView(APIView):
    """List users with role=instructor (id, username). Admin only."""
    permission_classes = [IsAuthenticated, IsAdminOnly]

    def get(self, request):
        instructor_ids = Profile.objects.filter(role='instructor').values_list('user_id', flat=True)
        users = User.objects.filter(id__in=instructor_ids).values('id', 'username', 'email')
        return Response(list(users))


# ---------- Dashboard & Reports (Admin or read for others) ----------
class DashboardSummaryView(APIView):
    """Summary: total users, role-wise count, total courses, total enrollments."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count
        total_users = User.objects.count()
        role_counts = dict(
            Profile.objects.values('role').annotate(count=Count('id')).values_list('role', 'count')
        )
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        return Response({
            'total_users': total_users,
            'users_by_role': {
                'admin': role_counts.get('admin', 0),
                'instructor': role_counts.get('instructor', 0),
                'student': role_counts.get('student', 0),
            },
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
        })
