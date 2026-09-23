/**
 * Dashboard Overview View
 */
const DashboardView = {
    async render(container) {
        container.innerHTML = `
            <!-- Top Metrics Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Products</p>
                        <h3 id="stat-products" class="text-3xl font-extrabold text-slate-900 mt-1">...</h3>
                        <p class="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                            <i class="fa-solid fa-arrow-trend-up"></i> Live in catalog
                        </p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                        <i class="fa-solid fa-box-open"></i>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</p>
                        <h3 id="stat-orders" class="text-3xl font-extrabold text-slate-900 mt-1">...</h3>
                        <p id="stat-orders-status" class="text-xs text-slate-500 font-medium mt-1">Processing...</p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Successful Payments</p>
                        <h3 id="stat-payments" class="text-3xl font-extrabold text-slate-900 mt-1">...</h3>
                        <p id="stat-revenue" class="text-xs text-emerald-600 font-medium mt-1">₹0.00 Total</p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                        <i class="fa-solid fa-credit-card"></i>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kafka Notifications</p>
                        <h3 id="stat-notifications" class="text-3xl font-extrabold text-slate-900 mt-1">...</h3>
                        <p class="text-xs text-indigo-600 font-medium mt-1 flex items-center gap-1">
                            <span class="pulse-live"></span> Service: 8086
                        </p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                        <i class="fa-solid fa-bell"></i>
                    </div>
                </div>
            </div>

            <!-- Quick Action Banners -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div class="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/10 flex flex-col justify-between">
                    <div>
                        <span class="inline-block px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-3">Quick Flow</span>
                        <h4 class="text-xl font-bold">Place a Test Order</h4>
                        <p class="text-indigo-100 text-sm mt-1">Simulate an order creation and watch the Saga transaction execute across Kafka & microservices.</p>
                    </div>
                    <div class="mt-6 flex items-center gap-3">
                        <button onclick="App.navigateTo('orders'); setTimeout(() => OrdersView.openCreateModal(), 150)" class="px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl font-bold text-sm shadow transition">
                            <i class="fa-solid fa-plus mr-1.5"></i> Create Order
                        </button>
                        <button onclick="App.navigateTo('products')" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-sm transition">
                            View Catalog
                        </button>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg shadow-slate-900/10 flex flex-col justify-between">
                    <div>
                        <span class="inline-block px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-sm mb-3">Notification Service</span>
                        <h4 class="text-xl font-bold">Live Kafka Alerts</h4>
                        <p class="text-slate-300 text-sm mt-1">Real-time alerts for confirmed orders, successful payments, and cancellations emitted via Kafka.</p>
                    </div>
                    <div class="mt-6">
                        <button onclick="App.navigateTo('notifications')" class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow transition">
                            <i class="fa-solid fa-satellite-dish mr-1.5"></i> Open Live Stream
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Gateway Status</span>
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Online
                            </span>
                        </div>
                        <h4 class="text-lg font-bold text-slate-900">API Gateway :8080</h4>
                        <p class="text-slate-500 text-xs mt-1">Active proxy for 6 Spring Boot microservices with Spring Cloud Gateway & global CORS.</p>
                    </div>
                    <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span>Gateway: <code class="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-bold">http://localhost:8080</code></span>
                        <button onclick="App.navigateTo('status')" class="text-indigo-600 hover:text-indigo-800 font-semibold">
                            Full Health <i class="fa-solid fa-arrow-right text-[10px]"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Two-Column Recent Activity Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Recent Orders -->
                <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-receipt text-indigo-600"></i> Recent Orders
                        </h4>
                        <button onclick="App.navigateTo('orders')" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">View All</button>
                    </div>
                    <div id="dashboard-recent-orders" class="space-y-3">
                        <div class="text-center py-8 text-slate-400 text-sm">Loading recent orders...</div>
                    </div>
                </div>

                <!-- Recent Notifications -->
                <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-bell text-purple-600"></i> Latest Notifications
                        </h4>
                        <button onclick="App.navigateTo('notifications')" class="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">Notification Center</button>
                    </div>
                    <div id="dashboard-recent-notifications" class="space-y-3">
                        <div class="text-center py-8 text-slate-400 text-sm">Loading notifications...</div>
                    </div>
                </div>
            </div>
        `;

        this.loadMetrics();
    },

    async loadMetrics() {
        try {
            // Load products
            const productsData = await Api.products.getAll(0, 100).catch(() => null);
            const totalProducts = productsData?.totalElements ?? (productsData?.content?.length || 0);
            const prodEl = document.getElementById('stat-products');
            if (prodEl) prodEl.textContent = totalProducts;

            // Load orders
            const orders = await Api.orders.getAll().catch(() => []);
            const ordEl = document.getElementById('stat-orders');
            if (ordEl) ordEl.textContent = Array.isArray(orders) ? orders.length : 0;
            
            const confirmedCount = Array.isArray(orders) 
                ? orders.filter(o => o.status === 'CONFIRMED').length 
                : 0;
            const ordStatusEl = document.getElementById('stat-orders-status');
            if (ordStatusEl) ordStatusEl.textContent = `${confirmedCount} confirmed orders`;

            // Load payments
            const payments = await Api.payments.getAll().catch(() => []);
            const payEl = document.getElementById('stat-payments');
            if (payEl) payEl.textContent = Array.isArray(payments) ? payments.length : 0;

            const totalRev = Array.isArray(payments)
                ? payments.reduce((acc, p) => acc + (p.status === 'SUCCESS' ? Number(p.amount || 0) : 0), 0)
                : 0;
            const revEl = document.getElementById('stat-revenue');
            if (revEl) revEl.textContent = `₹${totalRev.toFixed(2)} Collected`;

            // Load notifications
            const notifications = await Api.notifications.getAll().catch(() => []);
            const notifEl = document.getElementById('stat-notifications');
            if (notifEl) notifEl.textContent = Array.isArray(notifications) ? notifications.length : 0;
            NavbarComponent.updateNotificationBadge(Array.isArray(notifications) ? notifications.length : 0);

            // Render Recent Orders List
            this.renderRecentOrders(Array.isArray(orders) ? orders.slice(-5).reverse() : []);

            // Render Recent Notifications List
            this.renderRecentNotifications(Array.isArray(notifications) ? notifications.slice(-5).reverse() : []);
        } catch (err) {
            console.error('Error loading dashboard metrics:', err);
        }
    },

    renderRecentOrders(orders) {
        const container = document.getElementById('dashboard-recent-orders');
        if (!container) return;

        if (!orders.length) {
            container.innerHTML = `<div class="text-center py-6 text-slate-400 text-sm">No orders placed yet. Create one!</div>`;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center">
                        #${order.id}
                    </div>
                    <div>
                        <p class="text-sm font-semibold text-slate-800">Product #${order.productId} (x${order.quantity})</p>
                        <p class="text-xs text-slate-400">User ID: ${order.userId} • ₹${Number(order.amount).toFixed(2)}</p>
                    </div>
                </div>
                <div>
                    <span class="inline-block px-2.5 py-1 rounded-full text-xs font-semibold badge-status-${order.status}">
                        ${order.status}
                    </span>
                </div>
            </div>
        `).join('');
    },

    renderRecentNotifications(notifications) {
        const container = document.getElementById('dashboard-recent-notifications');
        if (!container) return;

        if (!notifications.length) {
            container.innerHTML = `<div class="text-center py-6 text-slate-400 text-sm">No notifications received yet.</div>`;
            return;
        }

        container.innerHTML = notifications.map(notif => `
            <div class="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex-shrink-0 flex items-center justify-center text-xs mt-0.5">
                    <i class="fa-solid fa-bell"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-slate-800 truncate">${notif.message}</p>
                    <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>Order #${notif.orderId}</span>
                        <span>•</span>
                        <span>User #${notif.userId}</span>
                        <span>•</span>
                        <span class="text-purple-600 font-semibold">${notif.status}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

window.DashboardView = DashboardView;
