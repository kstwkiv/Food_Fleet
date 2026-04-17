using FoodFleet.Shared.Events.Orders;
using MassTransit;
using Notification.API.Application.Interfaces;

namespace Notification.API.Infrastructure.Consumers;

public class OrderStatusChangedConsumer : IConsumer<OrderStatusChangedEvent>
{
    private readonly IEmailService _emailService;

    public OrderStatusChangedConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<OrderStatusChangedEvent> context)
    {
        await _emailService.SendAsync(
            context.Message.CustomerEmail,
            "Order Status Updated",
            $"Your order {context.Message.OrderId} status changed to {context.Message.NewStatus}");
    }
}