using System.Globalization; 
using System.IdentityModel.Tokens.Jwt; 
using System.Reflection; 
using System.Security.Claims; 
using System.Text; 
using DbUp; 
using employee_management_backend.Endpoints; 
using employee_management_backend.Models.DTOs; 
using employee_management_backend.Repositories; 
using employee_management_backend.Services; 
using Microsoft.AspNetCore.Authentication.JwtBearer; 
using Microsoft.IdentityModel.Tokens; 
using Microsoft.Extensions.Logging; 


var builder = WebApplication.CreateBuilder(args);


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Database connection string 'DefaultConnection' not found.");

try
{
    Console.WriteLine("Ensuring database exists...");
    EnsureDatabase.For.PostgresqlDatabase(connectionString);
    Console.WriteLine("Database check/creation completed.");
}
catch (Exception ex)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine($"Error ensuring database exists: {ex.Message}");
    Console.ResetColor();
}

Console.WriteLine("Beginning database upgrade check...");
var upgrader = DeployChanges.To
    .PostgresqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
    .LogToConsole()
    .Build();

var migrationResult = upgrader.PerformUpgrade();

if (!migrationResult.Successful)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine("Database migration failed:");
    Console.WriteLine(migrationResult.Error);
    Console.ResetColor();
    throw new Exception("Database migration failed.", migrationResult.Error);
}

Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("Database migration successful!");
Console.ResetColor();


var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];


if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 32)
{
     if (builder.Environment.IsDevelopment())
     {
         Console.ForegroundColor = ConsoleColor.Yellow;
         Console.WriteLine("WARNING: JWT Secret Key is missing/short. Using default DEVELOPMENT key. CONFIGURE A STRONG KEY.");
         Console.ResetColor();
         secretKey = "DEFAULT_UNSAFE_DEV_KEY_REPLACE_ME_NOW_1234567890_ABCDEF"; 
     }
     else { throw new InvalidOperationException("JWT SecretKey is missing or too short."); }
}


builder.Services.AddSingleton<IPasswordService, PasswordService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IItemUsageRepository, ItemUsageRepository>();
builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>(); 
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "Employee Management API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme {  });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement {  });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policyBuilder =>
    {
        var allowedOrigins = builder.Configuration["AppCorsOrigins"]?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? ["http://localhost:5173"];
        if (builder.Environment.IsDevelopment())
        {
            var backendHttpOrigin = $"http://localhost:{builder.Configuration.GetValue<int>("HttpPort", 5183)}";
            var backendHttpsOrigin = $"https://localhost:{builder.Configuration.GetValue<int>("HttpsPort", 7167)}";
            var originsSet = new HashSet<string>(allowedOrigins, StringComparer.OrdinalIgnoreCase) { backendHttpOrigin, backendHttpsOrigin };
            allowedOrigins = originsSet.ToArray();
            Console.WriteLine($"[DEV CORS] Allowing origins: {string.Join(", ", allowedOrigins)}");
        }
        policyBuilder.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true,
            ValidIssuer = issuer, ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();


var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Employee API V1");
        options.RoutePrefix = "swagger";
    });
}
else { app.UseHsts(); }

app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigins");
app.UseAuthentication();
app.UseAuthorization();




app.MapGet("/", () => Results.Ok(new { message = "Employee Management API is running!" }))
   .WithName("GetApiRoot")
   .WithTags("API Status")
   .AllowAnonymous();


app.MapAuthEndpoints();
app.MapEmployeeEndpoints();
app.MapItemUsageEndpoints();
app.MapAttendanceEndpoints(); 


app.Run();