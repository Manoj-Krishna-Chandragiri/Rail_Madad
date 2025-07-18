# Generated by Django 5.1.6 on 2025-06-23 12:03

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('complaints', '0013_remove_complaint_assigned_at_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuickSolution',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('problem', models.CharField(max_length=200)),
                ('solution', models.TextField()),
                ('category', models.CharField(max_length=100)),
                ('resolution_time', models.CharField(max_length=50)),
                ('success_rate', models.FloatField(default=0.0)),
                ('usage_count', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='ClassificationResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('predicted_category', models.CharField(max_length=100)),
                ('confidence', models.FloatField()),
                ('is_approved', models.BooleanField(default=False)),
                ('manual_category', models.CharField(blank=True, max_length=100, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('approved_by', models.CharField(blank=True, max_length=100, null=True)),
                ('complaint', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='complaints.complaint')),
            ],
        ),
        migrations.CreateModel(
            name='SupportSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_name', models.CharField(max_length=100)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Waiting', 'Waiting'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')], default='Waiting', max_length=20)),
                ('session_type', models.CharField(choices=[('Chat', 'Chat'), ('Voice', 'Voice'), ('Video', 'Video')], default='Chat', max_length=10)),
                ('issue_description', models.TextField()),
                ('start_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('duration', models.DurationField(blank=True, null=True)),
                ('rating', models.IntegerField(blank=True, null=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('agent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='complaints.staff')),
            ],
        ),
    ]
