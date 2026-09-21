using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Api.Endpoints;

public static class CategoriesEndpoints
{
    public static void MapCategoriesEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/categories");

        //GET /genres
        group.MapGet("/", async (ExpenseContext dbContext) => 
            await dbContext.Categories
            .Select(category => new CategoryDto(category.Id, category.Name))
            .AsNoTracking()
            .ToListAsync());
    }
}