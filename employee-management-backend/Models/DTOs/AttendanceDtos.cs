using System.ComponentModel.DataAnnotations;

namespace employee_management_backend.Models.DTOs;



public record MonthlyAttendanceDto(
    Dictionary<int, Dictionary<int, bool>> AttendanceData
);


public record SaveAttendanceDto(
    [Required]
    [RegularExpression(@"^\d{4}-(0[1-9]|1[0-2])$", ErrorMessage = "Month must be in YYYY-MM format.")]
    string Month, 

    [Required]
    
    Dictionary<int, Dictionary<int, bool>> AttendanceData
);