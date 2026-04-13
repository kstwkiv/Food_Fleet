using MediatR;
using Restaurant.API.Application.DTOs;

namespace Restaurant.API.Application.Queries;

public record GetRestaurantByIdQuery(Guid RestaurantId) : IRequest<RestaurantDto?>;