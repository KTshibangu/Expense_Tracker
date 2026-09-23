# Expense Tracker

A full-stack expense tracking application built with **ASP.NET Core Web API** and **React**.

The application allows users to manage their expenses, organize them by category, and view their spending data through a modern web interface.

## Architecture

The project consists of two main parts:

- **Backend** – ASP.NET Core Web API
- **Frontend** – React application
```text
                    Expense Tracker
                          │
             ┌────────────┴────────────┐
             │                         │
        React Frontend            ASP.NET Core API
             │                         │
             │       HTTP/REST         │
             └─────────────────────────┘
                                       │
                                       ▼
                                  SQLite Database

```

## Technologies

Backend

C#
ASP.NET Core Web API
Entity Framework Core
SQLite
REST API

Frontend

React
JavaScript
HTML
CSS
Fetch API

## Project Structure
```text
ExpenseTracker/
│
├── ExpenseTrackerApi/
│   │
│   ├── Data/                         # Database context and data access
│   ├── Dtos/                         # Data Transfer Objects
│   ├── Endpoints/                    # API endpoints
│   ├── Models/                       # Application models
│   ├── Properties/
│   │   └── launchSettings.json
│   │
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── expenses.http                 # API testing requests
│   ├── ExpenseTrackerApi.csproj
│   └── Program.cs
│
├── ExpenseTrackerFrontend/
│   │
│   ├── src/
│   │   ├── components/               # Reusable React components
│   │   ├── pages/                    # Application pages
│   │   ├── api.js                    # API communication
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

## Getting Started
## Prerequisites

Make sure you have the following installed:

.NET SDK
Node.js
npm
Git

## Backend Setup

Navigate to the API project:

cd ExpenseTrackerApi

Restore the .NET dependencies:

dotnet restore

create/update the database with:

dotnet ef database update

Run the API:

dotnet run

## Frontend Setup

Open a new terminal and navigate to the React application:

cd client

Install the required dependencies:

npm install

Start the React development server:

npm run dev

