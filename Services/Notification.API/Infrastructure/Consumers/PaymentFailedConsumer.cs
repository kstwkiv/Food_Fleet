using FoodFleet.Shared.Events.Payments;
using MassTransit;
using Notification.API.Application.Interfaces;

namespace Notification.API.Infrastructure.Consumers;

public class PaymentFailedConsumer : IConsumer<PaymentFailedEvent>
{
    private readonly IEmailService _emailService;

    public PaymentFailedConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<PaymentFailedEvent> context)
    {
        await _emailService.SendAsync(
            context.Message.CustomerEmail,
            "Payment Failed",
            $"Your payment for order {context.Message.OrderId} failed. Reason: {context.Message.Reason}");
    }
}