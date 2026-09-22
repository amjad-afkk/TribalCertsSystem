@echo off
title Launch Project

:: Start server in a new window
start "Server" cmd /k "cd /d "%~dp0server" && npm run dev"

:: Start client in a new window
start "Client" cmd /k "cd /d "%~dp0client" && npm run dev"

exit