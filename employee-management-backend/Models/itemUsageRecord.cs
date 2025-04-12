namespace employee_management_backend.Models;

public class ItemUsageRecord
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public DateTime TransactionDate { get; set; } 
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    
    public List<ItemUsageDetail> Items { get; set; } = new List<ItemUsageDetail>();

    
    public string? EmployeeName { get; set; }
}