/**
 * Navbar & Navigation Component
 * Handles sidebar menus, topbar status, route switching, and notification badges
 */
const NavbarComponent = {
    currentTab: 'dashboard',

    init() {
        this.bindEvents();
        this.updateUserDisplay();
        this.updateActiveTab(this.currentTab);
        
        // Listen to auth changes
        window.addEventListener('auth-changed', () => {
            this.updateUserDisplay();
        });
    },

    bindEvents() {
        // Sidebar Navigation Links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetView = link.getAttribute('data-view');
                if (targetView) {
                    App.navigateTo(targetView);
                }
            });
        });

        // Mobile Menu Toggle
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.getElementById('sidebar');
        if (mobileBtn && sidebar) {
            mobileBtn.addEventListener('click', () => {
                sidebar.classList.toggle('-translate-x-full');
            });
        }

        // Notification Bell click -> Go to notifications view
        const notifBell = document.getElementById('topbar-notif-bell');
        if (notifBell) {
            notifBell.addEventListener('click', () => {
                App.navigateTo('notifications');
            });
        }
    },

    updateActiveTab(tabName) {
        this.currentTab = tabName;
        
        document.querySelectorAll('.nav-link').forEach(link => {
            const view = link.getAttribute('data-view');
            if (view === tabName) {
                link.classList.add('bg-indigo-50', 'text-indigo-600', 'font-semibold');
                link.classList.remove('text-slate-600', 'hover:bg-slate-50', 'hover:text-slate-900');
            } else {
                link.classList.remove('bg-indigo-50', 'text-indigo-600', 'font-semibold');
                link.classList.add('text-slate-600', 'hover:bg-slate-50', 'hover:text-slate-900');
            }
        });

        // Update header title and breadcrumb
        const titleEl = document.getElementById('page-title');
        const breadcrumbEl = document.getElementById('page-breadcrumb');
        const titles = {
            dashboard: 'Overview & Metrics',
            products: 'Product Catalog',
            orders: 'Order Management',
            payments: 'Payment Processing',
            inventory: 'Inventory Warehouse',
            notifications: 'Notification Center',
            auth: 'Identity & Authentication',
            status: 'Microservices Topology'
        };

        if (titleEl) titleEl.textContent = titles[tabName] || 'Dashboard';
        if (breadcrumbEl) breadcrumbEl.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    },

    updateUserDisplay() {
        const user = AppConfig.session.user;
        const nameEl = document.getElementById('topbar-username');
        const roleEl = document.getElementById('topbar-userrole');
        const idBadge = document.getElementById('topbar-userid');

        if (nameEl) nameEl.textContent = user.username || 'Guest';
        if (roleEl) roleEl.textContent = user.role || 'USER';
        if (idBadge) idBadge.textContent = `User ID: ${user.id || 1}`;
    },

    updateNotificationBadge(count) {
        const badges = [
            document.getElementById('topbar-notif-badge'),
            document.getElementById('sidebar-notif-badge')
        ];

        badges.forEach(badge => {
            if (!badge) return;
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    }
};

window.NavbarComponent = NavbarComponent;
