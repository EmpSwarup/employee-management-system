using employee_management_backend.Models;

namespace employee_management_backend.Repositories;

public interface IItemUsageRepository
{
    
    Task<IEnumerable<ItemUsageRecord>> GetAllAsync();
    Task<ItemUsageRecord?> GetByIdAsync(int id);

    
    Task<int> CreateAsync(ItemUsageRecord record); 
    Task<bool> UpdateAsync(ItemUsageRecord record); 
    Task<bool> DeleteAsync(int id); 
}