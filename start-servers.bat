@echo off
start cmd /k "cd backend && python manage.py runserver 8001"
timeout /t 5
start cmd /k "cd frontend && npm run dev"
