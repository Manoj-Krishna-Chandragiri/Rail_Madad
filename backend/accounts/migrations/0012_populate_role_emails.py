# Generated migration to populate email fields
from django.db import migrations


def populate_email_fields(apps, schema_editor):
    """Copy email from FirebaseUser to role tables"""
    from django.db import connection
    
    with connection.cursor() as cursor:
        # Update Admin emails
        cursor.execute("""
            UPDATE accounts_admin a
            JOIN accounts_firebaseuser u ON a.user_id = u.id
            SET a.email = u.email
        """)
        
        # Update Staff emails
        cursor.execute("""
            UPDATE accounts_staff s
            JOIN accounts_firebaseuser u ON s.user_id = u.id
            SET s.email = u.email
        """)
        
        # Update Passenger emails
        cursor.execute("""
            UPDATE accounts_passenger p
            JOIN accounts_firebaseuser u ON p.user_id = u.id
            SET p.email = u.email
        """)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0011_add_email_to_roles'),
    ]

    operations = [
        migrations.RunPython(populate_email_fields, migrations.RunPython.noop),
    ]
