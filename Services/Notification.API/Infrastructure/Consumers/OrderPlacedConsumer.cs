using FoodFleet.Shared.Events.Orders;
using MassTransit;
using Notification.API.Application.Interfaces;

namespace Notification.API.Infrastructure.Consumers;

public class OrderPlacedConsumer : IConsumer<OrderPlacedEvent>
{
    private readonly IEmailService _emailService;

    public OrderPlacedConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<OrderPlacedEvent> context)
    {
        await _emailService.SendAsync(
            context.Message.CustomerEmail,
            "Order Placed Successfully!",
            $"Your order {context.Message.OrderId} has been placed. Total: {context.Message.TotalAmount}");
    }
}