@echo off
rem Double-clic : installe l'outil. "installer.cmd desinstaller" : le retire.
if /i "%~1"=="desinstaller" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1" -Desinstaller
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0installer.ps1"
)
pause
