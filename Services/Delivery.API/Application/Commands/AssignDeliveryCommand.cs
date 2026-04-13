using Delivery.API.Application.DTOs;
using MediatR;

namespace Delivery.API.Application.Commands;

public record AssignDeliveryCommand(
    Guid OrderId,
    Guid CustomerId,
    string CustomerEmail) : IRequest<DeliveryDto>;