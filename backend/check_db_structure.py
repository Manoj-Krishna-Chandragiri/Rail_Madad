"""Check database table structure"""
import pymysql

conn = pymysql.connect(
    host='localhost',
    user='root',
    password='Manoj@123',
    database='railmadad'
)
cursor = conn.cursor()

print("📋 accounts_firebaseuser table structure:\n")
cursor.execute('DESCRIBE accounts_firebaseuser')
rows = cursor.fetchall()
for row in rows:
    print(f"  {row[0]}: {row[1]}")

print("\n\n👤 All users:")
cursor.execute('SELECT id, email, is_admin, is_staff, is_super_admin FROM accounts_firebaseuser')
users = cursor.fetchall()
for user in users:
    print(f"  ID {user[0]}: {user[1]} (admin={user[2]}, staff={user[3]}, super={user[4]})")

cursor.close()
conn.close()
