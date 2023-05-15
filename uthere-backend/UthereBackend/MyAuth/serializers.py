
from rest_framework import serializers

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from django.contrib.auth.models import update_last_login
from django.core.exceptions import ObjectDoesNotExist
from .models import User, ContactForm, Profile, Settings, Meeting, MeetingUser,Presenter, AttentionEmotionScore,ScreenShare, AttentionEmotionScoreAverage


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active', 'password','settings_id']
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
        fields = ['id', 'attention_limit', 'get_analysis_report', 'hide_real_time_emotion_analysis','hide_real_time_attention_analysis','hide_real_time_analysis','hide_who_left','hide_eye_tracking']
    def update(self, instance):
        instance.attention_limit = self.validated_data.get('attention_limit', instance.attention_limit)
        instance.get_analysis_report = self.validated_data.get('get_analysis_report', instance.get_analysis_report)
        instance.hide_real_time_emotion_analysis = self.validated_data.get('hide_real_time_emotion_analysis ', instance.hide_real_time_emotion_analysis)
        instance.hide_real_time_attention_analysis = self.validated_data.get('hide_real_time_attention_analysis ', instance.hide_real_time_attention_analysis)
        instance.hide_real_time_analysis = self.validated_data.get('hide_real_time_analysis', instance.hide_real_time_analysis)
        instance.hide_who_left = self.validated_data.get('hide_who_left', instance.hide_who_left)
        instance.hide_eye_tracking = self.validated_data.get('hide_eye_tracking ', instance.hide_eye_tracking )
        return instance


class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['id', 'agora_token', 'start_time', 'end_time','channel_name']

    def create(self, instance):
        return Meeting.objects.create(**self.validated_data)


class MeetingUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingUser
        fields = ['id', 'is_host','access_report', 'is_presenter', 'join_time', 'left_time', 'meeting','user','agora_id','is_removed','alert_num']

    def create(self, instance):
        return MeetingUser.objects.create(**self.validated_data)
    
class PresenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presenter
        fields = ['id', 'start_time', 'end_time', 'meeting', 'user']

    def create(self, instance):
        return Presenter.objects.create(**self.validated_data)
    
class AttentionEmotionScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttentionEmotionScore
        fields = ['id', 'attention_score', 'time','emotion', 'meeting', 'user']

    def create(self, instance):
        return AttentionEmotionScore.objects.create(**self.validated_data)
    
class AttentionEmotionScoreAverageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttentionEmotionScoreAverage
        fields = ['id', 'meeting','time_start','time_end','avg_attention_score']

    def create(self, instance):
        return AttentionEmotionScoreAverage.objects.create(**self.validated_data)
    
    
class ScreenShareSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreenShare
        fields = ['id', 'start_time', 'end_time','agora_id', 'meeting', 'user']

    def create(self, instance):
        return ScreenShare.objects.create(**self.validated_data)



