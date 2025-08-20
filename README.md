# Todo App API

A simple RESTful API for managing todo tasks with user authentication.

## Tech Stack

- Node.js, Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create `.env` file:

   ```env
   PORT=
   ACCESS_TOKEN_SECRET=""
   DB_HOST_URL=""
   DB_NAME=""
   ```

3. **Start server**
   ```bash
   npm run start
   ```

## API Endpoints

### Authentication

- `POST /api/v1/users/register` - Register user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/logout` - Logout user

### Todos (Requires JWT token)

- `POST /api/v1/todos` - Create todo
- `GET /api/v1/todos` - Get all todos
- `GET /api/v1/todos/:id` - Get single todo
- `PUT /api/v1/todos/:id` - Update todo
- `DELETE /api/v1/todos/:id` - Delete todo

## Testing

Use Postman or similar tools to test the API endpoints.
