using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Api.Dtos;

public record  CreateExpenseDto
(
    [Required][StringLength(50)] string Name,
    [Range(1, 50)] int CategoryId,
    decimal Amount,
    DateOnly PaymentDate
);