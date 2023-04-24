from rest_framework.authentication import TokenAuthentication
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework import filters
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.decorators import action
from .serializers import UserSerializer, LoginSerializer, RegisterSerializer, ContactFormSerializer, ProfileSerializer, \
    MeetingSerializer, MeetingUserSerializer, SettingsSerializer
from .models import User, Profile, Meeting, Settings, MeetingUser
from django.contrib.auth import authenticate, login
from django.shortcuts import get_object_or_404
from .sendmail import send_email
from agora_token_builder import RtcTokenBuilder
import secrets
import string
import time
from django.utils import timezone

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


class UserInfoViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['get']
    queryset = User.objects.all()

    def retrieve(self, request, pk=None):
        print("primary key is " + pk)
        queryset = User.objects.filter(id=pk, is_active=True)
        my_object = queryset.first()

        if my_object is None:
            return Response(status=404)

        serializer = UserSerializer(my_object)
        return Response(serializer.data)
    
class UserUpdateViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = UserSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['put']
    queryset = User.objects.all()

    def put(self, request, *args, **kwargs):
     
        user_id = request.data.get("userId")
        changed_info = request.data.get("changedInfo")
        user = User.objects.get(pk=user_id)
        print("changed Info is " + changed_info)
        if(changed_info =="full name"):
            new_username = request.data.get("newInfo")
            user.username = new_username
            user.save()
            return Response({'status': 'username updated'})
        elif( changed_info == "email"):
            new_email = request.data.get("newInfo")
            user.email = new_email
            user.save()
            return Response({'status': 'email updated'})
        elif( changed_info == "password"):
            new_password = request.data.get("newInfo")
            user.password = new_password
            user.save()
            return Response({'status': 'password updated'})
        return Response({'status': 'ERROR'})
    
class UserKickedMeetingViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = MeetingUserSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        left_user_id = request.data.get("userId")
        channel_id= request.data.get("channelId")
        print("left user id is " + str(left_user_id))
        print("channel id is " + str(channel_id))
        user_meeting = MeetingUser.objects.get(agora_id=left_user_id, meeting_id= channel_id)
 
        if user_meeting.left_time == None:
            user_meeting.left_time = timezone.now().date()
            user_meeting.is_removed = True
            user_meeting.save()
            return Response({'status': 'user is kicked out of the meeting'})
        return Response({'status': 'ERROR'})


class SettingsViewSet(ModelViewSet):
    serializer_class = SettingsSerializer
    permission_classes = (AllowAny,)
    queryset = Settings.objects.all()
    http_method_names = ['put']

    def update(self, request, *args, **kwargs):
        data = request.data
        print(data)
        return super().update(request, *args, **kwargs)


class GetSettingsViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = SettingsSerializer
    permission_classes = (AllowAny,)
    queryset = Settings.objects.all()

    def retrieve(self, request, pk=None):
        user = User.objects.get(id=pk, is_active=True)

        if user is None:
            return Response(status=404)
        serializer = SettingsSerializer(user.settings)
        print(serializer.data)
        return Response(serializer.data)


class LoginViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = LoginSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            username = request.data['email']
            password = request.data['password']
            user = authenticate(request, username=username, password=password)
            login(request, user)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    
class CreateMeetingViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = MeetingSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        print("girdiii")
        appId = request.data.get("appId")
        certificate = request.data.get("certificate")
        uid = request.data.get("uid")
        role = request.data.get("role")
        #create random channel name
        alphabet = string.ascii_letters + string.digits
        channelName = ''.join(secrets.choice(alphabet) for i in range(6))
        privilegeExpiredTs = request.data.get("privilegeExpiredTs")
        expiration_time_in_seconds = int(time.time()) + 1440 * 60
        token = RtcTokenBuilder.buildTokenWithUid(appId, certificate, channelName, 0, role, expiration_time_in_seconds)
        print("uid is " + str(uid))
        print("channel name is " + channelName)
        print("token is " + token)
        print("expiration " + str(expiration_time_in_seconds))
        print( request.data)
        new_data = {'agora_token': token, 'channel_name':channelName}
        serializer = self.get_serializer(data=new_data)
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.data, status=status.HTTP_200_OK)
    
class GetMeetingViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = MeetingSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['get']
    queryset = Meeting.objects.all()

    def retrieve(self, request, pk=None):
        print("primary key is " + pk)
        queryset = Meeting.objects.filter(id=pk)
        my_object = queryset.first()
        print(my_object.agora_token)
        if my_object is None:
            return Response(status=404)

        serializer = MeetingSerializer(my_object)
        return Response(serializer.data)

class GetMeetingUserViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = MeetingUserSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['get']
    queryset = MeetingUser.objects.all()

    def retrieve(self, request, pk=None):
        print("primary key is " + pk)
        queryset = MeetingUser.objects.filter(meeting=pk, is_host= True)
        my_object = queryset.first()
        print(my_object)
        if my_object is None:
            return Response(status=404)

        serializer = MeetingUserSerializer(my_object)
        return Response(serializer.data)
    
class GetMeetingUserParticipantViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = MeetingUserSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['get']
    queryset = MeetingUser.objects.all()

    def retrieve(self, request, pk=None):
        print("primary key is " + pk)
        queryset = MeetingUser.objects.filter(agora_id=pk)
        my_object = queryset.first()
        print(my_object)
        if my_object is None:
            return Response(status=404)

        serializer = MeetingUserSerializer(my_object)
        return Response(serializer.data)
    
class GetMeetingUserInfoViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = MeetingUserSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['put']
    queryset = MeetingUser.objects.all()

    def put(self, request, *args, **kwargs):
        user_id = request.data.get("userId")
        channel_id= request.data.get("channelId")
        print("channel id is " + str(channel_id))
        user_meeting = MeetingUser.objects.get(user_id=user_id, meeting_id= channel_id)
        if user_meeting is None:
            return Response({'status': 'MeetingUser not found'}, status=404)

        serializer = MeetingUserSerializer(user_meeting)
        return Response(serializer.data)

    
class CreateMeetingUserViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = MeetingUserSerializer
    permission_classes = (AllowAny,)
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

class JoinMeetingViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = MeetingUserSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()

        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.data, status=status.HTTP_200_OK)


class RegistrationViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        res = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        return Response({
            "user": serializer.data,
            "refresh": res["refresh"],
            "token": res["access"]
        }, status=status.HTTP_201_CREATED)


class RefreshViewSet(viewsets.ViewSet, TokenRefreshView):
    #permission_classes = (IsAuthenticated,)
    authentication_classes = (TokenAuthentication,)
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class ContactViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = ContactFormSerializer
    permission_classes = (AllowAny,)
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        print(request.data)
        data = request.data
        serializer = self.serializer_class(data=data)

        if serializer.is_valid():
            serializer.save()
            print("saved")
            message = request.data.get("message")
            category = request.data.get("category")
            message = "Sender: " + request.data.get("email") + "\n\n" + message
            print("message is " + message)
            print("category is " + category)
            send_email(category,message)

            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileViewSet(ModelViewSet, TokenObtainPairView):
    serializer_class = ProfileSerializer
    authentication_classes = (TokenAuthentication, SessionAuthentication, BasicAuthentication)
    permission_classes = (AllowAny,)
    http_method_names = ['post', 'get', 'patch']

    def create(self, request):
        print("inside c")
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request):
        print("inside u")

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
            print(self.request.user)
            print(Profile.objects.all())
            return Profile.objects.filter(user=self.request.user)
        except TokenError as e:
            raise InvalidToken(e.args[0])



