using Delivery.API.Application.Commands;
using FoodFleet.Shared.Events.Orders;
using MassTransit;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Delivery.API.Infrastructure.Consumers;

public class OrderReadyConsumer : IConsumer<OrderStatusChangedEvent>
{
    private readonly IMediator _mediator;
    private readonly ILogger<OrderReadyConsumer> _logger;

    public OrderReadyConsumer(IMediator mediator, ILogger<OrderReadyConsumer> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderStatusChangedEvent> context)
    {
        if (context.Message.NewStatus == "Ready")
        {
            _logger.LogInformation("Order {OrderId} is ready - assigning delivery agent", context.Message.OrderId);
            await _mediator.Send(new AssignDeliveryCommand(
                context.Message.OrderId,
                context.Message.CustomerId,
                context.Message.CustomerEmail));
        }
    }
}