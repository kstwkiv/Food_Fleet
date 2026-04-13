using FoodFleet.Shared.Events.Payments;
using MassTransit;
using MediatR;
using Microsoft.Extensions.Logging;
using Order.API.Application.Commands;
using Order.API.Domain.Enums;

namespace Order.API.Infrastructure.Consumers;

public class PaymentFailedConsumer : IConsumer<PaymentFailedEvent>
{
    private readonly IMediator _mediator;
    private readonly ILogger<PaymentFailedConsumer> _logger;

    public PaymentFailedConsumer(IMediator mediator, ILogger<PaymentFailedConsumer> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PaymentFailedEvent> context)
    {
        _logger.LogInformation("Payment failed for Order {OrderId}", context.Message.OrderId);
        await _mediator.Send(new UpdateOrderStatusCommand(context.Message.OrderId, OrderStatus.Cancelled));
    }
}