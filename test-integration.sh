#!/bin/bash

echo "🧪 Testing Stir Recipe App Integration"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test MongoDB Connection
echo -e "\n${YELLOW}Testing MongoDB Connection...${NC}"
python -c "
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

try:
    client = MongoClient(os.getenv('MONGODB_URL'))
    client.admin.command('ping')
    print('✅ MongoDB connection successful')
    db = client[os.getenv('DATABASE_NAME')]
    print(f'✅ Database \"{os.getenv(\"DATABASE_NAME\")}\" accessible')
    client.close()
except Exception as e:
    print(f'❌ MongoDB connection failed: {e}')
"

# Test Backend API
echo -e "\n${YELLOW}Testing Backend API...${NC}"
curl -s http://localhost:8000/ | grep -q "Stir Recipe API" && echo "✅ Backend API responding" || echo "❌ Backend API not responding"

curl -s http://localhost:8000/docs | grep -q "swagger" && echo "✅ API documentation available" || echo "❌ API documentation not available"

# Test Frontend
echo -e "\n${YELLOW}Testing Frontend...${NC}"
curl -s http://localhost:8080/ | grep -q "Stir" && echo "✅ Frontend serving content" || echo "❌ Frontend not responding"

# Check required files
echo -e "\n${YELLOW}Checking Project Structure...${NC}"

files=(
    "backend/main.py"
    "backend/models.py" 
    "backend/auth.py"
    "backend/database.py"
    "backend/.env"
    "src/lib/api.ts"
    "src/lib/apiClient.ts"
    "src/contexts/AuthContext.tsx"
    "src/pages/Favorites.tsx"
    "src/pages/Generate.tsx"
    "src/pages/RecipeDetail.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo -e "\n${GREEN}Integration Test Complete!${NC}"
echo -e "\n📋 Summary:"
echo "- Backend: FastAPI server with MongoDB"
echo "- Frontend: React + TypeScript + Vite"
echo "- Database: MongoDB Atlas cluster"
echo "- Authentication: JWT-based"
echo ""
echo "🚀 Access the application:"
echo "- Frontend: http://localhost:8080"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"