using FoodFleet.Shared.Events.Auth;
using MassTransit;
using Notification.API.Application.Interfaces;

namespace Notification.API.Infrastructure.Consumers;

public class UserLoggedInConsumer : IConsumer<UserLoggedInEvent>
{
    private readonly IEmailService _emailService;

    public UserLoggedInConsumer(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task Consume(ConsumeContext<UserLoggedInEvent> context)
    {
        var msg = context.Message;
        await _emailService.SendAsync(
            msg.Email,
            "New Sign-In to Your FoodFleet Account",
            $@"<p>Hi {msg.FullName},</p>
               <p>A new sign-in was detected on your FoodFleet account at <strong>{msg.LoggedInAt:f} UTC</strong>.</p>
               <p>If this was you, no action is needed. If you didn't sign in, please reset your password immediately.</p>
               <p>— FoodFleet Team</p>");
    }
}
