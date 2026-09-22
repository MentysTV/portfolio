@echo off
title ⚡ CYBER PC MONITOR // LAUNCHER
chcp 65001 >nul
cd /d "%~dp0"

echo =====================================================================
echo  ⚡ SPUŠTĚNÍ CYBER PC MONITOR - SLEDOVÁNÍ VÝKONU PC
echo =====================================================================
echo.
echo [1/2] Kontrola závislostí a Pythonu...

where py >nul 2>nul
if %errorlevel% equ 0 (
    set PY_CMD=py -3.14
) else (
    where python >nul 2>nul
    if %errorlevel% equ 0 (
        set PY_CMD=python
    ) else (
        echo [CHYBA] Python nebyl v systému nalezen! Nainstalujte prosím Python 3.
        pause
        exit /b 1
    )
)

%PY_CMD% -c "import psutil" 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Instaluji balíček psutil pro čtení systémových metrik...
    %PY_CMD% -m pip install psutil
)

echo [2/2] Spouštím aplikaci a otevírám nativní okno na obrazovce...
echo.
%PY_CMD% app.py

pause
