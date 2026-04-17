namespace Identity.API.Infrastructure.Swagger;

public class SwaggerSecurityMiddleware
{
    private readonly RequestDelegate _next;

    public SwaggerSecurityMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments("/swagger") ||
            !context.Request.Path.Value!.EndsWith("swagger.json"))
        {
            await _next(context);
            return;
        }

        var originalBody = context.Response.Body;
        using var buffer = new MemoryStream();
        context.Response.Body = buffer;

        await _next(context);

        buffer.Seek(0, SeekOrigin.Begin);
        var body = await new StreamReader(buffer).ReadToEndAsync();

        // Fix empty security requirements: replace { } with {"Bearer":[]}
        body = body.Replace("\"security\": [\n          { },\n          { }\n        ]",
                            "\"security\": [\n          {\"Bearer\": []}\n        ]");
        body = body.Replace("\"security\": [\n    { }\n  ]",
                            "\"security\": [\n    {\"Bearer\": []}\n  ]");

        // More aggressive replacement for any empty security object in arrays
        body = System.Text.RegularExpressions.Regex.Replace(
            body,
            @"""security"":\s*\[\s*\{\s*\}(?:\s*,\s*\{\s*\})?\s*\]",
            @"""security"": [{""Bearer"": []}]");

        context.Response.Body = originalBody;
        context.Response.ContentLength = System.Text.Encoding.UTF8.GetByteCount(body);
        await context.Response.WriteAsync(body);
    }
}
