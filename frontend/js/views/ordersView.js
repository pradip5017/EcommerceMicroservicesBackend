/**
 * Orders Management View
 * Handles viewing orders, creating new orders with live total calculation,
 * out-of-stock item verification, and order payment actions.
 */
const OrdersView = {
    orders: [],
    filterStatus: 'ALL',
    currentSelectedStock: null,

    async render(container) {
        container.innerHTML = `
            <!-- Top Controls Bar -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <button onclick="OrdersView.filterOrders('ALL')" class="order-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm" data-filter="ALL">
                        All Orders
                    </button>
                    <button onclick="OrdersView.filterOrders('CONFIRMED')" class="order-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-600 hover:bg-slate-50 border border-slate-200" data-filter="CONFIRMED">
                        Confirmed
                    </button>
                    <button onclick="OrdersView.filterOrders('PENDING')" class="order-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-600 hover:bg-slate-50 border border-slate-200" data-filter="PENDING">
                        Pending
                    </button>
                    <button onclick="OrdersView.filterOrders('CANCELLED')" class="order-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-600 hover:bg-slate-50 border border-slate-200" data-filter="CANCELLED">
                        Cancelled
                    </button>
                </div>

                <div class="flex items-center gap-3">
                    <button onclick="OrdersView.loadOrders()" class="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition flex items-center gap-2">
                        <i class="fa-solid fa-arrows-rotate"></i> Refresh
                    </button>
                    <button onclick="OrdersView.openCreateModal()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm transition flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> Create Order
                    </button>
                </div>
            </div>

            <!-- Orders Table Container -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th class="py-3.5 px-4">Order ID</th>
                                <th class="py-3.5 px-4">User</th>
                                <th class="py-3.5 px-4">Product ID</th>
                                <th class="py-3.5 px-4">Qty</th>
                                <th class="py-3.5 px-4">Total Amount</th>
                                <th class="py-3.5 px-4">Status</th>
                                <th class="py-3.5 px-4">Created Time</th>
                                <th class="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="orders-table-body" class="divide-y divide-slate-100 text-xs">
                            <tr>
                                <td colspan="8" class="py-12 text-center text-slate-400">
                                    <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 text-indigo-500"></i>
                                    <p>Loading orders from Order Service (:8084)...</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadOrders();
    },

    async loadOrders() {
        try {
            const data = await Api.orders.getAll();
            this.orders = Array.isArray(data) ? data : [];
            this.renderTable();
        } catch (err) {
            const tbody = document.getElementById('orders-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="py-8 text-center text-red-500">
                            <i class="fa-solid fa-circle-exclamation text-2xl mb-2"></i>
                            <p class="font-bold">Failed to load orders: ${err.message}</p>
                        </td>
                    </tr>
                `;
            }
        }
    },

    filterOrders(status) {
        this.filterStatus = status;
        document.querySelectorAll('.order-filter-btn').forEach(btn => {
            if (btn.getAttribute('data-filter') === status) {
                btn.className = 'order-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm';
            } else {
                btn.className = 'order-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition bg-white text-slate-600 hover:bg-slate-50 border border-slate-200';
            }
        });
        this.renderTable();
    },

    renderTable() {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;

        let filtered = this.orders;
        if (this.filterStatus !== 'ALL') {
            filtered = filtered.filter(o => o.status === this.filterStatus);
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="py-12 text-center text-slate-400">
                        <i class="fa-solid fa-receipt text-3xl mb-2 text-slate-300"></i>
                        <p class="font-semibold text-slate-600">No orders found</p>
                        <p class="text-xs text-slate-400 mt-0.5">Click 'Create Order' to submit your first test order.</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Sort descending by ID
        const sorted = [...filtered].sort((a, b) => (b.id || 0) - (a.id || 0));

        tbody.innerHTML = sorted.map(order => {
            const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';
            const isPending = order.status === 'PENDING' || order.status === 'INVENTORY_RESERVED' || order.status === 'PAYMENT_PENDING';

            return `
                <tr class="hover:bg-slate-50/70 transition">
                    <td class="py-3 px-4 font-mono font-bold text-indigo-600">#${order.id}</td>
                    <td class="py-3 px-4 font-semibold text-slate-800">
                        <span class="inline-flex items-center gap-1.5">
                            <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600 font-bold">U</span>
                            User #${order.userId}
                        </span>
                    </td>
                    <td class="py-3 px-4 font-semibold text-slate-700">Product #${order.productId}</td>
                    <td class="py-3 px-4 font-bold text-slate-900">${order.quantity}</td>
                    <td class="py-3 px-4 font-bold text-slate-900">₹${Number(order.amount).toFixed(2)}</td>
                    <td class="py-3 px-4">
                        <span class="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold badge-status-${order.status}">
                            ${order.status}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-slate-400 text-[11px]">${formattedDate}</td>
                    <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            ${isPending ? `
                                <button onclick="OrdersView.payOrder(${order.id}, ${order.amount})" 
                                    class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1">
                                    <i class="fa-solid fa-credit-card text-[10px]"></i> Pay
                                </button>
                            ` : ''}
                            <button onclick="OrdersView.viewOrderDetails(${order.id})" title="View Notifications for Order"
                                class="w-7 h-7 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center transition">
                                <i class="fa-solid fa-bell text-[11px]"></i>
                            </button>
                            <button onclick="OrdersView.deleteOrder(${order.id})" title="Delete Order"
                                class="w-7 h-7 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg flex items-center justify-center transition">
                                <i class="fa-solid fa-trash text-[11px]"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    async openCreateModal(prefill = null) {
        const modal = document.getElementById('order-modal');
        const user = AppConfig.session.user;

        document.getElementById('order-user-id').value = user.id || 1;
        document.getElementById('order-qty').value = 1;

        // Load products into select dropdown
        const select = document.getElementById('order-product-select');
        select.innerHTML = '<option value="">-- Choose Product --</option>';

        try {
            const data = await Api.products.getAll(0, 100);
            const prods = data?.content || (Array.isArray(data) ? data : []);
            
            prods.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.dataset.price = p.price;
                opt.textContent = `#${p.id} - ${p.name} (₹${Number(p.price).toFixed(2)})`;
                select.appendChild(opt);
            });

            if (prefill?.productId) {
                select.value = prefill.productId;
            } else if (prods.length > 0) {
                select.value = prods[0].id;
            }

            await this.checkSelectedProductStock();
            this.calculateOrderTotal();
        } catch (e) {
            console.error(e);
        }

        modal.classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('order-modal').classList.add('hidden');
    },

    async checkSelectedProductStock() {
        const select = document.getElementById('order-product-select');
        const productId = select.value;
        const stockBanner = document.getElementById('order-stock-banner');
        const submitBtn = document.getElementById('order-submit-btn');

        if (!productId) {
            this.currentSelectedStock = null;
            if (stockBanner) stockBanner.classList.add('hidden');
            return;
        }

        try {
            const inv = await Api.inventory.getByProductId(productId);
            const qty = (inv && inv.availableQuantity !== undefined) ? inv.availableQuantity : 0;
            this.currentSelectedStock = qty;

            if (stockBanner && submitBtn) {
                stockBanner.classList.remove('hidden');
                if (qty <= 0) {
                    // Out of stock warning
                    stockBanner.className = 'p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5';
                    stockBanner.innerHTML = `
                        <i class="fa-solid fa-triangle-exclamation text-red-600 text-base mt-0.5 flex-shrink-0"></i>
                        <div>
                            <strong class="font-bold">OUT OF STOCK:</strong> This product currently has <strong>0 units</strong> in inventory.
                            Submitting an order will trigger an inventory reservation failure in Kafka.
                        </div>
                    `;
                    submitBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
                    submitBtn.classList.add('bg-red-600', 'hover:bg-red-700');
                    submitBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Force Order (Out of Stock Test)`;
                } else {
                    stockBanner.className = 'p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between';
                    stockBanner.innerHTML = `
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-circle-check text-emerald-600"></i>
                            <span>In Stock: <strong>${qty} units</strong> available in warehouse</span>
                        </div>
                        <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">VERIFIED</span>
                    `;
                    submitBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
                    submitBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
                    submitBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> Submit Order`;
                }
            }
        } catch {
            this.currentSelectedStock = null;
        }
    },

    calculateOrderTotal() {
        const select = document.getElementById('order-product-select');
        const qtyInput = document.getElementById('order-qty');
        const amountDisplay = document.getElementById('order-total-amount');

        const selectedOption = select.options[select.selectedIndex];
        const unitPrice = selectedOption ? parseFloat(selectedOption.dataset.price || 0) : 0;
        const qty = parseInt(qtyInput.value, 10) || 1;

        const total = unitPrice * qty;
        if (amountDisplay) amountDisplay.textContent = `₹${total.toFixed(2)}`;
        return total;
    },

    async submitOrder(e) {
        e.preventDefault();
        const userId = parseInt(document.getElementById('order-user-id').value, 10);
        const productId = parseInt(document.getElementById('order-product-select').value, 10);
        const quantity = parseInt(document.getElementById('order-qty').value, 10);
        const amount = this.calculateOrderTotal();

        if (!productId) {
            App.showToast('Please select a product', 'warning');
            return;
        }

        // Warn if out of stock
        if (this.currentSelectedStock !== null && this.currentSelectedStock <= 0) {
            App.showToast(`⚠️ Warning: Ordering item with 0 stock will trigger inventory failure in Kafka!`, 'warning');
        }

        try {
            const newOrder = await Api.orders.create(userId, productId, quantity, amount);
            App.showToast(`Order #${newOrder.id} created successfully! (Status: ${newOrder.status})`, 'success');
            this.closeModal();
            await this.loadOrders();

            // Refresh notifications view counter
            setTimeout(() => {
                NotificationsView.loadNotifications();
            }, 800);
        } catch (err) {
            App.showToast('Order failed: ' + err.message, 'error');
        }
    },

    payOrder(orderId, amount) {
        App.navigateTo('payments');
        setTimeout(() => {
            PaymentsView.prefillPayment(orderId, amount);
        }, 150);
    },

    viewOrderDetails(orderId) {
        App.navigateTo('notifications');
        setTimeout(() => {
            NotificationsView.filterByOrder(orderId);
        }, 150);
    },

    async deleteOrder(id) {
        if (!confirm(`Delete order #${id}?`)) return;

        try {
            await Api.orders.delete(id);
            App.showToast(`Order #${id} deleted`, 'info');
            await this.loadOrders();
        } catch (err) {
            App.showToast('Delete failed: ' + err.message, 'error');
        }
    }
};

window.OrdersView = OrdersView;
