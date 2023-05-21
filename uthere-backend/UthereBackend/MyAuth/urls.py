from django.urls import path, include
from .views import upload_video

from .viewsets import UserInfoViewSet

urlpatterns = [
    path('api/', include(('MyAuth.routers', 'MyAuth'), namespace='auth-api')),
    path('upload-video/', upload_video, name='upload_video'),

]
