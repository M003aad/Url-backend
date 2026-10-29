# 📄 Project Requirements Specification (Cahier des Charges)

## 1. Project Overview

- **Project Name:** URLSHORT Backend
- **Architecture:** Node.js + Express 5, with a layered structure using controllers, use cases, services, models, and cache helpers.
- **Core Goal:** Provide a secure URL shortening API for anonymous redirects and authenticated user link management, while supporting email activation, password reset, and cache-backed lookup performance.

---

## 2. Tech Stack & Dependencies

- **Backend Runtime:** Node.js / Express 5.x
- **Database:** MongoDB & Mongoose ORM
- **Caching & Redirection:** Upstash Redis + in-memory LRU cache
- **Authentication & Session:** JWT-based auth with refresh support, session storage, Bcrypt for password hashing
- **Security & Rate Limiting:** Helmet, CORS, custom Upstash-backed rate limiting middleware
- **Storage & Mail:** Nodemailer for email activation & reset flows

---

## 3. User Roles & Access Control

### 3.1 Unauthenticated User (Public / Guest)

- **Allowed:**
  - Access short URLs and be redirected to original destinations via `GET /r/:code`.
- **Restricted:**
  - URL creation and deletion
  - Profile reading or updates
  - Password changes
  - Any authenticated resource

### 3.2 Authenticated User (Registered & Verified)

- **Allowed:**
  - Create shortened links.
  - View personal URL history with click counts.
  - Delete user-owned shortened links.
  - View and update profile details.
  - Change password.
  - Refresh tokens through `/auth/refresh`.

---

## 4. Functional Requirements

### Module A: Public Redirection

- **[FR-A1] Fast Redirection:** Resolve a short code from cache before querying MongoDB.
- **[FR-A2] Fallback Query:** On cache miss, retrieve mapping from MongoDB and cache it in Redis plus local LRU cache for 24 hours.
- **[FR-A3] Analytics Incrementation:** Increment `clicks` asynchronously when a valid redirect occurs.
- **[FR-A4] Redirect Response:** Use a 302 redirect with no-cache response headers.

### Module B: URL Management (Protected Routes)

- **[FR-B1] Shorten URL:** Validate destination URL, generate a unique code, store the record in MongoDB, and return the final shortened URL.
- **[FR-B2] URL History:** Return the authenticated user’s URLs with pagination and click counts.
- **[FR-B3] Delete URL:** Delete a URL by ID and invalidate its cache entries.

### Module C: Authentication & Token Lifecycle Management

- **[FR-C1] Registration & Activation:** Register users and require email activation via token link.
- **[FR-C2] Session Login:** Authenticate credentials, create a session, and issue access credentials.
- **[FR-C3] Refresh Flow:** Renew access tokens through the refresh endpoint.
- **[FR-C4] Logout:** Support logout from the current session and logout from all sessions.
- **[FR-C5] Rate Limiting:** Enforce endpoint-specific limits for auth, registration, email actions, URL creation, and redirects.

### Module D: User Profile Management (Protected Routes)

- **[FR-D1] Fetch Profile:** Return authenticated user profile details.
- **[FR-D2] Update Profile:** Update first and last name fields.
- **[FR-D3] Change Password:** Update password for the authenticated user.
- **[FR-D4] Delete Account:** Delete the authenticated account and cascade cleanup for sessions, tokens, and URLs.

---

## 5. API Endpoints Specification

### 🌐 Public & Auth Endpoints

| Endpoint                | Method | Rate Limit Middleware  | Description                                |
| ----------------------- | ------ | ---------------------- | ------------------------------------------ |
| `/r/:code`              | `GET`  | `urlRedirectRateLimit` | Redirects a short code to its original URL |
| `/auth/ping`            | `GET`  | none                   | Health check endpoint                      |
| `/auth/register`        | `POST` | `registerRateLimit`    | Register a new user                        |
| `/auth/activate/:token` | `GET`  | none                   | Activate a new account using token         |
| `/auth/resend-activate` | `POST` | `emailSpamRateLimit`   | Resend activation email                    |
| `/auth/login`           | `POST` | `authRateLimit`        | Authenticate user and create session       |
| `/auth/refresh`         | `POST` | none                   | Refresh authentication tokens              |
| `/auth/forget-password` | `POST` | `emailSpamRateLimit`   | Request password reset code/email          |
| `/auth/reset-password`  | `POST` | `authRateLimit`        | Reset password using reset code            |

### 🔒 Protected Endpoints (Requires Authentication)

| Endpoint                   | Method   | Description                                |
| -------------------------- | -------- | ------------------------------------------ |
| `/auth/logout`             | `POST`   | Logout from current session                |
| `/auth/logoutFromAll`      | `POST`   | Logout from all sessions                   |
| `/add-url`                 | `POST`   | Create a new shortened URL                 |
| `/getAllUrls`              | `GET`    | Retrieve authenticated user’s URLs         |
| `/delete-url/:urlId`       | `DELETE` | Delete a specific user-owned shortened URL |
| `/profile/me`              | `GET`    | Retrieve current user profile              |
| `/profile/me`              | `PUT`    | Update first/last name                     |
| `/profile/change-password` | `PUT`    | Change user password                       |
| `/profile/delete-account`  | `PATCH`  | Delete authenticated user account          |

---

## 6. Data Schema Specifications

### `Url Schema` (`models/Url.model.js`)

```json
{
  "_id": "ObjectId",
  "originalUrl": "String (Required)",
  "urlCode": "String (Unique, Required, Indexed)",
  "shortUrl": "String (Required)",
  "clicks": "Number (Default: 0)",
  "userId": "ObjectId (Ref: User, Required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### `User Schema` (`models/User.model.js`)

- `firstName`, `lastName`, `email`, `password`
- `emailVerified`: boolean
- `role`: `user` or `admin`
- `status`: `active`, `suspended`, or `banned`
- `deletedAt`: soft delete timestamp

---

## 7. Cache Strategy

- **L1 Memory Cache:** In-process `LRUCache` for hot URL and profile lookups.
- **L2 Redis Cache:** Upstash Redis for shared short-code and profile caching.
- **TTL:** URL cache entries are stored for 24 hours before expiration.
- **Invalidation:** URL creation and deletion update both local and Redis caches.

---

## 8. Non-Functional Requirements

- **Performance:** Cached redirects should return quickly; URL lookup uses local and Redis cache before DB.
- **Scalability:** Stateless JWT authentication supports horizontal scaling alongside shared Redis state for rate limits and caches.
- **Security:** Joi request validation, rate limiting, Helmet/CORS, Bcrypt hashing, and centralized error handling.
- **Reliability:** Soft delete for users with cascade cleanup of sessions, tokens, and URLs.
