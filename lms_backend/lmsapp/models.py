from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin')
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    avatar_url = models.URLField(blank=True, null=True, help_text='Profile picture URL')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, help_text='Profile picture')

    def __str__(self):
        return f"{self.user.username} - {self.phone} ({self.role})"


class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    subject = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} - {self.subject}"


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    enrollment_date = models.DateField()
    is_active = models.BooleanField(default=True)
    roll_number = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown'} - Student"


class Category(models.Model):
    """Course category (e.g., Programming, Design, Business)."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=10, default='📂', help_text='An emoji icon for this category')

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Course(models.Model):
    LEVEL_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    title = models.CharField(max_length=100)
    description = models.TextField()
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='courses')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True, help_text='Course cover image')
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00, help_text='Course price (0.00 for free)')

    def __str__(self):
        return self.title


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrollment_date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student} enrolled in {self.course.title}"


class Lesson(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    video_url = models.URLField(blank=True, null=True)
    attachment = models.FileField(upload_to='lesson_attachments/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0, help_text='Display order within the course')

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.title


class Assignment(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    due_date = models.DateTimeField()

    def __str__(self):
        return self.title


class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField()

    def __str__(self):
        return f"Submission by {self.student} for {self.assignment.title}"


class Results(models.Model):
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE)
    score = models.FloatField()
    feedback = models.TextField()

    def __str__(self):
        return f"Results for {self.submission.student} - {self.score}"


class LessonProgress(models.Model):
    """Tracks whether a student has completed a specific lesson."""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress_records')
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'lesson')
        ordering = ['lesson__order', 'lesson__id']

    def __str__(self):
        status = 'completed' if self.completed else 'in progress'
        return f"{self.student} - {self.lesson.title} ({status})"


class CourseReview(models.Model):
    """Star rating and text review left by an enrolled student."""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='reviews')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Rating from 1 (worst) to 5 (best)'
    )
    review = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student} rated {self.course.title} {self.rating}/5"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}"


# Signals for Notifications
@receiver(post_save, sender=Lesson)
def notify_new_lesson(sender, instance, created, **kwargs):
    if created:
        enrollments = Enrollment.objects.filter(course=instance.course)
        notifications = [
            Notification(
                user=enrollment.student.user,
                message=f"New lesson added: {instance.title} in {instance.course.title}",
                link=f"/courses/{instance.course.id}/lessons/{instance.id}"
            )
            for enrollment in enrollments if enrollment.student.user
        ]
        Notification.objects.bulk_create(notifications)

@receiver(post_save, sender=Assignment)
def notify_new_assignment(sender, instance, created, **kwargs):
    if created:
        enrollments = Enrollment.objects.filter(course=instance.course)
        notifications = [
            Notification(
                user=enrollment.student.user,
                message=f"New assignment posted: {instance.title} in {instance.course.title}",
                link=f"/assignments/{instance.id}"
            )
            for enrollment in enrollments if enrollment.student.user
        ]
        Notification.objects.bulk_create(notifications)

@receiver(post_save, sender=Submission)
def notify_teacher_submission(sender, instance, created, **kwargs):
    if created:
        teacher_user = instance.assignment.course.teacher.user
        if teacher_user:
            Notification.objects.create(
                user=teacher_user,
                message=f"New submission from {instance.student.user.username} for {instance.assignment.title}",
                link=f"/assignments/{instance.assignment.id}"
            )

@receiver(post_save, sender=Results)
def notify_student_grade(sender, instance, created, **kwargs):
    if created or not created: # notify on create or update
        student_user = instance.submission.student.user
        if student_user:
            Notification.objects.create(
                user=student_user,
                message=f"Your assignment '{instance.submission.assignment.title}' has been graded: {instance.score}/100",
                link=f"/assignments/{instance.submission.assignment.id}"
            )