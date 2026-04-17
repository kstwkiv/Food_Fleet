using Restaurant.API.Application.DTOs;

namespace Restaurant.API.Application.Commands;

public record CreateRestaurantCommand(
    Guid OwnerId,
    string Name,
    string Description,
    string Address,
    double Lat,
    double Lng,
    string CuisineTypes,
    string OperatingHours,
    double MinimumOrderAmount,
    int EstimatedDeliveryMinutes);
