using Restaurant.API.Domain.Entities;
using Restaurant.API.Domain.Enums;

namespace Restaurant.API.Application.Interfaces;

public interface IRestaurantRepository
{
    Task<IEnumerable<Domain.Entities.Restaurant>> GetAllActiveAsync();
    Task<IEnumerable<Domain.Entities.Restaurant>> GetAllAsync();
    Task<IEnumerable<Domain.Entities.Restaurant>> GetByStatusAsync(RestaurantStatus status);
    Task<IEnumerable<Domain.Entities.Restaurant>> SearchAsync(string term);
    Task<Domain.Entities.Restaurant?> GetByIdAsync(Guid id);
    Task AddAsync(Domain.Entities.Restaurant restaurant);
    void Update(Domain.Entities.Restaurant restaurant);
}