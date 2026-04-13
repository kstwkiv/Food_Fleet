using FoodFleet.Shared.Events.Delivery;
using MassTransit;
using Notification.API.Application.Interfaces;

namespace Notification.API.Infrastructure.Consumers;

public class DeliveryCompletedConsumer : IConsumer<DeliveryCompletedEvent>
{
    private readonly IEmailService _emailService;

    public DeliveryCompletedConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<DeliveryCompletedEvent> context)
    {
        await _emailService.SendAsync(
            context.Message.CustomerEmail,
            "Your Order Has Been Delivered!",
            $"Great news! Your order {context.Message.OrderId} was delivered on {context.Message.CompletedAt:f}. Enjoy your meal!");
    }
}
