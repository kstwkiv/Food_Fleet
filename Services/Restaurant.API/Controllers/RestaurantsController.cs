using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.API.Application.Commands;
using Restaurant.API.Application.DTOs;
using Restaurant.API.Application.Interfaces;
using Restaurant.API.Application.Queries;

namespace Restaurant.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;

    public RestaurantsController(IMediator mediator, IUnitOfWork unitOfWork)
    {
        _mediator = mediator;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var result = await _mediator.Send(new GetRestaurantsQuery(search));
        return Ok(result);
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        var result = await _unitOfWork.Restaurants.SearchAsync(q ?? string.Empty);
        return Ok(result.Select(r => new RestaurantDto
        {
            Id = r.Id,
            OwnerId = r.OwnerId,
            Name = r.Name,
            Description = r.Description,
            Address = r.Address,
            CuisineTypes = r.CuisineTypes,
            Status = r.Status.ToString(),
            IsOpen = r.IsOpen,
            MinimumOrderAmount = r.MinimumOrderAmount,
            EstimatedDeliveryMinutes = r.EstimatedDeliveryMinutes,
            AverageRating = r.AverageRating,
            TotalReviews = r.TotalReviews
        }));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetRestaurantByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "RestaurantOwner,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateRestaurantRequest request)
    {
        var ownerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var command = new CreateRestaurantCommand(
            ownerId,
            request.Name,
            request.Description,
            request.Address,
            request.Lat,
            request.Lng,
            request.CuisineTypes,
            request.OperatingHours,
            request.MinimumOrderAmount,
            request.EstimatedDeliveryMinutes);

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPatch("{id}/availability")]
    [Authorize(Roles = "RestaurantOwner,Admin")]
    public async Task<IActionResult> ToggleAvailability(Guid id)
    {
        var restaurant = await _unitOfWork.Restaurants.GetByIdAsync(id);
        if (restaurant == null) return NotFound();

        restaurant.IsOpen = !restaurant.IsOpen;
        restaurant.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Restaurants.Update(restaurant);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { restaurant.Id, restaurant.IsOpen });
    }
}