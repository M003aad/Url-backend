# API endpoint guide

This document summarizes the HTTP endpoints currently registered by the application. Request bodies are JSON unless noted otherwise. The authentication endpoints are mounted under `/auth`, profile endpoints under `/profile`, and URL endpoints at the root.

## Authentication

| Method | Endpoint | Authentication | What it does |
|---|---|---|---|
| `GET` | `/auth/ping` | No | Health check for the authentication service. Returns `{ "success": true, "message": "auth service up" }`. |
| `POST` | `/auth/register` | No | Creates an account and starts the email-activation process. Body: `firstName`, `lastName`, `email`, `password`. |
| `GET` | `/auth/activate/:token` | No | Activates the account using the token in the URL. The token must be 64 characters. |
| `POST` | `/auth/resend-activate` | No | Requests another account-activation email. Body: `email`. |
| `POST` | `/auth/login` | No | Checks the credentials and sets the `accessToken` cookie on success. Body: `email`, `password`. |
| `POST` | `/auth/logout` | Yes | Ends the current session and clears the `accessToken` cookie. |
| `POST` | `/auth/logoutFromAll` | Yes | Ends all sessions for the authenticated account and clears the current `accessToken` cookie. |
| `POST` | `/auth/forget-password` | No | Starts the password-recovery process by email. Body: `email`. |
| `POST` | `/auth/reset-password` | No | Resets the password using the recovery code. Body: `code` (6 characters), `newPassword`. |
| `POST` | `/auth/refresh` | Yes | Intended to renew the access-token cookie when the session is eligible for refresh. See the implementation note below. |

## Profile

All profile endpoints require authentication. The application reads the `accessToken` cookie to identify the account.

| Method | Endpoint | What it does |
|---|---|---|
| `GET` | `/profile/me` | Returns the signed-in user's `firstName`, `lastName`, and `email`. |
| `PUT` | `/profile/me` | Updates the signed-in user's first and last names. Body: `firstName`, `lastName`. |
| `PUT` | `/profile/change-password` | Changes the signed-in user's password. Body: `newPassword`. |
| `PATCH` | `/profile/delete-account` | Deletes the signed-in user's account after checking their password. Body: `password`. |

## URLs

| Method | Endpoint | Authentication | What it does |
|---|---|---|---|
| `POST` | `/add-url` | Yes | Validates and shortens a URL, then associates it with the signed-in user. Body: `url` (must be a valid `http://` or `https://` URL). |
| `GET` | `/r/:code` | No | Redirects to the original URL for the 8-character short code. |
| `DELETE` | `/delete-url/:urlId` | Yes | Deletes the specified URL belonging to the signed-in user. `urlId` must be a 24-character hexadecimal ID. Returns no response body on success. |
| `GET` | `/getAllUrls?page=1` | Yes | Lists the signed-in user's shortened URLs, 10 per page. `page` is optional and defaults to page 1. The response includes the URLs and pagination details. |

## Authentication notes

- Protected endpoints use the `accessToken` cookie set by login; send cookies with requests to those endpoints.
- Registration requires a password of 8–128 characters containing lowercase and uppercase letters, a digit, and one of the accepted special characters.
- Profile updates require both names (3–20 characters each). Registration allows names of 2–20 characters.
- The refresh controller currently references `currentIp` and `userAgent` without defining them. As written, `/auth/refresh` can fail before completing its intended refresh behavior.