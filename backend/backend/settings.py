import os
from pathlib import Path
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth
from corsheaders.defaults import default_headers

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'change_this_in_production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG', 'False') == 'True'

# Allowed hosts with comma-separated values from environment
# Allowed hosts with comma-separated values from environment
ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,rail-madad-backend.onrender.com').split(',')
# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'accounts',
    'complaints',
]

# Custom User Model
AUTH_USER_MODEL = 'accounts.FirebaseUser'

# DRF Authentication Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ]
}

# Middleware Configuration
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'accounts.middleware.FirebaseAuthMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Database Configuration - Use SQLite for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Uncomment below for MySQL if needed:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': os.getenv('MYSQL_DATABASE', 'rail_madad'),
#         'USER': os.getenv('MYSQL_USER', 'root'),
#         'PASSWORD': os.getenv('MYSQL_PASSWORD', 'Lu@B9pk@3k4WP'),
#         'HOST': os.getenv('MYSQL_HOST', 'localhost'),
#         'PORT': os.getenv('MYSQL_PORT', '3306'),
#     }
# }

# Password Validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static and Media Files Configuration
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Create media directory if it doesn't exist
os.makedirs(MEDIA_ROOT, exist_ok=True)

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Admin Credentials
ADMIN_EMAIL = 'adm.railmadad@gmail.com'
ADMIN_PASSWORD = 'admin@2025'

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",
    "https://rail-madad-backend.onrender.com",  # Add your backend domain
    "https://main.dhpx91sx6cx3f.amplifyapp.com",  # Add your frontend domain when ready
]

CORS_ALLOW_HEADERS = list(default_headers) + [
    'X-CSRFToken',
    'Authorization',
]

CORS_ALLOW_CREDENTIALS = True

# Firebase Configuration
FIREBASE_CERT = os.path.join(BASE_DIR, 'backend/railmadad-login-firebase-adminsdk-fbsvc-5305d3439b.json')

if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(FIREBASE_CERT)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized successfully")
    except Exception as e:
        print(f"Firebase initialization error: {str(e)}")

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'debug.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'accounts': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}