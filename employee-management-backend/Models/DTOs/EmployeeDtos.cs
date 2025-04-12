using System.ComponentModel.DataAnnotations;

namespace employee_management_backend.Models.DTOs;


public record EmployeeDto(
    int Id,
    string Name,
    string Email,
    string? Phone,
    bool Status
);


public record CreateEmployeeDto(
    [Required][StringLength(200, MinimumLength = 2)] string Name,
    [Required][EmailAddress][StringLength(255)] string Email,
    [StringLength(50)] string? Phone, 
    [Required] bool Status = true 
);


public record UpdateEmployeeDto(
    [Required][StringLength(200, MinimumLength = 2)] string Name,
    [Required][EmailAddress][StringLength(255)] string Email,
    [StringLength(50)] string? Phone,
    [Required] bool Status
);

public record EmployeeSelectItemDto(int Id, string Name);