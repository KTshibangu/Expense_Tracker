namespace ExpenseTracker.Api.Models;

public class User
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string Password { get; set; } = string.Empty;
    public ICollection<Expense> Expenses { get; set; }= new List<Expense>();
}