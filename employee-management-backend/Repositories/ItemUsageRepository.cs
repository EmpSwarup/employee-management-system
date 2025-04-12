using Dapper;
using employee_management_backend.Models; 
using Npgsql;
using System.Collections.Generic;
using System.Linq; 
using System.Threading.Tasks;
using System.Transactions; 
using Microsoft.Extensions.Configuration; 

namespace employee_management_backend.Repositories;

public class ItemUsageRepository : IItemUsageRepository
{
    private readonly string _connectionString;

    public ItemUsageRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Database connection string 'DefaultConnection' not found.");
    }

    private NpgsqlConnection CreateConnection() => new NpgsqlConnection(_connectionString);

    

    public async Task<IEnumerable<ItemUsageRecord>> GetAllAsync()
    {
        
        
        
        const string sql = @"
            SELECT
                r.""Id"", r.""EmployeeId"", r.""TransactionDate"", r.""CreatedAt"", r.""UpdatedAt"",
                e.""Name"" AS EmployeeName,
                d.""Id"", d.""ItemUsageRecordId"", d.""ItemName"", d.""Quantity""
            FROM public.""ItemUsageRecords"" r
            INNER JOIN public.""Employees"" e ON r.""EmployeeId"" = e.""Id""
            LEFT JOIN public.""ItemUsageDetails"" d ON r.""Id"" = d.""ItemUsageRecordId""
            ORDER BY r.""Id"", d.""Id"";";

        using var connection = CreateConnection();

        
        var recordDictionary = new Dictionary<int, ItemUsageRecord>();

        
        await connection.QueryAsync<ItemUsageRecord, string, Models.ItemUsageDetail, ItemUsageRecord>(
            sql,
            (record, employeeName, detail) => 
            {
                
                record.EmployeeName = employeeName;

                if (!recordDictionary.TryGetValue(record.Id, out var currentRecord))
                {
                    currentRecord = record;
                    
                    currentRecord.Items = new List<Models.ItemUsageDetail>();
                    recordDictionary.Add(currentRecord.Id, currentRecord);
                }
                
                
                if (detail != null && detail.ItemUsageRecordId == currentRecord.Id) 
                {
                    
                    currentRecord.Items.Add(detail); 
                }
                return currentRecord;
            },
            
            splitOn: "EmployeeName, Id"
        );

        
        return recordDictionary.Values.ToList();
    }


    public async Task<ItemUsageRecord?> GetByIdAsync(int id)
    {
        
        const string sql = @"
            SELECT
                r.""Id"", r.""EmployeeId"", r.""TransactionDate"", r.""CreatedAt"", r.""UpdatedAt"",
                e.""Name"" AS EmployeeName,
                d.""Id"", d.""ItemUsageRecordId"", d.""ItemName"", d.""Quantity""
            FROM public.""ItemUsageRecords"" r
            INNER JOIN public.""Employees"" e ON r.""EmployeeId"" = e.""Id""
            LEFT JOIN public.""ItemUsageDetails"" d ON r.""Id"" = d.""ItemUsageRecordId""
            WHERE r.""Id"" = @Id
            ORDER BY d.""Id"";";

        using var connection = CreateConnection();
        ItemUsageRecord? foundRecord = null;

        
        await connection.QueryAsync<ItemUsageRecord, string, Models.ItemUsageDetail, ItemUsageRecord>(
            sql,
            (record, employeeName, detail) =>
            {
                 record.EmployeeName = employeeName; 
                if (foundRecord == null)
                {
                    foundRecord = record;
                    
                    foundRecord.Items = new List<Models.ItemUsageDetail>();
                }
                 
                 if (detail != null && detail.ItemUsageRecordId == foundRecord.Id)
                {
                    
                    foundRecord.Items.Add(detail); 
                }
                return foundRecord; 
            },
            new { Id = id },
            
            splitOn: "EmployeeName, Id"
        );

        return foundRecord;
    }


    
    

    public async Task<int> CreateAsync(ItemUsageRecord record)
    {
        using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
        using var connection = CreateConnection();
        await connection.OpenAsync();

        try
        {
            
            const string recordSql = @"
                INSERT INTO public.""ItemUsageRecords"" (""EmployeeId"", ""TransactionDate"")
                VALUES (@EmployeeId, @TransactionDate)
                RETURNING ""Id"";";
            var newRecordId = await connection.ExecuteScalarAsync<int>(recordSql, new { record.EmployeeId, record.TransactionDate });

            
            if (record.Items != null && record.Items.Any())
            {
                const string detailSql = @"
                    INSERT INTO public.""ItemUsageDetails"" (""ItemUsageRecordId"", ""ItemName"", ""Quantity"")
                    VALUES (@ItemUsageRecordId, @ItemName, @Quantity);";

                var detailsToInsert = record.Items.Select(item => new
                {
                    ItemUsageRecordId = newRecordId,
                    item.ItemName,
                    item.Quantity
                });

                await connection.ExecuteAsync(detailSql, detailsToInsert);
            }

            scope.Complete(); 
            return newRecordId;
        }
        catch
        {
            
            throw; 
        }
    }

    public async Task<bool> UpdateAsync(ItemUsageRecord record)
    {
        using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
        using var connection = CreateConnection();
        await connection.OpenAsync();

        try
        {
            
            const string recordSql = @"
                UPDATE public.""ItemUsageRecords""
                SET ""EmployeeId"" = @EmployeeId,
                    ""TransactionDate"" = @TransactionDate
                WHERE ""Id"" = @Id;";
            var affectedRows = await connection.ExecuteAsync(recordSql, new { record.EmployeeId, record.TransactionDate, record.Id });

            if (affectedRows == 0) return false; 

            
            const string deleteDetailsSql = @"DELETE FROM public.""ItemUsageDetails"" WHERE ""ItemUsageRecordId"" = @ItemUsageRecordId;";
            await connection.ExecuteAsync(deleteDetailsSql, new { ItemUsageRecordId = record.Id });

            
            if (record.Items != null && record.Items.Any())
            {
                 const string insertDetailSql = @"
                    INSERT INTO public.""ItemUsageDetails"" (""ItemUsageRecordId"", ""ItemName"", ""Quantity"")
                    VALUES (@ItemUsageRecordId, @ItemName, @Quantity);";

                var detailsToInsert = record.Items.Select(item => new
                {
                    ItemUsageRecordId = record.Id,
                    item.ItemName,
                    item.Quantity
                });
                await connection.ExecuteAsync(insertDetailSql, detailsToInsert);
            }

            scope.Complete(); 
            return true;
        }
        catch
        {
            throw; 
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        
        const string sql = @"DELETE FROM public.""ItemUsageRecords"" WHERE ""Id"" = @Id;";
        using var connection = CreateConnection();
        var affectedRows = await connection.ExecuteAsync(sql, new { Id = id });
        return affectedRows > 0;
    }
} 

