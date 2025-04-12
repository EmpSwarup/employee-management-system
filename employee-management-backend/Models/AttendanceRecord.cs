
namespace employee_management_backend.Models;

public class AttendanceRecord
{
    
    public int EmployeeId { get; set; }
    public DateTime AttendanceDate { get; set; } 
    public bool Status { get; set; }
    
}