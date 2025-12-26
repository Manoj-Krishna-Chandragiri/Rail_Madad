@echo off
REM Script to extract downloaded models and prepare for testing

echo ============================================================
echo   EXTRACT TRAINED MODELS FROM COLAB
echo ============================================================
echo.

REM Check if ZIP file exists
if not exist "trained_models.zip" (
    echo [ERROR] trained_models.zip not found!
    echo.
    echo Please:
    echo   1. Complete training in Google Colab
    echo   2. Run the final download cell
    echo   3. Move trained_models.zip to this directory
    echo   4. Run this script again
    echo.
    pause
    exit /b 1
)

echo [1/4] Found trained_models.zip
echo.

REM Create enhanced directory if it doesn't exist
if not exist "backend\ai_models\models\enhanced" (
    mkdir "backend\ai_models\models\enhanced"
    echo [2/4] Created backend\ai_models\models\enhanced\
) else (
    echo [2/4] Directory backend\ai_models\models\enhanced\ already exists
)
echo.

REM Extract using PowerShell
echo [3/4] Extracting models... (this may take 1-2 minutes)
powershell -Command "Expand-Archive -Path 'trained_models.zip' -DestinationPath 'temp_extract' -Force"

REM Move extracted models to correct location
echo [4/4] Moving models to backend\ai_models\models\enhanced\
if exist "temp_extract\content\category_model" (
    xcopy /E /I /Y "temp_extract\content\category_model" "backend\ai_models\models\enhanced\category_model"
    xcopy /E /I /Y "temp_extract\content\staff_model" "backend\ai_models\models\enhanced\staff_model"
    xcopy /E /I /Y "temp_extract\content\priority_model" "backend\ai_models\models\enhanced\priority_model"
    xcopy /E /I /Y "temp_extract\content\severity_model" "backend\ai_models\models\enhanced\severity_model"
) else (
    REM Try without 'content' prefix
    xcopy /E /I /Y "temp_extract\category_model" "backend\ai_models\models\enhanced\category_model"
    xcopy /E /I /Y "temp_extract\staff_model" "backend\ai_models\models\enhanced\staff_model"
    xcopy /E /I /Y "temp_extract\priority_model" "backend\ai_models\models\enhanced\priority_model"
    xcopy /E /I /Y "temp_extract\severity_model" "backend\ai_models\models\enhanced\severity_model"
)

REM Clean up temp directory
rmdir /S /Q "temp_extract"

echo.
echo ============================================================
echo   SUCCESS! Models extracted to:
echo   - backend\ai_models\models\enhanced\category_model\
echo   - backend\ai_models\models\enhanced\staff_model\
echo   - backend\ai_models\models\enhanced\priority_model\
echo   - backend\ai_models\models\enhanced\severity_model\
echo ============================================================
echo.

REM Verify files
echo Verifying model files...
echo.

set "all_good=1"

for %%m in (category_model staff_model priority_model severity_model) do (
    echo Checking %%m:
    if exist "backend\ai_models\models\enhanced\%%m\config.json" (
        echo   [OK] config.json
    ) else (
        echo   [MISSING] config.json
        set "all_good=0"
    )
    
    if exist "backend\ai_models\models\enhanced\%%m\model.safetensors" (
        echo   [OK] model.safetensors
    ) else (
        echo   [MISSING] model.safetensors
        set "all_good=0"
    )
    
    if exist "backend\ai_models\models\enhanced\%%m\label_encoder.pkl" (
        echo   [OK] label_encoder.pkl
    ) else (
        echo   [MISSING] label_encoder.pkl
        set "all_good=0"
    )
    
    echo.
)

if "%all_good%"=="1" (
    echo ============================================================
    echo   ALL MODEL FILES VERIFIED!
    echo ============================================================
    echo.
    echo Next step: Run test script
    echo   cd backend
    echo   python test_enhanced_models.py
    echo.
) else (
    echo ============================================================
    echo   WARNING: Some model files are missing!
    echo ============================================================
    echo   Please check the extraction manually.
    echo.
)

pause
