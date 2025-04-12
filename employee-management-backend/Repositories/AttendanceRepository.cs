using Dapper;
using employee_management_backend.Models; 
using Microsoft.Extensions.Configuration; 
using Microsoft.Extensions.Logging; 
using Npgsql;
using System; 
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions; 

namespace employee_management_backend.Repositories;

public class AttendanceRepository : IAttendanceRepository 
{
    private readonly string _connectionString; 
    private readonly ILogger<AttendanceRepository> _logger; 

    
    public AttendanceRepository(IConfiguration configuration, ILogger<AttendanceRepository> logger) 
    {
        _logger = logger; 
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Database connection string 'DefaultConnection' not found in configuration.");

        
        _logger.LogInformation("AttendanceRepository created. ConnectionString assigned (Length: {Length}).", _connectionString?.Length ?? 0);
        if (string.IsNullOrEmpty(_connectionString))
        {
             _logger.LogCritical("CONNECTION STRING IS NULL OR EMPTY AFTER READING CONFIGURATION!");
             
        }
    }
    

    
    private NpgsqlConnection CreateConnection() => new NpgsqlConnection(_connectionString);

    public async Task<IEnumerable<AttendanceRecord>> GetAttendanceForMonthAsync(int year, int month)
    {
        _logger.LogDebug("Executing GetAttendanceForMonthAsync for {Year}-{Month}", year, month);
        const string sql = @"
            SELECT
                ""EmployeeId"",
                ""AttendanceDate"", -- Select the full DATE column (maps to DateTime in model)
                ""Status""
            FROM public.""AttendanceRecords""
            WHERE EXTRACT(YEAR FROM ""AttendanceDate"") = @Year
              AND EXTRACT(MONTH FROM ""AttendanceDate"") = @Month
            ORDER BY ""EmployeeId"", ""AttendanceDate"";";

        try
        {
            using var connection = CreateConnection();
            
            var result = await connection.QueryAsync<AttendanceRecord>(sql, new { Year = year, Month = month });
            _logger.LogDebug("Successfully fetched {Count} records for {Year}-{Month}", result.Count(), year, month);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database error fetching attendance for {Year}-{Month}", year, month);
            throw; 
        }
    }

    public async Task<bool> SaveAttendanceForMonthAsync(int year, int month, Dictionary<int, Dictionary<int, bool>> attendanceData)
    {
        _logger.LogDebug("Executing SaveAttendanceForMonthAsync for {Year}-{Month}", year, month);
        using var connection = CreateConnection();
        await connection.OpenAsync(); 
        using var transaction = await connection.BeginTransactionAsync();
        _logger.LogTrace("Transaction started for {Year}-{Month} attendance save.", year, month);

        try
        {
            var recordsToUpsert = new List<object>();
            if (attendanceData != null) 
            {
                foreach (var empEntry in attendanceData)
                {
                    int employeeId = empEntry.Key;
                    if (empEntry.Value == null) continue; 

                    foreach (var dayEntry in empEntry.Value)
                    {
                        int day = dayEntry.Key;
                        bool status = dayEntry.Value;
                        DateOnly attendanceDateOnly;
                        try {
                             attendanceDateOnly = new DateOnly(year, month, day);
                        } catch (ArgumentOutOfRangeException ex) {
                             
                             _logger.LogWarning(ex, "Skipping invalid date Year={Year}, Month={Month}, Day={Day} for EmployeeId={EmployeeId}", year, month, day, employeeId);
                             continue; 
                        }

                        
                        DateTime attendanceDateTime = attendanceDateOnly.ToDateTime(TimeOnly.MinValue);

                        recordsToUpsert.Add(new
                        {
                            EmployeeId = employeeId,
                            AttendanceDate = attendanceDateTime, 
                            Status = status
                        });
                    }
                }
            } 

            if (!recordsToUpsert.Any())
            {
                _logger.LogInformation("No valid attendance records to upsert for {Year}-{Month:D2}. Committing transaction.", year, month);
                await transaction.CommitAsync(); 
                return true;
            }

            const string upsertSql = @"
                INSERT INTO public.""AttendanceRecords"" (""EmployeeId"", ""AttendanceDate"", ""Status"")
                VALUES (@EmployeeId, @AttendanceDate, @Status)
                ON CONFLICT (""EmployeeId"", ""AttendanceDate"") DO UPDATE
                  SET ""Status"" = EXCLUDED.""Status"",
                      ""UpdatedAt"" = CURRENT_TIMESTAMP;
            ";

            _logger.LogTrace("Executing UPSERT SQL for {Count} records for {Year}-{Month:D2}", recordsToUpsert.Count, year, month);
            int affectedRows = await connection.ExecuteAsync(upsertSql, recordsToUpsert, transaction);
            _logger.LogInformation("Upserted/Updated {AffectedRows} attendance records for {Year}-{Month:D2}.", affectedRows, year, month);

            await transaction.CommitAsync(); 
            _logger.LogTrace("Transaction committed for {Year}-{Month:D2} attendance save.", year, month);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DATABASE ERROR saving attendance for {Year}-{Month}", year, month); 
            try
            {
                await transaction.RollbackAsync(); 
                _logger.LogWarning("Transaction rolled back for {Year}-{Month} attendance save due to error.", year, month);
            }
            catch (Exception rollbackEx)
            {
                 _logger.LogError(rollbackEx, "Error attempting to roll back transaction for {Year}-{Month}", year, month);
            }
            throw; 
        }
        
    }
}