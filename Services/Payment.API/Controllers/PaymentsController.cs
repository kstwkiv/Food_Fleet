using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Payment.API.Application.Commands;
using Payment.API.Application.DTOs;

namespace Payment.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("process")]
    [Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> Process([FromBody] ProcessPaymentRequest request)
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await _mediator.Send(new ProcessPaymentCommand(
            request.OrderId,
            customerId,
            request.Amount,
            request.PaymentMethod));

        return Ok(result);
    }
}
