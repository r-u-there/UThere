from django.urls import path, include
from .viewsets import UserInfoViewSet

urlpatterns = [
    path('api/', include(('MyAuth.routers', 'MyAuth'), namespace='auth-api')),
]
