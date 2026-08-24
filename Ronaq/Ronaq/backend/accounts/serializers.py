from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'address', 'city', 'postal_code', 'role', 'is_staff', 'is_email_verified')
        read_only_fields = ('id', 'role', 'is_staff', 'is_email_verified')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6, required=False)

    class Meta:
        model = User
        fields = ('email', 'password', 'confirm_password', 'first_name', 'last_name', 'phone_number', 'address')

    def validate(self, attrs):
        confirm_pwd = attrs.get('confirm_password')
        if confirm_pwd and attrs['password'] != confirm_pwd:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'address', 'city', 'postal_code', 'role', 'is_staff', 'is_superuser', 'is_email_verified')
        read_only_fields = ('id', 'email', 'role', 'is_staff', 'is_superuser', 'is_email_verified')

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
