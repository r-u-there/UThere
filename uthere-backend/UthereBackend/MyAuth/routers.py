# core/routers.py
from rest_framework.routers import SimpleRouter
from .viewsets import LoginViewSet, RegistrationViewSet, UserViewSet, ContactViewSet, ProfileViewSet, \
    UserInfoViewSet, UserUpdateViewSet, CreateMeetingViewSet, CreateMeetingUserViewSet, SettingsViewSet, \
    GetSettingsViewSet, GetMeetingViewSet, GetMeetingUserViewSet, GetMeetingUserParticipantViewSet, \
    UserKickedMeetingViewSet, GetMeetingUserInfoViewSet, \
    SetPresenterMeetingViewSet, UnsetPresenterMeetingViewSet, AlertUserMeetingViewSet, AlertAllUserMeetingViewSet, SignOutViewSet, \
    GetAllMeetingParticipantsViewSet, CreatePresenterViewSet,EndTimePresenterViewSet, GetParticipantUserInfoViewSet, UserLeftMeetingViewSet,RemoveAllUserMeetingViewSet, \
CheckDeparturesViewSet, GetPresenterViewSet, GetAttentionEmotionScoreViewSet, CreateScreenShareViewSet, GetScreenShareViewSet, GetUserInfoViewSet, CreatePollViewSet

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
routes.register(r'alert_all_user_meeting', AlertAllUserMeetingViewSet, basename='alert-all-user-meeting')
routes.register(r'create_presenter', CreatePresenterViewSet, basename='create-presenter')
routes.register(r'end_time_presenter_table', EndTimePresenterViewSet, basename='end-time-presenter')
routes.register(r'participant_user_info', GetParticipantUserInfoViewSet, basename='participant_user_info')
routes.register(r'user_left_meeting', UserLeftMeetingViewSet, basename='user_left_meeting')
routes.register(r'remove_all_user', RemoveAllUserMeetingViewSet, basename='remove_all_user')
routes.register(r'check_departures', CheckDeparturesViewSet, basename='check_departures')
routes.register(r'get_presenter_table', GetPresenterViewSet, basename='get_presenter_table')
routes.register(r'create_poll', CreatePollViewSet, basename='create_poll')
routes.register(r'get_attention_emotion_score', GetAttentionEmotionScoreViewSet, basename='get_emotion_attention')
routes.register(r'create_screenshare', CreateScreenShareViewSet, basename='create_screnshare')
routes.register(r'get_screenshare_table', GetScreenShareViewSet, basename='get_screnshare')
routes.register(r'get_user_info', GetUserInfoViewSet, basename='get_user_info')

urlpatterns = [
    *routes.urls
]

