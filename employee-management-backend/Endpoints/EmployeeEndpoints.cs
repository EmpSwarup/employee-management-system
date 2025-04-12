using employee_management_backend.Models;
using employee_management_backend.Models.DTOs;
using employee_management_backend.Repositories;
using Microsoft.AspNetCore.Http.HttpResults; 
using Microsoft.AspNetCore.Mvc; 
using Microsoft.Extensions.Logging; 

namespace employee_management_backend.Endpoints;

public static class EmployeeEndpoints
{
    
    private const string LogCategory = "EmployeeEndpoints";

    public static IEndpointRouteBuilder MapEmployeeEndpoints(this IEndpointRouteBuilder app)
    {
        var employeeGroup = app.MapGroup("/api/employees")
                               .WithTags("Employees")
                               .RequireAuthorization();

        
        employeeGroup.MapGet("/", async (IEmployeeRepository repo) =>
        {
            var employees = await repo.GetAllAsync();
            
            var employeeDtos = employees.Select(e => new EmployeeDto(e.Id, e.Name, e.Email, e.Phone, e.Status));
            return Results.Ok(employeeDtos);
        })
        .Produces<IEnumerable<EmployeeDto>>()
        .WithName("GetAllEmployees");

        
        employeeGroup.MapGet("/{id:int}", async Task<Results<Ok<EmployeeDto>, NotFound>> (int id, IEmployeeRepository repo) =>
        {
            var employee = await repo.GetByIdAsync(id);
            if (employee == null)
            {
                return TypedResults.NotFound();
            }
            var employeeDto = new EmployeeDto(employee.Id, employee.Name, employee.Email, employee.Phone, employee.Status);
            return TypedResults.Ok(employeeDto);
        })
        .Produces<EmployeeDto>()
        .Produces(StatusCodes.Status404NotFound)
        .WithName("GetEmployeeById");

        
        employeeGroup.MapPost("/", async (
            [FromBody] CreateEmployeeDto createDto,
            IEmployeeRepository repo,
            ILoggerFactory loggerFactory 
        ) => {
             var logger = loggerFactory.CreateLogger(LogCategory); 
             var existingByEmail = await repo.GetByEmailAsync(createDto.Email);
             if (existingByEmail != null)
             {
                 
                 return Results.Problem(
                     title: "Conflict",
                     detail: $"Employee with email '{createDto.Email}' already exists.",
                     statusCode: StatusCodes.Status409Conflict);
             }
             var newEmployee = new Employee { Name = createDto.Name, Email = createDto.Email, Phone = createDto.Phone, Status = createDto.Status };
             try
             {
                 var createdId = await repo.CreateAsync(newEmployee);
                 var createdEmployeeDto = new EmployeeDto(createdId, newEmployee.Name, newEmployee.Email, newEmployee.Phone, newEmployee.Status);
                 
                 return Results.CreatedAtRoute("GetEmployeeById", new { id = createdId }, createdEmployeeDto);
             }
             catch (Exception ex)
             {
                 logger.LogError(ex, "Error creating employee with email {Email}", createDto.Email);
                 return Results.Problem("An error occurred while creating the employee.", statusCode: StatusCodes.Status500InternalServerError);
             }
        })
        .Produces<EmployeeDto>(StatusCodes.Status201Created)
        .ProducesValidationProblem() 
        .Produces<ProblemDetails>(StatusCodes.Status409Conflict) 
        .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError)
        .WithName("CreateEmployee");

        
        employeeGroup.MapPut("/{id:int}", async (
            int id,
            [FromBody] UpdateEmployeeDto updateDto,
            IEmployeeRepository repo,
            ILoggerFactory loggerFactory 
         ) => {
            var logger = loggerFactory.CreateLogger(LogCategory);
            var employeeToUpdate = await repo.GetByIdAsync(id);
            if (employeeToUpdate == null) { return Results.NotFound(); }

            var existingByEmail = await repo.GetByEmailAsync(updateDto.Email);
            if (existingByEmail != null && existingByEmail.Id != id)
            {
                 return Results.Problem(
                     title: "Conflict",
                     detail: $"Another employee with email '{updateDto.Email}' already exists.",
                     statusCode: StatusCodes.Status409Conflict);
            }

            
            employeeToUpdate.Name = updateDto.Name;
            employeeToUpdate.Email = updateDto.Email;
            employeeToUpdate.Phone = updateDto.Phone;
            employeeToUpdate.Status = updateDto.Status;

            try
            {
                var success = await repo.UpdateAsync(employeeToUpdate);
                if (!success)
                {
                    
                    return Results.Problem("Failed to update employee, possibly because it no longer exists.", statusCode: StatusCodes.Status500InternalServerError);
                }
                
                return Results.Ok(new EmployeeDto( employeeToUpdate.Id, employeeToUpdate.Name, employeeToUpdate.Email, employeeToUpdate.Phone, employeeToUpdate.Status));
            }
             catch (Exception ex)
             {
                 logger.LogError(ex, "Error updating employee with ID {EmployeeId}", id);
                 return Results.Problem("An error occurred while updating the employee.", statusCode: StatusCodes.Status500InternalServerError);
             }
        })
        .Produces<EmployeeDto>()
        .Produces(StatusCodes.Status404NotFound)
        .ProducesValidationProblem()
        .Produces<ProblemDetails>(StatusCodes.Status409Conflict)
        .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError)
        .WithName("UpdateEmployee");

        
        employeeGroup.MapDelete("/{id:int}", async (
            int id,
            IEmployeeRepository repo,
            ILoggerFactory loggerFactory 
        ) => {
            var logger = loggerFactory.CreateLogger(LogCategory);
             try
             {
                 var success = await repo.DeleteAsync(id);
                 if (!success)
                 {
                     return Results.NotFound(); 
                 }
                 return Results.NoContent(); 
             }
             catch (Exception ex)
             {
                 
                 logger.LogError(ex, "Error deleting employee with ID {EmployeeId}", id);
                 return Results.Problem("An error occurred while deleting the employee.", statusCode: StatusCodes.Status500InternalServerError);
             }
        })
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError) 
        .WithName("DeleteEmployee");

        
        employeeGroup.MapGet("/selectlist", async (IEmployeeRepository repo) =>
        {
            
            var employees = await repo.GetSelectListAsync();
            return Results.Ok(employees);
        })
        .Produces<IEnumerable<EmployeeSelectItemDto>>()
        .WithName("GetEmployeeSelectList");

        return app; 
    }
}