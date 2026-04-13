using Identity.API.Application.DTOs;
using MediatR;

namespace Identity.API.Application.Commands;

public record LoginCommand(
    string Email,
    string Password) : IRequest<AuthResponse>;