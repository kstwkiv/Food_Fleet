using MediatR;
using Restaurant.API.Application.DTOs;

namespace Restaurant.API.Application.Commands;

public record UpdateRestaurantCommand(
    Guid RestaurantId,
    string Name,
    string Description,
    string OperatingHours,
    double MinimumOrderAmount,
    int EstimatedDeliveryMinutes) : IRequest<RestaurantDto>;