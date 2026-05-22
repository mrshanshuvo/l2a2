# DevPulse

> Internal Tech Issue & Feature Tracker
> A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

## 🚀 Live URL

[Insert Live URL Here]

## ✨ Features

- **Authentication & Authorization**: Secure signup and login using JWT. Role-based access control with `contributor` and `maintainer` roles.
- **Issue Management**: Create, read, update, and delete bugs and feature requests.
- **Data Integrity**: Built with PostgreSQL using raw SQL (no ORMs) for high performance and strict schema enforcement.

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (using `pg` driver)
- **Security**: `bcrypt` for password hashing, `jsonwebtoken` for secure API access

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v24.x or higher)
- PostgreSQL

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd L2A2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory based on `.env.example` and configure your variables:
   ```env
   PORT=5000
   connectionString=postgres://username:password@localhost:5432/devpulse
   access_secret=your_access_secret_key
   refresh_secret=your_refresh_secret_key
   access_token_expiration=1d
   refresh_token_expiration=7d
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   *Note: The database tables will automatically be initialized on server start via `db/index.ts`.*

## 🌐 API Endpoints

### Authentication Module
- `POST /api/auth/signup` - Register a new user (contributor or maintainer)
- `POST /api/auth/login` - Authenticate user and receive JWT tokens
- `POST /api/auth/refresh-token` - Generate a fresh access token

### Issues Module
- `POST /api/issues` - Create a new issue (Auth required)
- `GET /api/issues` - Retrieve all issues (Supports `?sort=newest|oldest`, `?type=bug|feature_request`, `?status=open|in_progress|resolved`)
- `GET /api/issues/:id` - Retrieve full details of a specific issue
- `PATCH /api/issues/:id` - Update issue details (Maintainer: any issue; Contributor: own open issue)
- `DELETE /api/issues/:id` - Delete an issue (Maintainer only)

## 🗄️ Database Schema Summary

### `users`
- `id` (Primary Key, Serial)
- `name` (String, Required)
- `email` (String, Unique, Required)
- `password` (Hashed String, Required)
- `role` (String, `contributor` or `maintainer`, Default: `contributor`)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### `issues`
- `id` (Primary Key, Serial)
- `title` (String, Required)
- `description` (Text, Required, Min length 20)
- `type` (String, `bug` or `feature_request`)
- `status` (String, `open`, `in_progress`, `resolved`, Default: `open`)
- `reporter_id` (Integer, reference to Users)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
