using Identity.API.Application.DTOs;
using MediatR;

namespace Identity.API.Application.Commands;

public record RegisterUserCommand(
    string FullName,
    string Email,
    string Password,
    string MobileNumber,
    string Role) : IRequest<AuthResponse>;