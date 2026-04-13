param(
    [switch]$NoGateway
)

$ErrorActionPreference = "Stop"

$services = @(
    @{ Name = "Identity.API"; Path = "D:\.net\FoodFleetMicroservices\Services\Identity.API"; Port = 5001 },
    @{ Name = "Restaurant.API"; Path = "D:\.net\FoodFleetMicroservices\Services\Restaurant.API"; Port = 5002 },
    @{ Name = "Order.API"; Path = "D:\.net\FoodFleetMicroservices\Services\Order.API"; Port = 5003 },
    @{ Name = "Payment.API"; Path = "D:\.net\FoodFleetMicroservices\Services\Payment.API"; Port = 5004 },
    @{ Name = "Delivery.API"; Path = "D:\.net\FoodFleetMicroservices\Services\Delivery.API"; Port = 5005 },
    @{ Name = "Notification.API"; Path = "D:\.net\FoodFleetMicroservices\Services\Notification.API"; Port = 5006 }
)

if (-not $NoGateway) {
    $services += @{ Name = "ApiGateway"; Path = "D:\.net\FoodFleetMicroservices\ApiGateway"; Port = 5134 }
}

foreach ($service in $services) {
    $existing = Get-NetTCPConnection -LocalPort $service.Port -ErrorAction SilentlyContinue |
        Select-Object -First 1

    if ($existing) {
        Write-Host "$($service.Name) appears to already be running on port $($service.Port). Skipping."
        continue
    }

    $command = "Set-Location '$($service.Path)'; dotnet run"
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        $command
    ) -WorkingDirectory $service.Path | Out-Null

    Write-Host "Started $($service.Name) on port $($service.Port)."
}

Write-Host ""
Write-Host "Done. Give the services a few seconds to boot, then open:"
Write-Host "http://localhost:5134/swagger"
