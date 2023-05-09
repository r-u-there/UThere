# core/routers.py
from rest_framework.routers import SimpleRouter
from .viewsets import LoginViewSet, RegistrationViewSet, UserViewSet, ContactViewSet, ProfileViewSet, \
    UserInfoViewSet, UserUpdateViewSet, CreateMeetingViewSet, CreateMeetingUserViewSet, SettingsViewSet, \
    GetSettingsViewSet, GetMeetingViewSet, GetMeetingUserViewSet, GetMeetingUserParticipantViewSet, \
    UserKickedMeetingViewSet, GetMeetingUserInfoViewSet, \
    SetPresenterMeetingViewSet, UnsetPresenterMeetingViewSet, AlertUserMeetingViewSet, SignOutViewSet, \
    GetAllMeetingParticipantsViewSet, CreatePresenterViewSet,EndTimePresenterViewSet, GetParticipantUserInfoViewSet

routes = SimpleRouter()

# AUTHENTICATION
routes.register(r'auth/login', LoginViewSet, basename='auth-login')
routes.register(r'auth/logout', SignOutViewSet, basename='auth-logout')
routes.register(r'auth/register', RegistrationViewSet, basename='auth-register')
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
routes.register(r'user_kicked_meeting', UserKickedMeetingViewSet, basename='user-kicked-meeting')
routes.register(r'user_meeting_get_info', GetMeetingUserInfoViewSet, basename='meeting-user-info')
routes.register(r'set_presenter_meeting', SetPresenterMeetingViewSet, basename='set-presenter-meeting')
routes.register(r'unset_presenter_meeting', UnsetPresenterMeetingViewSet, basename='unset-presenter-meeting')
routes.register(r'get_all_meeting_participants', GetAllMeetingParticipantsViewSet, basename='get-all-meeting-participants')
routes.register(r'alert_user_meeting', AlertUserMeetingViewSet, basename='alert-user-meeting')
routes.register(r'create_presenter', CreatePresenterViewSet, basename='create-presenter')
routes.register(r'end_time_presenter_table', EndTimePresenterViewSet, basename='end-time-presenter')
routes.register(r'participant_user_info', GetParticipantUserInfoViewSet, basename='participant_user_info')


urlpatterns = [
    *routes.urls
]

