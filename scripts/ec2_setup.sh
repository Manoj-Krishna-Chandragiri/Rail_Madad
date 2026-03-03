#!/bin/bash
# Run this script once on EC2 to set up the backend
# Usage: chmod +x ec2_setup.sh && ./ec2_setup.sh

set -e
echo "🚀 Starting Rail Madad EC2 Setup..."

# ── 1. System packages ─────────────────────────────────────────────────────
echo "=== Installing system packages ==="
sudo apt-get update -y
sudo apt-get install -y python3.12 python3.12-venv python3-pip \
    mysql-server libmysqlclient-dev pkg-config \
    nginx git build-essential

# ── 2. MySQL setup ─────────────────────────────────────────────────────────
echo "=== Setting up MySQL ==="
sudo systemctl enable mysql
sudo systemctl start mysql

# Create DB and user (change PASSWORD below)
DB_NAME="rail_madad"
DB_USER="railmadad"
DB_PASS="YourStrongPassword123!"   # ← Change this

sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
echo "✅ MySQL database '${DB_NAME}' and user '${DB_USER}' created"

# ── 3. Clone repo ──────────────────────────────────────────────────────────
echo "=== Cloning repository ==="
cd /home/ubuntu
if [ ! -d "Rail_Madad" ]; then
    git clone https://github.com/Manoj-Krishna-Chandragiri/Rail_Madad.git
fi
cd Rail_Madad

# ── 4. Python virtual environment ─────────────────────────────────────────
echo "=== Setting up Python venv ==="
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install --upgrade pip
# Use EC2-specific requirements (excludes tensorflow/deepface — too heavy for t2.micro)
pip install -r requirements-ec2.txt

# ── 5. .env file ───────────────────────────────────────────────────────────
echo "=== Creating .env file ==="
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
EC2_DNS=$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)

cat > /home/ubuntu/Rail_Madad/backend/.env << EOF
# Django
DJANGO_SECRET_KEY=django-insecure-replace-with-50-char-random-string-here
DJANGO_DEBUG=False
ENVIRONMENT=production

# Database (local EC2 MySQL — no SSL needed)
USE_SQLITE=False
MYSQL_DATABASE=${DB_NAME}
MYSQL_USER=${DB_USER}
MYSQL_PASSWORD=${DB_PASS}
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_SSL=false

# EC2 host info (auto-detected)
EC2_PUBLIC_IP=${EC2_IP}
EC2_PUBLIC_DNS=${EC2_DNS}

# Add your secrets below (or in .env.secrets)
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,${EC2_IP},${EC2_DNS},.ap-south-1.compute.amazonaws.com
CORS_ALLOWED_ORIGINS=https://manojkrishna.tech,https://main.dhpx91sx6cx3f.amplifyapp.com
EOF

echo "✅ .env created at /home/ubuntu/Rail_Madad/backend/.env"
echo "⚠️  Add your DJANGO_SECRET_KEY, Firebase, and Gemini keys to .env.secrets"

# ── 6. Migrations + static ─────────────────────────────────────────────────
echo "=== Running migrations ==="
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# ── 7. Gunicorn systemd service ────────────────────────────────────────────
echo "=== Setting up Gunicorn service ==="
sudo tee /etc/systemd/system/gunicorn.service > /dev/null << EOF
[Unit]
Description=Rail Madad Django Gunicorn
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/Rail_Madad/backend
ExecStart=/home/ubuntu/Rail_Madad/backend/venv/bin/gunicorn \
    --workers 2 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    backend.wsgi:application
Restart=always
RestartSec=5
EnvironmentFile=/home/ubuntu/Rail_Madad/backend/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn

# ── 8. Nginx config ────────────────────────────────────────────────────────
echo "=== Setting up Nginx ==="
sudo tee /etc/nginx/sites-available/railmadad > /dev/null << EOF
server {
    listen 80;
    server_name ${EC2_IP} ${EC2_DNS};

    client_max_body_size 50M;

    location /static/ {
        alias /home/ubuntu/Rail_Madad/backend/staticfiles/;
    }

    location /media/ {
        alias /home/ubuntu/Rail_Madad/backend/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/railmadad /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# ── 9. Sudoers for GitHub Actions (restart without password) ───────────────
echo "=== Configuring sudo for CI/CD ==="
echo "ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl restart gunicorn, /bin/systemctl restart nginx" \
    | sudo tee /etc/sudoers.d/railmadad > /dev/null

echo ""
echo "✅ EC2 setup complete!"
echo "   Backend is running at: http://${EC2_IP}"
echo ""
echo "📌 Next steps:"
echo "   1. Edit /home/ubuntu/Rail_Madad/backend/.env — fill in DJANGO_SECRET_KEY, Firebase, Gemini keys"
echo "   2. Run data migration from Aiven: see scripts/migrate_aiven_to_ec2.sh"
echo "   3. Add GitHub Secrets (see README or CI/CD instructions)"
