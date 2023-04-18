
from rest_framework import serializers

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from django.contrib.auth.models import update_last_login
from django.core.exceptions import ObjectDoesNotExist
from .models import User, ContactForm, Profile, Settings, Meeting, MeetingUser



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active']
        read_only_field = ['is_active']


class LoginSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = self.get_token(self.user)

        data['user'] = UserSerializer(self.user).data
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)

        if api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data


class RegisterSerializer(UserSerializer):
    password = serializers.CharField(max_length=128, min_length=8, required=True)
    email = serializers.EmailField(required=True, max_length=128)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'is_active','settings']

    def create(self, validated_data):
        try:
            user = User.objects.get(email=validated_data['email'])
            instance = self.Meta.model(**validated_data)
            instance.is_active = True
        except ObjectDoesNotExist:
            user = User.objects.create_user(**validated_data)
            settings = Settings()
            user.settings = settings
            settings.save()
            user.save()
            settings = Settings()
            user.settings = settings
            settings.save()
            user.save()
        return user


class ContactFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactForm
        fields = ('message', 'category')
    def create(self, instance):
        return ContactForm.objects.create(**self.validated_data)

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('full_name', 'gender', 'birth_date', 'user')

    def create(self, instance):
        return Profile.objects.create(**self.validated_data)

    def update(self, instance):
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.birth_date = validated_data.get('birth_date', instance.birth_date)
        return instance

class SettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Settings
        fields = '__all__'

class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['id', 'agora_token', 'start_time', 'end_time']
    def create(self, instance):
        return Meeting.objects.create(**self.validated_data)

class MeetingUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingUser
        fields = ['id', 'is_host', 'is_presenter', 'join_time', 'left_time', 'meeting',' user']

    def create(self, instance):
        return MeetingUser.objects.create(**self.validated_data)



