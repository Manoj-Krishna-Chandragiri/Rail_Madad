# Generated by Django 5.1.6 on 2025-05-12 15:27

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('complaints', '0009_staff_communication_preferences'),
    ]

    operations = [
        migrations.AddField(
            model_name='complaint',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='complaint',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
