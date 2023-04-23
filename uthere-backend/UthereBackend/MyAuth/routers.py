# core/routers.py
from rest_framework.routers import SimpleRouter
from .viewsets import LoginViewSet, RegistrationViewSet, RefreshViewSet, UserViewSet, ContactViewSet, ProfileViewSet, \
    UserInfoViewSet, UserUpdateViewSet, CreateMeetingViewSet, CreateMeetingUserViewSet, SettingsViewSet, \
    GetSettingsViewSet,GetMeetingViewSet, GetMeetingUserViewSet, GetMeetingUserParticipantViewSet

routes = SimpleRouter()

# AUTHENTICATION
routes.register(r'auth/login', LoginViewSet, basename='auth-login')
routes.register(r'auth/register', RegistrationViewSet, basename='auth-register')
routes.register(r'auth/refresh', RefreshViewSet, basename='auth-refresh')
routes.register(r'contact', ContactViewSet, basename='contact')
routes.register(r'profile', ProfileViewSet, basename='profile')
routes.register(r'settings', SettingsViewSet, basename='settings')
routes.register(r'getsettings', GetSettingsViewSet, basename='get_settings')

# USER
#routes.register(r'user', UserViewSet, basename='user')
routes.register(r'user/info', UserInfoViewSet, basename='user-info')
routes.register(r'user/update', UserUpdateViewSet, basename='user-update')

#MEETING
routes.register(r'create_meeting', CreateMeetingViewSet, basename='meeting')
routes.register(r'create_meeting_user', CreateMeetingUserViewSet, basename='meeting-user')
routes.register(r'get_meeting', GetMeetingViewSet, basename='meeting-get')
routes.register(r'get_meeting_user', GetMeetingUserViewSet, basename='meeting-user-get')
routes.register(r'get_meeting_participant', GetMeetingUserParticipantViewSet, basename='meeting-user-get-participant')

urlpatterns = [
    *routes.urls
]

