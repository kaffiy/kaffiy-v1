@echo off
title Kaffiy Growth Dashboard
cd /d "%~dp0"

REM Sunucuyu yeni pencerede baslat (pencere acik kalsin)
start "Kaffiy Growth Dashboard - Sunucu" cmd /k "npm run dev"

REM Tarayiciyi acmadan once birkaç saniye bekle
timeout /t 4 /nobreak > nul

REM Tarayicida dashboard'u ac
start http://localhost:5173
