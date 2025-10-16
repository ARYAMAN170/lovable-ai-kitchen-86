@echo off
echo 🧪 Testing Stir Recipe App Integration
echo =====================================

REM Test Backend API
echo.
echo Testing Backend API...
curl -s http://localhost:8000/ | findstr "Stir Recipe API" >nul && echo ✅ Backend API responding || echo ❌ Backend API not responding

REM Test Frontend
echo.
echo Testing Frontend...
curl -s http://localhost:8080/ | findstr "Stir" >nul && echo ✅ Frontend serving content || echo ❌ Frontend not responding

REM Check required files
echo.
echo Checking Project Structure...

if exist "backend\main.py" (echo ✅ backend\main.py exists) else (echo ❌ backend\main.py missing)
if exist "backend\models.py" (echo ✅ backend\models.py exists) else (echo ❌ backend\models.py missing)
if exist "backend\auth.py" (echo ✅ backend\auth.py exists) else (echo ❌ backend\auth.py missing)
if exist "backend\database.py" (echo ✅ backend\database.py exists) else (echo ❌ backend\database.py missing)
if exist "backend\.env" (echo ✅ backend\.env exists) else (echo ❌ backend\.env missing)
if exist "src\lib\api.ts" (echo ✅ src\lib\api.ts exists) else (echo ❌ src\lib\api.ts missing)
if exist "src\lib\apiClient.ts" (echo ✅ src\lib\apiClient.ts exists) else (echo ❌ src\lib\apiClient.ts missing)
if exist "src\contexts\AuthContext.tsx" (echo ✅ src\contexts\AuthContext.tsx exists) else (echo ❌ src\contexts\AuthContext.tsx missing)
if exist "src\pages\Favorites.tsx" (echo ✅ src\pages\Favorites.tsx exists) else (echo ❌ src\pages\Favorites.tsx missing)
if exist "src\pages\Generate.tsx" (echo ✅ src\pages\Generate.tsx exists) else (echo ❌ src\pages\Generate.tsx missing)
if exist "src\pages\RecipeDetail.tsx" (echo ✅ src\pages\RecipeDetail.tsx exists) else (echo ❌ src\pages\RecipeDetail.tsx missing)

echo.
echo Integration Test Complete!
echo.
echo 📋 Summary:
echo - Backend: FastAPI server with MongoDB
echo - Frontend: React + TypeScript + Vite  
echo - Database: MongoDB Atlas cluster
echo - Authentication: JWT-based
echo.
echo 🚀 Access the application:
echo - Frontend: http://localhost:8080
echo - Backend API: http://localhost:8000
echo - API Docs: http://localhost:8000/docs

pause