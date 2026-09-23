using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.Dtos;
using ExpenseTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Api.Endpoints;

public static class ExpensesEndpoints
{
    const string GetEndpointName = "GetExpense";

    public static void MapExpensesEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/expenses");
        //GET /expenses
        // group.MapGet("/", async (ExpenseContext dbContext) => 
        //     await dbContext.Expenses
        //     .Include(expense => expense.Category)
        //     .Select(expense => new ExpenseSummaryDto(
        //         expense.Id,
        //         expense.Name,
        //         expense.Category!.Name,
        //         expense.Amount,
        //         expense.PaymentDate
        //     ))
        //     .AsNoTracking()
        //     .ToListAsync()
        // );

        // GET /expenses?page=1&pageSize=20&month=2026-06&categoryId=3
        group.MapGet("/", async (
            ExpenseContext dbContext,
            int page = 1,
            int pageSize = 20,
            string? month = null,
            int? categoryId = null) =>
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 20 : pageSize;

            var query = dbContext.Expenses
                .Include(e => e.Category)
                .AsNoTracking()
                .AsQueryable();

            if (categoryId is not null)
            {
                query = query.Where(e => e.CategoryId == categoryId);
            }

            // month comes in as "YYYY-MM" from the <input type="month">
            if (!string.IsNullOrWhiteSpace(month) &&
                DateOnly.TryParse($"{month}-01", out var parsedMonth))
            {
                query = query.Where(e =>
                    e.PaymentDate.Year == parsedMonth.Year &&
                    e.PaymentDate.Month == parsedMonth.Month);
            }

            query = query.OrderByDescending(e => e.PaymentDate);

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new ExpenseSummaryDto(
                    e.Id,
                    e.Name,
                    e.Category!.Name,
                    e.Amount,
                    e.PaymentDate))
                .ToListAsync();

            return Results.Ok(new PagedResult<ExpenseSummaryDto>(items, totalCount, page, pageSize));
        });


        //GET /expenses/1
        group.MapGet("/{id}", async (int id, ExpenseContext dbContext) =>
        {
            var expense = await dbContext.Expenses.FindAsync(id);

            return expense is null ? Results.NotFound() : Results.Ok(
                new ExpenseDetailsDto(
                        expense.Id,
                        expense.Name,
                        expense.CategoryId,
                        expense.Amount,
                        expense.PaymentDate
                )
            );
        }).WithName(GetEndpointName);

        //POST /expenses
        group.MapPost("/", async (CreateExpenseDto newExpense, ExpenseContext dbContext) =>
        {
            Expense expense = new()
            {
                Name = newExpense.Name,
                CategoryId = newExpense.CategoryId,
                Amount = newExpense.Amount,
                PaymentDate = newExpense.PaymentDate
            };

            dbContext.Expenses.Add(expense);
            await dbContext.SaveChangesAsync();

            ExpenseDetailsDto expenseDto = new(
                expense.Id,
                expense.Name,
                expense.CategoryId,
                expense.Amount,
                expense.PaymentDate
            );

            return Results.CreatedAtRoute(GetEndpointName, new { id = expenseDto.Id }, expenseDto);
        });

        // PUT /expenses/1
        group.MapPut("/{id}", async (int id, UpdateExpenseDto updatedExpense, ExpenseContext dbContext) =>
        {
            var existingExpense = await dbContext.Expenses.FindAsync(id);

            if (existingExpense is null)
            {
                return Results.NotFound();
            }

            existingExpense.Name = updatedExpense.Name;
            existingExpense.CategoryId = updatedExpense.CategoryId;
            existingExpense.Amount = updatedExpense.Amount;
            existingExpense.PaymentDate = updatedExpense.PaymentDate;

            await dbContext.SaveChangesAsync();

            return Results.NoContent();
        });

        //DELETE /expenses/1
        group.MapDelete("/{id}", async (int id, ExpenseContext dbContext) =>
        {
            await dbContext.Expenses
            .Where(expense => expense.Id == id)
            .ExecuteDeleteAsync();

            return Results.NoContent();
        });

    }

    public record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize)
    {
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}