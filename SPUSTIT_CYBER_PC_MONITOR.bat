@echo off
title CYBER PC MONITOR // LAUNCHER
chcp 65001 >nul
cd /d "%~dp0"

:: Pokud je v systému nainstalován Python, spustíme přímo přes něj (žádné modré varování Windows SmartScreen)
where py >nul 2>nul
if %errorlevel% equ 0 (
    cd system_dashboard
    start "" py app.py
    exit
)

where python >nul 2>nul
if %errorlevel% equ 0 (
    cd system_dashboard
    start "" python app.py
    exit
)

:: Fallback na zkompilovaný .exe v případě, že počítač nemá Python
cd /d "%~dp0system_dashboard\dist\Cyber_PC_Monitor"
start "" "Cyber_PC_Monitor.exe"
exit
