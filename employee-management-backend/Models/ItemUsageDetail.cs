namespace employee_management_backend.Models;

public class ItemUsageDetail
{
    public int Id { get; set; } 
    public int ItemUsageRecordId { get; set; } 
    public required string ItemName { get; set; }
    public int Quantity { get; set; }
}