from rest_framework.authentication import TokenAuthentication

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework import filters
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from .serializers import UserSerializer, LoginSerializer, RegisterSerializer, ContactFormSerializer, ProfileSerializer, \
    MeetingSerializer, MeetingUserSerializer, SettingsSerializer,PresenterSerializer,AttentionEmotionScoreSerializer, ScreenShareSerializer,\
    AttentionEmotionScoreAverageSerializer, PollSerializer, OptionsSerializer
from .models import User, Profile, Meeting, Settings, MeetingUser, Presenter,AttentionEmotionScore, ScreenShare, AttentionEmotionScoreAverage, Poll, Options
from django.contrib.auth import authenticate, login
from .sendmail import send_email
from agora_token_builder import RtcTokenBuilder
import secrets
import string
import time
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.utils.timezone import make_aware
from datetime import datetime,timedelta
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from matplotlib.backends.backend_agg import FigureCanvasAgg
from io import BytesIO
import matplotlib.pyplot as plt
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.graphics.widgets.markers import makeMarker
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.legends import Legend
from matplotlib.dates import date2num
import numpy as np
import numpy as np
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing, String
from matplotlib.dates import date2num, DateFormatter, MinuteLocator, SecondLocator
from reportlab.graphics.charts.piecharts import Pie
from django.db import IntegrityError
from django.contrib.auth.hashers import check_password
from django.db import transaction


class UserViewSet(viewsets.ModelViewSet):
    http_method_names = ['get']
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = [filters.OrderingFilter]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()

    def get_object(self):
        lookup_field_value = self.kwargs[self.lookup_field]

        obj = User.objects.get(lookup_field_value)
        self.check_object_permissions(self.request, obj)

        return obj


class UserInfoViewSet(ModelViewSet):
    serializer_class = UserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = User.objects.all()

    def retrieve(self, request, pk=None):
        user = request.user
        data = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'settings_id': user.settings_id
        }
        return Response(data)

class LeftUserInfoViewSet(ModelViewSet):
    serializer_class = UserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = User.objects.all()

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            data = {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'settings_id': user.settings_id
            }
            return Response(data)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class GetUserInfoViewSet(ModelViewSet):
    serializer_class = UserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = User.objects.all()

    def retrieve(self, request, pk=None):
        queryset = User.objects.filter(id=pk)
        my_object = queryset.first()
        if my_object is None:
            return Response(status=404)

        serializer = UserSerializer(my_object)
        return Response(serializer.data)

class UserUpdateViewSet(ModelViewSet):
    serializer_class = UserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = User.objects.all()

    def put(self, request, *args, **kwargs):
        user_id = request.data.get("userId")
        changed_info = request.data.get("changedInfo")
        user = User.objects.get(pk=user_id)
        print("changed Info is " + changed_info)
        changed_info = request.data.get("changedInfo")
        # user = request.user
        if changed_info =="full name":
            new_username = request.data.get("newInfo")
            user.username = new_username
            user.save()
            return Response({'status': 'username updated'})
        elif changed_info == "email":
            new_email = request.data.get("newInfo")
            try:
                user.email = new_email
                user.save()
                return Response({'status': 'email updated'})
            except IntegrityError:
                return Response({'status': 'ERROR', 'message': 'Email already exists'})
        elif changed_info == "password":
            currentPassword = request.data.get("currentPassword")
            print(currentPassword)
            password = request.user.password
            if check_password(currentPassword, password):
                new_password = request.data.get("newInfo")
                user.set_password(new_password)
                user.save()
                return Response({'status': 'password updated'})
            else:
                return Response({'status': 'ERROR', 'message': 'Current password is wrong'}) 
            
        return Response({'status': 'ERROR'})


class UserKickedMeetingViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        print(request.user)
        left_user_id = request.data.get("userId")
        channel_id = request.data.get("channelId")
        print(left_user_id, channel_id)
        user_meeting = MeetingUser.objects.get(agora_id=left_user_id, meeting_id=channel_id)

        print(user_meeting)
        if user_meeting.left_time is None:
            print("inside if")
            user_meeting.left_time = datetime.now(tz=timezone.utc)
            user_meeting.is_removed = True
            user_meeting.save()
            return Response({'status': 'user is kicked out of the meeting'})
        return Response({'status': 'ERROR'})
    
class RemoveAllUserMeetingViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        print(request.user)
        channel_id = request.data.get("channelId")
        print(channel_id)
        user_meeting_all = MeetingUser.objects.filter( meeting_id=channel_id).all()
        print(user_meeting_all)
        for user_meeting in user_meeting_all:
            print(user_meeting)
            print(user_meeting.left_time)
            if user_meeting.left_time is None:
                print("inside if")
                user_meeting.left_time = datetime.now(tz=timezone.utc)
                user_meeting.is_removed = True
                user_meeting.save()
        return Response({'status': 'user is kicked out of the meeting'})


class SetPresenterMeetingViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        presenter_user_id = request.data.get("userId")
        channel_id = request.data.get("channelId")
        agora_id = request.data.get("agoraToken")
        print(presenter_user_id)
        user_meeting = MeetingUser.objects.get(user_id=presenter_user_id, meeting_id=channel_id,agora_id=agora_id)
        if user_meeting.is_presenter == 0:
            user_meeting.is_presenter = True
            user_meeting.save()
            return Response({'status': 'user become presenter'})
        return Response({'status': 'ERROR'})
    
class GiveAccessUserViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        user_id = request.data.get("userId")
        channel_id = request.data.get("channelId")
        agora_id = request.data.get("agoraToken")
        print(user_id)
        print(channel_id)
        print(agora_id)
        user_meeting = MeetingUser.objects.get(user_id=user_id, meeting_id=channel_id,agora_id=agora_id)
        if user_meeting is not None:
            user_meeting.access_report = True
            user_meeting.save()
            return Response({'status': 'user can access report'})
        return Response({'status': 'ERROR'})


class UnsetPresenterMeetingViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        presenter_user_id = request.data.get("userId")
        channel_id = request.data.get("channelId")
        agora_id = request.data.get("agoraToken")
        user_meeting = MeetingUser.objects.get(user_id=presenter_user_id, meeting_id=channel_id,agora_id=agora_id)
        if user_meeting.is_presenter == 1:
            user_meeting.is_presenter = False
            user_meeting.save()
            return Response({'status': 'user is unsetted as presenter'})
        return Response({'status': 'ERROR'})
    
class EndTimePresenterViewSet(ModelViewSet):
    serializer_class = PresenterSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = Presenter.objects.all()

    def put(self, request, *args, **kwargs):
        presenter_user_id = request.data.get("userId")
        channel_id = request.data.get("channelId")
        id = request.data.get("id")
        presenter = Presenter.objects.filter(user_id=presenter_user_id, meeting_id=channel_id, end_time=None).order_by('-id').last()
        presenter.end_time = datetime.now(tz=timezone.utc)
        presenter.save()
        return Response({'status': 'presenter is unsetted in presenter table'})


class AlertUserMeetingViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        presenter_user_id = request.data.get("userId")
        channel_id = request.data.get("channelId")
        user_meeting = MeetingUser.objects.get(agora_id=presenter_user_id, meeting_id= channel_id)
        if user_meeting is None:
            return Response({'status': 'MeetingUser not found'}, status=404)
        else:
            user_meeting.alert_num = user_meeting.alert_num + 1
            user_meeting.save()

        serializer = MeetingUserSerializer(user_meeting)
        return Response(serializer.data)


class SignOutViewSet(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request, pk=None):
        # Get the user's token
        try:
            token = request.auth
        except AttributeError:
            # The user is not authenticated
            return Response(status=401)

        # Delete the user's token
        try:
            token = Token.objects.get(key=token)
            token.delete()
        except Token.DoesNotExist:
            # The token doesn't exist
            pass

        # Return a success response
        return Response(status=204)

    
class SettingsViewSet(ModelViewSet):
    serializer_class = SettingsSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Settings.objects.all()
    http_method_names = ['put', 'patch']

    def update(self, request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data)
        print(data)

        if serializer.is_valid():
            setting = Settings.objects.get(id=request.user.settings_id)
            print(setting.attention_limit)
            for key, value in data.items():
                setattr(setting, key, value)
            setting.save()
            print(setting)
            return Response(data=serializer.data, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetSettingsViewSet(ModelViewSet):
    serializer_class = SettingsSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Settings.objects.all()
    http_method_names = ['get']


    def retrieve(self, request, pk=None):
        my_object = request.user.settings
        if my_object is None:
            return Response(status=204)

        serializer = SettingsSerializer(my_object)
        return Response(serializer.data)


class LoginViewSet(ModelViewSet):
    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        User = get_user_model()
        username = serializer.validated_data['user']['email']
        password = serializer.validated_data['user']['password']
        user = User.objects.get(email=username, password=password)
        authenticate(email=username, password=password)
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)

        response_data = {
            'token': token.key,
            'id': user.id
        }

        login(request, user)
        return Response(response_data, status=status.HTTP_200_OK)


class CreateMeetingViewSet(ModelViewSet):
    serializer_class = MeetingSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        print("creating")
        app_id = request.data.get("appId")
        certificate = request.data.get("certificate")
        uid = request.data.get("uid")
        role = request.data.get("role")
        #create random channel name
        alphabet = string.ascii_letters + string.digits
        channel_name = ''.join(secrets.choice(alphabet) for i in range(6))
        privilege_expired_ts = request.data.get("privilegeExpiredTs")
        expiration_time_in_seconds = int(time.time()) + 1440 * 60
        token = RtcTokenBuilder.buildTokenWithUid(app_id, certificate, channel_name, 0, role, expiration_time_in_seconds)
        new_data = {'agora_token': token, 'channel_name':channel_name}
        serializer = self.get_serializer(data=new_data)
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
            print("created")
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.data, status=status.HTTP_200_OK)


class GetMeetingViewSet(ModelViewSet):
    serializer_class = MeetingSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = Meeting.objects.all()

    def retrieve(self, request, pk=None):
        queryset = Meeting.objects.filter(id=pk)
        my_object = queryset.first()
        if my_object is None:
            return Response(status=404)

        serializer = MeetingSerializer(my_object)
        return Response(serializer.data)
    
class GetParticipantUserInfoViewSet(ModelViewSet):
    serializer_class = UserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = User.objects.all()
    print("hello")
    def retrieve(self, request, pk=None):
        print("primarey key for part id id" + pk)
        queryset = User.objects.filter(id=pk)
        my_object = queryset.first()
        if my_object is None:
            return Response(status=404)

        serializer = UserSerializer(my_object)
        return Response(serializer.data)


class GetMeetingUserViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = MeetingUser.objects.all()

    def retrieve(self, request, pk=None):
        queryset = MeetingUser.objects.filter(meeting=pk, is_host= True)
        my_object = queryset.first()
        if my_object is None:
            return Response(status=404)

        serializer = MeetingUserSerializer(my_object)
        return Response(serializer.data)


class GetMeetingUserParticipantViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = MeetingUser.objects.all()

    def retrieve(self, request, pk=None):
        print(pk)
        queryset = MeetingUser.objects.filter(agora_id=pk)
        my_object = queryset.first()
        if my_object is None:
            return Response(status=404)

        serializer = MeetingUserSerializer(my_object)
        return Response(serializer.data)
    
class CheckDeparturesViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = MeetingUser.objects.all()

    def retrieve(self, request, pk=None):
        print(pk)
        queryset = MeetingUser.objects.filter(meeting_id=pk,is_removed=False,left_time__isnull=False )
        my_object = queryset.last()
        if my_object is None:
            return Response([])

        serializer = MeetingUserSerializer(my_object)
        return Response(serializer.data)


class GetMeetingUserInfoViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        user_id = request.data.get("userId")
        channel_id = request.data.get("channelId")
        agora_id = request.data.get("agoraToken")
        print(type(channel_id))
        user_meeting_queryset = MeetingUser.objects.filter(user_id=request.user.id, meeting_id=channel_id,agora_id=agora_id)
        if not user_meeting_queryset.exists():
            return Response({'status': 'MeetingUser not found'}, status=404)
        user_meeting = user_meeting_queryset.first()
        serializer = MeetingUserSerializer(user_meeting)
        return Response(serializer.data)
    
class IsUserLeftViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        channel_id = request.data.get("channelId")
        agora_id = request.data.get("agora_id")
        user_meeting_queryset = MeetingUser.objects.filter(meeting_id=channel_id,agora_id=agora_id)
        if not user_meeting_queryset.exists():
            return Response({'status': 'MeetingUser not found'})
        user_meeting = user_meeting_queryset.first()
        if user_meeting.left_time is None:
            return Response({'status': False})
        return Response({'status': True})



class GetAttentionEmotionScoreViewSet(ModelViewSet):
    serializer_class = AttentionEmotionScoreSerializer,AttentionEmotionScoreAverageSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = AttentionEmotionScore.objects.all()

    def put(self, request, *args, **kwargs):
        meeting_id = request.data.get("channelId")
        time = request.data.get("time")
        time_curr = datetime.strptime(time,'%Y-%m-%dT%H:%M:%S.%fZ')
        one_minute_before = time_curr - timedelta(seconds=20)
        queryset = AttentionEmotionScore.objects.filter( meeting_id=meeting_id, time__gte=one_minute_before)
        if not queryset.exists():
            return Response({'status': 'Attention score not found'})
        attention_score = queryset.all()
        total = sum(at_score.attention_score for at_score in attention_score)
        avg_attention_score = total / len(attention_score)
        
        # Create and save the AttentionEmotionScoreAverage instance
        with transaction.atomic():
            meeting = Meeting.objects.get(id=meeting_id)
            score_average = AttentionEmotionScoreAverage(
                meeting=meeting,
                time_start=one_minute_before,
                time_end=time_curr,
                avg_attention_score=avg_attention_score,
            )
            score_average.save()
        
        # Serialize the AttentionEmotionScore instances and return the response
        serializer = AttentionEmotionScoreSerializer(attention_score, many=True)
        return Response(serializer.data)


class GetPresenterViewSet(ModelViewSet):
    serializer_class = PresenterSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = Presenter.objects.all()

    def put(self, request, *args, **kwargs):
        user_id = request.data.get("userId")
        channel_id = request.data.get("channelId")
        print(type(channel_id))
        presenter_queryset = Presenter.objects.filter(user_id=user_id, meeting_id=channel_id)
        if not presenter_queryset.exists():
            return Response({'status': 'MeetingUser not found'})
        presenter_row = presenter_queryset.last()
        serializer = PresenterSerializer(presenter_row)
        return Response(serializer.data)


class GetScreenShareViewSet(ModelViewSet):
    serializer_class = ScreenShareSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = ScreenShare.objects.all()

    def put(self, request, *args, **kwargs):
        channel_id = request.data.get("channelId")
        agora_id = request.data.get("agora_id")
        queryset = ScreenShare.objects.filter( meeting_id=channel_id, agora_id = agora_id)
        if not queryset.exists():
            return Response({'status':'Not Screenshare'})
        screenshare_row = queryset.first()
        serializer = ScreenShareSerializer(screenshare_row)
        return Response(serializer.data)

class EndScreenShareViewSet(ModelViewSet):
    serializer_class = ScreenShareSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = ScreenShare.objects.all()

    def put(self, request, *args, **kwargs):
        user_id = request.data.get("userId")
        channel_id = request.data.get("channelId")
        agora_id = request.data.get("agoraToken")
        print(agora_id)
        queryset = ScreenShare.objects.filter( meeting_id=channel_id, agora_id = agora_id, user_id=user_id, end_time__isnull=True)
        if not queryset.exists():
            return Response({'status':'Not Ended Screenshare'})
        screenshare_row = queryset.first()
        screenshare_row.end_time = datetime.now()
        screenshare_row.save()
        return Response({'status':'Ended Screenshare'})
    
class EndMeetingViewSet(ModelViewSet):
    serializer_class = MeetingSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = Meeting.objects.all()

    def put(self, request, *args, **kwargs):
        channel_id = request.data.get("channelId")
        queryset = Meeting.objects.filter( id=channel_id, end_time__isnull=True)
        if not queryset.exists():
            return Response({'status':'Not Found Meeting'})
        meeting_row = queryset.first()
        meeting_row.end_time = datetime.now()
        meeting_row.save()
        return Response({'status':'Meeting Ended'})
    
class GetCountScreenShareViewSet(ModelViewSet):
    serializer_class = ScreenShareSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = ScreenShare.objects.all()

    def put(self, request, *args, **kwargs):
        channel_id = request.data.get("channelId")
        queryset = ScreenShare.objects.filter( meeting_id=channel_id, end_time__isnull=True )
        if not queryset.exists():
            return Response(0)
        screenshare_row = queryset.all()
        return Response(len(screenshare_row))

class IsParticipantScreenshareViewSet(ModelViewSet):
    serializer_class = ScreenShareSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = ScreenShare.objects.all()

    def put(self, request, *args, **kwargs):
        channel_id = request.data.get("channelId")
        agora_id = request.data.get("agoraId")
        print(agora_id)
        print(channel_id)
        queryset = ScreenShare.objects.filter( meeting_id=channel_id, agora_id = agora_id)
        if queryset.exists():
            return Response({'status': True})
        else:
            return Response({'status': False})
        return Response(serializer.data)


class UserLeftMeetingViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        print(request.user)
        left_user_id = request.data.get("userId")
        channel_id = request.data.get("channelId")
        agora_id = request.data.get("agoraId")
        print(left_user_id, channel_id, agora_id)
        user_meeting = MeetingUser.objects.get(user_id=left_user_id, meeting_id=channel_id,agora_id=agora_id)

        print(user_meeting)
        if user_meeting.left_time is None:
            print(datetime.now(tz=timezone.utc))
            user_meeting.left_time = datetime.now(tz=timezone.utc)
            user_meeting.save()
            return Response({'status': 'user is kicked out of the meeting'})
        return Response({'status': 'ERROR'})

    
class CreateMeetingUserViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        print(request.data)
        if request.data['is_host'] == "1":
            request.data['is_presenter'] = 1
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()

        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CreatePresenterViewSet(ModelViewSet):
    serializer_class = PresenterSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()

        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.data, status=status.HTTP_200_OK)


class CreateScreenShareViewSet(ModelViewSet):
    serializer_class = ScreenShareSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        print(request.data)
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()

        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.data, status=status.HTTP_200_OK)


class JoinMeetingViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()

        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.data, status=status.HTTP_200_OK)


class RegistrationViewSet(ModelViewSet):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        # print(serializer.is_valid)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        print(user)
        refresh = RefreshToken.for_user(user)
        return Response(status=status.HTTP_201_CREATED)


class ContactViewSet(ModelViewSet):
    serializer_class = ContactFormSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data)

        if serializer.is_valid():
            serializer.save()
            message = request.data.get("message")
            category = request.data.get("category")
            message = "Sender: " + request.data.get("email") + "\n\n" + message
            send_email(category, message)

            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileViewSet(ModelViewSet):
    serializer_class = ProfileSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['post', 'get', 'patch']

    def create(self, request):
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request):
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.update()
            return Response(data=serializer.data, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        serializer = ProfileSerializer(Profile)
        return Response(serializer.data)

    def get_queryset(self):
        try:
            return self.request.user.profile
        except TokenError as e:
            raise InvalidToken(e.args[0])


class GetAllMeetingParticipantsViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = MeetingUser.objects.all()

    def retrieve(self, request, pk=None):
        print("primary key is " + pk)
        queryset = MeetingUser.objects.filter(meeting_id=pk)
        print(queryset)
        if not queryset.exists():
            return Response(status=404)

        serializer = MeetingUserSerializer(queryset, many=True)
        return Response(serializer.data)
    
class GetSpecificAnalysisReportViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        meeting_user_id = request.data.get("id")
        user_id = request.data.get("userId")
        channel_id = request.data.get("channelId")
        agora_id = request.data.get("agora_id")
        print(user_id)
        print(channel_id)
        print(agora_id)
        user_meeting = MeetingUser.objects.get(id=meeting_user_id,user_id=user_id, meeting_id=channel_id,agora_id=agora_id)
        if user_meeting is not None:
            #create report
            #get meeting info
            meeting =  Meeting.objects.filter(id=channel_id)
            #find the host of the meeting, presenter and other participants
            host_query = MeetingUser.objects.filter(meeting_id=channel_id,is_host=True)
            participants_query = MeetingUser.objects.filter(meeting_id=channel_id,is_host=False)
            user_info_host = User.objects.filter(id=host_query.first().user_id)
            presenters = Presenter.objects.filter(meeting_id=channel_id)
            #find all polls in this meeting
            polls = Poll.objects.filter(meeting_id=channel_id)
            poll_questions =[]
            poll_options_and_counts=[]
            for poll in polls:
                poll_questions.append(poll.question_body)
                #for this question find options and counts
                poll_options ={}
                poll_options_query = Options.objects.filter(poll_id=poll.id)
                for option in poll_options_query:
                    poll_options[option.option_body]=option.count
                poll_options_and_counts.append(poll_options)

            presenter_names=[]
            presenter_emails=[]
            presenter_start_times=[]
            presenter_end_times=[]
            for presenter in presenters:
                user_info_presenters=  User.objects.filter(id=presenter.user_id)
                presenter_names.append(user_info_presenters.get().username)
                presenter_emails.append(user_info_presenters.get().email)
                presenter_start_times.append(presenter.start_time)
                presenter_end_times.append(presenter.end_time)
            #get participant related information
            participant_names=[]
            participant_emails=[]
            participant_join_times=[]
            participant_left_times=[]
            participant_alert_nums =[]
            for participant in participants_query:
                user_info_participants=  User.objects.filter(id=participant.user_id)
                participant_names.append(user_info_participants.get().username)
                participant_emails.append(user_info_participants.get().email)
                participant_join_times.append(participant.join_time)
                participant_left_times.append(participant.left_time)
                participant_alert_nums.append(participant.alert_num)
            #get total average attention and emotion score
            emotions =[0,0,0,0,0,0,0]
            emotion_name = ['Sad','Angry','Surprise','Fear','Happy','Disgust','Neutral']
            total_avg_attention = AttentionEmotionScore.objects.filter(meeting_id=channel_id)
            points_for_attention_graph = AttentionEmotionScoreAverage.objects.filter(meeting_id=channel_id)
            show_atttention_anlaysis= True
            if len(total_avg_attention)==0 or len(points_for_attention_graph) == 0:
                show_atttention_anlaysis =False
                print(show_atttention_anlaysis)
            elif total_avg_attention and points_for_attention_graph is not None:
                total = 0
                attention_graph_points = []
                attention_graph_points_average = []
                for attention in total_avg_attention:
                    total = total + attention.attention_score
                    emotions[attention.emotion] = emotions[attention.emotion] +1
                    point = {'attention_score': attention.attention_score, 'time': attention.time}
                    attention_graph_points.append(point)
                for points in points_for_attention_graph:
                    point ={'attention_score':points.avg_attention_score,'time_start':points.time_start,'time_end':points.time_end}
                    attention_graph_points_average.append(point)
                max_index = emotions.index(max(emotions))
                attention_graph_points = sorted(attention_graph_points, key=lambda point: point['time'])
                attention_graph_points_average = sorted(attention_graph_points_average, key=lambda point: point['time_start'])
                print(attention_graph_points_average)
                average_attention=0
                avg_emotion='Not available'
                if len(total_avg_attention) != 0: 
                    average_attention = total /len(total_avg_attention)
                    avg_emotion = emotion_name[max_index]
                    
                avg_attention= average_attention * 100/3
                #find total average emotion score

                if len(total_avg_attention) != 0: 
                    average_attention = total /len(total_avg_attention)
                    avg_emotion = emotion_name[max_index]
                    
                avg_attention= average_attention * 100/3
            if show_atttention_anlaysis:
                meeting_report = {'start_time':meeting.first().start_time, 'end_time':meeting.first().end_time,'join_time': user_meeting.join_time,
                                    'user_left_time':user_meeting.left_time, 'host_username':user_info_host.get().username, 'host_email':user_info_host.get().email,
                                    'presenter_names': presenter_names, 'presenter_emails': presenter_emails,'average_attention':avg_attention, 'average_emotion': avg_emotion,
                                        'attention_graph_points':attention_graph_points,'attention_graph_points_average':attention_graph_points_average,'emotions':emotions, 'presenter_start_times':presenter_start_times,
                                            'presenter_end_times':presenter_end_times, 'participant_names':participant_names,'participant_emails':participant_emails,'participant_join_times':participant_join_times,'participant_left_times':participant_left_times,'participant_alert_nums':participant_alert_nums,
                                                'poll_questions':poll_questions,'poll_options_and_counts':poll_options_and_counts}
            else:
                meeting_report = {'start_time':meeting.first().start_time, 'end_time':meeting.first().end_time,'join_time': user_meeting.join_time,
                                    'user_left_time':user_meeting.left_time, 'host_username':user_info_host.get().username, 'host_email':user_info_host.get().email,
                                    'presenter_names': presenter_names, 'presenter_emails': presenter_emails, 'presenter_start_times':presenter_start_times,'presenter_end_times':presenter_end_times,
                                    'participant_names':participant_names,'participant_emails':participant_emails,'participant_join_times':participant_join_times,'participant_left_times':participant_left_times,'participant_alert_nums':participant_alert_nums,
                                        'poll_questions':poll_questions,'poll_options_and_counts':poll_options_and_counts}

            #find total average emotion score
            # create a new PDF file
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="meeting_reports.pdf"'
            pdf = canvas.Canvas(response)
            # create a new PDF document with ReportLab
            # write the reports to the PDF file
            y = 750
            pdf.setFont("Helvetica", 14)
            pdf.drawString(100, y, f"General Meeting Information")
            y -= 20

            start_time = meeting_report['start_time']
            pdf.setFont("Helvetica", 12)
            new_date_format = "%d-%m-%Y %H:%M:%S"
            formatted_start_time = start_time.strftime(new_date_format)
            pdf.drawString(100, y, f"Meeting start time: {formatted_start_time}")
            y -= 20

            end_time = meeting_report['end_time']
            formatted_end_time = end_time.strftime(new_date_format)
            pdf.drawString(100, y, f"Meeting end time: {formatted_end_time}")
            y -= 20

            host_user_name = meeting_report['host_username']
            host_email = meeting_report['host_email']
            pdf.drawString(100, y, f"Host of the meeting (name): {host_user_name}, (email): {host_email}")
            y -= 20

            join_time = meeting_report['join_time']
            formatted_join_time = join_time.strftime(new_date_format)
            pdf.drawString(100, y, f"The time you join to the meeting: {formatted_join_time}")
            y -= 20

            left_time = meeting_report['user_left_time']
            formatted_left_time = left_time.strftime(new_date_format)
            pdf.drawString(100, y, f"The time you left the meeting: {formatted_left_time}")
            y -= 20

            y-=40

            pdf.setFont("Helvetica", 14)
            pdf.drawString(100, y, f"Presenters")
            y -= 20

            pdf.setFont("Helvetica", 12)
            presenter_names = meeting_report['presenter_names']
            presenter_emails = meeting_report['presenter_emails']
            presenter_start_times = meeting_report['presenter_start_times']
            presenter_end_times = meeting_report['presenter_end_times']
            for name, email,start_time,end_time in zip(presenter_names,presenter_emails,presenter_start_times,presenter_end_times):
                formatted_start_time = start_time.strftime(new_date_format)
                formatted_end_time = end_time.strftime(new_date_format)
                pdf.drawString(100, y, f"Presenter (name): {name}, (email): {email}")
                y -= 20
                pdf.drawString(100, y, f"Presenter start time: {formatted_start_time}, end time: {formatted_end_time}")
                y -= 30
            
            y-=40
            pdf.setFont("Helvetica", 14)
            
            if show_atttention_anlaysis:
                pdf.drawString(100, y, f"Attention and Emotion Scores")
                y -= 20

                pdf.setFont("Helvetica", 12)
                total_avg_attention_score = meeting_report['average_attention']
                pdf.drawString(100, y, f"The average attention score: {total_avg_attention_score}")
                y -= 20

                total_avg_emotion_score = meeting_report['average_emotion']
                pdf.drawString(100, y, f"The most common emotion during the meeting: {total_avg_emotion_score}")
                

                emotions=  meeting_report['emotions']
                y-= 40
                #draw attention graph
                pdf.setFont("Helvetica", 14)
                pdf.drawString(100, y, f"Attention Graph")
                y -= 330
                drawing = Drawing(width=500, height=300)
                # your existing code
                x_values = [datetime.strptime(point['time_end'], '%Y-%m-%d %H:%M:%S.%f').timestamp() for point in attention_graph_points_average]
                reverse_x_values = [datetime.fromtimestamp(timestamp) for timestamp in x_values]
                x_labels = [dt.strftime("%Y-%m-%d %H:%M:%S") for dt in reverse_x_values]
                y_values = [point['attention_score'] for point in attention_graph_points_average]   
                print(x_values)
                print(y_values)

                lp = LinePlot()
                lp.x = 50
                lp.y = 50
                lp.width = 400
                lp.height = 200
                lp.data = [list(zip(x_values, y_values))]
                lp.lines[0].symbol = makeMarker('FilledCircle')
                lp.lines[0].strokeWidth = 2
                lp.lines[0].strokeColor = colors.blue
                lp.xValueAxis.labelTextFormat = '%2.1f'
                
                drawing.add(lp)
                drawing.add(lp)
                drawing.drawOn(pdf, 50, y,450)
                    
                pdf.showPage()
                y+=650
                #emotion pie
                pdf.setFont("Helvetica", 14)
                pdf.drawString(100, y, f"Emotion Graph")
                y-=300
                d = Drawing(300, 200)
                pc = Pie()
                pc.x = 200
                pc.y = 15
                pc.width = 200
                pc.height = 200
                pc.data = emotions
                pc.labels = ['Sad','Angry','Surprise','Fear','Happy','Disgust','Neutral']
                pc.slices[3].fontColor = colors.red
                d.add(pc)
                d.drawOn(pdf, 0, y,50)
                #legend part
                legend = Legend()
                legend.alignment = 'right'
                legend.x = 100
                legend.y = 0
                legend.colorNamePairs = [(pc.slices[i].fillColor, pc.labels[i]) for i in range(len(pc.labels))]
                d.add(legend)
                d.drawOn(pdf, 0, y,50)
                y-=100
            #more detailed informations (alerts, poll and results,all particapants)
            pdf.setFont("Helvetica", 14)
            pdf.drawString(100, y, f"Participants")
            y -= 20

            pdf.setFont("Helvetica", 12)
            participant_names = meeting_report['participant_names']
            participant_emails = meeting_report['participant_emails']
            participant_join_times = meeting_report['participant_join_times']
            participant_left_times = meeting_report['participant_left_times']
            participant_alert_nums = meeting_report['participant_alert_nums']
            for name, email,join_time,left_time,alert_num in zip(participant_names,participant_emails,participant_join_times,participant_left_times,participant_alert_nums):
                formatted_join_time = join_time.strftime(new_date_format)
                formatted_left_time = left_time.strftime(new_date_format)
                pdf.drawString(100, y, f"Participant (name): {name}, (email): {email}")
                y -= 20
                pdf.drawString(100, y, f"Participant join time: {formatted_join_time}, left time: {formatted_left_time}")
                y -= 20
                if alert_num != 0:
                    pdf.drawString(100, y, f"This participant is alerted {alert_num} times")
                    y -= 30
            y-=20
            #poll related information

           
            poll_questions = meeting_report['poll_questions']
            if len(poll_questions)!=0:
                pdf.setFont("Helvetica", 14)
                pdf.drawString(100, y, f"Polls")
                y -= 20
                pdf.setFont("Helvetica", 12)
                poll_options_and_counts = meeting_report['poll_options_and_counts']
                for question, options_and_counts in zip(poll_questions,poll_options_and_counts):
                    pdf.drawString(100, y, f"Poll question: {question}")
                    y -= 20
                    print(question)
                    print(options_and_counts)
                    for option,count in options_and_counts.items():
                        print(option)
                        print(count)
                        pdf.drawString(100, y, f"*{option}, count: {count}")
                        y -= 20
            # save the PDF file and return the response
            pdf.save()
            return response
        return Response({'status': 'ERROR'})  

class GetAnalysisReportsViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']

    def retrieve(self, request, pk=None):
        print("primary key is " + pk)
        #take all of the meetings that this user can access
        queryset_meeting_user =  MeetingUser.objects.filter(user_id=pk,access_report=True)
        if queryset_meeting_user is not None:
            reports =[]
            for meeting_user in queryset_meeting_user:
                #get the start time and end time of the meeting
                meeting =  Meeting.objects.filter(id=meeting_user.meeting_id)
               
                #find the host of the meeting
                host_query = MeetingUser.objects.filter(meeting_id=meeting_user.meeting_id,is_host=True)
                user_info_host = User.objects.filter(id=host_query.get().user_id)
                presenters = Presenter.objects.filter(meeting_id=meeting_user.meeting_id)
                presenter_names=[]
                presenter_emails=[]
                for presenter in presenters:
                    user_info_presenters=  User.objects.filter(id=presenter.user_id)
                    presenter_names.append(user_info_presenters.get().username)
                    presenter_emails.append(user_info_presenters.get().email)
                
                #get total average attention and emotion score
                emotions =[0,0,0,0,0,0,0]
                emotion_name = ['Sad','Angry','Surprise','Fear','Happy','Disgust','Neutral']
                total_avg_attention = AttentionEmotionScore.objects.filter(meeting_id=meeting_user.meeting_id)
                total = 0
                attention_graph_points = []
                for attention in total_avg_attention:
                    total = total + attention.attention_score
                    emotions[attention.emotion] = emotions[attention.emotion] +1
                    point = {'attention_score': attention.attention_score, 'time': attention.time}
                    attention_graph_points.append(point)
                max_index = emotions.index(max(emotions))
                attention_graph_points = sorted(attention_graph_points, key=lambda point: point['time'])
                print(attention_graph_points)
                average_attention=0
                avg_emotion='Not available'
                if len(total_avg_attention) != 0: 
                    average_attention = total /len(total_avg_attention)
                    avg_emotion = emotion_name[max_index]
                   
                avg_attention= average_attention * 100/3
                #find total average emotion score


                meeting_report = {'start_time':meeting.first().start_time, 'end_time':meeting.first().end_time,'join_time': meeting_user.join_time,
                                  'user_left_time':meeting_user.left_time, 'host_username':user_info_host.get().username, 'host_email':user_info_host.get().email,
                                   'presenter_names': presenter_names, 'presenter_emails': presenter_emails,'average_attention':avg_attention, 'average_emotion': avg_emotion,
                                    'attention_graph_points':attention_graph_points,'emotions':emotions }
                reports.append(meeting_report)

            # create a new PDF file
            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="meeting_reports.pdf"'
            pdf = canvas.Canvas(response)
            # create a new PDF document with ReportLab
            # write the reports to the PDF file
            y = 700
            for report in reports:
                pdf.setFont("Helvetica", 14)
                pdf.drawString(100, y, f"General Meeting Information")
                y -= 20
                
                start_time = report['start_time']
                pdf.setFont("Helvetica", 12)
                pdf.drawString(100, y, f"Meeting start time: {start_time}")
                y -= 20

                end_time = report['end_time']
                pdf.drawString(100, y, f"Meeting end time: {end_time}")
                y -= 20

                host_user_name = report['host_username']
                host_email = report['host_email']
                pdf.drawString(100, y, f"Host of the meeting (name): {host_user_name}, (email): {host_email}")
                y -= 20

                join_time = report['join_time']
                pdf.drawString(100, y, f"The time you join to the meeting: {join_time}")
                y -= 20

                left_time = report['user_left_time']
                pdf.drawString(100, y, f"The time you left the meeting: {left_time}")
                y -= 20

                y-=40

                pdf.setFont("Helvetica", 14)
                pdf.drawString(100, y, f"Presenters")
                y -= 20

                pdf.setFont("Helvetica", 12)
                presenter_names = report['presenter_names']
                presenter_emails = report['presenter_emails']
                for name, email in zip(presenter_names,presenter_emails):
                    pdf.drawString(100, y, f"Presenter (name): {name}, (email): {email}")
                    y -= 20
                
                y-=40
                pdf.setFont("Helvetica", 14)
                pdf.drawString(100, y, f"Attention and Emotion Scores")
                y -= 20

                pdf.setFont("Helvetica", 12)
                total_avg_attention_score = report['average_attention']
                pdf.drawString(100, y, f"The average attention score: {total_avg_attention_score}")
                y -= 20

                total_avg_emotion_score = report['average_emotion']
                pdf.drawString(100, y, f"The most common emotion during the meeting: {total_avg_emotion_score}")
                y -= 400
                
                emotions=  report['emotions']
                #draw attention graph
                pdf.setFont("Helvetica", 14)
                pdf.drawString(100, y, f"Attention Graph")
                drawing = Drawing(width=500, height=300)
                # your existing code
               
                x_values = [datetime.strptime(point['time'], '%Y-%m-%d %H:%M:%S.%f').timestamp() for point in attention_graph_points]
                reverse_x_values = [datetime.fromtimestamp(timestamp) for timestamp in x_values]
                x_labels = [dt.strftime("%Y-%m-%d %H:%M:%S") for dt in reverse_x_values]
                y_values = [point['attention_score'] for point in attention_graph_points]   
                print(x_values)
                print(y_values)

                lp = LinePlot()
                lp.x = 50
                lp.y = 50
                lp.width = 400
                lp.height = 200
                lp.data = [list(zip(x_values, y_values))]
                lp.lines[0].symbol = makeMarker('FilledCircle')
                lp.lines[0].strokeWidth = 2
                lp.lines[0].strokeColor = colors.blue
                lp.xValueAxis.labelTextFormat = '%2.1f'
               
                drawing.add(lp)
                drawing.add(lp)
                drawing.drawOn(pdf, 50, y,450)
                
                pdf.showPage()
                y+=600
                #emotion pie
                pdf.drawString(100, 800, f"Emotion Graph")
                y-=100
                d = Drawing(300, 200)
                pc = Pie()
                pc.x = 200
                pc.y = 15
                pc.width = 200
                pc.height = 200
                pc.data = emotions
                pc.labels = ['Sad','Angry','Surprise','Fear','Happy','Disgust','Neutral']
                pc.slices[3].fontColor = colors.red
                pc.slices[3].fontSize = 26
                d.add(pc)
                #legend part
                legend = Legend()
                legend.alignment = 'right'
                legend.x = 10
                legend.y = 70
                legend.colorNamePairs = [(pc.slices[i].fillColor, pc.labels[i]) for i in range(len(pc.labels))]
                d.add(legend)
                d.drawOn(pdf, 0, y,50)
             
            # save the PDF file and return the response
            pdf.save()
        else:
            response = []
        return response


class GetAnalysisReportsNameViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = MeetingUser.objects.all()

    def retrieve(self, request, pk=None):
        print("primary key is " + pk)
        queryset = MeetingUser.objects.filter(user_id=pk, access_report=True)
        print(queryset)
        if not queryset.exists():
            return Response(status=204)

        serializer = MeetingUserSerializer(queryset, many=True)
        return Response(serializer.data)


class CreatePollViewSet(ModelViewSet):
    serializer_class = PollSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        print(request.data, flush= True)
        user_id = request.data.get("user")
        meeting_id = request.data.get("meeting")
        question_body = request.data.get("question")
        options = request.data.get("options")

        poll_data = {'meeting': meeting_id, 'user':user_id, 'creator': user_id, 'question_body': question_body}
        poll_serializer = PollSerializer(data=poll_data)
        try:
            poll_serializer.is_valid(raise_exception=True)
            poll = poll_serializer.save()
        except TokenError as e:
            raise InvalidToken(e.args[0])
        
        for option in options:
            options_data = {'poll': poll.pk, 'option_body':option}
            options_serializer = OptionsSerializer(data=options_data)
            try:
                options_serializer.is_valid(raise_exception=True)
                options_serializer.save()
            except TokenError as e:
                raise InvalidToken(e.args[0])
        
        queryset = MeetingUser.objects.filter(meeting=meeting_id, is_presenter= False)

        if queryset is not None:
            for meeting_user in queryset:
                meeting_user.latest_poll = poll.pk
                meeting_user.save()

        return Response(status=202)

class GetPollViewSet(ModelViewSet):
    serializer_class = PollSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = Poll.objects.all()

    def retrieve(self, request, pk=None):
        queryset = Poll.objects.filter(id=pk)
        poll = queryset.first()

        options = Options.objects.filter(poll_id=pk)
        options_strings = []
        if options is not None:
            for option in options:
                options_strings.append(option.option_body)
        resp = {'poll_id':pk, 'question_body': poll.question_body,'option1' :options_strings[0],'option2':options_strings[1],'option3':options_strings[2]}

        return Response(resp)

class AnswerPollViewSet(ModelViewSet):
    serializer_class = OptionsSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = Options.objects.all()

    def put(self, request, *args, **kwargs):
        poll_id = request.data.get("poll_id")
        selection = request.data.get("selected_option")
        option = Options.objects.filter(poll=poll_id, option_body=selection).first()
        if option is not None:
            option.count = option.count + 1
            option.save()
            return Response({'status': 'answer saved'})
        else:
            return Response({'status': 'option could not found'})

class GetLatestPollViewSet(ModelViewSet):
    serializer_class = PollSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']
    queryset = Poll.objects.all()

    def retrieve(self, request, pk=None):
        queryset = Poll.objects.filter(meeting=pk)
        poll = queryset.last()
        if poll is not None:
            options = Options.objects.filter(poll=poll)
            resp = {'question_body': poll.question_body}
            results = [["Options", "Counts"]]
            for option in options:
                results.append([option.option_body, int(option.count)])
            resp['poll_results'] = results
            return Response(resp)
        else:
            return Response({'status': 404})