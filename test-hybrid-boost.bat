@echo off
REM Test Enhanced Hybrid Classifier for 95%+ accuracy

echo ============================================================
echo   ENHANCED HYBRID CLASSIFIER - PERFORMANCE TEST
echo ============================================================
echo.
echo Goal: Boost Priority/Severity from 87%%/83%% to 95%%+
echo Strategy: Aggressive rule-based boosting for critical cases
echo.

cd backend

echo Running hybrid boost test...
echo.

python test_hybrid_boost.py

echo.
echo ============================================================
echo   Test Complete
echo ============================================================
echo.

pause
