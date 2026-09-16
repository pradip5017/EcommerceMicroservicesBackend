# Script to seed sample data across the microservices via API Gateway
Write-Host "Seeding data via API Gateway (http://localhost:8080)..." -ForegroundColor Cyan

# 1. Seed Users
Write-Host "`n[1/4] Seeding Users..." -ForegroundColor Yellow
$users = @(
    @{ username = "alex_gamer"; email = "alex@ecommerce.com"; password = "password123" },
    @{ username = "sarah_tech"; email = "sarah@ecommerce.com"; password = "password123" },
    @{ username = "mike_pro";   email = "mike@ecommerce.com";  password = "password123" }
)

foreach ($u in $users) {
    try {
        $body = $u | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body $body
        Write-Host "  -> Registered user: $($u.username)" -ForegroundColor Green
    } catch {
        Write-Host "  -> User $($u.username) already registered or skipped." -ForegroundColor Gray
    }
}

# 2. Seed Products
Write-Host "`n[2/4] Seeding Products & Inventory..." -ForegroundColor Yellow
$products = @(
    @{
        name = "Dell UltraSharp 34 Curved USB-C Monitor"
        description = "WQHD curved monitor with IPS Black technology and 90W power delivery"
        price = 849.99
        category = "Monitors"
        imageUrl = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf"
        stock = 30
    },
    @{
        name = "Keychron Q1 Pro Wireless Custom Mechanical Keyboard"
        description = "Full aluminum QMK/VIA wireless mechanical keyboard with hot-swappable switches"
        price = 199.99
        category = "Peripherals"
        imageUrl = "https://images.unsplash.com/photo-1587829741301-dc798b83add3"
        stock = 50
    },
    @{
        name = "Bose QuietComfort Ultra Headphones"
        description = "World-class noise cancellation, spatial audio, and custom-tuned sound"
        price = 429.00
        category = "Audio"
        imageUrl = "https://images.unsplash.com/photo-1546435770-a3e426bf472b"
        stock = 45
    }
)

foreach ($p in $products) {
    try {
        $prodBody = @{
            name = $p.name
            description = $p.description
            price = $p.price
            category = $p.category
            imageUrl = $p.imageUrl
        } | ConvertTo-Json

        $createdProd = Invoke-RestMethod -Uri "http://localhost:8080/api/products" -Method Post -ContentType "application/json" -Body $prodBody
        Write-Host "  -> Created Product #$($createdProd.id): $($createdProd.name)" -ForegroundColor Green

        # Add Inventory
        $invBody = @{
            productId = $createdProd.id
            quantity = $p.stock
        } | ConvertTo-Json
        $createdInv = Invoke-RestMethod -Uri "http://localhost:8080/api/inventory" -Method Post -ContentType "application/json" -Body $invBody
        Write-Host "     Inventory set: $($createdInv.availableQuantity) units in stock" -ForegroundColor Gray

        # Place a test order
        $orderBody = @{
            userId = 1
            productId = $createdProd.id
            quantity = 1
            amount = $p.price
        } | ConvertTo-Json
        $createdOrder = Invoke-RestMethod -Uri "http://localhost:8080/api/orders" -Method Post -ContentType "application/json" -Body $orderBody
        Write-Host "     Placed Order #$($createdOrder.id) for 1 item" -ForegroundColor Gray
    } catch {
        Write-Host "  -> Error adding $($p.name): $_" -ForegroundColor Red
    }
}

Write-Host "`nWaiting 3 seconds for Kafka event processing..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "`nData seeding completed successfully!" -ForegroundColor Green
