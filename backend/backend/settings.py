import os
from pathlib import Path
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth
from corsheaders.defaults import default_headers

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file in the backend directory
dotenv_path = BASE_DIR / '.env'
load_dotenv(dotenv_path=dotenv_path)

# Load secrets from .env.secrets (API keys, credentials, etc.)
secrets_path = BASE_DIR / '.env.secrets'
if secrets_path.exists():
    load_dotenv(dotenv_path=secrets_path, override=True)
    print(f"✅ Loaded secrets from {secrets_path}")

# SECURITY WARNING: keep the secret key used in production secret!
if not os.getenv('DJANGO_SECRET_KEY'):
    raise ValueError('DJANGO_SECRET_KEY environment variable is not set. This is required for production.')
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG', 'False').lower() == 'true'

# Environment detection
IS_PRODUCTION = not DEBUG and os.getenv('ENVIRONMENT') == 'production'

# Allowed hosts configuration - production-safe
DEFAULT_ALLOWED_HOSTS = ['localhost', '127.0.0.1']
if IS_PRODUCTION or os.getenv('ENVIRONMENT') in ['staging', 'production']:
    DEFAULT_ALLOWED_HOSTS.extend([
        'api.rail-madad.manojkrishna.me',
        'rail-madad.manojkrishna.me',
    ])
    # Add EC2 instance IP if provided (for fallback access)
    ec2_ip = os.getenv('EC2_PUBLIC_IP')
    if ec2_ip:
        DEFAULT_ALLOWED_HOSTS.append(ec2_ip)

ALLOWED_HOSTS = [host.strip() for host in os.getenv('DJANGO_ALLOWED_HOSTS', ','.join(DEFAULT_ALLOWED_HOSTS)).split(',') if host.strip()]
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
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this line
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

# Database Configuration
if os.getenv('USE_SQLITE', 'False') == 'True':
    # Use SQLite for local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Use MySQL for production
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv('MYSQL_DATABASE'),
            'USER': os.getenv('MYSQL_USER'),
            'PASSWORD': os.getenv('MYSQL_PASSWORD'),
            'HOST': os.getenv('MYSQL_HOST'),
            'PORT': os.getenv('MYSQL_PORT'),
            'OPTIONS': {
                'sql_mode': 'traditional',
                'charset': 'utf8mb4',
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
                'ssl': {
                    'ssl_mode': 'REQUIRED',
                }
            }
        }
    }

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
STATIC_URL = '/static/'  # Add leading slash
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Create media directory if it doesn't exist
os.makedirs(MEDIA_ROOT, exist_ok=True)

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Configuration - Production-safe with explicit origins
DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",  # Vite default port (dev only)
    "http://localhost:5174",  # Local development (dev only)
    "http://127.0.0.1:5173",  # Local dev fallback (dev only)
    "http://127.0.0.1:5174",  # Local dev fallback (dev only)
]

if IS_PRODUCTION or os.getenv('ENVIRONMENT') in ['staging', 'production']:
    DEFAULT_CORS_ORIGINS.extend([
        "https://rail-madad.manojkrishna.me",      # Custom frontend domain
        "https://main.dhpx91sx6cx3f.amplifyapp.com",  # AWS Amplify frontend
    ])

CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in os.getenv(
        'CORS_ALLOWED_ORIGINS',
        ','.join(DEFAULT_CORS_ORIGINS)
    ).split(',') if origin.strip()
]

# CORS configuration
CORS_ALLOW_ALL_ORIGINS = False  # NEVER use * in production
CORS_ALLOW_CREDENTIALS = True  # Allow cookies/credentials

# Add Cloudinary domains for image uploads
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.cloudinary\.com$",  # Cloudinary CDN
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
    'HEAD',
]

CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-csrftoken',
    'x-admin-access',
    'x-dev-user-email',  # Development-only header
]

# CSRF Configuration - Production-safe
DEFAULT_CSRF_ORIGINS = [
    "http://localhost:5173",   # Dev only
    "http://localhost:5174",   # Dev only
    "http://127.0.0.1:5173",   # Dev only
    "http://127.0.0.1:5174",   # Dev only
]

if IS_PRODUCTION or os.getenv('ENVIRONMENT') in ['staging', 'production']:
    DEFAULT_CSRF_ORIGINS.extend([
        "https://rail-madad.manojkrishna.me",       # Custom frontend domain
        "https://main.dhpx91sx6cx3f.amplifyapp.com",  # AWS Amplify frontend
    ])

CSRF_TRUSTED_ORIGINS = [
    origin.strip() for origin in os.getenv(
        'CSRF_TRUSTED_ORIGINS',
        ','.join(DEFAULT_CSRF_ORIGINS)
    ).split(',') if origin.strip()
]

# CSRF Cookie settings (secure in production)
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'  # Allow cross-site form submissions
if IS_PRODUCTION:
    CSRF_COOKIE_SECURE = True  # HTTPS only in production

# Cloudinary Configuration for Media Storage
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

# Firebase Configuration - Secure Environment Variable Based Setup
if not firebase_admin._apps:
    try:
        # Check if environment variables for Firebase are available
        firebase_type = os.environ.get('FIREBASE_TYPE')
        firebase_project_id = os.environ.get('FIREBASE_PROJECT_ID')
        firebase_private_key_id = os.environ.get('FIREBASE_PRIVATE_KEY_ID')
        firebase_private_key = os.environ.get('FIREBASE_PRIVATE_KEY')
        firebase_client_email = os.environ.get('FIREBASE_CLIENT_EMAIL')
        
        if all([firebase_type, firebase_project_id, firebase_private_key_id, firebase_private_key, firebase_client_email]):
            # Check if these are placeholder values
            if (firebase_private_key_id == 'placeholder_key_id' or 
                'placeholder' in firebase_private_key):
                print("⚠️  Firebase using placeholder credentials - skipping initialization")
                print("💡 Generate real Firebase credentials for full functionality")
                print("🔗 Visit: https://console.cloud.google.com/iam-admin/serviceaccounts")
            else:
                try:
                    # Use real environment variables (RECOMMENDED for production)
                    firebase_credentials = {
                        'type': firebase_type,
                        'project_id': firebase_project_id,
                        'private_key_id': firebase_private_key_id,
                        'private_key': firebase_private_key.replace('\\n', '\n'),
                        'client_email': firebase_client_email,
                        'client_id': os.environ.get('FIREBASE_CLIENT_ID'),
                        'auth_uri': os.environ.get('FIREBASE_AUTH_URI', 'https://accounts.google.com/o/oauth2/auth'),
                        'token_uri': os.environ.get('FIREBASE_TOKEN_URI', 'https://oauth2.googleapis.com/token'),
                        'auth_provider_x509_cert_url': os.environ.get('FIREBASE_AUTH_PROVIDER_X509_CERT_URL', 'https://www.googleapis.com/oauth2/v1/certs'),
                        'client_x509_cert_url': os.environ.get('FIREBASE_CLIENT_X509_CERT_URL'),
                        'universe_domain': os.environ.get('FIREBASE_UNIVERSE_DOMAIN', 'googleapis.com')
                    }
                    cred = credentials.Certificate(firebase_credentials)
                    firebase_admin.initialize_app(cred)
                    print("[SUCCESS] Firebase initialized successfully from environment variables")
                except Exception as cert_error:
                    print(f"[WARNING] Failed to initialize Firebase with provided credentials: {str(cert_error)[:100]}")
                    print("Continuing in development mode without Firebase...")
        else:
            print("[ERROR] Firebase credentials not found in environment variables")
            print("Please set up Firebase environment variables in your .env file")
            print("See .env.example for required variables")
    except Exception as e:
        print(f"[WARNING] Firebase initialization error: {str(e)}")
        print("The app will continue to work, but Firebase features may be limited")
        if DEBUG:
            print("This is normal in development mode with placeholder credentials")

# Development mode flag for bypassing Firebase when not configured
DEVELOPMENT_MODE = DEBUG and not firebase_admin._apps
if DEBUG:
    print(f"[CONFIG] DEVELOPMENT_MODE set to: {DEVELOPMENT_MODE} (DEBUG={DEBUG}, firebase_apps={len(firebase_admin._apps)})")
    print(f"[CONFIG] Environment: {'development' if not IS_PRODUCTION else 'production'}")
    print(f"[CONFIG] ALLOWED_HOSTS: {ALLOWED_HOSTS}")
    print(f"[CONFIG] CORS_ALLOWED_ORIGINS: {CORS_ALLOWED_ORIGINS[:2]}...")
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

# Replace STATICFILES_STORAGE with STORAGES
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Production Security Settings
if IS_PRODUCTION:
    # HTTPS & SSL Configuration
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')  # For Nginx/Gunicorn
    
    # HSTS (HTTP Strict Transport Security)
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Content Security Headers
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_BROWSER_XSS_FILTER = True
    X_FRAME_OPTIONS = 'DENY'
    
    # Cookie Security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Additional security headers
    SECURE_REFERRER_POLICY = 'same-origin'
else:
    # Development settings
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False