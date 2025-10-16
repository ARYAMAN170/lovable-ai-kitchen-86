# 🔌 Backend API Documentation for Stir Recipe App

## Overview
This document outlines all the API endpoints you need to implement for the Stir Recipe App backend. The frontend is already configured to work with these endpoints.

## 🛠️ Base Configuration
- **Base URL**: `http://localhost:8000` (or your preferred port)
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer token in Authorization header

## 🔐 Authentication Endpoints

### 1. User Registration
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "id": "user_id_string",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-01-01T00:00:00Z",
  "is_active": true
}
```

**Error Responses:**
- `400` - Email already registered
- `422` - Validation error

---

### 2. User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "access_token": "jwt_token_string",
  "token_type": "bearer",
  "user": {
    "id": "user_id_string",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `401` - Invalid credentials

---

### 3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "id": "user_id_string",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-01-01T00:00:00Z",
  "is_active": true
}
```

**Error Responses:**
- `401` - Invalid or expired token

---

## 🍳 Recipe Endpoints

### 4. Create Recipe
**POST** `/recipes`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Request Body:**
```json
{
  "title": "Spaghetti Carbonara",
  "description": "Classic Italian pasta dish",
  "ingredients": [
    "spaghetti",
    "eggs", 
    "parmesan cheese",
    "pancetta"
  ],
  "instructions": [
    "Cook spaghetti according to package directions",
    "Cook pancetta until crispy",
    "Mix eggs and cheese",
    "Combine all ingredients"
  ],
  "prep_time": "15",
  "cook_time": "20",
  "difficulty": "Medium",
  "calories": "450",
  "protein": "25",
  "carbs": "55",
  "fat": "18",
  "servings": 4
}
```

**Response (201):**
```json
{
  "id": "recipe_id_string",
  "title": "Spaghetti Carbonara",
  "description": "Classic Italian pasta dish",
  "ingredients": ["spaghetti", "eggs", "parmesan cheese", "pancetta"],
  "instructions": ["Cook spaghetti...", "Cook pancetta..."],
  "prep_time": "15",
  "cook_time": "20", 
  "difficulty": "Medium",
  "calories": "450",
  "protein": "25",
  "carbs": "55",
  "fat": "18",
  "servings": 4,
  "user_id": "user_id_string",
  "created_at": "2025-01-01T00:00:00Z",
  "is_favorite": false
}
```

---

### 5. Get User's Recipes
**GET** `/recipes`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
[
  {
    "id": "recipe_id_string",
    "title": "Spaghetti Carbonara",
    "description": "Classic Italian pasta dish",
    "ingredients": ["spaghetti", "eggs", "parmesan cheese", "pancetta"],
    "instructions": ["Cook spaghetti...", "Cook pancetta..."],
    "prep_time": "15",
    "cook_time": "20",
    "difficulty": "Medium",
    "calories": "450",
    "protein": "25",
    "carbs": "55",
    "fat": "18",
    "servings": 4,
    "user_id": "user_id_string",
    "created_at": "2025-01-01T00:00:00Z",
    "is_favorite": true
  }
]
```

---

### 6. Get Single Recipe
**GET** `/recipes/{recipe_id}`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "id": "recipe_id_string",
  "title": "Spaghetti Carbonara",
  "description": "Classic Italian pasta dish",
  "ingredients": ["spaghetti", "eggs", "parmesan cheese", "pancetta"],
  "instructions": ["Cook spaghetti...", "Cook pancetta..."],
  "prep_time": "15",
  "cook_time": "20",
  "difficulty": "Medium",
  "calories": "450",
  "protein": "25",
  "carbs": "55", 
  "fat": "18",
  "servings": 4,
  "user_id": "user_id_string",
  "created_at": "2025-01-01T00:00:00Z",
  "is_favorite": false
}
```

**Error Responses:**
- `404` - Recipe not found
- `403` - Not authorized to view this recipe

---

### 7. Delete Recipe
**DELETE** `/recipes/{recipe_id}`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "message": "Recipe deleted successfully"
}
```

**Error Responses:**
- `404` - Recipe not found
- `403` - Not authorized to delete this recipe

---

## ❤️ Favorites Endpoints

### 8. Add Recipe to Favorites
**POST** `/favorites/{recipe_id}`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "message": "Added to favorites"
}
```

**Error Responses:**
- `404` - Recipe not found
- `400` - Recipe already in favorites

---

### 9. Remove Recipe from Favorites
**DELETE** `/favorites/{recipe_id}`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "message": "Removed from favorites"
}
```

**Error Responses:**
- `404` - Favorite not found

---

### 10. Get User's Favorite Recipes
**GET** `/favorites`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
[
  {
    "id": "recipe_id_string",
    "title": "Chicken Stir Fry",
    "description": "Quick and healthy stir-fried chicken",
    "ingredients": ["chicken breast", "bell peppers", "broccoli"],
    "instructions": ["Cut chicken...", "Heat oil..."],
    "prep_time": "10",
    "cook_time": "15",
    "difficulty": "Easy",
    "calories": "320",
    "protein": "35",
    "carbs": "15",
    "fat": "12",
    "servings": 2,
    "user_id": "user_id_string",
    "created_at": "2025-01-01T00:00:00Z",
    "is_favorite": true
  }
]
```

---

## 🗄️ Database Schema Suggestion

### Users Collection/Table
```json
{
  "_id": "ObjectId or UUID",
  "email": "string (unique)",
  "name": "string",
  "hashed_password": "string",
  "created_at": "datetime",
  "is_active": "boolean"
}
```

### Recipes Collection/Table
```json
{
  "_id": "ObjectId or UUID",
  "user_id": "string (foreign key)",
  "title": "string",
  "description": "string",
  "ingredients": "array of strings",
  "instructions": "array of strings", 
  "prep_time": "string",
  "cook_time": "string",
  "difficulty": "string",
  "calories": "string",
  "protein": "string",
  "carbs": "string",
  "fat": "string",
  "servings": "number",
  "created_at": "datetime"
}
```

### Favorites Collection/Table
```json
{
  "_id": "ObjectId or UUID",
  "user_id": "string (foreign key)",
  "recipe_id": "string (foreign key)",
  "created_at": "datetime"
}
```

---

## 🔒 CORS Configuration
Make sure to allow these origins in your backend CORS settings:
```
http://localhost:8080
http://localhost:8081
http://localhost:3000
http://localhost:5173
```

---

## 🚀 Frontend Integration
The frontend is already configured to call these endpoints using:
- **Auth**: `authAPI.login()`, `authAPI.register()`, `authAPI.getCurrentUser()`
- **Recipes**: `recipeAPI.createRecipe()`, `recipeAPI.getRecipes()`, `recipeAPI.getRecipe()`, `recipeAPI.deleteRecipe()`
- **Favorites**: `favoritesAPI.addFavorite()`, `favoritesAPI.removeFavorite()`, `favoritesAPI.getFavorites()`

The frontend automatically includes JWT tokens in the Authorization header for authenticated requests.

---

## 📝 Notes
1. All `prep_time`, `cook_time`, `calories`, `protein`, `carbs`, and `fat` are stored as strings in the frontend
2. JWT tokens should expire after a reasonable time (e.g., 24 hours)
3. Passwords should be hashed before storing
4. The `is_favorite` field in recipe responses should be calculated based on whether the current user has favorited that recipe
5. MongoDB connection string: `mongodb+srv://cybernews:12121212@cluster0.zn1gohj.mongodb.net/`

## ✅ Ready to Go!
Your frontend is now running at **http://localhost:8080** with mock data. Once you implement these endpoints, simply replace the mock functions in `src/lib/apiClient.ts` with real API calls!