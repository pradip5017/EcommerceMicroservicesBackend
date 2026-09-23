/**
 * Microservices Topology & Health Status View
 * Live ping check to all 7 microservices (Gateway + 6 domain services)
 */
const StatusView = {
    services: [
        {
            name: 'API Gateway',
            port: 8080,
            url: 'http://localhost:8080',
            testPath: '/api/notifications',
            role: 'Reverse Proxy & CORS Router',
            command: 'mvn spring-boot:run -pl api-gateway'
        },
        {
            name: 'User Service',
            port: 8081,
            url: 'http://localhost:8081',
            testPath: '/api/auth/login',
            role: 'JWT Auth & User Profiles',
            command: 'mvn spring-boot:run -pl user-service'
        },
        {
            name: 'Product Service',
            port: 8082,
            url: 'http://localhost:8082',
            testPath: '/api/products',
            role: 'Product Catalog & Search',
            command: 'mvn spring-boot:run -pl product-service'
        },
        {
            name: 'Inventory Service',
            port: 8083,
            url: 'http://localhost:8083',
            testPath: '/api/inventory/1',
            role: 'Stock Reservation & Warehousing',
            command: 'mvn spring-boot:run -pl inventory-service'
        },
        {
            name: 'Order Service',
            port: 8084,
            url: 'http://localhost:8084',
            testPath: '/api/orders',
            role: 'Order Lifecycle & Saga Orchestration',
            command: 'mvn spring-boot:run -pl order-service'
        },
        {
            name: 'Payment Service',
            port: 8085,
            url: 'http://localhost:8085',
            testPath: '/api/payments',
            role: 'Payment Processing & Events',
            command: 'mvn spring-boot:run -pl payment-service'
        },
        {
            name: 'Notification Service',
            port: 8086,
            url: 'http://localhost:8086',
            testPath: '/api/notifications',
            role: 'Kafka Event Consumer & Alerts',
            command: 'mvn spring-boot:run -pl notification-service'
        }
    ],

    async render(container) {
        container.innerHTML = `
            <!-- Header Bar -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 class="text-lg font-extrabold text-slate-900">Microservices Health Matrix</h3>
                    <p class="text-xs text-slate-500 mt-0.5">Real-time status, latency, and topology for all backend microservices</p>
                </div>
                <button onclick="StatusView.checkAllServices()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2">
                    <i class="fa-solid fa-arrows-rotate"></i> Ping All Services
                </button>
            </div>

            <!-- Service Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="status-grid">
                ${this.services.map((s, idx) => `
                    <div id="service-card-${idx}" class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                                    Port :${s.port}
                                </span>
                                <span id="service-badge-${idx}" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                    <span class="w-2 h-2 rounded-full bg-slate-400"></span> Checking...
                                </span>
                            </div>

                            <h4 class="text-base font-bold text-slate-900">${s.name}</h4>
                            <p class="text-xs text-slate-500 mt-1">${s.role}</p>

                            <div class="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                                <div class="flex items-center justify-between text-slate-600">
                                    <span>Direct URL:</span>
                                    <code class="font-mono text-indigo-600 font-bold">${s.url}</code>
                                </div>
                                <div class="flex items-center justify-between text-slate-600">
                                    <span>Latency:</span>
                                    <span id="service-latency-${idx}" class="font-mono font-bold text-slate-800">-- ms</span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span class="text-[11px] text-slate-400 font-mono truncate max-w-[170px]" title="${s.command}">${s.command}</span>
                            <button onclick="StatusView.pingSingle(${idx})" class="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
                                Ping
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Architecture Diagram Note -->
            <div class="mt-8 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl">
                <div class="flex items-center gap-3 mb-2">
                    <i class="fa-solid fa-network-wired text-indigo-400 text-xl"></i>
                    <h4 class="font-bold text-base">Backend Architecture Topology</h4>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    Frontend connects directly to <strong class="text-white">API Gateway (Port 8080)</strong>. The Gateway proxies requests to the respective microservices:
                    User Service (:8081), Product Service (:8082), Inventory Service (:8083), Order Service (:8084), Payment Service (:8085), and Notification Service (:8086).
                    Asynchronous communication across Order, Inventory, Payment, and Notification is orchestrated via <strong class="text-white">Apache Kafka (Port 29092)</strong>.
                </p>
            </div>
        `;

        await this.checkAllServices();
    },

    async checkAllServices() {
        for (let i = 0; i < this.services.length; i++) {
            await this.pingSingle(i);
        }
    },

    async pingSingle(idx) {
        const s = this.services[idx];
        const badge = document.getElementById(`service-badge-${idx}`);
        const latencyEl = document.getElementById(`service-latency-${idx}`);

        if (badge) {
            badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200';
            badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Pinging...`;
        }

        const res = await Api.health.ping(s.url, s.testPath);

        if (latencyEl) {
            latencyEl.textContent = `${res.latency} ms`;
        }

        if (badge) {
            if (res.online) {
                badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
                badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Online`;
            } else {
                badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200';
                badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500"></span> Offline`;
            }
        }
    }
};

window.StatusView = StatusView;
