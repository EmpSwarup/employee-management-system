using System.Globalization; 
using employee_management_backend.Models;
using employee_management_backend.Models.DTOs;
using employee_management_backend.Repositories;
using Microsoft.AspNetCore.Http.HttpResults; 
using Microsoft.AspNetCore.Mvc; 
using Microsoft.Extensions.Logging; 

using System;
using System.Collections.Generic; 
using System.Linq; 

namespace employee_management_backend.Endpoints;

public static class AttendanceEndpoints
{
    private const string LogCategory = "AttendanceEndpoints";

    public static IEndpointRouteBuilder MapAttendanceEndpoints(this IEndpointRouteBuilder app)
    {
        var attendanceGroup = app.MapGroup("/api/attendance")
                                 .WithTags("Attendance")
                                 .RequireAuthorization(); 

        
        attendanceGroup.MapGet("/{year:int}/{month:int}", async Task<Results<Ok<MonthlyAttendanceDto>, BadRequest<string>, ProblemHttpResult>> (
            int year,
            int month,
            IAttendanceRepository repo,
            ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger(LogCategory);
            logger.LogInformation("Fetching attendance for Year: {Year}, Month: {Month}", year, month);

            if (month < 1 || month > 12 || year < 1900 || year > DateTime.Now.Year + 5)
            {
                return TypedResults.BadRequest("Invalid year or month provided.");
            }

            try
            {
                var records = await repo.GetAttendanceForMonthAsync(year, month);
                var attendanceDict = new Dictionary<int, Dictionary<int, bool>>();

                foreach (var record in records)
                {
                    if (!attendanceDict.ContainsKey(record.EmployeeId))
                    {
                        attendanceDict[record.EmployeeId] = new Dictionary<int, bool>();
                    }
                    attendanceDict[record.EmployeeId][record.AttendanceDate.Day] = record.Status;
                }
                return TypedResults.Ok(new MonthlyAttendanceDto(attendanceDict));
            }
            catch (Exception ex)
            {
                 logger.LogError(ex, "Error fetching attendance for {Year}-{Month}", year, month);
                 
                 return TypedResults.Problem("An error occurred while fetching attendance data.", statusCode: StatusCodes.Status500InternalServerError);
                 
            }
        })
        .Produces<MonthlyAttendanceDto>()
        .Produces<string>(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status500InternalServerError)
        .WithName("GetMonthlyAttendance");


        
        attendanceGroup.MapPost("/", async Task<Results<Ok, BadRequest<string>, ProblemHttpResult>> (
            [FromBody] SaveAttendanceDto saveDto,
            IAttendanceRepository repo,
            ILoggerFactory loggerFactory) =>
        {
             var logger = loggerFactory.CreateLogger(LogCategory);
             logger.LogInformation("Saving attendance for Month: {Month}", saveDto.Month);

             if (!DateTime.TryParseExact(saveDto.Month + "-01", "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var monthDate))
             {
                  return TypedResults.BadRequest("Invalid Month format. Use YYYY-MM.");
             }
             int year = monthDate.Year;
             int month = monthDate.Month;

             if (saveDto.AttendanceData == null)
             {
                 logger.LogWarning("Received request to save null attendance data for {Month}", saveDto.Month);
             }

             try
             {
                 bool success = await repo.SaveAttendanceForMonthAsync(year, month, saveDto.AttendanceData ?? new Dictionary<int, Dictionary<int, bool>>());

                 if (!success)
                 {
                      logger.LogWarning("SaveAttendanceForMonthAsync returned false for {Year}-{Month}", year, month);
                      return TypedResults.Problem("Failed to save attendance data due to an unexpected issue.", statusCode: StatusCodes.Status500InternalServerError);
                 }
                 return TypedResults.Ok(); 
             }
            catch (Exception ex)
             {
                 logger.LogError(ex, "Error saving attendance for {Month}", saveDto.Month);
                  
                 return TypedResults.Problem("An error occurred while saving attendance data.", statusCode: StatusCodes.Status500InternalServerError);
                 
             }
        })
        .Produces(StatusCodes.Status200OK)
        .ProducesValidationProblem()
        .Produces<string>(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status500InternalServerError)
        .WithName("SaveMonthlyAttendance");


        return app; 
    }
}