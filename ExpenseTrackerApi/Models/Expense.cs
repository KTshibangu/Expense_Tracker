namespace ExpenseTracker.Api.Models;

public class Expense
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public Category? Category { get; set; }

    public int CategoryId { get; set; }

    public decimal Amount { get; set; }

    public DateOnly PaymentDate { get; set; }

    public int UserId { get; set; }

    public User? User { get; set; }
}