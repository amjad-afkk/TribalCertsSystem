@echo off
title Launch Project

:: Start server in a new window
start "Server" cmd /k "cd /d C:\Users\notam\Desktop\I_hate_SIH\server && npm run dev"

:: Start client in a new window
start "Client" cmd /k "cd /d C:\Users\notam\Desktop\I_hate_SIH\client && npm run dev"

exit