from django.contrib import admin
from .models import User, Profile,Settings, MeetingUser
# Register your models here.
admin.site.register(Settings)
admin.site.register(Profile)
admin.site.register(User)
admin.site.register(MeetingUser)