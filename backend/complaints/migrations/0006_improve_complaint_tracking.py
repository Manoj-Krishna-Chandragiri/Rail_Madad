# Generated migration for improved complaint tracking

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('complaints', '0005_staff'),
    ]

    operations = [
        migrations.AddField(
            model_name='complaint',
            name='priority',
            field=models.CharField(
                choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')],
                default='medium',
                max_length=10
            ),
        ),
        migrations.AddField(
            model_name='complaint',
            name='assigned_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='complaint',
            name='first_response_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='complaint',
            name='last_updated_by',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='complaint',
            name='category',
            field=models.CharField(
                choices=[
                    ('technical', 'Technical Issues'),
                    ('service', 'Service Quality'),
                    ('staff', 'Staff Behavior'),
                    ('cleanliness', 'Cleanliness'),
                    ('security', 'Security'),
                    ('infrastructure', 'Infrastructure'),
                    ('accessibility', 'Accessibility'),
                    ('ticketing', 'Ticketing'),
                    ('food', 'Food Services'),
                    ('other', 'Other')
                ],
                default='other',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='complaint',
            name='source',
            field=models.CharField(
                choices=[
                    ('web', 'Web Portal'),
                    ('mobile', 'Mobile App'),
                    ('phone', 'Phone Call'),
                    ('email', 'Email'),
                    ('counter', 'Service Counter'),
                    ('social', 'Social Media')
                ],
                default='web',
                max_length=20
            ),
        ),
        migrations.AlterField(
            model_name='complaint',
            name='status',
            field=models.CharField(
                choices=[
                    ('Open', 'Open'),
                    ('In Progress', 'In Progress'),
                    ('Pending', 'Pending Response'),
                    ('Escalated', 'Escalated'),
                    ('Resolved', 'Resolved'),
                    ('Closed', 'Closed'),
                    ('Reopened', 'Reopened')
                ],
                default='Open',
                max_length=20
            ),
        ),
    ]
