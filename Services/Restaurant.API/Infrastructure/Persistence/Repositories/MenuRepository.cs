using Microsoft.EntityFrameworkCore;
using Restaurant.API.Application.Interfaces;
using Restaurant.API.Domain.Entities;

namespace Restaurant.API.Infrastructure.Persistence.Repositories;

public class MenuRepository : IMenuRepository
{
    private readonly RestaurantDbContext _context;

    public MenuRepository(RestaurantDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MenuCategory>> GetCategoriesWithItemsAsync(Guid restaurantId) =>
        await _context.MenuCategories
            .Include(c => c.MenuItems)
            .Where(c => c.RestaurantId == restaurantId)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

    public async Task AddItemAsync(MenuItem item) =>
        await _context.MenuItems.AddAsync(item);
}