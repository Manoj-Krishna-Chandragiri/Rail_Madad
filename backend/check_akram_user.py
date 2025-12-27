"""Check if akram.dcme@gmail.com exists in MySQL database"""
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
print("CHECKING USER: akram.dcme@gmail.com", flush=True)
print("=" * 70, flush=True)

cursor.execute("""
    SELECT id, email, firebase_uid, is_admin, is_staff, is_passenger 
    FROM accounts_firebaseuser 
    WHERE email = 'akram.dcme@gmail.com'
""")
user = cursor.fetchone()

if user:
    print(f"\n[FOUND IN MYSQL]", flush=True)
    print(f"  ID: {user[0]}", flush=True)
    print(f"  Email: {user[1]}", flush=True)
    print(f"  Firebase UID: {user[2]}", flush=True)
    print(f"  is_admin: {user[3]}", flush=True)
    print(f"  is_staff: {user[4]}", flush=True)
    print(f"  is_passenger: {user[5]}", flush=True)
    
    print(f"\n[IMPORTANT]", flush=True)
    if user[2] and 'placeholder' not in user[2]:
        print(f"  User has a real Firebase UID: {user[2]}", flush=True)
        print(f"  This user SHOULD exist in Firebase with this UID", flush=True)
    else:
        print(f"  User has placeholder/missing Firebase UID", flush=True)
        print(f"  This user needs to be created in Firebase Authentication", flush=True)
else:
    print(f"\n[NOT FOUND] akram.dcme@gmail.com not in MySQL database", flush=True)

print("\n" + "=" * 70, flush=True)
print("SOLUTION:", flush=True)
print("=" * 70, flush=True)
print("If Firebase UID is real: Check password in Firebase Console", flush=True)
print("If Firebase UID is placeholder: Create user in Firebase Console", flush=True)
print("=" * 70, flush=True)

cursor.close()
conn.close()
