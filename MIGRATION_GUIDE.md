# Stir Recipe App - Complete Setup & Migration Guide

This project has been successfully migrated from Supabase to MongoDB. Here's everything you need to know:

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + Python
- **Database**: MongoDB (your existing cluster)
- **Authentication**: JWT-based (replacing Supabase Auth)

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
# In the root directory
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:8080`

## 🔧 Configuration

### Backend (.env file)
```
MONGODB_URL=mongodb+srv://cybernews:12121212@cluster0.zn1gohj.mongodb.net/
DATABASE_NAME=stir_app
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env file)
```
VITE_API_BASE_URL=http://localhost:8000
```

## 📊 Database Collections

The app uses these MongoDB collections:

- **users**: User accounts and authentication
- **recipes**: Recipe data with ingredients and instructions
- **favorites**: User favorite recipes

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user info

### Recipes
- `POST /recipes` - Create recipe
- `GET /recipes` - Get user's recipes
- `GET /recipes/{id}` - Get specific recipe
- `DELETE /recipes/{id}` - Delete recipe

### Favorites
- `POST /favorites/{recipe_id}` - Add to favorites
- `DELETE /favorites/{recipe_id}` - Remove from favorites
- `GET /favorites` - Get favorite recipes

## 📱 Features

✅ **User Authentication** - JWT-based login/register
✅ **Recipe Generation** - Create recipes from ingredients
✅ **Recipe Management** - View, create, delete recipes
✅ **Favorites System** - Save favorite recipes
✅ **Responsive UI** - Mobile-first design
✅ **MongoDB Integration** - Full database functionality

## 🛠️ What Changed

### Removed:
- Supabase client and dependencies
- Supabase authentication system
- Supabase database integration

### Added:
- FastAPI backend server
- MongoDB database connection
- JWT authentication system
- Custom recipe API endpoints
- Enhanced UI components

## 🔍 Testing

1. Start both backend and frontend servers
2. Register a new account at `http://localhost:8080`
3. Try generating a recipe with ingredients
4. Add recipes to favorites
5. View your favorite recipes

## 🚀 Production Deployment

For production:
1. Change the SECRET_KEY in backend/.env
2. Update CORS origins in main.py
3. Set up proper MongoDB connection string
4. Configure frontend build for your domain

## 📚 API Documentation

When the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`