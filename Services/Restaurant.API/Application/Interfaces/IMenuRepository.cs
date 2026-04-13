using Restaurant.API.Domain.Entities;

namespace Restaurant.API.Application.Interfaces;

public interface IMenuRepository
{
    Task<IEnumerable<MenuCategory>> GetCategoriesWithItemsAsync(Guid restaurantId);
    Task AddItemAsync(MenuItem item);
}