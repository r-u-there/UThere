from django.db import models

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid


class UserManager(BaseUserManager):

    def create_user(self, username, email, password=None, **kwargs):
        """Create and return a `User` with an email, phone number, username and password."""
        if username is None:
            raise TypeError('Users must have a username.')
        if email is None:
            raise TypeError('Users must have an email.')

        user = self.model(username=username, email=self.normalize_email(email))
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, username, email, password):
        """
        Create and return a `User` with superuser (admin) permissions.
        """
        if password is None:
            raise TypeError('Superusers must have a password.')
        if email is None:
            raise TypeError('Superusers must have an email.')
        if username is None:
            raise TypeError('Superusers must have an username.')

        user = self.create_user(username, email, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)

        return user


class Settings(models.Model):
    attention_limit = models.DecimalField(max_digits=10, decimal_places=2, default=50)
    get_analysis_report = models.BooleanField(default=True)
    hide_real_time_emotion_analysis = models.BooleanField(default=False)
    hide_real_time_attention_analysis = models.BooleanField(default=False)
    hide_real_time_analysis = models.BooleanField(default=False)
    hide_who_left = models.BooleanField(default=False)
    hide_eye_tracking = models.BooleanField(default=False)


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=300)
    email = models.EmailField(db_index=True, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    settings = models.OneToOneField(Settings, on_delete=models.CASCADE, related_name="user_settings", null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def __str__(self):
        return f"{self.email}"


class ContactForm(models.Model):
    message = models.CharField(max_length=250)
    # CATEGORY_CHOICES = [
    #     'Error',
    #     'Request',
    #     'Other'
    # ]
    category = models.CharField(max_length=250)

    def __str__(self):
        return self.message


class Profile(models.Model):
    full_name = models.CharField(max_length=50, null=True, blank=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.full_name


class Meeting(models.Model):
    agora_token = models.TextField(max_length=500)
    channel_name = models.TextField(max_length=500, default = "")
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True)


class MeetingUser(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    agora_id = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_host = models.BooleanField(default=False)
    is_presenter = models.BooleanField(default=False)
    join_time = models.DateTimeField(auto_now_add=True)
    left_time = models.DateTimeField(blank=True, null=True, auto_now_add=False)
    is_removed = models.BooleanField(default=False)
    alert_num = models.DecimalField(max_digits=10, decimal_places=0, default=0)


class Presenter(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True)


class AttentionScores(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    time = models.DateTimeField()
    attention_score = models.DecimalField(max_digits=10, decimal_places=2, default=0)


class Poll(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    creator = models.ForeignKey(Presenter, on_delete=models.CASCADE)
    question_body = models.TextField(max_length=500, default="")


class Options(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE)
    option_body =  models.CharField( max_length= 250, default="")
    count = models.IntegerField(default=0)