using MediatR;

namespace Delivery.API.Application.Commands;

public record UpdateLocationCommand(
    Guid DeliveryId,
    double Lat,
    double Lng) : IRequest<bool>;