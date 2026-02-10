"""
Serializers for authentication, registration, and profile.
"""
from django.contrib.auth.models import User
from rest_framework import serializers
from lmsapp.models import Profile, Role


class RegisterSerializer(serializers.ModelSerializer):
    """Registration with email, password, and role."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=Role.choices, default=Role.STUDENT)
    phone = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def create(self, validated_data):
        role = validated_data.pop('role', Role.STUDENT)
        phone = validated_data.pop('phone', None) or ''
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        Profile.objects.create(user=user, role=role, phone=phone or None)
        return user


class LoginSerializer(serializers.Serializer):
    """Login by email or username + password."""
    email = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        email = data.get('email') or ''
        username = data.get('username') or ''
        password = data.get('password')
        if not (email or username):
            raise serializers.ValidationError('Provide email or username.')
        from django.contrib.auth import authenticate
        user = None
        if email and '@' in email:
            try:
                u = User.objects.get(email=email)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                pass
        if not user and username:
            user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        data['user'] = user
        return data


class ProfileSerializer(serializers.ModelSerializer):
    """Profile read/update with role-specific fields."""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    role = serializers.CharField(read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role']

    def update(self, instance, validated_data):
        for attr in ('email', 'first_name', 'last_name'):
            if attr in validated_data:
                setattr(instance.user, attr, validated_data.pop(attr))
        instance.user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
