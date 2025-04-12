namespace employee_management_backend.Services;

public class PasswordService : IPasswordService
{
    public string HashPassword(string password)
    {
        // BCrypt handles salt generation automatically
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool VerifyPassword(string password, string storedHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            // Handle cases where the stored hash might not be a valid BCrypt hash
            Console.WriteLine($"Error verifying password: Invalid hash format for hash starting with {storedHash.Substring(0, Math.Min(10, storedHash.Length))}...");
            return false;
        }
        // Potentially catch other exceptions if needed
    }
}