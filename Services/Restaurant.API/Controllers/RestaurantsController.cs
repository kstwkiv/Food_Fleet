using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Restaurant.API.Application.Commands;
using Restaurant.API.Application.DTOs;
using Restaurant.API.Application.Interfaces;

namespace Restaurant.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly IRestaurantService _restaurantService;
    private readonly IUnitOfWork _unitOfWork;

    public RestaurantsController(IRestaurantService restaurantService, IUnitOfWork unitOfWork)
    {
        _restaurantService = restaurantService;
        _unitOfWork = unitOfWork;
    }

    // GET /api/v1/restaurants  — public
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? search)
    {
        var result = await _restaurantService.GetAllAsync(search);
        return Ok(result);
    }

    // GET /api/v1/restaurants/my  — owner sees their own restaurant regardless of status
    [HttpGet("my")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> GetMine()
    {
        var ownerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var restaurant = await _unitOfWork.Restaurants.GetByOwnerIdAsync(ownerId);
        if (restaurant == null) return NotFound();
        return Ok(new RestaurantDto
        {
            Id = restaurant.Id,
            OwnerId = restaurant.OwnerId,
            Name = restaurant.Name,
            Description = restaurant.Description,
            Address = restaurant.Address,
            CuisineTypes = restaurant.CuisineTypes,
            AverageRating = restaurant.AverageRating,
            TotalReviews = restaurant.TotalReviews,
            IsOpen = restaurant.IsOpen,
            EstimatedDeliveryMinutes = restaurant.EstimatedDeliveryMinutes,
            MinimumOrderAmount = restaurant.MinimumOrderAmount,
            Status = restaurant.Status.ToString(),
            LogoUrl = restaurant.LogoUrl
        });
    }

    // GET /api/v1/restaurants/{id}  — public
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _restaurantService.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    // POST /api/v1/restaurants  — RestaurantOwner or Admin
    [HttpPost]
    [Authorize(Roles = "RestaurantOwner,Admin")]
    public async Task<IActionResult> Create([FromBody] CreateRestaurantRequest request)
    {
        var ownerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var ownerEmail = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

        var command = new CreateRestaurantCommand(
            ownerId,
            ownerEmail,
            request.Name,
            request.Description,
            request.Address,
            request.Lat,
            request.Lng,
            request.CuisineTypes,
            request.OperatingHours,
            request.MinimumOrderAmount,
            request.EstimatedDeliveryMinutes,
            request.LogoUrl);

        var result = await _restaurantService.CreateAsync(command);
        return Ok(result);
    }

    // PATCH /api/v1/restaurants/{id}/availability
    [HttpPatch("{id}/availability")]
    [Authorize(Roles = "RestaurantOwner,Admin")]
    public async Task<IActionResult> ToggleAvailability(Guid id)
    {
        var isOpen = await _restaurantService.ToggleAvailabilityAsync(id);
        if (isOpen == null) return NotFound();
        return Ok(new { Id = id, IsOpen = isOpen.Value });
    }
}
