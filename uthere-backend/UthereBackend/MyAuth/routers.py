# core/routers.py
from rest_framework.routers import SimpleRouter
from .viewsets import LoginViewSet, RegistrationViewSet, RefreshViewSet, UserViewSet, ContactViewSet, ProfileViewSet, UserInfoViewSet, UserUpdateViewSet

routes = SimpleRouter()

# AUTHENTICATION
routes.register(r'auth/login', LoginViewSet, basename='auth-login')
routes.register(r'auth/register', RegistrationViewSet, basename='auth-register')
routes.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh')
routes.register(r'contact', ContactViewSet, basename='contact')
routes.register(r'profile', ProfileViewSet, basename='profile')


# USER
#routes.register(r'user', UserViewSet, basename='user')
routes.register(r'user/info', UserInfoViewSet, basename='user-info')
routes.register(r'user/update', UserUpdateViewSet, basename='user-update')

urlpatterns = [
    *routes.urls
]

