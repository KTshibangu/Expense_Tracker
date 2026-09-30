using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Api.Dtos;

public record LoginRequestDto
(
    [property: Required, EmailAddress] 
    string Email,
    
    [property: Required, MinLength(8, ErrorMessage = "Passowrd must be at least 8 characters")] 
    string Password
);