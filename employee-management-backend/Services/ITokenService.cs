using employee_management_backend.Models;
using System.Security.Claims;

namespace employee_management_backend.Services;

public interface ITokenService
{
    string GenerateToken(User user);
    // Optional: Method to get claims from an existing token (useful for refresh tokens later)
    // ClaimsPrincipal? GetPrincipalFromToken(string token);
}