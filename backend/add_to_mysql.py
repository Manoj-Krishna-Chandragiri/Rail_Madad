"""Add is_passenger column directly to MySQL database"""
import pymysql

# Direct MySQL connection
conn = pymysql.connect(
    host='localhost',
    user='root',
    password='Manoj@123',
    database='railmadad'
)

cursor = conn.cursor()

try:
    print("Checking if column exists...")
    cursor.execute("SHOW COLUMNS FROM accounts_firebaseuser LIKE 'is_passenger'")
    result = cursor.fetchone()
    
    if result:
        print("[INFO] Column 'is_passenger' already exists in MySQL!")
    else:
        print("Adding is_passenger column to MySQL...")
        cursor.execute("""
            ALTER TABLE accounts_firebaseuser 
            ADD COLUMN is_passenger TINYINT(1) NOT NULL DEFAULT 1
        """)
        conn.commit()
        print("[SUCCESS] Column added to MySQL database!")
    
    # Verify table structure
    print("\n[INFO] Current table structure:")
    cursor.execute("DESCRIBE accounts_firebaseuser")
    columns = cursor.fetchall()
    for col in columns:
        print(f"  {col[0]}: {col[1]}")
    
    # Check users
    print("\n[INFO] Current users:")
    cursor.execute("SELECT id, email, is_admin, is_staff, is_super_admin, is_passenger FROM accounts_firebaseuser")
    users = cursor.fetchall()
    for user in users:
        print(f"  ID {user[0]}: {user[1]} (admin={user[2]}, staff={user[3]}, super={user[4]}, passenger={user[5]})")
    
except pymysql.err.OperationalError as e:
    print(f"[ERROR] MySQL error: {e}")
except Exception as e:
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()
finally:
    cursor.close()
    conn.close()
    print("\n[INFO] Done!")
