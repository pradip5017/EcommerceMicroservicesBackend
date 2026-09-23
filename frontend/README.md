# MicroCommerce Frontend Dashboard

A modern, responsive, full-featured web frontend for the **E-Commerce Microservices Backend** architecture.

---

## 🚀 Quick Start

You can open and run this frontend in **two ways**:

### Option 1: Direct in Browser (No Server Required)
Simply double-click on **`index.html`** or right-click > **Open with Google Chrome / Microsoft Edge**.
CORS is configured globally on the Spring Cloud Gateway (`http://localhost:8080`), so API calls will work seamlessly!

### Option 2: Run Local Web Server (Port 3000)
Double-click **`start-frontend.bat`** (or execute `.\start-frontend.ps1` in PowerShell).
This automatically starts a native Windows HTTP server on `http://localhost:3000` and opens your browser.

---

## 🧭 Separate Menu Bar Navigation Structure

The frontend is organized into distinct, modular views:

| Menu Item | View File | Connected Backend Service | Port | Description |
|---|---|---|---|---|
| **Overview** | `js/views/dashboardView.js` | All Services | Multiple | High-level metrics, recent orders, live stats, quick actions |
| **Products** | `js/views/productsView.js` | Product Service | `:8082` | Product catalog cards, search, category filter pills, Add/Edit/Delete modals |
| **Orders** | `js/views/ordersView.js` | Order Service | `:8084` | Order placement wizard, live order status badges (`PENDING`, `CONFIRMED`, `CANCELLED`), order cancellation |
| **Payments** | `js/views/paymentsView.js` | Payment Service | `:8085` | Payment simulator (`SUCCESS` or `FAILED` to test Kafka Saga events), payment records table |
| **Inventory** | `js/views/inventoryView.js` | Inventory Service | `:8083` | Stock level lookups by Product ID, restock counter (`+10`, `+50`), stock status pills |
| **Notifications** | `js/views/notificationsView.js` | Notification Service | `:8086` | Real-time stream of Kafka events (`order-confirmed`, `payment-successful`, `order-cancelled`), live unread counter badge |
| **Auth & Users** | `js/views/authView.js` | User Service | `:8081` | JWT login, user registration, active test user switcher (`User ID #1`), token inspector |
| **Topology Matrix** | `js/views/statusView.js` | API Gateway | `:8080` | Live ping checks and latency monitor for all 7 microservices |

---

## 🔄 End-to-End Saga Flow with Notification Service

To see the Notification Service and Kafka in action:
1. Go to **Orders** menu > Click **Create Order** > Select a product and click **Submit Order**.
2. Go to **Payments** menu > Enter the Order ID, Amount, and select **SUCCESS**. Click **Authorize & Pay**.
3. Watch the **Notifications** bell badge update in real-time! Go to **Notifications** menu to view the Kafka `order-confirmed` and `payment-successful` alerts delivered directly from `notification-service` (:8086).
