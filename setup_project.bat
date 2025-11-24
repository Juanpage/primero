@echo off
setlocal ENABLEDELAYEDEXPANSION

:: Ask for project name if not provided as first argument
if "%~1"=="" (
  set /p PROJECT_NAME="Ingresa el nombre del proyecto: "
) else (
  set PROJECT_NAME=%~1
)

if "%PROJECT_NAME%"=="" set PROJECT_NAME=VisitingWorld

set BASE=%CD%\%PROJECT_NAME%

echo Creando estructura en %BASE%

for %%D in ("assets" "assets\css" "assets\js" "assets\js" "assets\data" "assets\img" "assets\img\places" "assets\img\promotions" "assets\img\partners" "assets\video" "assets\pdf" "pages") do (
  if not exist "%BASE%\%%~D" (
    mkdir "%BASE%\%%~D"
    echo + Carpeta %%~D creada
  ) else (
    echo + Carpeta %%~D ya existía, se mantiene
  )
)

for %%F in ("index.html" "pages\destination.html" "assets\css\styles.css" "assets\js\main.js" "assets\js\chatbot.js" "assets\js\email.js" "assets\data\travel-data.json") do (
  set TARGET=%BASE%\%%~F
  if not exist "!TARGET!" (
    type nul > "!TARGET!"
    echo + Archivo %%~F creado
  ) else (
    echo + Archivo %%~F ya existía, se mantiene
  )
)

echo Estructura lista.
endlocal
