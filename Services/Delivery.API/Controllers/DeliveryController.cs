using System.Security.Claims;
using Delivery.API.Application.Commands;
using Delivery.API.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Delivery.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class DeliveryController : ControllerBase
{
    private readonly IDeliveryService _deliveryService;

    public DeliveryController(IDeliveryService deliveryService)
    {
        _deliveryService = deliveryService;
    }

    [HttpPost("assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Assign([FromBody] AssignDeliveryCommand command)
    {
        var result = await _deliveryService.AssignAsync(command);
        return Ok(result);
    }

    [HttpPatch("location")]
    [Authorize(Roles = "DeliveryAgent")]
    public async Task<IActionResult> UpdateLocation([FromBody] UpdateLocationCommand command)
    {
        var result = await _deliveryService.UpdateLocationAsync(command);
        if (!result) return NotFound();
        return Ok("Location updated.");
    }

    [HttpPatch("{orderId}/complete")]
    [Authorize(Roles = "DeliveryAgent,Admin")]
    public async Task<IActionResult> Complete(Guid orderId)
    {
        var result = await _deliveryService.CompleteAsync(new CompleteDeliveryCommand(orderId));
        if (!result) return NotFound();
        return Ok("Delivery completed.");
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetByOrder(Guid orderId)
    {
        var delivery = await _deliveryService.GetByOrderAsync(orderId);
        if (delivery == null) return NotFound();
        return Ok(delivery);
    }
}
