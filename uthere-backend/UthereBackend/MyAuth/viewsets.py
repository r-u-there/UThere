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
from .serializers import UserSerializer, LoginSerializer, RegisterSerializer, ContactFormSerializer, ProfileSerializer
from .models import User, Profile
from django.contrib.auth import authenticate, login
from django.shortcuts import get_object_or_404


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
            print(request.user)
            print(username)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)

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



