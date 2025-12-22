@echo off
echo Starting ESG Reporting System...
echo.

echo Starting Backend Server...
start "ESG Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
start "ESG Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause