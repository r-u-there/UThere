from django.urls import path, include
from .viewsets import ProfileUpdateViewSet

urlpatterns = [
    path('api/', include(('MyAuth.routers', 'MyAuth'), namespace='auth-api')),
    path('api/profile_all/<pk>', ProfileUpdateViewSet.as_view())
]
