@echo off
echo ===================================================
echo Starting ClaimFlow AI (ValueMomentum Workbench)
echo Open your browser at: http://localhost:8000
echo ===================================================
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
