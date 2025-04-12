using Dapper;
using employee_management_backend.Models;
using Npgsql; 

namespace employee_management_backend.Repositories;

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;

    
    public UserRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Database connection string 'DefaultConnection' not found.");
    }

    private NpgsqlConnection CreateConnection() => new NpgsqlConnection(_connectionString);

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = @"SELECT * FROM public.""Users"" WHERE ""Email"" = @Email LIMIT 1;";
        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });
    }

     public async Task<User?> GetByIdAsync(int id)
    {
        const string sql = @"SELECT * FROM public.""Users"" WHERE ""Id"" = @Id LIMIT 1;";
        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<int> CreateAsync(User user)
    {
        
        const string sql = @"
            INSERT INTO public.""Users"" (""Email"", ""PasswordHash"")
            VALUES (@Email, @PasswordHash)
            RETURNING ""Id"";"; 

        using var connection = CreateConnection();
        var newId = await connection.ExecuteScalarAsync<int>(sql, new { user.Email, user.PasswordHash });
        return newId;
    }
}