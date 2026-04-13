using FoodFleet.Shared.Events.Orders;
using MassTransit;
using MediatR;
using Microsoft.Extensions.Logging;
using Payment.API.Application.Commands;

namespace Payment.API.Infrastructure.Consumers;

public class OrderPlacedConsumer : IConsumer<OrderPlacedEvent>
{
    private readonly IMediator _mediator;
    private readonly ILogger<OrderPlacedConsumer> _logger;

    public OrderPlacedConsumer(IMediator mediator, ILogger<OrderPlacedConsumer> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderPlacedEvent> context)
    {
        _logger.LogInformation("Processing payment for Order {OrderId}", context.Message.OrderId);

        await _mediator.Send(new ProcessPaymentCommand(
            context.Message.OrderId,
            context.Message.CustomerId,
            context.Message.TotalAmount,
            context.Message.PaymentMethod));
    }
}