# Opens the MicroCommerce Frontend in your default browser
$indexPath = Join-Path $PSScriptRoot "index.html"
Write-Host "Opening MicroCommerce Frontend: $indexPath" -ForegroundColor Green
Start-Process $indexPath
