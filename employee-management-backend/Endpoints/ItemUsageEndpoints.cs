using employee_management_backend.Models;
using employee_management_backend.Models.DTOs;
using employee_management_backend.Repositories;
using Microsoft.AspNetCore.Http.HttpResults; 
using Microsoft.AspNetCore.Mvc; 
using Microsoft.Extensions.Logging; 

namespace employee_management_backend.Endpoints;

public static class ItemUsageEndpoints
{
    
    private const string LogCategory = "ItemUsageEndpoints";

    public static IEndpointRouteBuilder MapItemUsageEndpoints(this IEndpointRouteBuilder app)
    {
        var itemUsageGroup = app.MapGroup("/api/item-usage")
                                .WithTags("Item Usage")
                                .RequireAuthorization();

        
        itemUsageGroup.MapGet("/", async (IItemUsageRepository repo) =>
        {
            var records = await repo.GetAllAsync();
            var dtos = records.Select(r => new ItemUsageRecordDto( r.Id, r.EmployeeId, r.EmployeeName ?? "N/A", r.TransactionDate.ToString("yyyy-MM-dd"), r.Items.Select(i => new ItemDetailDto(i.ItemName, i.Quantity)).ToList() ));
            return Results.Ok(dtos);
        })
        .Produces<IEnumerable<ItemUsageRecordDto>>()
        .WithName("GetAllItemUsageRecords");

        
        itemUsageGroup.MapGet("/{id:int}", async Task<Results<Ok<ItemUsageRecordDto>, NotFound>> (int id, IItemUsageRepository repo) =>
        {
            var record = await repo.GetByIdAsync(id);
            if (record == null) { return TypedResults.NotFound(); }
            var dto = new ItemUsageRecordDto( record.Id, record.EmployeeId, record.EmployeeName ?? "N/A", record.TransactionDate.ToString("yyyy-MM-dd"), record.Items.Select(i => new ItemDetailDto(i.ItemName, i.Quantity)).ToList() );
            return TypedResults.Ok(dto);
        })
        .Produces<ItemUsageRecordDto>()
        .Produces(StatusCodes.Status404NotFound)
        .WithName("GetItemUsageRecordById");

        
        itemUsageGroup.MapPost("/", async (
            [FromBody] CreateItemUsageDto createDto,
            IItemUsageRepository usageRepo,
            IEmployeeRepository empRepo,
            ILoggerFactory loggerFactory 
        ) => {
            var logger = loggerFactory.CreateLogger(LogCategory);
            if (!DateOnly.TryParse(createDto.TransactionDate, out var transactionDateOnly))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]> {
                    { nameof(createDto.TransactionDate), ["Invalid date format. Use YYYY-MM-DD."] }
                });
            }
            var employeeExists = await empRepo.GetByIdAsync(createDto.EmployeeId);
            if (employeeExists == null)
            {
                 return Results.ValidationProblem(new Dictionary<string, string[]> {
                    { nameof(createDto.EmployeeId), [$"Employee with ID {createDto.EmployeeId} not found."] }
                });
            }
            var newRecord = new ItemUsageRecord { EmployeeId = createDto.EmployeeId, TransactionDate = transactionDateOnly.ToDateTime(TimeOnly.MinValue), Items = createDto.Items.Select(i => new ItemUsageDetail { ItemName = i.ItemName, Quantity = i.Quantity }).ToList() };
            try
            {
                var createdId = await usageRepo.CreateAsync(newRecord);
                var createdRecord = await usageRepo.GetByIdAsync(createdId); 
                if (createdRecord == null) { return Results.Problem("Failed to retrieve created record.", statusCode: 500); }
                var createdDto = new ItemUsageRecordDto( createdRecord.Id, createdRecord.EmployeeId, createdRecord.EmployeeName ?? "N/A", createdRecord.TransactionDate.ToString("yyyy-MM-dd"), createdRecord.Items.Select(i => new ItemDetailDto(i.ItemName, i.Quantity)).ToList() );
                return Results.CreatedAtRoute("GetItemUsageRecordById", new { id = createdId }, createdDto);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating item usage record for Employee ID {EmployeeId}", createDto.EmployeeId);
                return Results.Problem("An error occurred while creating the item usage record.", statusCode: 500);
            }
        })
        .Produces<ItemUsageRecordDto>(StatusCodes.Status201Created)
        .ProducesValidationProblem() 
        
        .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError)
        .WithName("CreateItemUsageRecord");

        
        itemUsageGroup.MapPut("/{id:int}", async (
            int id,
            [FromBody] UpdateItemUsageDto updateDto,
            IItemUsageRepository usageRepo,
            IEmployeeRepository empRepo,
            ILoggerFactory loggerFactory 
        ) => {
             var logger = loggerFactory.CreateLogger(LogCategory);
             if (!DateOnly.TryParse(updateDto.TransactionDate, out var transactionDateOnly))
             {
                  return Results.ValidationProblem(new Dictionary<string, string[]> { { nameof(updateDto.TransactionDate), ["Invalid date format. Use YYYY-MM-DD."] } });
             }
             var employeeExists = await empRepo.GetByIdAsync(updateDto.EmployeeId);
             if (employeeExists == null)
             {
                  return Results.ValidationProblem(new Dictionary<string, string[]> { { nameof(updateDto.EmployeeId), [$"Employee with ID {updateDto.EmployeeId} not found."] } });
             }
             var existingRecord = await usageRepo.GetByIdAsync(id); 
             if (existingRecord == null) { return Results.NotFound(); }

             var recordToUpdate = new ItemUsageRecord { Id = id, EmployeeId = updateDto.EmployeeId, TransactionDate = transactionDateOnly.ToDateTime(TimeOnly.MinValue), Items = updateDto.Items.Select(i => new ItemUsageDetail { ItemName = i.ItemName, Quantity = i.Quantity }).ToList() };
             try
             {
                 var success = await usageRepo.UpdateAsync(recordToUpdate);
                 if (!success) { return Results.Problem("Failed to update item usage record.", statusCode: 500); } 
                 var updatedRecord = await usageRepo.GetByIdAsync(id); 
                 if (updatedRecord == null) { return Results.Problem("Failed to retrieve updated record.", statusCode: 500); }
                 var updatedDto = new ItemUsageRecordDto( updatedRecord.Id, updatedRecord.EmployeeId, updatedRecord.EmployeeName ?? "N/A", updatedRecord.TransactionDate.ToString("yyyy-MM-dd"), updatedRecord.Items.Select(i => new ItemDetailDto(i.ItemName, i.Quantity)).ToList() );
                 return Results.Ok(updatedDto);
             }
             catch (Exception ex)
             {
                 logger.LogError(ex, "Error updating item usage record with ID {RecordId}", id);
                 return Results.Problem("An error occurred while updating the item usage record.", statusCode: 500);
             }
        })
        .Produces<ItemUsageRecordDto>()
        .Produces(StatusCodes.Status404NotFound)
        .ProducesValidationProblem()
        
        .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError)
        .WithName("UpdateItemUsageRecord");

        
        itemUsageGroup.MapDelete("/{id:int}", async (
            int id,
            IItemUsageRepository repo,
            ILoggerFactory loggerFactory 
        ) => {
             var logger = loggerFactory.CreateLogger(LogCategory);
             try
             {
                 var success = await repo.DeleteAsync(id);
                 if (!success) { return Results.NotFound(); }
                 return Results.NoContent();
             }
             catch (Exception ex)
             {
                 logger.LogError(ex, "Error deleting item usage record with ID {RecordId}", id);
                 return Results.Problem("An error occurred while deleting the item usage record.", statusCode: 500);
             }
        })
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError)
        .WithName("DeleteItemUsageRecord");

        return app; 
    }
}