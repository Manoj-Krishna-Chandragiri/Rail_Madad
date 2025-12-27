"""
Complete Data Migration Script for Role-Based Tables
Run this script to migrate all data from old schema to new role-based schema

Usage:
    python migrate_complete_data.py --backup      # Create backup first
    python migrate_complete_data.py --migrate     # Run migration
    python migrate_complete_data.py --validate    # Validate data
    python migrate_complete_data.py --all         # Backup + Migrate + Validate
"""

import os
import sys
import django
from datetime import datetime
import json

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection, transaction
from accounts.models import FirebaseUser
from django.core.management import call_command


class DataMigrator:
    def __init__(self):
        self.backup_file = None
        self.migration_log = []
        
    def log(self, message):
        """Log migration messages"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_message = f"[{timestamp}] {message}"
        print(log_message)
        self.migration_log.append(log_message)
    
    def create_backup(self):
        """Create database backup"""
        self.log("=" * 70)
        self.log("CREATING DATABASE BACKUP")
        self.log("=" * 70)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        self.backup_file = f"backup_before_role_migration_{timestamp}.sql"
        
        # Get database settings
        from django.conf import settings
        db_settings = settings.DATABASES['default']
        
        if db_settings['ENGINE'] == 'django.db.backends.mysql':
            # MySQL backup
            host = db_settings.get('HOST', 'localhost')
            port = db_settings.get('PORT', '3306')
            user = db_settings['USER']
            password = db_settings['PASSWORD']
            database = db_settings['NAME']
            
            backup_cmd = f'mysqldump -h {host} -P {port} -u {user} -p{password} {database} > {self.backup_file}'
            
            self.log(f"Creating MySQL backup: {self.backup_file}")
            self.log("Command: mysqldump -h [host] -u [user] [database]")
            
            # Note: In production, use subprocess for security
            os.system(backup_cmd)
            
            if os.path.exists(self.backup_file):
                file_size = os.path.getsize(self.backup_file) / (1024 * 1024)  # MB
                self.log(f"✓ Backup created successfully: {file_size:.2f} MB")
                return True
            else:
                self.log("✗ Backup failed!")
                return False
                
        elif db_settings['ENGINE'] == 'django.db.backends.sqlite3':
            # SQLite backup
            import shutil
            db_path = db_settings['NAME']
            self.backup_file = f"{db_path}.backup_{timestamp}"
            
            self.log(f"Creating SQLite backup: {self.backup_file}")
            shutil.copy2(db_path, self.backup_file)
            
            if os.path.exists(self.backup_file):
                file_size = os.path.getsize(self.backup_file) / (1024 * 1024)  # MB
                self.log(f"✓ Backup created successfully: {file_size:.2f} MB")
                return True
            else:
                self.log("✗ Backup failed!")
                return False
        
        else:
            self.log(f"✗ Unsupported database: {db_settings['ENGINE']}")
            return False
    
    def run_migrations(self):
        """Run Django migrations"""
        self.log("=" * 70)
        self.log("RUNNING DJANGO MIGRATIONS")
        self.log("=" * 70)
        
        try:
            # Create role tables
            self.log("Creating new role tables...")
            call_command('migrate', 'accounts', '0009_create_role_tables', verbosity=2)
            self.log("✓ Role tables created")
            
            # Migrate data
            self.log("Migrating data to role tables...")
            call_command('migrate', 'accounts', '0010_migrate_data_to_role_tables', verbosity=2)
            self.log("✓ Data migrated to role tables")
            
            # Create assignment table
            self.log("Creating complaint assignment table...")
            call_command('migrate', 'complaints', '0019_create_assignment_table', verbosity=2)
            self.log("✓ Assignment table created")
            
            # Migrate complaint assignments
            self.log("Migrating complaint assignments...")
            call_command('migrate', 'complaints', '0020_migrate_complaint_assignments', verbosity=2)
            self.log("✓ Complaint assignments migrated")
            
            self.log("=" * 70)
            self.log("✓ ALL MIGRATIONS COMPLETED SUCCESSFULLY")
            self.log("=" * 70)
            return True
            
        except Exception as e:
            self.log(f"✗ Migration failed: {str(e)}")
            import traceback
            self.log(traceback.format_exc())
            return False
    
    def validate_data(self):
        """Validate migrated data"""
        self.log("=" * 70)
        self.log("VALIDATING MIGRATED DATA")
        self.log("=" * 70)
        
        with connection.cursor() as cursor:
            # Count records in each table
            tables = [
                'accounts_firebaseuser',
                'accounts_admin',
                'accounts_staff',
                'accounts_passenger',
                'complaints_complaint',
                'complaints_assignment'
            ]
            
            self.log("\nTable Record Counts:")
            self.log("-" * 50)
            
            for table in tables:
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    self.log(f"{table:35s}: {count:5d} records")
                except Exception as e:
                    self.log(f"{table:35s}: ERROR - {str(e)}")
            
            # Validate admin migration
            self.log("\n" + "=" * 50)
            self.log("Admin Migration Validation:")
            self.log("=" * 50)
            
            cursor.execute("""
                SELECT COUNT(*) FROM accounts_firebaseuser 
                WHERE is_admin = 1 OR is_super_admin = 1
            """)
            old_admin_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM accounts_admin")
            new_admin_count = cursor.fetchone()[0]
            
            self.log(f"Old admin users (is_admin=1): {old_admin_count}")
            self.log(f"New admin profiles: {new_admin_count}")
            
            if old_admin_count == new_admin_count:
                self.log("✓ Admin migration: PASS")
            else:
                self.log(f"⚠ Admin migration: MISMATCH ({old_admin_count} vs {new_admin_count})")
            
            # Validate staff migration
            self.log("\n" + "=" * 50)
            self.log("Staff Migration Validation:")
            self.log("=" * 50)
            
            cursor.execute("SELECT COUNT(*) FROM complaints_staff")
            old_staff_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM accounts_staff")
            new_staff_count = cursor.fetchone()[0]
            
            self.log(f"Old staff records: {old_staff_count}")
            self.log(f"New staff profiles: {new_staff_count}")
            
            if old_staff_count == new_staff_count:
                self.log("✓ Staff migration: PASS")
            else:
                self.log(f"⚠ Staff migration: MISMATCH ({old_staff_count} vs {new_staff_count})")
            
            # Validate passenger migration
            self.log("\n" + "=" * 50)
            self.log("Passenger Migration Validation:")
            self.log("=" * 50)
            
            cursor.execute("SELECT COUNT(*) FROM accounts_firebaseuser WHERE is_passenger = 1")
            old_passenger_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM accounts_passenger")
            new_passenger_count = cursor.fetchone()[0]
            
            self.log(f"Old passenger users (is_passenger=1): {old_passenger_count}")
            self.log(f"New passenger profiles: {new_passenger_count}")
            
            if old_passenger_count == new_passenger_count:
                self.log("✓ Passenger migration: PASS")
            else:
                self.log(f"⚠ Passenger migration: MISMATCH ({old_passenger_count} vs {new_passenger_count})")
            
            # Validate complaint assignments
            self.log("\n" + "=" * 50)
            self.log("Complaint Assignment Validation:")
            self.log("=" * 50)
            
            cursor.execute("""
                SELECT COUNT(*) FROM complaints_complaint 
                WHERE staff IS NOT NULL AND staff != ''
            """)
            old_assigned = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM complaints_assignment")
            new_assigned = cursor.fetchone()[0]
            
            self.log(f"Old complaints with staff: {old_assigned}")
            self.log(f"New assignment records: {new_assigned}")
            
            if new_assigned > 0:
                self.log("✓ Complaint assignments created")
            else:
                self.log("⚠ No complaint assignments created")
            
            # Check for orphaned records
            self.log("\n" + "=" * 50)
            self.log("Orphaned Records Check:")
            self.log("=" * 50)
            
            cursor.execute("""
                SELECT COUNT(*) FROM accounts_firebaseuser fu
                LEFT JOIN accounts_admin ad ON fu.id = ad.user_id
                LEFT JOIN accounts_staff st ON fu.id = st.user_id
                LEFT JOIN accounts_passenger pa ON fu.id = pa.user_id
                WHERE ad.user_id IS NULL AND st.user_id IS NULL AND pa.user_id IS NULL
                AND fu.is_superuser = 0
            """)
            orphaned = cursor.fetchone()[0]
            
            if orphaned > 0:
                self.log(f"⚠ Found {orphaned} users without role profiles")
            else:
                self.log("✓ No orphaned users found")
        
        self.log("\n" + "=" * 70)
        self.log("VALIDATION COMPLETE")
        self.log("=" * 70)
    
    def save_log(self):
        """Save migration log to file"""
        log_file = f"migration_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(log_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(self.migration_log))
        self.log(f"\nMigration log saved to: {log_file}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Migrate data to role-based tables')
    parser.add_argument('--backup', action='store_true', help='Create database backup')
    parser.add_argument('--migrate', action='store_true', help='Run migrations')
    parser.add_argument('--validate', action='store_true', help='Validate migrated data')
    parser.add_argument('--all', action='store_true', help='Run all steps (backup + migrate + validate)')
    
    args = parser.parse_args()
    
    migrator = DataMigrator()
    
    try:
        if args.all or args.backup:
            if not migrator.create_backup():
                print("\n⚠ Backup failed! Migration aborted.")
                return
        
        if args.all or args.migrate:
            if not migrator.run_migrations():
                print("\n⚠ Migration failed! Check the logs.")
                return
        
        if args.all or args.validate:
            migrator.validate_data()
        
        migrator.save_log()
        
        print("\n" + "=" * 70)
        print("✓ MIGRATION PROCESS COMPLETED")
        print("=" * 70)
        print(f"\nBackup file: {migrator.backup_file}")
        print("\nNext steps:")
        print("1. Review the migration log")
        print("2. Test the application thoroughly")
        print("3. Update application code to use new models")
        print("4. If everything works, you can clean up old columns later")
        
    except KeyboardInterrupt:
        print("\n\n⚠ Migration interrupted by user")
    except Exception as e:
        print(f"\n\n✗ Migration failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        migrator.save_log()


if __name__ == '__main__':
    if len(sys.argv) == 1:
        print("Usage:")
        print("  python migrate_complete_data.py --backup      # Create backup")
        print("  python migrate_complete_data.py --migrate     # Run migration")
        print("  python migrate_complete_data.py --validate    # Validate data")
        print("  python migrate_complete_data.py --all         # Run all steps")
        sys.exit(1)
    
    main()
