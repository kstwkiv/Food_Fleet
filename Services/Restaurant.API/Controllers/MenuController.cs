using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.API.Application.Commands;
using Restaurant.API.Application.DTOs;
using Restaurant.API.Application.Queries;

namespace Restaurant.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class MenuController : ControllerBase
{
    private readonly IMediator _mediator;

    public MenuController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("restaurant/{restaurantId}")]
    public async Task<IActionResult> GetMenu(Guid restaurantId)
    {
        var result = await _mediator.Send(new GetMenuByRestaurantQuery(restaurantId));
        return Ok(result);
    }

    [HttpPost("restaurant/{restaurantId}/items")]
    [Authorize(Roles = "RestaurantOwner,Admin")]
    public async Task<IActionResult> CreateItem(Guid restaurantId, [FromBody] CreateMenuItemRequest request)
    {
        var command = new CreateMenuItemCommand(
            request.CategoryId,
            request.Name,
            request.Description,
            request.Price,
            request.DietaryTags);

        var result = await _mediator.Send(command);
        return Ok(result);
    }
}