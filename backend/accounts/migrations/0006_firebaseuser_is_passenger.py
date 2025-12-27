# Generated manually to add is_passenger field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_auto_20251003_1153'),
    ]

    operations = [
        migrations.AddField(
            model_name='firebaseuser',
            name='is_passenger',
            field=models.BooleanField(default=True),
        ),
    ]
