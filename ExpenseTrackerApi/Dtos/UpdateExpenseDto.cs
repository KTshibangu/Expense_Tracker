using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Api.Dtos;

public record  UpdateExpenseDto
(
    [Required][StringLength(50)] string Name,
    [Range(1, 50)] int CategoryId,
    decimal Amount,
    DateOnly PaymentDate
);