# Generated by Django 4.1.5 on 2023-04-25 16:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MyAuth', '0007_meetinguser_is_removed'),
    ]

    operations = [
        migrations.AddField(
            model_name='meetinguser',
            name='alert_num',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]