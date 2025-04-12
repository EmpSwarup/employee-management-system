using System.ComponentModel.DataAnnotations;

namespace employee_management_backend.Models.DTOs;


public record ItemDetailDto(
    [Required][StringLength(255, MinimumLength = 1)] string ItemName,
    [Required][Range(1, int.MaxValue)] int Quantity
);


public record ItemUsageRecordDto(
    int Id,
    int EmployeeId,
    string EmployeeName, 
    string TransactionDate, 
    List<ItemDetailDto> Items
);


public record CreateItemUsageDto(
    [Required] int EmployeeId,
    [Required] string TransactionDate, 
    [Required][MinLength(1, ErrorMessage = "At least one item must be added.")] List<ItemDetailDto> Items
);


public record UpdateItemUsageDto(
    [Required] int EmployeeId,
    [Required] string TransactionDate,
    [Required][MinLength(1, ErrorMessage = "At least one item must be added.")] List<ItemDetailDto> Items
);