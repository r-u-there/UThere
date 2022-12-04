from django.urls import path, include
from . import views

urlpatterns = [
    path('api/', include(('MyAuth.routers', 'MyAuth'), namespace='auth-api')),

]
