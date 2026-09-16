# Script to run all 7 microservices in background processes
$services = @(
    @{ name = "user-service";         port = 8081; jar = "user-service/target/user-service-1.0.0.jar" },
    @{ name = "product-service";      port = 8082; jar = "product-service/target/product-service-1.0.0.jar" },
    @{ name = "inventory-service";    port = 8083; jar = "inventory-service/target/inventory-service-1.0.0.jar" },
    @{ name = "order-service";        port = 8084; jar = "order-service/target/order-service-1.0.0.jar" },
    @{ name = "payment-service";      port = 8085; jar = "payment-service/target/payment-service-1.0.0.jar" },
    @{ name = "notification-service"; port = 8086; jar = "notification-service/target/notification-service-1.0.0.jar" },
    @{ name = "api-gateway";          port = 8080; jar = "api-gateway/target/api-gateway-1.0.0.jar" }
)

Write-Host "Starting all 7 microservices..." -ForegroundColor Cyan

foreach ($s in $services) {
    Write-Host "Launching $($s.name) on port $($s.port)..." -ForegroundColor Yellow
    Start-Process -FilePath "java" -ArgumentList "-jar", $s.jar -WindowStyle Minimized
}

Write-Host "`nAll services have been started!" -ForegroundColor Green
Write-Host "Allow ~15-20 seconds for full initialization before sending requests to http://localhost:8080." -ForegroundColor Gray
