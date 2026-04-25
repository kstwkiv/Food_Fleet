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
    private readonly IUnitOfWork _unitOfWork;

    public DeliveryController(IDeliveryService deliveryService, IUnitOfWork unitOfWork)
    {
        _deliveryService = deliveryService;
        _unitOfWork = unitOfWork;
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

    [HttpGet("my")]
    [Authorize(Roles = "DeliveryAgent")]
    public async Task<IActionResult> GetMyDelivery()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var agent = await _unitOfWork.Agents.GetByUserIdAsync(userId);
        if (agent == null) return NotFound("Agent profile not found.");

        var delivery = await _unitOfWork.Deliveries.GetByAgentIdAsync(agent.Id);
        if (delivery == null) return NotFound("No active delivery.");

        return Ok(new
        {
            delivery.Id,
            delivery.OrderId,
            delivery.Status,
            delivery.CurrentLat,
            delivery.CurrentLng,
            delivery.AssignedAt,
            delivery.CompletedAt
        });
    }
}
