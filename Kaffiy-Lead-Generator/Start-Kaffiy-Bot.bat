@echo off
title Kaffiy AI Marketer (Bot)
cd /d "%~dp0"

echo WAHA (port 3000) ve Dashboard (8080) acik olmali.
echo Bot baslatiliyor...
echo.

cd kaffiy_bot
python kaffiy_ai_marketer.py

pause
