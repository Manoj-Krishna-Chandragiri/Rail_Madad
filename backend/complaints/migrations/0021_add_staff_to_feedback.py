# Generated migration to add staff field to Feedback model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('complaints', '0020_migrate_complaint_assignments'),
    ]

    operations = [
        migrations.AddField(
            model_name='feedback',
            name='staff',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='feedbacks', to='complaints.staff'),
        ),
    ]
