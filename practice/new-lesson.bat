@echo off
setlocal

if "%~1"=="" (
    echo Usage: new-lesson lesson-name
    echo Example: new-lesson 07-css-basics
    exit /b 1
)

set "HERE=%~dp0"
set "DEST=%HERE%%~1"

if exist "%DEST%" (
    echo Folder already exists: %~1
    exit /b 1
)

mkdir "%DEST%"
copy "%HERE%_template\index.html" "%DEST%\index.html" >nul
copy "%HERE%_template\style.css" "%DEST%\style.css" >nul
copy "%HERE%_template\script.js" "%DEST%\script.js" >nul

echo Created lesson folder: %~1
endlocal
