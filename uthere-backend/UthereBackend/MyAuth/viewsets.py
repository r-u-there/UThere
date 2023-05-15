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
    MeetingSerializer, MeetingUserSerializer, SettingsSerializer,PresenterSerializer,AttentionEmotionScoreSerializer, ScreenShareSerializer
from .models import User, Profile, Meeting, Settings, MeetingUser, Presenter,AttentionEmotionScore, ScreenShare
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
        user_meeting_all = MeetingUser.objects.filter( meeting_id=channel_id)
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
        return Response({'status': 'ERROR'})


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

    def retrieve(self, request, pk=None):
        my_object = request.user.settings
        if my_object is None:
            return Response(status=404)

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
    
class GetAttentionEmotionScoreViewSet(ModelViewSet):
    serializer_class = AttentionEmotionScoreSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = AttentionEmotionScore.objects.all()

    def put(self, request, *args, **kwargs):
        meeting_id = request.data.get("channelId")
        time = request.data.get("time")
        time_curr = datetime.strptime(time,'%Y-%m-%dT%H:%M:%S.%fZ')
        #one_minute_before = time_curr -timedelta(minutes=1)
        one_minute_before = time_curr -timedelta(seconds=20)
        print(time_curr)
        print(one_minute_before)
        queryset = AttentionEmotionScore.objects.filter( meeting_id=meeting_id,time__gte=one_minute_before)
        if not queryset.exists():
            return Response({'status': 'Attention score not found'})
        attention_score = queryset.all()
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
                d.add(pc)
                d.drawOn(pdf, 0, y,50)
             
            # save the PDF file and return the response
            pdf.save()
        else:
            response =[]
        return response



