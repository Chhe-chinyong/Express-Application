# Node.js Authentication API (Learning Project)

**Note:** This is a learning project and not intended for production use.

## Project Overview
A simple Express.js authentication system demonstrating:
- User registration with password hashing
- JWT-based authentication
- Basic security practices
- Middleware configuration

## Quick Start
```bash
# Install dependencies
npm install express bcryptjs jsonwebtoken dotenv

# Create .env file
echo "SECRET_KEY=your_secret_key_here" > .env

# Start server
node server.js
