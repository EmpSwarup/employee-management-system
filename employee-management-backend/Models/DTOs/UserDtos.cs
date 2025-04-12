using System.ComponentModel.DataAnnotations; 

namespace employee_management_backend.Models.DTOs;

public record UserRegisterDto(
    [Required][EmailAddress] string Email,
    [Required][MinLength(6)] string Password
);

public record UserLoginDto(
    [Required][EmailAddress] string Email,
    [Required] string Password
);


public record LoginResponseDto(string Token);


public record UserInfoDto(int Id, string Email);