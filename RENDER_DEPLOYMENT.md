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
FIREBASE_PRIVATE_KEY_ID=5305d3439b90b1eaa7aebd8683da54b688c43a3e
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDIHw049wGzGb0Z\nDE2hd5MCht1OJFILcX7KB86tHiBQZXtom3mPBVZ5r5lnKGqavYhOCYt9hWJEAmLU\nSa0wMjGDCnnNm6aXmetdHSm36Cblmzt9bXQ5myoyDYpYNz8gVavt2q28qFvpXJpG\nkxFlNfJB3izML755aIULel3oMG5VoKcd1hWugJpV5tZPMrlxUlxn1NxIipwkhVDA\nwLWx5B1DMKLxud6b2mTDbehqEgyjcmRXjWEJilL+ZfT+ncs9jU5K1xGVgGM0SKhJ\n457CR9XDa4lOxPh+FdMwtfyyZRLLKSgjOhDoSaCA9GJ8Mu7iusqWKYoJPIRsGRrw\nGp8ORAa5AgMBAAECggEAA4k47JbAuu9rffPPs1ivik3jvyu5H2aj/OHibwCnRYRl\nh9WncjV/76qApWf7ajyLGgXlJxSiRd1c7a9XlhBs+4nF2TI04Vzg4cZQJGW/ujLh\n/Ddg5FuvhS7kEOb5AJNC9HL2uuymoxr1xuV2Wzl2zF8mn30Aepi0MR26Zw3kBTNH\nfueNgeIoaqDbg5UHY8Xs1zJD8sP7WR0Bvow3544vOCR2Gkrfh0VvHN5QKXxluNwP\ngfSpB2DECBnjXfbtTipGiJntP1eqculkvuejR/3o0MrzreR/uam9+dqpKA3h8zOs\nTwSNXzzsjxbtk1s/LqCrjuB7LVeGkdXJFgDisocguQKBgQDsu5C4BoetzAWuq66W\n+rB7GTwBImY7Pd+9jU79v9KR49KaAAiqGH9tW+ZI1LsGWCI7ZA+spJHiP6vfZVLc\nbvjuA/utHyo8TbC4b08M0ULHhFj/iIei/L/cIYajteTHREXmV8qC6WZJAPPkRG0Z\ne24g7h4v2OOaNq/odzGjfMAtXwKBgQDYaKvaBcfHqsIsZ7T/W177JTvA1bAR9Siz\nk2WuRLq2oVEonJXU+oVTvsIzTZbeOTu9gdLSAmsV6hMSiU+EAmcfh8ADWkebf5v9\n77fmeO+ng6fgsIkGU3iIK8iMHd/L80u17Nkj7ZQ+S4Af+pNPdl1sTIMpJncAA9AD\nNbX7QYaq5wKBgChwReFZpDWpA1N6GkHKIvl0Lw7WjHYUNLMRf2vTJ6oqK6CI3vIH\na0UIDMdmJ2iHB5nzlsXb+tuWGsr3aPcksbsezRAeob1ZXBW1VeCPooOodPd5oAnU\neQWmaHRwrtrnK7WUS5CfRAy2b/MPST+wGPjhFCECQKboLpZcPgt6VO2rAoGAFy1m\nsmwKEIVmVHEq/mpfytAbDTUVrWavXEQ+EKMFyEeQtKPInE3Ud7qne+0kalqA3nQI\nCzv9EhTGxCZ2oLHNL6BPXUyO/MV3BIRnEsUDDdLY6QSfOFE6SIM/8FnGvUYqZqqe\nOu3YAa/+Ye5pVopbyRyMs5yOBC9kWOOowOcssCMCgYAI7b4CIEI2owuNpTu55lYX\nlAmFEX8uiMV7cLgCtpBLq5R/7pL7Bu3WXFnMEbVXY08lNBh6gsq/xAWuiF+stZuv\nedeLEy9lyFj9AFBlIxA8dWlk6eJtfUKwr+Z/yYpeod8cWXo+Xo8LV7j8k+lzAaJj\nbsqgfrNhqO73EvspEuySXw==\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@railmadad-login.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=114268549453695544166
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40railmadad-login.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

5. Make sure to add all your other necessary environment variables as well:

```
DJANGO_SECRET_KEY=9jk$ukho40ar_@o%ummdylk#c1m)%bn_l=3x=-b*k!+66@t=#=
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=rail-madad-backend.onrender.com,rail-madad.manojkrishna.me

# Database settings
MYSQL_DATABASE=defaultdb
MYSQL_USER=avnadmin
MYSQL_PASSWORD=AVNS_AVkDcLu9vBZO1ize1yY
MYSQL_HOST=rail-madad-backend-railmadad.c.aivencloud.com
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
