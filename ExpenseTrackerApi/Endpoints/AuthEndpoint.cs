using ExpenseTracker.Api.Data;
using ExpenseTracker.Api.Dtos;
using ExpenseTracker.Api.Models;
using ExpenseTracker.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var auth = app.MapGroup("/auth").RequireRateLimiting("auth");

        //POST /auth/register
        auth.MapPost("/register", async (
            RegisterDto request,
            ExpenseContext dbContext,
            IPasswordHasher<User> passwordHasher) =>
        {
            var existingUser = await dbContext.Users.FirstOrDefaultAsync(
                u => u.Email == request.Email
            );

            if (existingUser is not null)
            {
                return Results.BadRequest(new
                {
                    message = "A user with this email already exists"
                });
            }

            var user = new User
            {
                Name = request.Name,
                Email = request.Email
            };

            user.Password = passwordHasher.HashPassword(user, request.Password);

            dbContext.Users.Add(user);

            await dbContext.SaveChangesAsync();

            return Results.Ok(new
            {
                message = "Usewr is registered successfully"
            });
        });


        auth.MapPost("/login", async (
            LoginRequestDto request,
            ExpenseContext dbContext,
            IPasswordHasher<User> passwordHasher,
            TokenService tokenService) =>
        {
            var user = await dbContext.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user is null)
            {
                return Results.Unauthorized();
            }

            var verifyPassword = passwordHasher.VerifyHashedPassword(
                user,
                user.Password,
                request.Password
            );

            if (verifyPassword == PasswordVerificationResult.Failed)
            {
                return Results.Unauthorized();
            }

            var token = tokenService.CreateToken(user);

            return Results.Ok(new LoginResponseDto(token));
        });
    }
}