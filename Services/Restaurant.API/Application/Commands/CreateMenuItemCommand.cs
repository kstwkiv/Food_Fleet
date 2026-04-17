using Restaurant.API.Application.DTOs;

namespace Restaurant.API.Application.Commands;

public record CreateMenuItemCommand(
    Guid CategoryId,
    string Name,
    string Description,
    decimal Price,
    string DietaryTags);
