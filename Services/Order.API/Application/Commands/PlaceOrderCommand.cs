using MediatR;
using Order.API.Application.DTOs;
using Order.API.Domain.Enums;

namespace Order.API.Application.Commands;

public record PlaceOrderCommand(
    Guid CustomerId,
    string CustomerEmail,
    Guid RestaurantId,
    string DeliveryAddress,
    PaymentMethod PaymentMethod,
    List<OrderItemDto> Items) : IRequest<OrderDto>;