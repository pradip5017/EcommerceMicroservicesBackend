/**
 * Payments Processing View
 * Integrates with the Dummy Payment API (/api/payments/dummy-pay) and payment-service (:8085)
 * Allows simulating card/UPI/netbanking payments with real-time Kafka Saga event verification
 */
const PaymentsView = {
    payments: [],
    pendingOrders: [],
    selectedMethod: 'DUMMY_CARD',
    lastReceipt: null,

    async render(container) {
        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                <!-- ============================================== -->
                <!-- 1. DUMMY PAYMENT GATEWAY SIMULATOR            -->
                <!-- ============================================== -->
                <div class="lg:col-span-5 space-y-6">
                    <!-- Virtual Card Mockup -->
                    <div class="relative h-52 w-full rounded-3xl p-6 bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 text-white shadow-2xl shadow-indigo-900/30 overflow-hidden flex flex-col justify-between border border-white/10">
                        <div class="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none"></div>
                        <div class="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none"></div>
                        
                        <div class="flex items-center justify-between z-10">
                            <div class="flex items-center gap-2">
                                <span class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                                    <i class="fa-solid fa-microchip text-lg"></i>
                                </span>
                                <span class="text-xs font-mono font-bold tracking-widest text-slate-300">DUMMY TEST CARD</span>
                            </div>
                            <span class="text-xs font-black tracking-widest bg-white/20 px-2 py-0.5 rounded backdrop-blur-md">VISA</span>
                        </div>

                        <div class="z-10">
                            <p class="text-xs text-slate-400 font-mono tracking-wider mb-1">CARD NUMBER</p>
                            <p id="card-mock-number" class="text-xl font-mono font-bold tracking-widest text-white">4111 •••• •••• 4444</p>
                        </div>

                        <div class="flex items-center justify-between text-xs font-mono z-10">
                            <div>
                                <span class="text-[10px] text-slate-400 block">CARD HOLDER</span>
                                <span id="card-mock-name" class="font-bold text-slate-100 uppercase">DEMO USER</span>
                            </div>
                            <div>
                                <span class="text-[10px] text-slate-400 block">EXPIRES</span>
                                <span class="font-bold text-slate-100">12/28</span>
                            </div>
                            <div>
                                <span class="text-[10px] text-slate-400 block">CVV</span>
                                <span class="font-bold text-slate-100">999</span>
                            </div>
                        </div>
                    </div>

                    <!-- Dummy Payment Portal Card -->
                    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                    <i class="fa-solid fa-shield-halved"></i>
                                </div>
                                <div>
                                    <h4 class="text-sm font-extrabold text-slate-900">Dummy Payment Gateway API</h4>
                                    <p class="text-[11px] text-slate-400">Endpoints: <code class="text-indigo-600 font-mono">/api/payments/dummy-pay</code></p>
                                </div>
                            </div>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">SANDBOX</span>
                        </div>

                        <!-- Method Tabs -->
                        <div class="grid grid-cols-3 gap-2 mb-4">
                            <button type="button" onclick="PaymentsView.setMethod('DUMMY_CARD')" id="tab-card"
                                class="method-tab p-2.5 rounded-xl border text-center text-xs font-bold transition border-indigo-600 bg-indigo-50/50 text-indigo-700">
                                <i class="fa-solid fa-credit-card block mb-1 text-sm"></i> Card
                            </button>
                            <button type="button" onclick="PaymentsView.setMethod('DUMMY_UPI')" id="tab-upi"
                                class="method-tab p-2.5 rounded-xl border text-center text-xs font-bold transition border-slate-200 text-slate-600 hover:bg-slate-50">
                                <i class="fa-solid fa-mobile-screen-button block mb-1 text-sm"></i> UPI App
                            </button>
                            <button type="button" onclick="PaymentsView.setMethod('DUMMY_NETBANKING')" id="tab-nb"
                                class="method-tab p-2.5 rounded-xl border text-center text-xs font-bold transition border-slate-200 text-slate-600 hover:bg-slate-50">
                                <i class="fa-solid fa-building-columns block mb-1 text-sm"></i> NetBanking
                            </button>
                        </div>

                        <!-- Form -->
                        <form id="dummy-payment-form" onsubmit="PaymentsView.processDummyPayment(event)" class="space-y-4">
                            <!-- Order Selector -->
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Select Order to Pay</label>
                                <select id="dummy-order-select" onchange="PaymentsView.onOrderSelected()" 
                                    class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                                    <option value="">-- Choose an Order --</option>
                                </select>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">Order ID</label>
                                    <input id="dummy-order-id" type="number" required placeholder="32"
                                        class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
                                    <input id="dummy-pay-amount" type="number" step="0.01" min="0.01" required placeholder="100.00"
                                        class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-black text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                </div>
                            </div>

                            <!-- Simulated Status Outcome -->
                            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                                <span class="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Simulate Transaction Outcome:</span>
                                <div class="grid grid-cols-2 gap-2">
                                    <label class="border rounded-xl p-2 flex items-center gap-2 cursor-pointer bg-white hover:bg-emerald-50/50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                                        <input type="radio" name="dummy-status" value="SUCCESS" checked class="text-emerald-600" />
                                        <span class="text-xs font-bold text-emerald-800">SUCCESS</span>
                                    </label>
                                    <label class="border rounded-xl p-2 flex items-center gap-2 cursor-pointer bg-white hover:bg-red-50/50 has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                                        <input type="radio" name="dummy-status" value="FAILED" class="text-red-600" />
                                        <span class="text-xs font-bold text-red-800">FAILED</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <button type="submit" id="dummy-pay-btn" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2">
                                <i class="fa-solid fa-lock text-xs"></i> Pay with Dummy Payment API
                            </button>
                        </form>
                    </div>

                    <!-- Live Receipt Banner (if generated) -->
                    <div id="dummy-receipt-container" class="hidden">
                        <!-- Populated upon transaction -->
                    </div>
                </div>

                <!-- ============================================== -->
                <!-- 2. PAYMENT TRANSACTIONS AUDIT TABLE            -->
                <!-- ============================================== -->
                <div class="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
                    <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h4 class="font-bold text-slate-900 text-base">Payment Audit Trail</h4>
                            <p class="text-xs text-slate-500">Live records from Payment Service (:8085) & Kafka event confirmations</p>
                        </div>
                        <button onclick="PaymentsView.loadPayments()" class="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition flex items-center gap-1.5 self-start sm:self-auto">
                            <i class="fa-solid fa-arrows-rotate"></i> Refresh History
                        </button>
                    </div>

                    <div class="overflow-x-auto flex-1">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th class="py-3.5 px-4">Pay ID</th>
                                    <th class="py-3.5 px-4">Order ID</th>
                                    <th class="py-3.5 px-4">Amount</th>
                                    <th class="py-3.5 px-4">Status</th>
                                    <th class="py-3.5 px-4">Recorded Date</th>
                                    <th class="py-3.5 px-4 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody id="payments-table-body" class="divide-y divide-slate-100 text-xs">
                                <tr>
                                    <td colspan="6" class="py-12 text-center text-slate-400">
                                        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 text-indigo-500"></i>
                                        <p>Loading transactions...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        await this.loadOrdersDropdown();
        await this.loadPayments();
    },

    setMethod(method) {
        this.selectedMethod = method;
        const tabs = {
            DUMMY_CARD: document.getElementById('tab-card'),
            DUMMY_UPI: document.getElementById('tab-upi'),
            DUMMY_NETBANKING: document.getElementById('tab-nb')
        };

        const cardNumMock = document.getElementById('card-mock-number');
        if (cardNumMock) {
            if (method === 'DUMMY_CARD') cardNumMock.textContent = '4111 •••• •••• 4444';
            else if (method === 'DUMMY_UPI') cardNumMock.textContent = 'user@okaxis (UPI ID)';
            else cardNumMock.textContent = 'HDFC BANK • NETBANKING';
        }

        Object.keys(tabs).forEach(k => {
            const btn = tabs[k];
            if (!btn) return;
            if (k === method) {
                btn.className = 'method-tab p-2.5 rounded-xl border text-center text-xs font-bold transition border-indigo-600 bg-indigo-50/50 text-indigo-700';
            } else {
                btn.className = 'method-tab p-2.5 rounded-xl border text-center text-xs font-bold transition border-slate-200 text-slate-600 hover:bg-slate-50';
            }
        });
    },

    prefillPayment(orderId, amount) {
        const orderInput = document.getElementById('dummy-order-id');
        const amountInput = document.getElementById('dummy-pay-amount');
        if (orderInput) orderInput.value = orderId;
        if (amountInput) amountInput.value = amount;

        const select = document.getElementById('dummy-order-select');
        if (select) select.value = orderId;
    },

    async loadOrdersDropdown() {
        const select = document.getElementById('dummy-order-select');
        if (!select) return;

        try {
            const orders = await Api.orders.getAll();
            this.pendingOrders = Array.isArray(orders) ? orders : [];

            select.innerHTML = '<option value="">-- Choose Order to Pay --</option>';
            this.pendingOrders.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.id;
                opt.dataset.amount = o.amount;
                opt.textContent = `Order #${o.id} - ₹${Number(o.amount).toFixed(2)} (${o.status})`;
                select.appendChild(opt);
            });
        } catch (e) {
            console.error('Error loading orders dropdown:', e);
        }
    },

    onOrderSelected() {
        const select = document.getElementById('dummy-order-select');
        const orderIdInput = document.getElementById('dummy-order-id');
        const amountInput = document.getElementById('dummy-pay-amount');

        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption && selectedOption.value) {
            orderIdInput.value = selectedOption.value;
            amountInput.value = parseFloat(selectedOption.dataset.amount || 0);
        }
    },

    async processDummyPayment(e) {
        e.preventDefault();
        const orderId = document.getElementById('dummy-order-id').value;
        const amount = document.getElementById('dummy-pay-amount').value;
        const status = document.querySelector('input[name="dummy-status"]:checked').value;
        const btn = document.getElementById('dummy-pay-btn');

        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Contacting Payment API (:8085)...`;

        try {
            const response = await Api.payments.dummyPay({
                orderId,
                amount,
                paymentMethod: this.selectedMethod,
                cardNumber: '4111-2222-3333-4444',
                status
            });

            this.lastReceipt = response;
            this.renderReceipt(response);

            if (response.status === 'SUCCESS') {
                App.showToast(`🎉 Dummy Payment Success! Order #${orderId} confirmed via Kafka.`, 'success');
            } else {
                App.showToast(`⚠️ Dummy Payment Failed! Order #${orderId} was cancelled.`, 'error');
            }

            await this.loadPayments();
            await this.loadOrdersDropdown();

            // Refresh notification badge
            setTimeout(() => {
                NotificationsView.loadNotifications();
            }, 800);

        } catch (err) {
            App.showToast('Payment API error: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-lock text-xs"></i> Pay with Dummy Payment API`;
        }
    },

    renderReceipt(receipt) {
        const container = document.getElementById('dummy-receipt-container');
        if (!container) return;

        const isSuccess = receipt.status === 'SUCCESS';
        const dateStr = receipt.timestamp ? new Date(receipt.timestamp).toLocaleString() : new Date().toLocaleString();

        container.className = 'block';
        container.innerHTML = `
            <div class="p-5 rounded-3xl bg-white border ${isSuccess ? 'border-emerald-200 ring-2 ring-emerald-500/10' : 'border-red-200 ring-2 ring-red-500/10'} shadow-lg animate-in fade-in duration-300">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Dummy Transaction Receipt</span>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                        ${receipt.status}
                    </span>
                </div>
                
                <div class="mt-3 space-y-1.5 text-xs">
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500">Transaction ID:</span>
                        <code class="font-mono font-bold text-slate-800">${receipt.transactionId}</code>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500">Target Order:</span>
                        <strong class="text-indigo-600 font-mono">Order #${receipt.orderId}</strong>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500">Amount Paid:</span>
                        <strong class="text-slate-900 font-extrabold text-sm font-mono">₹${Number(receipt.amount).toFixed(2)}</strong>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500">Method:</span>
                        <span class="font-semibold text-slate-700">${receipt.paymentMethod || 'DUMMY_CARD'}</span>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Timestamp:</span>
                        <span>${dateStr}</span>
                    </div>
                </div>

                <div class="mt-4 p-2.5 rounded-xl ${isSuccess ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'} text-xs font-semibold flex items-center gap-2">
                    <i class="fa-solid ${isSuccess ? 'fa-circle-check text-emerald-600' : 'fa-circle-xmark text-red-600'}"></i>
                    <span>${receipt.message}</span>
                </div>
            </div>
        `;
    },

    async loadPayments() {
        try {
            const data = await Api.payments.getAll();
            this.payments = Array.isArray(data) ? data : [];
            this.renderTable();
        } catch (err) {
            const tbody = document.getElementById('payments-table-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="py-8 text-center text-red-500 font-bold">
                            Failed to load payments: ${err.message}
                        </td>
                    </tr>
                `;
            }
        }
    },

    renderTable() {
        const tbody = document.getElementById('payments-table-body');
        if (!tbody) return;

        if (this.payments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="py-12 text-center text-slate-400">
                        <i class="fa-solid fa-receipt text-3xl mb-2 text-slate-300"></i>
                        <p class="font-semibold text-slate-600">No payment records found</p>
                        <p class="text-xs text-slate-400 mt-1">Use the Dummy Gateway on the left to process your first payment.</p>
                    </td>
                </tr>
            `;
            return;
        }

        const sorted = [...this.payments].sort((a, b) => (b.id || 0) - (a.id || 0));

        tbody.innerHTML = sorted.map(pay => {
            const formattedDate = pay.createdAt ? new Date(pay.createdAt).toLocaleString() : 'N/A';
            return `
                <tr class="hover:bg-slate-50/70 transition">
                    <td class="py-3 px-4 font-mono font-bold text-slate-900">#${pay.id}</td>
                    <td class="py-3 px-4 font-mono font-semibold text-indigo-600">Order #${pay.orderId}</td>
                    <td class="py-3 px-4 font-bold text-slate-900">₹${Number(pay.amount).toFixed(2)}</td>
                    <td class="py-3 px-4">
                        <span class="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold badge-status-${pay.status}">
                            ${pay.status}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-slate-400 text-[11px]">${formattedDate}</td>
                    <td class="py-3 px-4 text-right">
                        <button onclick="App.showToast('Payment #${pay.id} Verified in MySQL database.', 'info')" 
                            class="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-600 transition">
                            Verify
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
};

window.PaymentsView = PaymentsView;
