/**
 * Main Application Orchestrator
 * Handles routing, view switching, global toast notifications, and modal managers
 */
const App = {
    currentView: 'dashboard',

    init() {
        console.log('Initializing E-Commerce Microservices Frontend...');
        
        // Initialize Navigation Component
        NavbarComponent.init();

        // Bind global modals
        this.bindGlobalModals();

        // Initial Route
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        this.navigateTo(hash, false);

        // Handle browser Back / Forward buttons
        window.addEventListener('popstate', (e) => {
            const view = e.state?.view || 'dashboard';
            this.navigateTo(view, false);
        });

        // Background notification counter refresh
        this.startBackgroundPoller();
    },

    async navigateTo(viewName, pushState = true) {
        const validViews = ['dashboard', 'products', 'orders', 'payments', 'inventory', 'notifications', 'auth', 'status'];
        if (!validViews.includes(viewName)) {
            viewName = 'dashboard';
        }

        // Clean up polling if leaving notifications
        if (this.currentView === 'notifications' && viewName !== 'notifications') {
            NotificationsView.stopPolling();
        }

        this.currentView = viewName;
        NavbarComponent.updateActiveTab(viewName);

        if (pushState) {
            window.history.pushState({ view: viewName }, '', `#${viewName}`);
        }

        const container = document.getElementById('view-container');
        if (!container) return;

        // Render target view
        switch (viewName) {
            case 'dashboard':
                await DashboardView.render(container);
                break;
            case 'products':
                await ProductsView.render(container);
                break;
            case 'orders':
                await OrdersView.render(container);
                break;
            case 'payments':
                await PaymentsView.render(container);
                break;
            case 'inventory':
                await InventoryView.render(container);
                break;
            case 'notifications':
                await NotificationsView.render(container);
                break;
            case 'auth':
                await AuthView.render(container);
                break;
            case 'status':
                await StatusView.render(container);
                break;
        }

        // Scroll to top of content
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    bindGlobalModals() {
        // Product Modal Save & Close
        const prodForm = document.getElementById('product-form');
        if (prodForm) {
            prodForm.addEventListener('submit', (e) => ProductsView.saveProduct(e));
        }

        const prodClose = document.getElementById('product-modal-close');
        if (prodClose) {
            prodClose.addEventListener('click', () => ProductsView.closeModal());
        }

        // Order Modal Submit & Close
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => OrdersView.submitOrder(e));
        }

        const orderClose = document.getElementById('order-modal-close');
        if (orderClose) {
            orderClose.addEventListener('click', () => OrdersView.closeModal());
        }

        // Order total calculator listeners
        const orderProdSelect = document.getElementById('order-product-select');
        const orderQtyInput = document.getElementById('order-qty');
        if (orderProdSelect) {
            orderProdSelect.addEventListener('change', () => OrdersView.calculateOrderTotal());
        }
        if (orderQtyInput) {
            orderQtyInput.addEventListener('input', () => OrdersView.calculateOrderTotal());
        }

        // Settings Modal
        const settingsBtn = document.getElementById('topbar-settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const settingsClose = document.getElementById('settings-modal-close');
        const settingsForm = document.getElementById('settings-form');

        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                document.getElementById('setting-gateway-url').value = AppConfig.gatewayUrl;
                settingsModal.classList.remove('hidden');
            });
        }

        if (settingsClose && settingsModal) {
            settingsClose.addEventListener('click', () => {
                settingsModal.classList.add('hidden');
            });
        }

        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newUrl = document.getElementById('setting-gateway-url').value.trim();
                if (newUrl) {
                    AppConfig.setGatewayUrl(newUrl);
                    App.showToast('Gateway URL updated to ' + newUrl, 'success');
                    settingsModal.classList.add('hidden');
                    this.navigateTo(this.currentView, false);
                }
            });
        }
    },

    startBackgroundPoller() {
        // Polls notifications every 8s to update the topbar & sidebar badge if on another page
        setInterval(async () => {
            if (this.currentView !== 'notifications') {
                try {
                    const list = await Api.notifications.getAll();
                    if (Array.isArray(list)) {
                        NavbarComponent.updateNotificationBadge(list.length);
                    }
                } catch {
                    // silent fail in background
                }
            }
        }, 8000);
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold max-w-md transition-all duration-300';

        let icon = 'fa-solid fa-circle-info';
        let styleClasses = 'bg-white text-slate-800 border-slate-200';

        switch (type) {
            case 'success':
                icon = 'fa-solid fa-circle-check text-emerald-500';
                styleClasses = 'bg-white text-slate-900 border-emerald-200 shadow-emerald-500/10';
                break;
            case 'error':
                icon = 'fa-solid fa-triangle-exclamation text-red-500';
                styleClasses = 'bg-white text-red-900 border-red-200 shadow-red-500/10';
                break;
            case 'warning':
                icon = 'fa-solid fa-circle-exclamation text-amber-500';
                styleClasses = 'bg-white text-amber-900 border-amber-200 shadow-amber-500/10';
                break;
            case 'info':
            default:
                icon = 'fa-solid fa-bell text-indigo-500';
                styleClasses = 'bg-white text-slate-800 border-indigo-200 shadow-indigo-500/10';
                break;
        }

        toast.className += ` ${styleClasses}`;
        toast.innerHTML = `
            <i class="${icon} text-base flex-shrink-0"></i>
            <span class="flex-1">${message}</span>
            <button class="text-slate-400 hover:text-slate-600 ml-2" onclick="this.parentElement.remove()">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        container.appendChild(toast);

        // Auto remove after 4.5s
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4500);
    }
};

window.App = App;

// Bootstrap on DOM load
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
