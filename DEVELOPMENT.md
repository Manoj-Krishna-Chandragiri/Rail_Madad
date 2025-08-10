# Development Setup Guide

## Quick Start

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Git** for version control
- **Firebase account** for authentication

### 1. Clone and Setup
```bash
git clone https://github.com/Manoj-Krishna-Chandragiri/Rail_Madad.git
cd Rail_Madad
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv railmadad_env

# Activate virtual environment
# Windows:
railmadad_env\Scripts\activate
# macOS/Linux:
source railmadad_env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
copy .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
copy .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### 4. Quick Start (Windows)
```bash
# From project root
start-servers.bat
```

## Development URLs

- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/

## Environment Configuration

### Backend (.env)
```env
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
USE_SQLITE=True
FIREBASE_ADMIN_CREDENTIALS=backend/railmadad-login-firebase-adminsdk-fbsvc-5305d3439b.json
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## Common Issues

### Port Already in Use
```bash
# Kill process on port 8000 (Backend)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill process on port 5174 (Frontend)
netstat -ano | findstr :5174
taskkill /PID <PID> /F
```

### Database Reset
```bash
cd backend
python manage.py flush
python manage.py migrate
python manage.py createsuperuser
```

### Node Modules Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```

### Backend Static Files
```bash
cd backend
python manage.py collectstatic
```

## Project Structure

```
Rail_Madad/
├── backend/                 # Django REST API
│   ├── accounts/           # User management
│   ├── complaints/         # Complaint system
│   ├── backend/           # Project settings
│   └── requirements.txt   # Python dependencies
├── frontend/               # React + TypeScript
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
├── DEPLOYMENT.md          # Production deployment guide
└── README.md              # Project documentation
```
