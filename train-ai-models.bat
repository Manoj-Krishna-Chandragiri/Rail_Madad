@echo off
REM Railway Complaint AI Model Training Script
REM This script trains the BERT/DistilBERT models for complaint classification

echo ========================================================
echo   Railway Complaint AI Model Training
echo ========================================================
echo.

cd /d "%~dp0backend"

REM Check if virtual environment exists
if not exist "ai_venv\Scripts\python.exe" (
    echo Error: Virtual environment not found!
    echo Please run: python -m venv ai_venv
    echo Then run: ai_venv\Scripts\pip install -r ai_requirements.txt
    pause
    exit /b 1
)

echo Activating virtual environment...
call ai_venv\Scripts\activate.bat

echo.
echo Starting model training...
echo This will take approximately 20-30 minutes on CPU
echo.
echo Configuration:
echo   - Model: DistilBERT
echo   - Epochs: 3
echo   - Batch Size: 8
echo   - Dataset: Railway_Complaints_Enhanced_Dataset_V2.csv
echo.
echo Press Ctrl+C to cancel or wait for training to begin...
timeout /t 5

python train_complaint_classifier.py --dataset "../Railway_Complaints_Enhanced_Dataset_V2.csv" --epochs 3 --batch-size 8 --model-type distilbert

if errorlevel 1 (
    echo.
    echo ========================================================
    echo   Training Failed!
    echo ========================================================
    echo Check the error messages above
    pause
    exit /b 1
) else (
    echo.
    echo ========================================================
    echo   Training Completed Successfully!
    echo ========================================================
    echo Models saved to: backend/ai_models/models/complaint_classifier
    echo.
    echo Next steps:
    echo   1. Test the models: python train_complaint_classifier.py --test-only
    echo   2. Start backend: python manage.py runserver
    echo   3. Access frontend: cd ../frontend and npm run dev
    echo.
)

pause
