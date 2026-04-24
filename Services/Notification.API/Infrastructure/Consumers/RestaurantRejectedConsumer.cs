using FoodFleet.Shared.Events.Restaurants;
using MassTransit;
using Notification.API.Application.Interfaces;

namespace Notification.API.Infrastructure.Consumers;

public class RestaurantRejectedConsumer : IConsumer<RestaurantRejectedEvent>
{
    private readonly IEmailService _emailService;

    public RestaurantRejectedConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<RestaurantRejectedEvent> context)
    {
        var msg = context.Message;
        var isSuspended = msg.Reason.StartsWith("Suspended:");

        var subject = isSuspended
            ? $"Your Restaurant Has Been Suspended — {msg.RestaurantName}"
            : $"Your Restaurant Application Was Not Approved — {msg.RestaurantName}";

        var body = isSuspended
            ? $@"<p>Hi,</p>
                 <p>Your restaurant <strong>{msg.RestaurantName}</strong> has been <strong>suspended</strong> on FoodFleet.</p>
                 <p><strong>Reason:</strong> {msg.Reason.Replace("Suspended: ", "")}</p>
                 <p>Please contact support if you believe this is a mistake.</p>
                 <p>— FoodFleet Team</p>"
            : $@"<p>Hi,</p>
                 <p>Unfortunately, your restaurant <strong>{msg.RestaurantName}</strong> was not approved on FoodFleet.</p>
                 <p><strong>Reason:</strong> {msg.Reason}</p>
                 <p>You may reapply after addressing the above concerns.</p>
                 <p>— FoodFleet Team</p>";

        await _emailService.SendAsync(msg.OwnerEmail, subject, body);
    }
}
