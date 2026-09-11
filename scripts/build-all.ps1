$services = @("user-service","product-service","inventory-service","order-service","payment-service","notification-service","api-gateway")
foreach ($service in $services) {
  Push-Location $service
  mvn clean package -DskipTests
  Pop-Location
}
