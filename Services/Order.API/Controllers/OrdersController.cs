using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Order.API.Application.Commands;
using Order.API.Application.DTOs;
using Order.API.Application.Interfaces;
using Order.API.Application.Queries;
using Order.API.Domain.Enums;

namespace Order.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IUnitOfWork _unitOfWork;

    public OrdersController(IMediator mediator, IUnitOfWork unitOfWork)
    {
        _mediator = mediator;
        _unitOfWork = unitOfWork;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest request)
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var customerEmail = User.FindFirstValue(ClaimTypes.Email)!;

        var command = new PlaceOrderCommand(
            customerId,
            customerEmail,
            request.RestaurantId,
            request.DeliveryAddress,
            request.PaymentMethod,
            request.Items);

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetOrderByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetHistory(Guid customerId)
    {
        var result = await _mediator.Send(new GetOrderHistoryQuery(customerId));
        return Ok(result);
    }

    [HttpPost("{id}/cancel")]
    [Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _mediator.Send(new CancelOrderCommand(id, userId));
        if (!result) return BadRequest("Cannot cancel order.");
        return Ok("Order cancelled.");
    }

    [HttpGet("restaurant/{restaurantId}")]
    [Authorize(Roles = "RestaurantOwner,Admin")]
    public async Task<IActionResult> GetByRestaurant(Guid restaurantId)
    {
        var orders = await _unitOfWork.Orders.GetByRestaurantIdAsync(restaurantId);
        return Ok(orders.Select(o => new OrderDto
        {
            Id = o.Id,
            CustomerId = o.CustomerId,
            RestaurantId = o.RestaurantId,
            DeliveryAddress = o.DeliveryAddress,
            Status = o.Status,
            TotalAmount = o.TotalAmount,
            PaymentMethod = o.PaymentMethod.ToString(),
            CreatedAt = o.CreatedAt,
            Items = o.OrderItems.Select(i => new OrderItemDto
            {
                MenuItemId = i.MenuItemId,
                MenuItemName = i.MenuItemName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Customizations = i.Customizations
            }).ToList()
        }));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "RestaurantOwner,Admin")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] OrderStatus status)
    {
        var result = await _mediator.Send(new UpdateOrderStatusCommand(id, status));
        if (!result) return NotFound();
        return Ok("Status updated.");
    }
}
