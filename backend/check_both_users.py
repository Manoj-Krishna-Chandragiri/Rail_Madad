"""Check both users in MySQL"""
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

print("=" * 70, flush=True)
print("CHECKING BOTH USERS", flush=True)
print("=" * 70, flush=True)

for email in ['akram.dcme@gmail.com', 'manojkrishnachandragiri@gmail.com']:
    cursor.execute("""
        SELECT email, firebase_uid, is_admin, is_staff, is_passenger 
        FROM accounts_firebaseuser 
        WHERE email = %s
    """, (email,))
    user = cursor.fetchone()
    
    if user:
        print(f"\n[OK] {user[0]}", flush=True)
        print(f"  Firebase UID: {user[1]}", flush=True)
        print(f"  is_admin: {user[2]}", flush=True)
        print(f"  is_staff: {user[3]}", flush=True)
        print(f"  is_passenger: {user[4]}", flush=True)
        
        if user[2]:
            print(f"  --> CAN access Admin Portal", flush=True)
        if user[4]:
            print(f"  --> CAN access Passenger Portal", flush=True)
    else:
        print(f"\n[ERROR] {email} NOT FOUND", flush=True)

print("\n" + "=" * 70, flush=True)

cursor.close()
conn.close()
