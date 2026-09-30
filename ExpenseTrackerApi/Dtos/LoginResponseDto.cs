using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Api.Dtos;

public record LoginResponseDto
(
    string Token
);