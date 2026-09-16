# Script to stop all microservices by port
$ports = @(8080, 8081, 8082, 8083, 8084, 8085, 8086)

Write-Host "Stopping all microservices listening on ports 8080-8086..." -ForegroundColor Cyan

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pidToStop = $conn.OwningProcess
            if ($pidToStop -and $pidToStop -ne 0) {
                Write-Host "Stopping PID $pidToStop on port $port..." -ForegroundColor Yellow
                Stop-Process -Id $pidToStop -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Write-Host "All services stopped." -ForegroundColor Green
