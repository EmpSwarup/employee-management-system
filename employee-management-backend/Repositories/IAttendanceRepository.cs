using employee_management_backend.Models;  

namespace employee_management_backend.Repositories;

public interface IAttendanceRepository
{
    
    Task<IEnumerable<AttendanceRecord>> GetAttendanceForMonthAsync(int year, int month); 

    
    Task<bool> SaveAttendanceForMonthAsync(int year, int month, Dictionary<int, Dictionary<int, bool>> attendanceData);
}