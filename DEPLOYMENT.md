# Production Deployment Guide

## Frontend Deployment (AWS Amplify)

### Build Settings
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Environment Variables (AWS Amplify)
```
VITE_API_BASE_URL=https://rail-madad-backend.onrender.com
VITE_FIREBASE_API_KEY=AIzaSyAeP3pD8WZkil9h-Z06_WLtEJgmC6rRFko
VITE_FIREBASE_AUTH_DOMAIN=railmadad-login.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=railmadad-login
VITE_FIREBASE_STORAGE_BUCKET=railmadad-login.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=914935310403
VITE_FIREBASE_APP_ID=1:914935310403:web:edc5a318f2d9c9e9df8cf6
VITE_GEMINI_API_KEY=your-production-gemini-key
```

## Backend Deployment (Render)

### Build Command
```bash
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

### Start Command
```bash
gunicorn backend.wsgi:application
```

### Environment Variables (Render)
```
DJANGO_SECRET_KEY=your-production-secret-key
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=rail-madad-backend.onrender.com,rail-madad.manojkrishna.me
USE_SQLITE=False
MYSQL_DATABASE=production_db_name
MYSQL_USER=production_db_user
MYSQL_PASSWORD=production_db_password
MYSQL_HOST=production_db_host
MYSQL_PORT=3306
FIREBASE_ADMIN_CREDENTIALS=backend/railmadad-login-firebase-adminsdk-fbsvc-5305d3439b.json
CORS_ALLOWED_ORIGINS=https://rail-madad.manojkrishna.me
```

## Health Check Endpoints

- Backend: `https://rail-madad-backend.onrender.com/admin/`
- Frontend: `https://rail-madad.manojkrishna.me/`

## Monitoring & Logging

1. **Frontend**: AWS CloudWatch (automatic with Amplify)
2. **Backend**: Render logs + Django logging
3. **Database**: MySQL monitoring
4. **Firebase**: Firebase Console analytics
