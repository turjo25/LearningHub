from django.contrib.auth.models import User
from django.db.models import Avg
from rest_framework import serializers

from .models import (
    Assignment, Category, Course, CourseReview, Enrollment,
    LessonProgress, Profile, Student, Submission, Teacher, Lesson, Results, Notification
)


class RegisterSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(required=True, write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=Profile.ROLE_CHOICES, required=True, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'phone', 'first_name', 'last_name', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        role = validated_data.pop('role')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.get('last_name', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name
        )
        Profile.objects.create(user=user, phone=phone, role=role)

        # Conditionally create role-specific models
        if role == 'student':
            from django.utils import timezone
            Student.objects.create(user=user, enrollment_date=timezone.now().date())
        elif role == 'teacher':
            Teacher.objects.create(user=user, subject='')

        return user


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class TeacherSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = ['id', 'user', 'name', 'email', 'subject', 'is_active']

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() if obj.user else "Unknown"

    def get_email(self, obj):
        return obj.user.email if obj.user else ""


class StudentSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['id', 'user', 'name', 'email', 'enrollment_date', 'is_active', 'roll_number']

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() if obj.user else "Unknown"

    def get_email(self, obj):
        return obj.user.email if obj.user else ""


class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'course_count']

    def get_course_count(self, obj):
        if hasattr(obj, 'annotated_course_count'):
            return obj.annotated_course_count
        return obj.courses.count()


class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'teacher', 'teacher_name',
            'category', 'category_name', 'level', 'thumbnail', 'thumbnail_url',
            'average_rating', 'review_count', 'lesson_count', 'price',
        ]

    def get_teacher_name(self, obj):
        if obj.teacher and obj.teacher.user:
            return f"{obj.teacher.user.first_name} {obj.teacher.user.last_name}".strip()
        return "Unknown"

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_average_rating(self, obj):
        if hasattr(obj, 'annotated_average_rating'):
            avg = obj.annotated_average_rating
            return round(avg, 1) if avg is not None else None
        avg = obj.reviews.aggregate(avg=Avg('rating'))['avg']
        return round(avg, 1) if avg is not None else None

    def get_review_count(self, obj):
        if hasattr(obj, 'annotated_review_count'):
            return obj.annotated_review_count
        return obj.reviews.count()

    def get_lesson_count(self, obj):
        if hasattr(obj, 'annotated_lesson_count'):
            return obj.annotated_lesson_count
        return obj.lessons.count()

    def get_thumbnail_url(self, obj):
        """Return absolute URL for the uploaded thumbnail, or None."""
        if not obj.thumbnail:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return obj.thumbnail.url


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'enrollment_date']


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'course', 'video_url', 'attachment', 'order']


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'lesson', 'due_date', 'course']


class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = ['id', 'assignment', 'student', 'student_name', 'submitted_at', 'content']

    def get_student_name(self, obj):
        if obj.student and obj.student.user:
            return f"{obj.student.user.first_name} {obj.student.user.last_name}".strip() or obj.student.user.username
        return "Unknown"


class ResultSerializer(serializers.ModelSerializer):
    feedback = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = Results
        fields = ['id', 'submission', 'score', 'feedback']


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.SerializerMethodField()
    course_id = serializers.SerializerMethodField()

    class Meta:
        model = LessonProgress
        fields = ['id', 'student', 'lesson', 'lesson_title', 'course_id', 'completed', 'completed_at']
        read_only_fields = ['completed_at']

    def get_lesson_title(self, obj):
        return obj.lesson.title if obj.lesson else ''

    def get_course_id(self, obj):
        return obj.lesson.course_id if obj.lesson else None

    def update(self, instance, validated_data):
        """Auto-set completed_at when marking as complete."""
        if validated_data.get('completed') and not instance.completed:
            from django.utils import timezone
            validated_data['completed_at'] = timezone.now()
        elif not validated_data.get('completed', instance.completed):
            validated_data['completed_at'] = None
        return super().update(instance, validated_data)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'phone', 'role', 'avatar_url']


class CourseReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = CourseReview
        fields = ['id', 'student', 'course', 'rating', 'review', 'student_name', 'created_at']
        read_only_fields = ['created_at']

    def get_student_name(self, obj):
        if obj.student and obj.student.user:
            return f"{obj.student.user.first_name} {obj.student.user.last_name}".strip() or obj.student.user.username
        return "Anonymous"

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'link', 'is_read', 'created_at']