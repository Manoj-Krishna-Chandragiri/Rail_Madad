# Generated migration for database restructuring

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_firebaseuser_is_passenger'),  # Adjust to your latest migration
    ]

    operations = [
        # Step 1: Add user_type field to FirebaseUser
        migrations.AddField(
            model_name='firebaseuser',
            name='user_type',
            field=models.CharField(
                choices=[('passenger', 'Passenger'), ('staff', 'Staff'), ('admin', 'Admin')],
                default='passenger',
                max_length=10
            ),
        ),
        
        # Step 2: Populate user_type based on existing flags
        migrations.RunPython(
            code=lambda apps, schema_editor: populate_user_types(apps),
            reverse_code=migrations.RunPython.noop
        ),
        
        # Step 3: Create Passenger table
        migrations.CreateModel(
            name='Passenger',
            fields=[
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    primary_key=True,
                    related_name='passenger_profile',
                    serialize=False,
                    to='accounts.firebaseuser'
                )),
                ('full_name', models.CharField(blank=True, max_length=255)),
                ('phone_number', models.CharField(blank=True, max_length=20)),
                ('gender', models.CharField(
                    blank=True,
                    choices=[
                        ('male', 'Male'),
                        ('female', 'Female'),
                        ('other', 'Other'),
                        ('prefer_not_to_say', 'Prefer not to say')
                    ],
                    max_length=20
                )),
                ('address', models.TextField(blank=True, max_length=500)),
                ('date_of_birth', models.DateField(blank=True, null=True)),
                ('aadhar_number', models.CharField(blank=True, max_length=12)),
                ('preferred_language', models.CharField(default='en', max_length=50)),
                ('notification_preferences', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Passenger',
                'verbose_name_plural': 'Passengers',
                'db_table': 'accounts_passenger',
            },
        ),
        
        # Step 4: Create Staff table
        migrations.CreateModel(
            name='Staff',
            fields=[
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    primary_key=True,
                    related_name='staff_profile',
                    serialize=False,
                    to='accounts.firebaseuser'
                )),
                ('employee_id', models.CharField(max_length=50, unique=True)),
                ('full_name', models.CharField(max_length=255)),
                ('phone_number', models.CharField(max_length=20)),
                ('department', models.CharField(max_length=100)),
                ('designation', models.CharField(max_length=100)),
                ('location', models.CharField(blank=True, max_length=200)),
                ('avatar', models.ImageField(blank=True, null=True, upload_to='staff_avatars/')),
                ('expertise', models.JSONField(default=list)),
                ('languages', models.JSONField(default=list)),
                ('communication_preferences', models.JSONField(default=list)),
                ('certifications', models.JSONField(default=list)),
                ('status', models.CharField(
                    choices=[
                        ('active', 'Active'),
                        ('inactive', 'Inactive'),
                        ('on_leave', 'On Leave'),
                        ('suspended', 'Suspended')
                    ],
                    default='active',
                    max_length=20
                )),
                ('joining_date', models.DateField()),
                ('work_schedule', models.JSONField(default=dict)),
                ('assigned_zones', models.JSONField(default=list)),
                ('rating', models.FloatField(default=0.0)),
                ('active_tickets', models.IntegerField(default=0)),
                ('resolved_tickets', models.IntegerField(default=0)),
                ('average_resolution_time', models.IntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Staff Member',
                'verbose_name_plural': 'Staff Members',
                'db_table': 'accounts_staff',
            },
        ),
        
        # Step 5: Create Admin table
        migrations.CreateModel(
            name='Admin',
            fields=[
                ('user', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    primary_key=True,
                    related_name='admin_profile',
                    serialize=False,
                    to='accounts.firebaseuser'
                )),
                ('full_name', models.CharField(max_length=255)),
                ('phone_number', models.CharField(max_length=20)),
                ('admin_level', models.CharField(
                    choices=[
                        ('super_admin', 'Super Admin'),
                        ('admin', 'Admin'),
                        ('moderator', 'Moderator')
                    ],
                    default='admin',
                    max_length=20
                )),
                ('department', models.CharField(blank=True, max_length=100)),
                ('can_manage_staff', models.BooleanField(default=True)),
                ('can_manage_complaints', models.BooleanField(default=True)),
                ('can_view_analytics', models.BooleanField(default=True)),
                ('can_manage_users', models.BooleanField(default=False)),
                ('custom_permissions', models.JSONField(default=dict)),
                ('created_by', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='created_admins',
                    to='accounts.admin'
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('last_action_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Admin',
                'verbose_name_plural': 'Admins',
                'db_table': 'accounts_admin',
            },
        ),
        
        # Step 6: Create StaffShift table
        migrations.CreateModel(
            name='StaffShift',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('shift_date', models.DateField()),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('shift_type', models.CharField(
                    choices=[
                        ('morning', 'Morning'),
                        ('afternoon', 'Afternoon'),
                        ('evening', 'Evening'),
                        ('night', 'Night')
                    ],
                    max_length=20
                )),
                ('status', models.CharField(
                    choices=[
                        ('scheduled', 'Scheduled'),
                        ('completed', 'Completed'),
                        ('missed', 'Missed'),
                        ('cancelled', 'Cancelled')
                    ],
                    default='scheduled',
                    max_length=20
                )),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('staff', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='shifts',
                    to='accounts.staff'
                )),
            ],
            options={
                'verbose_name': 'Staff Shift',
                'verbose_name_plural': 'Staff Shifts',
                'db_table': 'accounts_staff_shift',
            },
        ),
        
        # Step 7: Create StaffPerformance table
        migrations.CreateModel(
            name='StaffPerformance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('month', models.DateField()),
                ('tickets_resolved', models.IntegerField(default=0)),
                ('average_resolution_time', models.IntegerField(blank=True, null=True)),
                ('customer_satisfaction', models.FloatField(blank=True, null=True)),
                ('response_time', models.IntegerField(blank=True, null=True)),
                ('escalations', models.IntegerField(default=0)),
                ('commendations', models.IntegerField(default=0)),
                ('warnings', models.IntegerField(default=0)),
                ('performance_notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('staff', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='performance_records',
                    to='accounts.staff'
                )),
            ],
            options={
                'verbose_name': 'Staff Performance',
                'verbose_name_plural': 'Staff Performance Records',
                'db_table': 'accounts_staff_performance',
            },
        ),
        
        # Step 8: Add indexes
        migrations.AddIndex(
            model_name='firebaseuser',
            index=models.Index(fields=['email', 'user_type'], name='accounts_fi_email_user_type_idx'),
        ),
        migrations.AddIndex(
            model_name='staff',
            index=models.Index(fields=['employee_id'], name='accounts_st_emp_id_idx'),
        ),
        migrations.AddIndex(
            model_name='staff',
            index=models.Index(fields=['department', 'status'], name='accounts_st_dept_status_idx'),
        ),
        migrations.AddIndex(
            model_name='staffshift',
            index=models.Index(fields=['staff', 'shift_date'], name='accounts_ss_staff_date_idx'),
        ),
        migrations.AddIndex(
            model_name='staffperformance',
            index=models.Index(fields=['staff', 'month'], name='accounts_sp_staff_month_idx'),
        ),
        
        # Step 9: Add unique constraints
        migrations.AddConstraint(
            model_name='staffshift',
            constraint=models.UniqueConstraint(
                fields=['staff', 'shift_date', 'start_time'],
                name='unique_staff_shift'
            ),
        ),
        migrations.AddConstraint(
            model_name='staffperformance',
            constraint=models.UniqueConstraint(
                fields=['staff', 'month'],
                name='unique_staff_month_performance'
            ),
        ),
    ]


def populate_user_types(apps):
    """
    Populate user_type field based on existing boolean flags
    Priority: admin > staff > passenger
    """
    FirebaseUser = apps.get_model('accounts', 'FirebaseUser')
    
    # Set admin users
    FirebaseUser.objects.filter(
        models.Q(is_admin=True) | models.Q(is_super_admin=True)
    ).update(user_type='admin')
    
    # Set staff users (excluding admins)
    FirebaseUser.objects.filter(
        is_staff=True
    ).exclude(
        models.Q(is_admin=True) | models.Q(is_super_admin=True)
    ).update(user_type='staff')
    
    # Set passenger users (everyone else)
    FirebaseUser.objects.filter(
        user_type='passenger'
    ).update(user_type='passenger')
