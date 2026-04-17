using FoodFleet.Shared.Events.Orders;
using MassTransit;
using Notification.API.Application.Interfaces;

namespace Notification.API.Infrastructure.Consumers;

public class OrderCancelledConsumer : IConsumer<OrderCancelledEvent>
{
    private readonly IEmailService _emailService;

    public OrderCancelledConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<OrderCancelledEvent> context)
    {
        await _emailService.SendAsync(
            context.Message.CustomerEmail,
            "Your Order Has Been Cancelled",
            $"Your order {context.Message.OrderId} was cancelled on {context.Message.CancelledAt:f}. Reason: {context.Message.Reason}");
    }
}
