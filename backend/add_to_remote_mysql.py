"""Add is_passenger column to remote Aiven MySQL database"""
import pymysql
import sys

# Remote Aiven MySQL connection
print("Connecting to remote Aiven MySQL database...", flush=True)
sys.stdout.flush()
conn = pymysql.connect(
    host='rail-madad-database-railmadad.d.aivencloud.com',
    user='avnadmin',
    password='AVNS_PDTIINWwv2B70owGaNp',
    database='defaultdb',
    port=21965,
    ssl={'ssl-mode': 'REQUIRED'}
)

cursor = conn.cursor()

try:
    print("[SUCCESS] Connected to remote MySQL!", flush=True)
    sys.stdout.flush()
    
    print("\nChecking if column exists...", flush=True)
    sys.stdout.flush()
    cursor.execute("SHOW COLUMNS FROM accounts_firebaseuser LIKE 'is_passenger'")
    result = cursor.fetchone()
    
    if result:
        print("[INFO] Column 'is_passenger' already exists!", flush=True)
    else:
        print("\n[ACTION] Adding is_passenger column...", flush=True)
        sys.stdout.flush()
        cursor.execute("""
            ALTER TABLE accounts_firebaseuser 
            ADD COLUMN is_passenger TINYINT(1) NOT NULL DEFAULT 1
        """)
        conn.commit()
        print("[SUCCESS] Column added successfully!", flush=True)
        sys.stdout.flush()
    
    # Verify table structure
    print("\n[INFO] Table structure:", flush=True)
    sys.stdout.flush()
    cursor.execute("DESCRIBE accounts_firebaseuser")
    columns = cursor.fetchall()
    for col in columns:
        print(f"  {col[0]}: {col[1]}", flush=True)
    sys.stdout.flush()
    
    # Check users
    print("\n[INFO] All users in database:", flush=True)
    sys.stdout.flush()
    cursor.execute("SELECT id, email, is_admin, is_staff, is_super_admin, is_passenger FROM accounts_firebaseuser ORDER BY id")
    users = cursor.fetchall()
    for user in users:
        print(f"  ID {user[0]}: {user[1]}", flush=True)
        print(f"    - is_admin: {user[2]}, is_staff: {user[3]}, is_super_admin: {user[4]}, is_passenger: {user[5]}", flush=True)
    sys.stdout.flush()
    
    print("\n[SUCCESS] All done!", flush=True)
    sys.stdout.flush()
    
except pymysql.err.OperationalError as e:
    print(f"[ERROR] MySQL error: {e}", flush=True)
    sys.stdout.flush()
except Exception as e:
    print(f"[ERROR] {e}", flush=True)
    sys.stdout.flush()
    import traceback
    traceback.print_exc()
finally:
    cursor.close()
    conn.close()
