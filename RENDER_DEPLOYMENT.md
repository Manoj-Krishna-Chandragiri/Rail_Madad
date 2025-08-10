# Render Deployment Guide for Rail Madad

This guide explains how to deploy the Rail Madad application on Render.com, with a focus on handling the Firebase credentials securely.

## Firebase Credentials Setup

Instead of using a JSON file for Firebase credentials (which can cause issues with Git), we now use environment variables. Follow these steps to set up your deployment on Render:

1. Log in to your Render dashboard at https://dashboard.render.com/
2. Navigate to your Rail Madad backend service
3. Go to the "Environment" tab
4. Add the following environment variables (copy these from your local `.env` file):

```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=railmadad-login
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key-here
FIREBASE_CLIENT_EMAIL=your-client-email@railmadad-login.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-client-email%40railmadad-login.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

5. Make sure to add all your other necessary environment variables as well:

```
DJANGO_SECRET_KEY=your-django-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=rail-madad-backend.onrender.com,rail-madad.manojkrishna.me

# Database settings
MYSQL_DATABASE=defaultdb
MYSQL_USER=avnadmin
MYSQL_PASSWORD=your-mysql-password-here
MYSQL_HOST=your-mysql-host.c.aivencloud.com
MYSQL_PORT=21965
```

6. Click "Save Changes"
7. Trigger a manual deploy to apply these changes

## Important Security Notes

1. In a production environment, it's recommended to rotate your Firebase service account keys periodically
2. Consider using Render's "Secret Files" feature for highly sensitive credentials
3. Make sure your `.gitignore` file continues to exclude:
   - `.env` files
   - Any Firebase credential JSON files

## Troubleshooting

If you encounter any issues with the Firebase initialization, check the Render logs for error messages. Common issues include:

1. Make sure the `FIREBASE_PRIVATE_KEY` maintains its newline characters (`\n`)
2. Verify that all environment variables are correctly copied without any typos
3. Confirm that your Firebase service account has the necessary permissions

For any persistent issues, you can temporarily enable debug logs by setting `DJANGO_DEBUG=True` to get more detailed error information.
