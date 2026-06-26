@echo off
REM Start IDM-VTON Python service (requires Python 3.10+ installed)
cd /d "%~dp0"
echo Installing dependencies...
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo.
  echo ERROR: Python not found. Install from https://www.python.org/downloads/
  echo Then run: python -m uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
  pause
  exit /b 1
)
set VTON_MOCK=false
echo Starting vton-service on http://127.0.0.1:8002 ...
python -m uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
