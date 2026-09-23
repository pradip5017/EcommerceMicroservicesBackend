/**
 * Centralized API Client for Backend Microservices
 * Communicates through the API Gateway (port 8080) with full JWT and error handling
 */
const Api = {
    // Core request dispatcher
    async request(path, options = {}) {
        const baseUrl = AppConfig.gatewayUrl;
        const url = `${baseUrl}${path}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        const token = AppConfig.session.user?.token;
        if (token && !headers['Authorization']) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            const contentType = response.headers.get('content-type') || '';
            let data = null;
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = (typeof data === 'object' && data?.message) 
                    ? data.message 
                    : (typeof data === 'string' && data) 
                        ? data 
                        : `HTTP Error ${response.status} (${response.statusText})`;
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error(`API Call Error on [${options.method || 'GET'} ${path}]:`, error);
            throw error;
        }
    },

    // ------------------------------------
    // 1. Auth & User Service (/api/auth)
    // ------------------------------------
    auth: {
        async login(username, password) {
            return Api.request('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },
        async register(username, email, password) {
            return Api.request('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password })
            });
        }
    },

    // ------------------------------------
    // 2. Product Service (/api/products)
    // ------------------------------------
    products: {
        async getAll(page = 0, size = 50) {
            return Api.request(`/api/products?page=${page}&size=${size}`);
        },
        async getById(id) {
            return Api.request(`/api/products/${id}`);
        },
        async create(product) {
            return Api.request('/api/products', {
                method: 'POST',
                body: JSON.stringify({
                    name: product.name,
                    description: product.description,
                    price: parseFloat(product.price),
                    category: product.category,
                    imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
                })
            });
        },
        async update(id, product) {
            return Api.request(`/api/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: product.name,
                    description: product.description,
                    price: parseFloat(product.price),
                    category: product.category,
                    imageUrl: product.imageUrl
                })
            });
        },
        async delete(id) {
            return Api.request(`/api/products/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // ------------------------------------
    // 3. Inventory Service (/api/inventory)
    // ------------------------------------
    inventory: {
        async getByProductId(productId) {
            try {
                return await Api.request(`/api/inventory/${productId}`);
            } catch (err) {
                // If not found, return null
                return null;
            }
        },
        async create(productId, quantity) {
            return Api.request('/api/inventory', {
                method: 'POST',
                body: JSON.stringify({
                    productId: parseInt(productId, 10),
                    quantity: parseInt(quantity, 10)
                })
            });
        }
    },

    // ------------------------------------
    // 4. Order Service (/api/orders)
    // ------------------------------------
    orders: {
        async getAll() {
            return Api.request('/api/orders');
        },
        async getById(id) {
            return Api.request(`/api/orders/${id}`);
        },
        async create(userId, productId, quantity, amount) {
            return Api.request('/api/orders', {
                method: 'POST',
                body: JSON.stringify({
                    userId: parseInt(userId, 10),
                    productId: parseInt(productId, 10),
                    quantity: parseInt(quantity, 10),
                    amount: parseFloat(amount)
                })
            });
        },
        async delete(id) {
            return Api.request(`/api/orders/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // ------------------------------------
    // 5. Payment Service (/api/payments)
    // ------------------------------------
    payments: {
        async getAll() {
            return Api.request('/api/payments');
        },
        async getById(id) {
            return Api.request(`/api/payments/${id}`);
        },
        async create(orderId, amount, status = 'SUCCESS') {
            return Api.request('/api/payments', {
                method: 'POST',
                body: JSON.stringify({
                    orderId: parseInt(orderId, 10),
                    amount: parseFloat(amount),
                    status: status.toUpperCase()
                })
            });
        },
        async dummyPay(paymentData) {
            return Api.request('/api/payments/dummy-pay', {
                method: 'POST',
                body: JSON.stringify({
                    orderId: parseInt(paymentData.orderId, 10),
                    amount: parseFloat(paymentData.amount),
                    paymentMethod: paymentData.paymentMethod || 'DUMMY_CARD',
                    cardNumber: paymentData.cardNumber || '4111-2222-3333-4444',
                    status: (paymentData.status || 'SUCCESS').toUpperCase()
                })
            });
        }
    },

    // ------------------------------------
    // 6. Notification Service (/api/notifications)
    // ------------------------------------
    notifications: {
        async getAll() {
            return Api.request('/api/notifications');
        },
        async getById(id) {
            return Api.request(`/api/notifications/${id}`);
        },
        async getByOrderId(orderId) {
            return Api.request(`/api/notifications/order/${orderId}`);
        },
        async getByUserId(userId) {
            return Api.request(`/api/notifications/user/${userId}`);
        }
    },

    // ------------------------------------
    // 7. Microservice Topology / Health Check
    // ------------------------------------
    health: {
        async ping(url, path = '') {
            const start = performance.now();
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2500);

                const response = await fetch(`${url}${path}`, {
                    method: 'GET',
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                const latency = Math.round(performance.now() - start);
                return {
                    online: response.status < 500,
                    status: response.status,
                    latency
                };
            } catch (err) {
                return {
                    online: false,
                    error: err.name === 'AbortError' ? 'Timeout' : 'Offline / Refused',
                    latency: Math.round(performance.now() - start)
                };
            }
        }
    }
};

window.Api = Api;
