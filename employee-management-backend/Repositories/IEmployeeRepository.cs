using employee_management_backend.Models;
using employee_management_backend.Models.DTOs;

namespace employee_management_backend.Repositories;

public interface IEmployeeRepository
{
    Task<IEnumerable<Employee>> GetAllAsync();
    Task<Employee?> GetByIdAsync(int id);
    Task<Employee?> GetByEmailAsync(string email); 
    Task<int> CreateAsync(Employee employee);
    Task<bool> UpdateAsync(Employee employee);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<EmployeeSelectItemDto>> GetSelectListAsync();
}