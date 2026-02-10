"""
Role-based permissions for the LMS.
Uses role stored on lmsapp.Profile (OneToOne with User).
"""
from rest_framework import permissions


def get_user_role(user):
    """Return user role string or None if no profile."""
    if not user or not user.is_authenticated:
        return None
    try:
        return user.profile.role
    except Exception:
        return None


class IsAdmin(permissions.BasePermission):
    """Only users with Admin role."""
    def has_permission(self, request, view):
        return get_user_role(request.user) == 'admin'


class IsInstructor(permissions.BasePermission):
    """Only users with Instructor role (or Admin)."""
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in ('admin', 'instructor')


class IsStudent(permissions.BasePermission):
    """Only users with Student role (or Admin for read)."""
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in ('admin', 'student')


class IsAdminOrReadOnly(permissions.BasePermission):
    """Admin can do anything; others read-only."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return get_user_role(request.user) == 'admin'
