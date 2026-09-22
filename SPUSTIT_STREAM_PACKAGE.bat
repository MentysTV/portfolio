@echo off
title MENTYS TV // CYBER VIOLET STREAM SUITE
chcp 65001 >nul
cd /d "%~dp0"

echo ======================================================================
echo    MENTYS TV // CYBER VIOLET STREAM PACKAGE PRO OBS STUDIO
echo ======================================================================
echo.
echo [1/2] Spoustim lokalni streamovaci server pro OBS...
start /b py -m http.server 8088 >nul 2>&1

echo [2/2] Oteviram Stream Control Hub v prohlizeci...
timeout /t 1 >nul
start http://localhost:8088/stream_package/index.html

echo.
echo ======================================================================
echo  SERVER BEZI NA: http://localhost:8088/stream_package/index.html
echo  NAVOD K OBS:   stream_package\NAVOD_OBS.md
echo ======================================================================
echo.
echo Toto okno muzes nechat bezet, dokud streamujes. Pro ukonceni ho zavri.
echo.
pause
