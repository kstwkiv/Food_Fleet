using System.Security.Claims;
using Delivery.API.Application.Commands;
using Delivery.API.Application.DTOs;
using Delivery.API.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Delivery.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class DeliveryController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;

    public DeliveryController(IMediator mediator, IUnitOfWork unitOfWork)
    {
        _mediator = mediator;
        _unitOfWork = unitOfWork;
    }

    [HttpPost("assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Assign([FromBody] AssignDeliveryCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPatch("location")]
    [Authorize(Roles = "DeliveryAgent")]
    public async Task<IActionResult> UpdateLocation([FromBody] UpdateLocationCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result) return NotFound();
        return Ok("Location updated.");
    }

    [HttpPatch("{orderId}/complete")]
    [Authorize(Roles = "DeliveryAgent,Admin")]
    public async Task<IActionResult> Complete(Guid orderId)
    {
        var result = await _mediator.Send(new CompleteDeliveryCommand(orderId));
        if (!result) return NotFound();
        return Ok("Delivery completed.");
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetByOrder(Guid orderId)
    {
        var delivery = await _unitOfWork.Deliveries.GetByOrderIdAsync(orderId);
        if (delivery == null) return NotFound();

        return Ok(new DeliveryDto
        {
            Id = delivery.Id,
            OrderId = delivery.OrderId,
            AgentId = delivery.AgentId,
            Status = delivery.Status,
            CurrentLat = delivery.CurrentLat,
            CurrentLng = delivery.CurrentLng,
            AssignedAt = delivery.AssignedAt,
            CompletedAt = delivery.CompletedAt
        });
    }
}
