# Generated migration to add email field to role tables
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_migrate_data_to_role_tables'),
    ]

    operations = [
        migrations.AddField(
            model_name='admin',
            name='email',
            field=models.EmailField(max_length=254, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='staff',
            name='email',
            field=models.EmailField(max_length=254, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='passenger',
            name='email',
            field=models.EmailField(max_length=254, default=''),
            preserve_default=False,
        ),
    ]
