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
    MeetingSerializer, MeetingUserSerializer, SettingsSerializer
from .models import User, Profile, Meeting, Settings, MeetingUser
from django.contrib.auth import authenticate, login
from .sendmail import send_email
from agora_token_builder import RtcTokenBuilder
import secrets
import string
import time
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token



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
        }
        return Response(data)


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
            user.email = new_email
            user.save()
            return Response({'status': 'email updated'})
        elif changed_info == "password":
            new_password = request.data.get("newInfo")
            user.set_password(new_password)
            user.save()
            return Response({'status': 'password updated'})

        return Response({'status': 'ERROR'})


class UserKickedMeetingViewSet(ModelViewSet):
    serializer_class = MeetingUserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        left_user_id = request.data.get("userId")
        channel_id= request.data.get("channelId")
        user_meeting = MeetingUser.objects.get(agora_id=left_user_id, meeting_id=channel_id)
 
        if user_meeting.left_time == None:
            user_meeting.left_time = timezone.now().date()
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
        user_meeting = MeetingUser.objects.get(agora_id=presenter_user_id, meeting_id=channel_id)
        if user_meeting.is_presenter == 0:
            user_meeting.is_presenter = True
            user_meeting.save()
            return Response({'status': 'user become presenter'})
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
        user_meeting = MeetingUser.objects.get(agora_id=presenter_user_id, meeting_id=channel_id)
        if user_meeting.is_presenter == 1:
            user_meeting.is_presenter = False
            user_meeting.save()
            return Response({'status': 'user is unsetted as presenter'})
        return Response({'status': 'ERROR'})


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
        
    
class SettingsViewSet(ModelViewSet):
    serializer_class = SettingsSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = Settings.objects.all()
    http_method_names = ['put', 'patch']

    def update(self, request, *args, **kwargs):
        data = request.data
        serializer = self.serializer_class(data=data)

        print("inside update")
        print(type(data))

        if serializer.is_valid():
            setting = Settings.objects.get(id=request.user.settings_id)
            for key, value in data.items():
                setattr(setting, key, value)
            setting.save()
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
        queryset = MeetingUser.objects.filter(agora_id=pk)
        my_object = queryset.first()
        if my_object is None:
            return Response(status=404)

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
        print(type(channel_id))
        user_meeting_queryset = MeetingUser.objects.filter(user_id=request.user.id, meeting_id=channel_id)
        if not user_meeting_queryset.exists():
            return Response({'status': 'MeetingUser not found'}, status=404)
        user_meeting = user_meeting_queryset.first()
        serializer = MeetingUserSerializer(user_meeting)
        return Response(serializer.data)

    
class CreateMeetingUserViewSet(ModelViewSet):
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



