using employee_management_backend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace employee_management_backend.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];

        if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 32)
        {
            // Use the same fallback logic as in Program.cs for dev consistency
             if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
             {
                 Console.ForegroundColor = ConsoleColor.Yellow;
                 Console.WriteLine("WARNING: JWT Secret Key missing/short in TokenService. Using default DEV key.");
                 Console.ResetColor();
                 secretKey = "DEFAULT_UNSAFE_DEV_KEY_REPLACE_ME_NOW_1234567890";
             }
             else
             {
                 throw new InvalidOperationException("JWT SecretKey configuration is missing or too short.");
             }
        }


        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Claims identify the user and their permissions/roles (if any)
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), // Subject (standard claim for user ID)
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Unique token identifier
            // Add other claims as needed (e.g., roles, name)
            // new Claim(ClaimTypes.Role, "Admin"),
             new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()) // Often used interchangeably with Sub
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(1), // Token expiration time (e.g., 1 hour) - adjust as needed
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}