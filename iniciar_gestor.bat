@echo off
title Gestor de Contenidos Web - Alfabetizacion ENS
cd /d "%~dp0"

echo ===================================================
echo   INICIANDO GESTOR DE CONTENIDOS WEB
echo ===================================================

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se encontro Node.js instalado en este equipo.
    echo Para usar el modo automatico, instala Node.js desde https://nodejs.org/
    echo.
    echo Puedes seguir usando el gestor abriendo "gestor/index.html" directamente en tu navegador.
    echo ===================================================
    pause
    exit /b 1
)

echo Iniciando servidor local y abriendo el navegador ...
node gestor/server.js
pause
