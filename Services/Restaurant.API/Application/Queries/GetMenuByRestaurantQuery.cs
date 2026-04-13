using MediatR;
using Restaurant.API.Application.DTOs;

namespace Restaurant.API.Application.Queries;

public record GetMenuByRestaurantQuery(Guid RestaurantId) : IRequest<List<MenuItemDto>>;