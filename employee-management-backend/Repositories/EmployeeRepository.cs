using Dapper;
using employee_management_backend.Models;
using Npgsql;
using System.Collections.Generic; 
using System.Threading.Tasks;   
using employee_management_backend.Models.DTOs;

namespace employee_management_backend.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly string _connectionString;

    public EmployeeRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Database connection string 'DefaultConnection' not found.");
    }

    private NpgsqlConnection CreateConnection() => new NpgsqlConnection(_connectionString);

    public async Task<IEnumerable<Employee>> GetAllAsync()
    {
        
        const string sql = @"SELECT * FROM public.""Employees"" ORDER BY ""Name"";";
        using var connection = CreateConnection();
        return await connection.QueryAsync<Employee>(sql);
    }

    public async Task<Employee?> GetByIdAsync(int id)
    {
        const string sql = @"SELECT * FROM public.""Employees"" WHERE ""Id"" = @Id;";
        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Employee>(sql, new { Id = id });
    }

     public async Task<Employee?> GetByEmailAsync(string email)
    {
        
        
        const string sql = @"SELECT * FROM public.""Employees"" WHERE ""Email"" = @Email;";
        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Employee>(sql, new { Email = email });
    }

    public async Task<int> CreateAsync(Employee employee)
    {
        
        const string sql = @"
            INSERT INTO public.""Employees"" (""Name"", ""Email"", ""Phone"", ""Status"")
            VALUES (@Name, @Email, @Phone, @Status)
            RETURNING ""Id"";"; 
        using var connection = CreateConnection();
        var newId = await connection.ExecuteScalarAsync<int>(sql, employee);
        return newId;
    }

    public async Task<bool> UpdateAsync(Employee employee)
    {
        
        const string sql = @"
            UPDATE public.""Employees""
            SET ""Name"" = @Name,
                ""Email"" = @Email,
                ""Phone"" = @Phone,
                ""Status"" = @Status
            WHERE ""Id"" = @Id;";
        using var connection = CreateConnection();
        var affectedRows = await connection.ExecuteAsync(sql, employee);
        return affectedRows > 0; 
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = @"DELETE FROM public.""Employees"" WHERE ""Id"" = @Id;";
        using var connection = CreateConnection();
        var affectedRows = await connection.ExecuteAsync(sql, new { Id = id });
        return affectedRows > 0; 
    }
    
    public async Task<IEnumerable<EmployeeSelectItemDto>> GetSelectListAsync()
    {
        
        const string sql = @"
        SELECT ""Id"", ""Name""
        FROM public.""Employees""
        WHERE ""Status"" = TRUE
        ORDER BY ""Name"";";
        using var connection = CreateConnection();
        return await connection.QueryAsync<EmployeeSelectItemDto>(sql);
    }
}