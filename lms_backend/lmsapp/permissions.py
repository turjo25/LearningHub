from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'admin'
        )


class IsTeacher(permissions.BasePermission):
    """Allows access only to teachers."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'teacher'
        )


class IsStudent(permissions.BasePermission):
    """Allows access only to students."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'student'
        )


class IsTeacherOrReadOnly(permissions.BasePermission):
    """
    Safe (GET/HEAD/OPTIONS) requests are allowed to any user (including anonymous).
    Write operations are restricted to authenticated teachers only.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'teacher'
        )


class IsOwnerTeacherOrReadOnly(permissions.BasePermission):
    """
    Object-level permission.
    - Safe methods: any authenticated user.
    - Write methods: only the teacher who OWNS the related course.
    Expects the object (Lesson or Assignment) to have a `.course.teacher.user` relation.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'teacher'
        )

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # obj can be a Lesson or Assignment – both have .course
        course = getattr(obj, 'course', None)
        if course is None:
            return False
        return course.teacher.user == request.user


class IsEnrolledStudentOrTeacherOwner(permissions.BasePermission):
    """
    For submissions:
    - Students can only create/view their own submissions.
    - Teachers can view/grade submissions for their courses.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user.is_authenticated:
            return False
        # Teachers can access submissions for their courses
        if hasattr(user, 'profile') and user.profile.role == 'teacher':
            return obj.assignment.course.teacher.user == user
        # Students can only access their own submissions
        if hasattr(user, 'student'):
            return obj.student == user.student
        return False
