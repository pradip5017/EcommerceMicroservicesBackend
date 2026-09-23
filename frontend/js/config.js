/**
 * Global Configuration for E-Commerce Microservices Frontend
 */
const AppConfig = {
    // API Gateway Base URL (Single entry point for all microservices)
    gatewayUrl: localStorage.getItem('ec_gateway_url') || 'http://localhost:8080',
    
    // Direct Service URLs (Used for direct health checks & fallback)
    directServices: {
        gateway: 'http://localhost:8080',
        user: 'http://localhost:8081',
        product: 'http://localhost:8082',
        inventory: 'http://localhost:8083',
        order: 'http://localhost:8084',
        payment: 'http://localhost:8085',
        notification: 'http://localhost:8086'
    },

    // Session Management
    session: {
        get user() {
            try {
                return JSON.parse(localStorage.getItem('ec_active_user')) || {
                    id: 1,
                    username: 'demo_user',
                    role: 'USER',
                    token: localStorage.getItem('ec_jwt_token') || ''
                };
            } catch (e) {
                return { id: 1, username: 'demo_user', role: 'USER', token: '' };
            }
        },
        setUser(userData) {
            localStorage.setItem('ec_active_user', JSON.stringify(userData));
            if (userData.token) {
                localStorage.setItem('ec_jwt_token', userData.token);
            }
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: userData }));
        },
        clearUser() {
            localStorage.removeItem('ec_active_user');
            localStorage.removeItem('ec_jwt_token');
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
        }
    },

    // Polling Interval for Notifications (milliseconds)
    notificationPollInterval: 3000,

    // Set and save Gateway URL
    setGatewayUrl(newUrl) {
        AppConfig.gatewayUrl = newUrl.replace(/\/$/, '');
        localStorage.setItem('ec_gateway_url', AppConfig.gatewayUrl);
    }
};

window.AppConfig = AppConfig;
