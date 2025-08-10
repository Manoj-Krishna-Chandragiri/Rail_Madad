@echo off
start cmd /k "cd backend && python manage.py runserver"
timeout /t 5
start cmd /k "cd frontend && npm run dev"
