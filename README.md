# Expense Tracker API

A RESTful expense tracking API built with **ASP.NET Core** and **Entity Framework Core**.

The API provides functionality for managing expenses, including creating, retrieving, updating, and deleting expense records. The project uses **SQLite** as the database for local development.

## Technologies

- **ASP.NET Core Web API**
- **C#**
- **Entity Framework Core**
- **SQLite**
- **.NET**
- **HTTP/REST API**

## Project Structure

```text
ExpenseTrackerApi/
│
├── Data/                         # Database context and data access
├── Dtos/                         # Data Transfer Objects
├── Endpoints/                    # API endpoints
├── Models/                       # Application/domain models
├── Properties/
│   └── launchSettings.json      # Local development configuration
│
├── appsettings.json             # Application configuration
├── appsettings.Development.json # Development configuration
├── expenses.http                # HTTP requests for testing the API
├── ExpenseTrackerApi.csproj     # Project configuration
├── Program.cs                   # Application entry point
└── .gitignore
