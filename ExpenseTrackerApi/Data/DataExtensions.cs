using ExpenseTracker.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Api.Data;

public static class DataExtensions
{
    public static void MigrateDb(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ExpenseContext>();

        dbContext.Database.Migrate();
    }

    public static void AddExpenseTrackerDb(this WebApplicationBuilder builder)
    {
        var connStriing = builder.Configuration.GetConnectionString("ExpenseTracker");
        builder.Services.AddSqlite<ExpenseContext>(
            connStriing,
            optionsAction: options => options.UseSeeding((context, _) =>
            {
                if (!context.Set<Category>().Any())
                {
                    context.Set<Category>().AddRange(
                        new Category { Name = "Housing" },
                        new Category { Name = "Utilities" },
                        new Category { Name = "Groceries" },
                        new Category { Name = "Food & Dining" },
                        new Category { Name = "Transport" },
                        new Category { Name = "Healthcare" },
                        new Category { Name = "Personal & Cloning" },
                        new Category { Name = "Famili & Children" },
                        new Category { Name = "Entertainment" },
                        new Category { Name = "Subscriptions" },
                        new Category { Name = "Other" }
                    );

                    context.SaveChanges();
                }
            })
        );
    }
}