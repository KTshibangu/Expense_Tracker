using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.Dtos;
using ExpenseTracker.Api.Endpoints;
using ExpenseTracker.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidation();
builder.AddExpenseTrackerDb();

var app = builder.Build();

app.MapExpensesEndpoints();
app.MapCategoriesEndpoints();

app.MigrateDb();

app.Run();
