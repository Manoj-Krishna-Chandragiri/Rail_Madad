#!/bin/bash
# Migrate data from Aiven MySQL → EC2 MySQL
# Run this FROM YOUR LOCAL MACHINE (Windows: use Git Bash or WSL)
# or run directly on EC2 if you have Aiven credentials there
#
# Usage: bash migrate_aiven_to_ec2.sh

set -e

echo "🔄 Rail Madad — Aiven → EC2 MySQL Migration"
echo ""

# ── Aiven source (fill these in) ───────────────────────────────────────────
AIVEN_HOST="your-aiven-host.aivencloud.com"   # ← from Aiven console
AIVEN_PORT="3306"
AIVEN_USER="avnadmin"
AIVEN_PASS="your-aiven-password"              # ← from Aiven console
AIVEN_DB="rail_madad"
AIVEN_SSL_CA="ca.pem"                         # ← download from Aiven console

# ── EC2 destination ────────────────────────────────────────────────────────
EC2_HOST="13.203.197.130"
EC2_USER="railmadad"
EC2_PASS="YourStrongPassword123!"             # ← same as in ec2_setup.sh
EC2_DB="rail_madad"

DUMP_FILE="aiven_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "Step 1: Dumping data from Aiven..."
mysqldump \
    --host="${AIVEN_HOST}" \
    --port="${AIVEN_PORT}" \
    --user="${AIVEN_USER}" \
    --password="${AIVEN_PASS}" \
    --ssl-ca="${AIVEN_SSL_CA}" \
    --single-transaction \
    --routines \
    --triggers \
    --no-tablespaces \
    "${AIVEN_DB}" > "${DUMP_FILE}"

echo "✅ Dump saved to ${DUMP_FILE} ($(du -sh ${DUMP_FILE} | cut -f1))"

echo ""
echo "Step 2: Importing into EC2 MySQL..."
echo "   Connecting to ${EC2_HOST}..."

mysql \
    --host="${EC2_HOST}" \
    --port="3306" \
    --user="${EC2_USER}" \
    --password="${EC2_PASS}" \
    "${EC2_DB}" < "${DUMP_FILE}"

echo "✅ Data imported successfully into EC2 MySQL!"
echo ""
echo "Step 3: Cleaning up dump file..."
rm "${DUMP_FILE}"

echo ""
echo "🎉 Migration complete!"
echo "   Your EC2 DB at ${EC2_HOST} now has all data from Aiven."
echo ""
echo "⚠️  Remember to:"
echo "   1. Update backend .env on EC2: MYSQL_HOST=127.0.0.1, MYSQL_SSL=false"
echo "   2. Restart gunicorn: sudo systemctl restart gunicorn"
