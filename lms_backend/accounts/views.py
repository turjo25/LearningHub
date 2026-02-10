"""
Authentication, profile, and password management views.
Uses JWT (SimpleJWT), role from lmsapp.Profile, and token blacklist for logout.
"""
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from lmsapp.models import Profile

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    ProfileSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)

# Token blacklist for logout (optional; we'll use simplejwt's blacklist app)
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


class RegisterView(generics.CreateAPIView):
    """User registration with email and role. Public."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        profile = user.profile
        return Response({
            'message': 'Registration successful',
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': profile.role,
            'tokens': tokens,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Login with email or username + password. Returns JWT tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        profile = user.profile
        return Response({
            'message': 'Login successful',
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': profile.role,
            'tokens': tokens,
        })


class LogoutView(APIView):
    """Blacklist refresh token on logout. Requires refresh token in body."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response(
                {'error': 'Refresh token required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logged out successfully'})


class ProfileView(APIView):
    """View and update current user profile. Role-specific fields on profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        return self.put(request)


# ----- Password reset (email token, console backend) -----
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from django.conf import settings

def make_reset_token(email):
    signer = TimestampSigner()
    return signer.sign(email)

def get_email_from_reset_token(token, max_age=3600):
    """Max age in seconds (default 1 hour)."""
    signer = TimestampSigner()
    try:
        return signer.unsign(token, max_age=max_age)
    except (SignatureExpired, BadSignature):
        return None


class ForgotPasswordView(APIView):
    """Request password reset. Sends token to email (console in dev)."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'message': 'If an account exists with this email, you will receive a reset link.'},
                status=status.HTTP_200_OK,
            )
        token = make_reset_token(email)
        reset_link = f'{request.scheme}://{request.get_host()}/api/accounts/reset-password/?token={token}'
        # Console email (dev); in production use send_mail
        print(f'[Password reset] Link for {email}: {reset_link}')
        from django.core.mail import send_mail
        send_mail(
            subject='Password reset',
            message=f'Use this link to reset your password: {reset_link}',
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@lms.local',
            recipient_list=[email],
            fail_silently=True,
        )
        return Response({'message': 'If an account exists with this email, you will receive a reset link.'})


class ResetPasswordView(APIView):
    """Reset password using token from email."""
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token') or request.query_params.get('token')
        new_password = request.data.get('new_password')
        if not token or not new_password:
            return Response(
                {'error': 'Token and new_password required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        email = get_email_from_reset_token(token)
        if not email:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successful'})
