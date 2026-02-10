"""LMS role-based permissions. Uses accounts.permissions.get_user_role."""
from rest_framework import permissions
from accounts.permissions import get_user_role


class IsAdminOnly(permissions.BasePermission):
    """Only Admin role."""
    def has_permission(self, request, view):
        return get_user_role(request.user) == 'admin'


class IsAdminOrInstructor(permissions.BasePermission):
    """Admin or Instructor."""
    def has_permission(self, request, view):
        return get_user_role(request.user) in ('admin', 'instructor')


class IsInstructorOrReadOnly(permissions.BasePermission):
    """Instructor can create/update/delete; others read-only."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return get_user_role(request.user) in ('admin', 'instructor')
