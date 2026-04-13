Write-Host "Building solution..." -ForegroundColor Cyan
dotnet build FoodFleet.slnx --configuration Debug
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Fix errors before running." -ForegroundColor Red
    exit 1
}

Write-Host "Build succeeded. Starting services..." -ForegroundColor Green

$services = @(
    "ApiGateway",
    "Services\Identity.API",
    "Services\Restaurant.API",
    "Services\Order.API",
    "Services\Payment.API",
    "Services\Delivery.API",
    "Services\Notification.API"
)

foreach ($service in $services) {
    $name = Split-Path $service -Leaf
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\$service'; dotnet run --no-build" -WindowStyle Normal
    Write-Host "Started $name" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "All services started!" -ForegroundColor Green
Write-Host "Gateway:  http://localhost:5000"
Write-Host "Swagger:  http://localhost:5000/swagger"
