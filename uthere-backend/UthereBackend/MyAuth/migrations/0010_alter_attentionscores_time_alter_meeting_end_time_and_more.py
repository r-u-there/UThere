# Generated by Django 4.2.1 on 2023-05-08 13:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MyAuth', '0009_alter_meetinguser_alert_num'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attentionscores',
            name='time',
            field=models.DateTimeField(),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='end_time',
            field=models.DateTimeField(null=True),
        ),
        migrations.AlterField(
            model_name='meeting',
            name='start_time',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='meetinguser',
            name='join_time',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='meetinguser',
            name='left_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='presenter',
            name='end_time',
            field=models.DateTimeField(null=True),
        ),
        migrations.AlterField(
            model_name='presenter',
            name='start_time',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(max_length=300),
        ),
    ]