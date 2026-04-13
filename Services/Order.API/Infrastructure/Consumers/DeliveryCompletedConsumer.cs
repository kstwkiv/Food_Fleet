using FoodFleet.Shared.Events.Delivery;
using MassTransit;
using MediatR;
using Microsoft.Extensions.Logging;
using Order.API.Application.Commands;
using Order.API.Domain.Enums;

namespace Order.API.Infrastructure.Consumers;

public class DeliveryCompletedConsumer : IConsumer<DeliveryCompletedEvent>
{
    private readonly IMediator _mediator;
    private readonly ILogger<DeliveryCompletedConsumer> _logger;

    public DeliveryCompletedConsumer(IMediator mediator, ILogger<DeliveryCompletedConsumer> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<DeliveryCompletedEvent> context)
    {
        _logger.LogInformation("Delivery completed for Order {OrderId}", context.Message.OrderId);
        await _mediator.Send(new UpdateOrderStatusCommand(context.Message.OrderId, OrderStatus.Delivered));
    }
}