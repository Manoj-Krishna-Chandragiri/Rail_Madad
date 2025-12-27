"""Manually add is_passenger column to MySQL database"""
import pymysql

try:
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='Manoj@123',
        database='railmadad'
    )
    cursor = conn.cursor()
    
    # Add is_passenger column
    print("Adding is_passenger column...")
    cursor.execute('ALTER TABLE accounts_firebaseuser ADD COLUMN is_passenger TINYINT(1) NOT NULL DEFAULT 1')
    conn.commit()
    print("✅ Column added successfully!")
    
    # Verify table structure
    cursor.execute('DESCRIBE accounts_firebaseuser')
    rows = cursor.fetchall()
    print("\n📋 Table structure:")
    for row in rows:
        print(f"  - {row[0]}: {row[1]}")
    
    cursor.close()
    conn.close()
    
except pymysql.err.OperationalError as e:
    if '1060' in str(e):  # Duplicate column name
        print("⚠️ Column already exists!")
    else:
        print(f"❌ Error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
