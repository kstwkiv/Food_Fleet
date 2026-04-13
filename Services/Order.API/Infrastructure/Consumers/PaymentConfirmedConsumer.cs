using FoodFleet.Shared.Events.Payments;
using MassTransit;
using Microsoft.Extensions.Logging;
using Order.API.Application.Commands;
using Order.API.Domain.Enums;
using MediatR;

namespace Order.API.Infrastructure.Consumers;

public class PaymentConfirmedConsumer : IConsumer<PaymentConfirmedEvent>
{
    private readonly IMediator _mediator;
    private readonly ILogger<PaymentConfirmedConsumer> _logger;

    public PaymentConfirmedConsumer(IMediator mediator, ILogger<PaymentConfirmedConsumer> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PaymentConfirmedEvent> context)
    {
        _logger.LogInformation("Payment confirmed for Order {OrderId}", context.Message.OrderId);
        await _mediator.Send(new UpdateOrderStatusCommand(context.Message.OrderId, OrderStatus.Confirmed));
    }
}