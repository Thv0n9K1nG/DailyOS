using System.Net;
using System.Text.Json;
using FluentValidation;

namespace LifeBoard.API.Middleware;

public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try { await next(context); }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";
            var error = new { status = 400, error = "Bad Request", message = "Validation failed",
                details = ex.Errors.Select(e => e.ErrorMessage).ToList() };
            await context.Response.WriteAsync(JsonSerializer.Serialize(error));
        }
        catch (KeyNotFoundException ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            context.Response.ContentType = "application/json";
            var error = new { status = 404, error = "Not Found", message = ex.Message };
            await context.Response.WriteAsync(JsonSerializer.Serialize(error));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            var error = new { status = 500, error = "Internal Server Error", message = "An unexpected error occurred." };
            await context.Response.WriteAsync(JsonSerializer.Serialize(error));
        }
    }
}
