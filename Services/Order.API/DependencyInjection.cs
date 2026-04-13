using System.Reflection;
using FluentValidation;
using FoodFleet.Shared.Messaging;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Order.API.Application.Interfaces;
using Order.API.Infrastructure.Consumers;
using Order.API.Infrastructure.Persistence;
using Order.API.Infrastructure.Persistence.Repositories;

namespace Order.API;

public static class DependencyInjection
{
    public static IServiceCollection AddOrderServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<OrderDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddRabbitMqMessaging(configuration, x =>
        {
            x.AddConsumer<PaymentConfirmedConsumer>();
            x.AddConsumer<PaymentFailedConsumer>();
            x.AddConsumer<DeliveryCompletedConsumer>();
        });

        return services;
    }
}