from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db.models import Q

from .serializers import (
    RegisterSerializer, LoginSerializer, SubmissionSerializer, TeacherSerializer,
    StudentSerializer, CourseSerializer, EnrollmentSerializer,
    LessonSerializer, AssignmentSerializer, ResultSerializer,
    CategorySerializer, LessonProgressSerializer, CourseReviewSerializer,
    NotificationSerializer,
)

from django.db.models import Count, Avg

from .models import (
    Profile, Submission, Teacher, Student, Course, Enrollment,
    Lesson, Assignment, Results, Category, LessonProgress, CourseReview,
    Notification,
)
from .permissions import (
    IsTeacher, IsTeacherOrReadOnly, IsStudent, IsAdmin,
    IsOwnerTeacherOrReadOnly, IsEnrolledStudentOrTeacherOwner,
)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class RegisterView(generics.CreateAPIView):
    """User registration view."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer


def get_tokens_for_user(user):
    """Helper to get JWT tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class LoginView(APIView):
    """Login view using phone and password."""

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        password = serializer.validated_data['password']

        try:
            profile = Profile.objects.get(phone=phone)
            user = profile.user
        except Profile.DoesNotExist:
            return Response({'error': 'Invalid phone or password'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({'error': 'Invalid phone or password'}, status=status.HTTP_400_BAD_REQUEST)

        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Login successful',
            'user_id': user.id,
            'username': user.username,
            'tokens': tokens,
        })


class ProtectedView(APIView):
    """Protected view — returns full user profile including role."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = None
        try:
            role = user.profile.role
        except Profile.DoesNotExist:
            role = 'student'

        # Build absolute avatar URL if an uploaded file exists
        avatar_url = None
        if hasattr(user, 'profile') and user.profile.avatar:
            avatar_url = request.build_absolute_uri(user.profile.avatar.url)

        user_data = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': role,
            'avatar_url': avatar_url,
        }
        return Response({'message': 'successfully fetched this user', 'user': user_data})


class UserUpdateView(APIView):
    """PATCH /api/users/<pk>/ — update first_name, last_name, email for the authenticated user."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.id != pk:
            return Response({'error': 'You can only update your own profile.'}, status=status.HTTP_403_FORBIDDEN)

        user = request.user
        for field in ['first_name', 'last_name', 'email']:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()

        avatar_url = None
        role = 'student'
        try:
            role = user.profile.role
            if user.profile.avatar:
                avatar_url = request.build_absolute_uri(user.profile.avatar.url)
        except Profile.DoesNotExist:
            pass

        return Response({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': role,
            'avatar_url': avatar_url,
        })


class AvatarUploadView(APIView):
    """
    POST /api/users/<pk>/avatar/
    Accepts multipart/form-data with a single field: avatar (image file).
    Replaces the existing avatar and returns the new absolute URL.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if request.user.id != pk:
            return Response({'error': 'You can only update your own avatar.'}, status=status.HTTP_403_FORBIDDEN)

        if 'avatar' not in request.FILES:
            return Response({'error': 'No file provided. Send the image as "avatar" field.'}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['avatar']

        # Basic validation — only allow common image types
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            return Response({'error': 'Unsupported file type. Use JPEG, PNG, GIF, or WebP.'}, status=status.HTTP_400_BAD_REQUEST)

        # 5 MB limit
        if file.size > 5 * 1024 * 1024:
            return Response({'error': 'File too large. Maximum size is 5 MB.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Delete old file to avoid orphaned uploads
        if profile.avatar:
            profile.avatar.delete(save=False)

        profile.avatar = file
        profile.save(update_fields=['avatar'])

        avatar_url = request.build_absolute_uri(profile.avatar.url)
        return Response({'avatar_url': avatar_url}, status=status.HTTP_200_OK)


class CourseThumbnailUploadView(APIView):
    """
    POST /api/course/<pk>/thumbnail/
    Accepts multipart/form-data with field: thumbnail (image file).
    Only the course's owner teacher can upload.
    Returns the new absolute thumbnail_url.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Only the teacher who owns this course can upload
        if not hasattr(request.user, 'profile') or request.user.profile.role != 'teacher':
            return Response({'error': 'Only teachers can upload thumbnails.'}, status=status.HTTP_403_FORBIDDEN)
        if course.teacher.user != request.user:
            return Response({'error': 'You can only update thumbnails for your own courses.'}, status=status.HTTP_403_FORBIDDEN)

        if 'thumbnail' not in request.FILES:
            return Response({'error': 'No file provided. Send the image as "thumbnail" field.'}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['thumbnail']

        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            return Response({'error': 'Unsupported file type. Use JPEG, PNG, GIF, or WebP.'}, status=status.HTTP_400_BAD_REQUEST)

        if file.size > 10 * 1024 * 1024:
            return Response({'error': 'File too large. Maximum size is 10 MB.'}, status=status.HTTP_400_BAD_REQUEST)

        # Delete old thumbnail to avoid orphaned files
        if course.thumbnail:
            course.thumbnail.delete(save=False)

        course.thumbnail = file
        course.save(update_fields=['thumbnail'])

        thumbnail_url = request.build_absolute_uri(course.thumbnail.url)
        return Response({'thumbnail_url': thumbnail_url}, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Teachers
# ---------------------------------------------------------------------------

class TeacherListCreateView(generics.ListCreateAPIView):
    """List and create teachers. Supports ?user=<user_id> filtering."""
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Teacher.objects.select_related('user').all()
        user_id = self.request.query_params.get('user')
        if user_id:
            qs = qs.filter(user__id=user_id)
        return qs


class TeacherRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a teacher."""
    queryset = Teacher.objects.select_related('user').all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]


# ---------------------------------------------------------------------------
# Students
# ---------------------------------------------------------------------------

class StudentListCreateView(generics.ListCreateAPIView):
    """List and create students. Supports ?user=<user_id> filtering."""
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Student.objects.select_related('user').all()
        user_id = self.request.query_params.get('user')
        if user_id:
            qs = qs.filter(user__id=user_id)
        return qs


class StudentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a student."""
    queryset = Student.objects.select_related('user').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]


# ---------------------------------------------------------------------------
# Categories (NEW)
# ---------------------------------------------------------------------------

class CategoryListCreateView(generics.ListCreateAPIView):
    """List all categories or create a new one (admin/teacher only for create)."""
    queryset = Category.objects.annotate(annotated_course_count=Count('courses'))
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsTeacherOrReadOnly]


class CategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a category (admin/teacher only for write)."""
    queryset = Category.objects.annotate(annotated_course_count=Count('courses'))
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsTeacherOrReadOnly]


# ---------------------------------------------------------------------------
# Courses
# ---------------------------------------------------------------------------

class CourseListCreateView(generics.ListCreateAPIView):
    """
    List and create courses.
    Supports filtering:
      ?teacher=<teacher_id>
      ?category=<category_id>
      ?level=beginner|intermediate|advanced
      ?search=<text>   (searches title + description)
    """
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrReadOnly]

    def get_queryset(self):
        qs = Course.objects.select_related('teacher__user', 'category').annotate(
            annotated_lesson_count=Count('lessons', distinct=True),
            annotated_review_count=Count('reviews', distinct=True),
            annotated_average_rating=Avg('reviews__rating')
        ).prefetch_related('reviews', 'lessons')
        teacher_id = self.request.query_params.get('teacher')
        category_id = self.request.query_params.get('category')
        level = self.request.query_params.get('level')
        search = self.request.query_params.get('search')

        if teacher_id:
            qs = qs.filter(teacher__id=teacher_id)
        if category_id:
            qs = qs.filter(category__id=category_id)
        if level:
            qs = qs.filter(level=level)
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(teacher__user__first_name__icontains=search) |
                Q(teacher__user__last_name__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'teacher':
            try:
                teacher = self.request.user.teacher
                serializer.save(teacher=teacher)
            except Teacher.DoesNotExist:
                raise ValidationError("Teacher profile not found.")
        else:
            raise PermissionDenied("Only teachers can create courses.")


class CourseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a course."""
    queryset = Course.objects.select_related('teacher__user', 'category').annotate(
        annotated_lesson_count=Count('lessons', distinct=True),
        annotated_review_count=Count('reviews', distinct=True),
        annotated_average_rating=Avg('reviews__rating')
    ).prefetch_related('reviews', 'lessons')
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrReadOnly]


# ---------------------------------------------------------------------------
# Enrollments
# ---------------------------------------------------------------------------

class EnrollmentListCreateView(generics.ListCreateAPIView):
    """List and create enrollments. Supports ?student=<id> and ?course=<id> filtering."""
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Enrollment.objects.all()
        student_id = self.request.query_params.get('student')
        course_id = self.request.query_params.get('course')
        if student_id:
            qs = qs.filter(student__id=student_id)
        if course_id:
            qs = qs.filter(course__id=course_id)
        return qs

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'student'):
            raise PermissionDenied("Only students can enroll.")
        serializer.save(student=self.request.user.student)


class EnrollmentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an enrollment."""
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]


# ---------------------------------------------------------------------------
# Lessons  (now uses IsOwnerTeacherOrReadOnly for object-level security)
# ---------------------------------------------------------------------------

class LessonListCreateView(generics.ListCreateAPIView):
    """List and create lessons. Supports ?course=<course_id> filtering."""
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsOwnerTeacherOrReadOnly]

    def get_queryset(self):
        qs = Lesson.objects.all()
        course_id = self.request.query_params.get('course')
        if course_id:
            qs = qs.filter(course__id=course_id)
        return qs

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        if course.teacher.user != self.request.user:
            raise PermissionDenied("You can only add lessons to your own courses.")
        serializer.save()


class LessonRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a lesson."""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsOwnerTeacherOrReadOnly]


# ---------------------------------------------------------------------------
# Assignments  (now uses IsOwnerTeacherOrReadOnly for object-level security)
# ---------------------------------------------------------------------------

class AssignmentListCreateView(generics.ListCreateAPIView):
    """List and create assignments. Supports ?course=<id> and ?lesson=<id> filtering."""
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerTeacherOrReadOnly]

    def get_queryset(self):
        qs = Assignment.objects.all()
        course_id = self.request.query_params.get('course')
        lesson_id = self.request.query_params.get('lesson')
        if course_id:
            qs = qs.filter(course__id=course_id)
        if lesson_id:
            qs = qs.filter(lesson__id=lesson_id)
        return qs

    def perform_create(self, serializer):
        course = serializer.validated_data.get('course')
        if course.teacher.user != self.request.user:
            raise PermissionDenied("You can only add assignments to your own courses.")
        serializer.save()


class AssignmentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an assignment."""
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerTeacherOrReadOnly]


# ---------------------------------------------------------------------------
# Submissions
# ---------------------------------------------------------------------------

class SubmissionListCreateView(generics.ListCreateAPIView):
    """List and create submissions. Supports ?student=<id> and ?assignment=<id> filtering."""
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated, IsEnrolledStudentOrTeacherOwner]

    def get_queryset(self):
        qs = Submission.objects.all()
        student_id = self.request.query_params.get('student')
        assignment_id = self.request.query_params.get('assignment')
        if student_id:
            qs = qs.filter(student__id=student_id)
        if assignment_id:
            qs = qs.filter(assignment__id=assignment_id)
        return qs

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'student'):
            raise PermissionDenied("Only students can submit assignments.")
        assignment = serializer.validated_data.get('assignment')
        if not Enrollment.objects.filter(student=self.request.user.student, course=assignment.course).exists():
            raise PermissionDenied("You must be enrolled in the course to submit an assignment.")
        serializer.save(student=self.request.user.student)


class SubmissionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a submission."""
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated, IsEnrolledStudentOrTeacherOwner]


# ---------------------------------------------------------------------------
# Results
# ---------------------------------------------------------------------------

class ResultsListCreateView(generics.ListCreateAPIView):
    """List and create results."""
    queryset = Results.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrReadOnly]

    def perform_create(self, serializer):
        submission = serializer.validated_data.get('submission')
        if submission.assignment.course.teacher.user != self.request.user:
            raise PermissionDenied("You can only grade submissions for your own courses.")
        serializer.save()


class ResultsRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a result."""
    queryset = Results.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrReadOnly]


# ---------------------------------------------------------------------------
# Lesson Progress (NEW)
# ---------------------------------------------------------------------------

class LessonProgressListCreateView(generics.ListCreateAPIView):
    """
    Track lesson completion.
    Supports ?student=<id>, ?lesson=<id>, ?course=<course_id> filtering.
    """
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = LessonProgress.objects.select_related('student', 'lesson')
        student_id = self.request.query_params.get('student')
        lesson_id = self.request.query_params.get('lesson')
        course_id = self.request.query_params.get('course')
        if student_id:
            qs = qs.filter(student__id=student_id)
        if lesson_id:
            qs = qs.filter(lesson__id=lesson_id)
        if course_id:
            qs = qs.filter(lesson__course__id=course_id)
        return qs

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'student'):
            raise PermissionDenied("Only students can track progress.")
        lesson = serializer.validated_data.get('lesson')
        if not Enrollment.objects.filter(student=self.request.user.student, course=lesson.course).exists():
            raise PermissionDenied("You must be enrolled in the course to track progress.")
        serializer.save(student=self.request.user.student)


class LessonProgressRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve or update a lesson progress record."""
    queryset = LessonProgress.objects.all()
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]


# ---------------------------------------------------------------------------
# Course Reviews (NEW)
# ---------------------------------------------------------------------------

class CourseReviewListCreateView(generics.ListCreateAPIView):
    """
    List and create course reviews.
    Supports ?course=<id> and ?student=<id> filtering.
    """
    serializer_class = CourseReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = CourseReview.objects.select_related('student__user', 'course')
        course_id = self.request.query_params.get('course')
        student_id = self.request.query_params.get('student')
        if course_id:
            qs = qs.filter(course__id=course_id)
        if student_id:
            qs = qs.filter(student__id=student_id)
        return qs

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'student'):
            raise PermissionDenied("Only students can write reviews.")
        course = serializer.validated_data.get('course')
        if not Enrollment.objects.filter(student=self.request.user.student, course=course).exists():
            raise PermissionDenied("You must be enrolled in the course to review it.")
        serializer.save(student=self.request.user.student)


class CourseReviewRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a review."""
    queryset = CourseReview.objects.all()
    serializer_class = CourseReviewSerializer
    permission_classes = [IsAuthenticated]


# ---------------------------------------------------------------------------
# Notifications (NEW)
# ---------------------------------------------------------------------------

class NotificationListView(generics.ListAPIView):
    """List notifications for the logged-in user."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationUpdateView(generics.UpdateAPIView):
    """Update a notification (e.g. mark as read)."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
