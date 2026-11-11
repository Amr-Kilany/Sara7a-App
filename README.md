# 🚀 Sara7a App (Backend API)

A robust, secure, and production-ready backend API inspired by the Sara7a platform, built with **Node.js**, **Express**, **MongoDB**, and **Redis**. It features advanced authentication flows, token revocation via Redis, social authentication, secure file handling, and messaging capabilities.

---

## 🌟 Key Features

- **Advanced Authentication & Security**:
  - Local user signup with OTP-based email verification (powered by event emitters and Argon2 hashing).
  - JWT-based authentication supporting Access and Refresh tokens with dual-level signatures (User/Admin).
  - Google OAuth 2.0 social login integration (`/social-login`).
  - Forgot and reset password workflows with secure OTP validation.
- **Token Revocation & Management**:
  - Instant token blacklisting and revocation handling using **Redis** (with dynamic TTL expiration matching JWT expiration).
  - Persistent database-level revocation tracking via MongoDB (`TokenModel`).
  - Automatic invalidation of active tokens if user credentials are changed.
- **Messaging System**:
  - Send, receive, and manage anonymous/direct messages.
  - Toggle read status and favorite status for messages.
- **Security & Middleware Protection**:
  - Custom IP-based rate limiting to prevent abuse and DDoS attempts.
  - File upload validation using magic bytes inspection (`file-type`) to ensure payload safety.
  - Security hardening with Helmet, CORS configuration, and Morgan request logging.
- **Robust Error Handling**:
  - Centralized global error handling with custom operational error responses.
  - Comprehensive request validation using **Joi** schemas.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database & ORM**: MongoDB, Mongoose (with repository pattern abstraction)
- **Caching & Revocation**: Redis (Upstash)
- **Authentication**: JSON Web Tokens (JWT), Google Auth Library
- **Security & Validation**: Argon2 (Hashing), Joi (Validation), Helmet, Express Rate Limit
- **Utilities**: Nodemailer (Email events), Multer (File uploads)

---

## 📁 Project Architecture

```text
Sara7a-App/
├── config/                  # Environment and global configuration
├── src/
│   ├── DB/                  # Database connections, models, and repository patterns
│   │   ├── Models/          # Mongoose schemas (User, Message, Token)
│   │   └── ...
│   ├── Middlewares/         # Authentication, validation, rate-limiting, and security
│   ├── Modules/             # Feature-based modular architecture (Auth, Messages, Users)
│   │   ├── Auth/            # Authentication controllers, services, and routes
│   │   ├── Messages/        # Messaging controllers, services, and routes
│   │   └── Users/           # User profile management
│   ├── Utils/               # Helpers, email events, security/hashing, and response handlers
│   └── app.controller.js    # Express application bootstrap and middleware wiring
└── index.js                 # Application entry point
```

⚙️ Getting Started
Prerequisites
Node.js installed on your machine.

A running MongoDB instance (or MongoDB Atlas connection string).

A Redis instance (such as an Upstash Redis database).

Environment Variables
Create a .env.dev file inside a config/ folder with the following variables:

PORT=3000
NODE_ENV=development
DB_URI="your_mongodb_connection_string"

UPSTASH_REDIS_HOST="your_redis_host"
UPSTASH_REDIS_PORT=6379
UPSTASH_REDIS_USERNAME="default"
UPSTASH_REDIS_PASSWORD="your_redis_password"

CLIENT_ID="your_google_oauth_client_id"

Installation & Running
Clone the repository:

Bash
git clone [https://github.com/Amr-Kilany/Sara7a-App.git](https://github.com/Amr-Kilany/Sara7a-App.git)
cd Sara7a-App
Install dependencies:

Bash
npm install
Run the application:

Bash
npm run dev
