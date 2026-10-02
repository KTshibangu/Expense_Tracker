# Expense Tracker

A full-stack expense tracking application built with **ASP.NET Core Minimal API**, **React**, **Entity Framework Core**, **PostgreSQL**, and **JWT authentication**.

The application allows users to securely register, log in, and manage their personal expenses.

## Tech Stack

### Backend

- ASP.NET Core Minimal API
- C#
- Entity Framework Core
- PostgreSQL
- Npgsql
- JWT Authentication
- Password Hashing
- API Rate Limiting
- Docker

### Frontend

- React
- Vite
- JavaScript
- CSS

### Database & Deployment

- Neon PostgreSQL
- Docker
- Render — Backend API
- Vercel — React Frontend

## Features

### Authentication

- User registration
- User login
- JWT-based authentication
- Password hashing
- Protected API endpoints
- User-specific expense data
- Authentication endpoint rate limiting

### Expense Management

Authenticated users can:

- Create expenses
- View expenses
- View individual expenses
- Update expenses
- Delete expenses
- Filter expenses
- Paginate expenses
- Associate expenses with categories
- Track payment dates
- Track expense amounts

### Categories

The application includes predefined expense categories such as:

- Housing
- Utilities
- Groceries
- Food & Dining
- Transport
- Healthcare
- Family & Children
- Entertainment
- Subscriptions
- Other

## Security

The API implements several security measures.

### JWT Authentication

Protected endpoints require a valid JWT access token.

The API validates:

- Token signature
- Issuer
- Audience
- Token lifetime

User IDs are stored in JWT claims and are used to ensure users can only access their own expenses.

### Password Security

Passwords are never stored as plain text.

Passwords are hashed using ASP.NET Core's password hashing functionality before being stored in the database.

### Rate Limiting

Rate limiting has been implemented to help protect the API from excessive requests and abuse.

Rate limiting is applied to:

- Authentication endpoints
- Expense endpoints

This helps reduce the risk of:

- Brute-force login attempts
- Excessive API requests
- Accidental request flooding
- API resource abuse

Rate limits are enforced by the ASP.NET Core API before requests are processed by the corresponding endpoints.

## API

### Authentication

```text
POST /register
POST /login
```

### Expenses

```text
GET    /expenses
GET    /expenses/{id}
POST   /expenses
PUT    /expenses/{id}
DELETE /expenses/{id}
```

### Categories

```text
GET /categories
```

Protected endpoints require the JWT token:

```text
Authorization: Bearer <token>
```

## Database

The application uses **PostgreSQL** with Entity Framework Core.

Production database hosting is provided by **Neon PostgreSQL**.

Entity Framework Core migrations are used to manage the database schema.

The current PostgreSQL migration was created after migrating the project from SQLite to PostgreSQL.

## Environment Configuration

Sensitive configuration values are not stored directly in source control.

### Local Development

.NET User Secrets are used for sensitive values such as:

```text
ConnectionStrings:ExpenseTracker
Jwt:Key
```

### Production

Environment variables are used by the deployed API.

Example:

```text
ConnectionStrings__ExpenseTracker
Jwt__Key
Jwt__Issuer
Jwt__Audience
Jwt__ExpiryMinutes
```

Secrets should never be committed to Git.

## Running the Backend Locally

Navigate to the API project:

```powershell
cd ExpenseTrackerApi
```

Restore dependencies:

```powershell
dotnet restore
```

Run the application:

```powershell
dotnet run
```

The API can then be accessed locally through the configured development URL.

## Running with Docker

The backend can be packaged and run as a Docker container.

Build the image:

```powershell
docker build -t expense-tracker-api .
```

Run the container:

```powershell
docker run --name expense-tracker-api -p 8080:8080 `
  -e "ConnectionStrings__ExpenseTracker=<connection-string>" `
  -e "Jwt__Key=<jwt-secret>" `
  -e "Jwt__Issuer=ExpenseTrackerApi" `
  -e "Jwt__Audience=ExpenseTrackerClient" `
  -e "Jwt__ExpiryMinutes=60" `
  expense-tracker-api
```

The API is then available at:

```text
http://localhost:8080
```

The root endpoint returns a simple API health response:

```text
GET /
```

## Frontend

The React frontend communicates with the ASP.NET Core API.

During local development, Vite can proxy API requests to the local ASP.NET Core API.

For production, the API URL is configured using:

```text
VITE_API_URL
```

Example:

```text
VITE_API_URL=https://your-api.onrender.com
```

## Production Architecture

```text
             React Frontend
                 │
                 │ HTTPS
                 ▼
        ┌──────────────────┐
        │      Vercel      │
        │   React + Vite   │
        └────────┬─────────┘
                 │
                 │ HTTPS API requests
                 ▼
        ┌──────────────────┐
        │      Render      │
        │ ASP.NET Core API │
        │     Docker       │
        └────────┬─────────┘
                 │
                 │ PostgreSQL
                 ▼
        ┌──────────────────┐
        │      Neon        │
        │    PostgreSQL    │
        └──────────────────┘
```

## Project Structure

```text
Expense_Tracker/
│
├── ExpenseTrackerApi/
│   ├── Data/
│   ├── Models/
│   ├── Endpoints/
│   ├── Services/
│   ├── Migrations/
│   ├── Program.cs
│   ├── Dockerfile
│   └── ExpenseTrackerApi.csproj
│
└── client/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── pages/
    │   ├── api.js
    │   └── ...
    ├── public/
    ├── vite.config.js
    └── package.json
```

## Deployment

### Backend

The ASP.NET Core API is containerized using Docker and deployed to Render.

Production secrets and configuration are supplied through Render environment variables.

### Frontend

The React application can be deployed to Vercel.

The production API URL is configured through the Vite environment variable:

```text
VITE_API_URL
```

## API Protection

The API combines several layers of protection:

```text
Request
   │
   ▼
Rate Limiting
   │
   ▼
Authentication
   │
   ▼
Authorization
   │
   ▼
Endpoint
   │
   ▼
Database
```

Authentication and expense endpoints are rate-limited to help prevent excessive or abusive requests.

## Future Improvements

Potential improvements include:

- Refresh tokens
- HttpOnly authentication cookies
- More granular rate-limiting policies
- Expense reporting and charts
- Budget management
- Recurring expenses
- Advanced filtering
- Offline/PWA support
- Automated testing
- CI/CD pipeline
