"""Make akram.dcme@gmail.com an admin"""
import pymysql

conn = pymysql.connect(
    host='rail-madad-database-railmadad.d.aivencloud.com',
    user='avnadmin',
    password='AVNS_PDTIINWwv2B70owGaNp',
    database='defaultdb',
    port=21965,
    ssl={'ssl-mode': 'REQUIRED'}
)

cursor = conn.cursor()

print("[ACTION] Updating akram.dcme@gmail.com to admin...", flush=True)

cursor.execute("""
    UPDATE accounts_firebaseuser 
    SET is_admin = 1, is_staff = 1 
    WHERE email = 'akram.dcme@gmail.com'
""")
conn.commit()

print("[SUCCESS] User updated!", flush=True)

# Verify
cursor.execute("""
    SELECT email, is_admin, is_staff, is_passenger 
    FROM accounts_firebaseuser 
    WHERE email = 'akram.dcme@gmail.com'
""")
user = cursor.fetchone()

print(f"\n[VERIFIED] {user[0]}", flush=True)
print(f"  is_admin: {user[1]}", flush=True)
print(f"  is_staff: {user[2]}", flush=True)
print(f"  is_passenger: {user[3]}", flush=True)

print(f"\n[SUCCESS] User can now access Admin Portal!", flush=True)

cursor.close()
conn.close()
