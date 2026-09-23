/**
 * Notification Center View
 * Dedicated real-time listener for Notification Service (:8086)
 * Automatically receives Kafka events for order-confirmed, payment-successful, and order-cancelled
 */
const NotificationsView = {
    notifications: [],
    pollingTimer: null,
    isPolling: true,
    userFilter: '',
    orderFilter: '',
    searchQuery: '',
    lastNotificationCount: 0,

    async render(container) {
        container.innerHTML = `
            <!-- Top Controls & Status Bar -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shadow-inner">
                        <i class="fa-solid fa-satellite-dish"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h3 class="text-lg font-extrabold text-slate-900">Notification Stream</h3>
                            <span id="notif-live-pill" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span class="pulse-live"></span> Live Polling
                            </span>
                        </div>
                        <p class="text-xs text-slate-500 mt-0.5">Subscribed to Kafka topics: <code class="font-mono text-purple-700 font-bold bg-purple-50 px-1 rounded">order-confirmed</code>, <code class="font-mono text-emerald-700 font-bold bg-emerald-50 px-1 rounded">payment-successful</code>, <code class="font-mono text-red-700 font-bold bg-red-50 px-1 rounded">order-cancelled</code></p>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-2.5">
                    <button id="notif-poll-toggle" onclick="NotificationsView.togglePolling()" class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                        <i class="fa-solid fa-pause"></i> Pause Stream
                    </button>
                    <button onclick="NotificationsView.loadNotifications(true)" class="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition flex items-center gap-1.5">
                        <i class="fa-solid fa-arrows-rotate"></i> Sync Now
                    </button>
                </div>
            </div>

            <!-- Filters & Search Bar -->
            <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-3">
                <div class="relative flex-1 w-full">
                    <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input id="notif-search-input" type="text" placeholder="Search notification message text..."
                        class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                </div>

                <div class="flex items-center gap-2 w-full md:w-auto">
                    <input id="notif-filter-user" type="number" placeholder="User ID"
                        class="w-24 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono" />
                    
                    <input id="notif-filter-order" type="number" placeholder="Order ID"
                        class="w-24 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono" />

                    <button onclick="NotificationsView.clearFilters()" class="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold text-xs transition whitespace-nowrap">
                        Clear
                    </button>
                </div>
            </div>

            <!-- Notifications Feed Container -->
            <div id="notifications-feed" class="space-y-3">
                <div class="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                    <i class="fa-solid fa-spinner fa-spin text-3xl mb-3 text-purple-500"></i>
                    <p>Connecting to Notification Service (:8086)...</p>
                </div>
            </div>
        `;

        this.bindEvents();
        await this.loadNotifications();
        this.startPolling();
    },

    bindEvents() {
        const searchInput = document.getElementById('notif-search-input');
        const userFilterInput = document.getElementById('notif-filter-user');
        const orderFilterInput = document.getElementById('notif-filter-order');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderFeed();
            });
        }

        if (userFilterInput) {
            userFilterInput.addEventListener('input', (e) => {
                this.userFilter = e.target.value.trim();
                this.renderFeed();
            });
        }

        if (orderFilterInput) {
            orderFilterInput.addEventListener('input', (e) => {
                this.orderFilter = e.target.value.trim();
                this.renderFeed();
            });
        }
    },

    startPolling() {
        this.stopPolling();
        if (!this.isPolling) return;

        this.pollingTimer = setInterval(async () => {
            await this.loadNotifications(false);
        }, AppConfig.notificationPollInterval);
    },

    stopPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
        }
    },

    togglePolling() {
        this.isPolling = !this.isPolling;
        const btn = document.getElementById('notif-poll-toggle');
        const pill = document.getElementById('notif-live-pill');

        if (this.isPolling) {
            this.startPolling();
            if (btn) {
                btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200';
                btn.innerHTML = `<i class="fa-solid fa-pause"></i> Pause Stream`;
            }
            if (pill) {
                pill.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
                pill.innerHTML = `<span class="pulse-live"></span> Live Polling`;
            }
        } else {
            this.stopPolling();
            if (btn) {
                btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 bg-slate-100 text-slate-800 hover:bg-slate-200';
                btn.innerHTML = `<i class="fa-solid fa-play"></i> Resume Stream`;
            }
            if (pill) {
                pill.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200';
                pill.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-400"></span> Paused`;
            }
        }
    },

    async loadNotifications(isManual = false) {
        try {
            const data = await Api.notifications.getAll();
            const list = Array.isArray(data) ? data : [];

            // Detect new notification arrival
            if (list.length > this.lastNotificationCount && this.lastNotificationCount !== 0) {
                const diff = list.length - this.lastNotificationCount;
                App.showToast(`🔔 Received ${diff} new notification from Notification Service!`, 'success');
            }
            this.lastNotificationCount = list.length;
            NavbarComponent.updateNotificationBadge(list.length);

            this.notifications = list;
            this.renderFeed();

            if (isManual) {
                App.showToast('Synced notifications successfully', 'info');
            }
        } catch (err) {
            console.error('Error loading notifications:', err);
            const feed = document.getElementById('notifications-feed');
            if (feed && this.notifications.length === 0) {
                feed.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <i class="fa-solid fa-bell-slash text-3xl text-red-500 mb-2"></i>
                        <h4 class="font-bold text-red-900">Notification Service Unreachable</h4>
                        <p class="text-xs text-red-600 mt-1">${err.message}</p>
                    </div>
                `;
            }
        }
    },

    renderFeed() {
        const feed = document.getElementById('notifications-feed');
        if (!feed) return;

        let filtered = this.notifications;

        if (this.userFilter) {
            filtered = filtered.filter(n => String(n.userId) === this.userFilter);
        }

        if (this.orderFilter) {
            filtered = filtered.filter(n => String(n.orderId) === this.orderFilter);
        }

        if (this.searchQuery) {
            filtered = filtered.filter(n => n.message && n.message.toLowerCase().includes(this.searchQuery));
        }

        if (filtered.length === 0) {
            feed.innerHTML = `
                <div class="bg-white rounded-2xl p-16 text-center text-slate-400 border border-slate-200">
                    <i class="fa-solid fa-bell-slash text-4xl text-slate-300 mb-3"></i>
                    <h4 class="text-base font-bold text-slate-700">No Notifications Found</h4>
                    <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        Notifications will appear here in real time as order events and payment events are published through Kafka to the Notification Service.
                    </p>
                </div>
            `;
            return;
        }

        // Sort descending by ID
        const sorted = [...filtered].sort((a, b) => (b.id || 0) - (a.id || 0));

        feed.innerHTML = sorted.map(notif => {
            const formattedDate = notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'N/A';
            const msg = notif.message || '';
            
            // Determine event theme
            let themeIcon = 'fa-solid fa-bell';
            let themeColor = 'purple';
            let eventTag = 'EVENT';

            if (msg.toLowerCase().includes('confirmed')) {
                themeIcon = 'fa-solid fa-circle-check';
                themeColor = 'indigo';
                eventTag = 'ORDER CONFIRMED';
            } else if (msg.toLowerCase().includes('payment successful') || msg.toLowerCase().includes('paid')) {
                themeIcon = 'fa-solid fa-credit-card';
                themeColor = 'emerald';
                eventTag = 'PAYMENT SUCCESS';
            } else if (msg.toLowerCase().includes('cancelled') || msg.toLowerCase().includes('failed')) {
                themeIcon = 'fa-solid fa-ban';
                themeColor = 'red';
                eventTag = 'ORDER CANCELLED';
            }

            return `
                <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div class="flex items-start gap-4 flex-1">
                        <div class="w-10 h-10 rounded-xl bg-${themeColor}-50 text-${themeColor}-600 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                            <i class="${themeIcon}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-${themeColor}-100 text-${themeColor}-800">
                                    ${eventTag}
                                </span>
                                <span class="text-xs font-mono font-bold text-slate-500">ID: #${notif.id}</span>
                                <span class="text-[11px] text-slate-400">• ${formattedDate}</span>
                            </div>
                            <p class="text-sm font-semibold text-slate-800 leading-snug">${notif.message}</p>
                            <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                                <span class="inline-flex items-center gap-1 font-mono font-semibold text-indigo-600 bg-indigo-50/70 px-2 py-0.5 rounded-lg cursor-pointer hover:bg-indigo-100" onclick="NotificationsView.filterByOrder(${notif.orderId})">
                                    <i class="fa-solid fa-box text-[10px]"></i> Order #${notif.orderId}
                                </span>
                                <span class="inline-flex items-center gap-1 font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg cursor-pointer hover:bg-slate-200" onclick="NotificationsView.filterByUser(${notif.userId})">
                                    <i class="fa-solid fa-user text-[10px]"></i> User #${notif.userId}
                                </span>
                                <span class="text-slate-400 text-[11px]">Status: <strong class="text-slate-700">${notif.status}</strong></span>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 self-end sm:self-center">
                        <button onclick="OrdersView.filterOrders('ALL'); App.navigateTo('orders');" title="View Related Order" class="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
                            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> View Order
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterByUser(userId) {
        this.userFilter = String(userId);
        const input = document.getElementById('notif-filter-user');
        if (input) input.value = userId;
        this.renderFeed();
    },

    filterByOrder(orderId) {
        this.orderFilter = String(orderId);
        const input = document.getElementById('notif-filter-order');
        if (input) input.value = orderId;
        this.renderFeed();
    },

    clearFilters() {
        this.userFilter = '';
        this.orderFilter = '';
        this.searchQuery = '';
        const searchInput = document.getElementById('notif-search-input');
        const userFilterInput = document.getElementById('notif-filter-user');
        const orderFilterInput = document.getElementById('notif-filter-order');
        if (searchInput) searchInput.value = '';
        if (userFilterInput) userFilterInput.value = '';
        if (orderFilterInput) orderFilterInput.value = '';
        this.renderFeed();
    }
};

window.NotificationsView = NotificationsView;
