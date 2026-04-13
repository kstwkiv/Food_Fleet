using FoodFleet.Shared.Events.Restaurants;
using MassTransit;
using Notification.API.Application.Interfaces;

namespace Notification.API.Infrastructure.Consumers;

public class RestaurantApprovedConsumer : IConsumer<RestaurantApprovedEvent>
{
    private readonly IEmailService _emailService;

    public RestaurantApprovedConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<RestaurantApprovedEvent> context)
    {
        await _emailService.SendAsync(
            context.Message.OwnerEmail,
            "Your Restaurant Has Been Approved!",
            $"Congratulations! Your restaurant '{context.Message.RestaurantName}' has been approved on {context.Message.ApprovedAt:f}. You can now start receiving orders.");
    }
}
