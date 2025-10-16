# 🎯 Required API Endpoints for Stir Recipe App

## Base URL Configuration
Set your base URL in `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8000'; // Update with your backend URL
```

## 📋 API Endpoints You Need to Implement

### 1. **GET /api/v1/recipes/?skip=0&limit=100** - Get All Recipes
**Purpose**: Load recipes for home page and recipe browsing

**Query Parameters**:
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 100)

**Response Format**:
```json
[
  {
    "_id": "string",
    "title": "string", 
    "ingredients_cleaned": ["array of strings"],
    "instructions": "string",
    "image": {
      "url": "string",
      "public_id": "string",
      "width": number,
      "height": number,
      "format": "string"
    }
  }
]
```

**Example Response**:
```json
[
  {
    "_id": "68ed43151b5c24dd9cd2f1b3",
    "title": "Turmeric Hot Toddy",
    "ingredients_cleaned": [
      "¼ cup granulated sugar",
      "¾ tsp. ground turmeric", 
      "1 ½ oz. Amontillado sherry",
      "1 oz. bourbon"
    ],
    "instructions": "For the turmeric syrup, combine ½ cup hot water with sugar and turmeric...",
    "image": {
      "url": "https://res.cloudinary.com/dswpzlaij/image/upload/v1760379668/recipes/turmeric-hot-toddy.jpg",
      "public_id": "recipes/turmeric-hot-toddy",
      "width": 274,
      "height": 169,
      "format": "jpg"
    }
  }
]
```

### 2. **GET /recipes/{id}** - Get Single Recipe
**Purpose**: Load individual recipe details

**Parameters**:
- `id` (path): Recipe ID

**Response Format**: Same as single recipe object above

### 3. **POST /recipes** - Create New Recipe (Optional)
**Purpose**: For recipe generation feature

**Request Body**:
```json
{
  "title": "string",
  "ingredients_cleaned": ["array of strings"],
  "instructions": "string",
  "image": {
    "url": "string",
    "public_id": "string", 
    "width": number,
    "height": number,
    "format": "string"
  }
}
```

**Response**: Same as GET /recipes/{id}

### 4. **DELETE /recipes/{id}** - Delete Recipe (Optional)
**Purpose**: Allow users to delete their created recipes

**Parameters**:
- `id` (path): Recipe ID

**Response**:
```json
{
  "message": "Recipe deleted successfully"
}
```

## 🔧 Frontend Integration Status

### ✅ **Currently Working**:
- **Home Page**: Fetches and displays recipes from `/recipes` endpoint
- **Recipe Detail**: Fetches individual recipes from `/recipes/{id}` endpoint  
- **Navigation**: All page routing works without authentication
- **UI Components**: All shadcn/ui components properly styled
- **Image Display**: Cloudinary images display correctly with fallbacks

### ⏳ **Mock Features** (No Backend Required Yet):
- **Authentication**: Uses mock user, no real login needed
- **Favorites**: Stored locally, no backend persistence
- **Recipe Generation**: Creates mock recipes
- **Search**: Not yet implemented

### 📱 **How to Test Your API**:

1. **Start your backend server** on the port configured in `src/lib/api.ts`

2. **Test the endpoints**:
   ```bash
   # Test recipe listing
   curl http://localhost:8000/recipes
   
   # Test single recipe  
   curl http://localhost:8000/recipes/68ed43151b5c24dd9cd2f1b3
   ```

3. **Start the frontend**:
   ```bash
   cd c:\Users\ARYAMAN\Downloads\Stir
   npm run dev
   ```

4. **Expected Results**:
   - **Home page**: Shows your recipes with Cloudinary images
   - **Recipe detail**: Clicking recipes shows full details
   - **No auth required**: Can browse freely without login
   - **Responsive**: Works on mobile and desktop

## 🚀 **Next Steps After Basic API**:

1. **Add Search**: `GET /recipes?search=query`
2. **Add Categories**: `GET /recipes?category=breakfast`  
3. **Add Pagination**: `GET /recipes?page=1&limit=10`
4. **Add User System**: Authentication endpoints
5. **Add Favorites**: User-specific favorite recipes
6. **Add Recipe Creation**: Full recipe generation with AI

## 🔗 **Current API Configuration**:
- **Base URL**: Set in `src/lib/api.ts` 
- **CORS**: Make sure your backend allows requests from `http://localhost:8081`
- **Content-Type**: Expects `application/json`
- **Authentication**: Currently bypassed (mock user)

Your backend just needs to implement the basic recipe endpoints and the frontend will work perfectly! 🎉