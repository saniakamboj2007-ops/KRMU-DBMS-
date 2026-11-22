@echo off
title BHOOKH Database Seeder
cd backend
echo =================================================================
echo   BHOOKH — MySQL 8.0 Database Initialization (bHOOKH_db)
echo =================================================================
echo.
node src/utils/seedData.js
pause
