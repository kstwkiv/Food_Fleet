namespace FoodFleet.Shared.Events.Orders;

public class OrderPlacedEvent
{
    public Guid OrderId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid RestaurantId { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public DateTime PlacedAt { get; set; } = DateTime.UtcNow;
}