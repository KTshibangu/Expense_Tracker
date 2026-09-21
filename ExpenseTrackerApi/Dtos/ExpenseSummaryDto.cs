namespace ExpenseTracker.Api.Dtos;

public record  ExpenseSummaryDto
(
    int Id,
    string Name,
    string Category,
    decimal Amount,
    DateOnly PaymentDate
);