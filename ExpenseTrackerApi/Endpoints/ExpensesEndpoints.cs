using System.Security.Claims;
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
        var group = app.MapGroup("/expenses").RequireAuthorization();
        // GET /expenses?page=1&pageSize=20&month=2026-06&categoryId=3
        group.MapGet("/", async (
            ExpenseContext dbContext,
            ClaimsPrincipal user,
            int page = 1,
            int pageSize = 10,
            string? month = null,
            DateOnly? startDate = null,
            DateOnly? endDate = null,
            int? categoryId = null) =>
        {
            var userId = int.Parse(
                user.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            page = page < 1 ? 1 : page;
            pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

            var query = dbContext.Expenses
                .Where(expense => expense.UserId == userId)
                .AsNoTracking().AsQueryable();

            if (categoryId is not null)
                query = query.Where(e => e.CategoryId == categoryId);

            // Explicit date range wins over "month" if both are somehow sent.
            if (startDate is not null)
                query = query.Where(e => e.PaymentDate >= startDate);

            if (endDate is not null)
                query = query.Where(e => e.PaymentDate <= endDate);

            if (startDate is null && endDate is null &&
                !string.IsNullOrWhiteSpace(month) &&
                DateOnly.TryParse($"{month}-01", out var parsedMonth))
            {
                query = query.Where(e =>
                    e.PaymentDate.Year == parsedMonth.Year &&
                    e.PaymentDate.Month == parsedMonth.Month);
            }

            var totalCount = await query.CountAsync();
            var totalAmount = await query.SumAsync(e => (decimal?)e.Amount) ?? 0m;

            var items = await query
                .OrderByDescending(e => e.PaymentDate)
                .ThenByDescending(e => e.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new ExpenseSummaryDto(e.Id, e.Name, e.Category!.Name, e.Amount, e.PaymentDate))
                .ToListAsync();

            return Results.Ok(new PagedResult<ExpenseSummaryDto>(items, totalCount, totalAmount, page, pageSize));
        });



        //GET /expenses/1
        group.MapGet("/{id}", async (int id, ExpenseContext dbContext, ClaimsPrincipal user) =>
        {
            var userId = int.Parse(
                user.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            var expense = await dbContext.Expenses
                .FirstOrDefaultAsync(e =>
                    e.Id == id &&
                    e.UserId == userId
            );

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
        group.MapPost("/", async (
            CreateExpenseDto newExpense,
            ExpenseContext dbContext,
            ClaimsPrincipal user) =>
        {
            var userId = int.Parse(
                user.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            Expense expense = new()
            {
                Name = newExpense.Name,
                CategoryId = newExpense.CategoryId,
                Amount = newExpense.Amount,
                PaymentDate = newExpense.PaymentDate,
                UserId = userId
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
        group.MapPut("/{id}", async (
            int id,
            UpdateExpenseDto updatedExpense,
            ExpenseContext dbContext,
            ClaimsPrincipal user) =>
        {
            var userId = int.Parse(
                user.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            var existingExpense = await dbContext.Expenses
                .FirstOrDefaultAsync(e =>
                    e.Id == id &&
                    e.UserId == userId
                );

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
        group.MapDelete("/{id}", async (
            int id,
            ExpenseContext dbContext,
            ClaimsPrincipal user) =>
        {
            var userId = int.Parse(
                user.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            await dbContext.Expenses
            .Where(expense => expense.Id == id && expense.UserId == userId)
            .ExecuteDeleteAsync();

            return Results.NoContent();
        });

    }

    public record PagedResult<T>(
        List<T> Items, int TotalCount, decimal TotalAmount, int Page, int PageSize)
    {
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}