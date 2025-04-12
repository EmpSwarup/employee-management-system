using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using employee_management_backend.Models;
using employee_management_backend.Models.DTOs;
using employee_management_backend.Repositories;
using employee_management_backend.Services;
using Microsoft.AspNetCore.Mvc; 

namespace employee_management_backend.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var authGroup = app.MapGroup("/api/auth").WithTags("Authentication");

        authGroup.MapPost("/register", async (
            [FromBody] UserRegisterDto registerDto,
            IUserRepository userRepository,
            IPasswordService passwordService,
            ILogger<Program> logger) => 
        {
            var existingUser = await userRepository.GetByEmailAsync(registerDto.Email);
            if (existingUser != null) { return Results.Conflict(new { message = "User with this email already exists." }); }
            var passwordHash = passwordService.HashPassword(registerDto.Password);
            var newUser = new User { Email = registerDto.Email, PasswordHash = passwordHash };
            try
            {
                var createdUserId = await userRepository.CreateAsync(newUser);
                return Results.StatusCode(StatusCodes.Status201Created);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating user with email {Email}", registerDto.Email);
                return Results.Problem("An error occurred during registration.", statusCode: StatusCodes.Status500InternalServerError);
            }
        })
        .Produces(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status409Conflict)
        .Produces(StatusCodes.Status500InternalServerError)
        .WithName("RegisterUser");

        authGroup.MapPost("/login", async (
            [FromBody] UserLoginDto loginDto,
            IUserRepository userRepository,
            IPasswordService passwordService,
            ITokenService tokenService) =>
        {
            var user = await userRepository.GetByEmailAsync(loginDto.Email);
            if (user == null || !passwordService.VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return Results.Unauthorized();
            }
            var token = tokenService.GenerateToken(user);
            return Results.Ok(new LoginResponseDto(token));
        })
        .Produces<LoginResponseDto>()
        .Produces(StatusCodes.Status401Unauthorized)
        .WithName("LoginUser");

        
        
        app.MapGet("/api/users/me", async (ClaimsPrincipal claimsPrincipal, IUserRepository userRepository) =>
        {
            var userIdClaim = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier) ?? claimsPrincipal.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId)) { return Results.Unauthorized(); }
            var user = await userRepository.GetByIdAsync(userId);
            if (user == null) { return Results.NotFound(new { message = "User not found." }); }
            return Results.Ok(new UserInfoDto(user.Id, user.Email));
        })
        .RequireAuthorization()
        .Produces<UserInfoDto>()
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status404NotFound)
        .WithName("GetCurrentUser")
        .WithTags("Users"); 

        return app; 
    }
}