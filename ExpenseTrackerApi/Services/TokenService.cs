using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ExpenseTracker.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace ExpenseTracker.Api.Services;

public class TokenService(IConfiguration configuration)
{
    public string CreateToken(User user)
    {
        var claims = new[]
        {
          new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
          new Claim(JwtRegisteredClaimNames.Email, user.Email)
        };

        var key = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is missing.");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                configuration.GetValue<int>("Jwt:ExpiryMinutes")
            ),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);

    }
}