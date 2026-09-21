namespace ExpenseTracker.Api.Dtos;

public record  ExpenseDetailsDto
(
    int Id,
    string Name,
    int CategoryId,
    decimal Amount,
    DateOnly PaymentDate
);