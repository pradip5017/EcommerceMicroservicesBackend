/**
 * Authentication & Identity View
 * Handles Login, Registration, JWT token inspection, and User profile switching
 */
const AuthView = {
    async render(container) {
        const user = AppConfig.session.user;

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Current Active Profile Card -->
                <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="flex items-center gap-4 mb-4">
                            <div class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-indigo-500/20">
                                ${(user.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 class="font-extrabold text-slate-900 text-lg">${user.username || 'demo_user'}</h3>
                                <div class="flex items-center gap-2 mt-0.5">
                                    <span class="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-md border border-indigo-200">
                                        Role: ${user.role || 'USER'}
                                    </span>
                                    <span class="text-xs font-mono text-slate-500 font-semibold">User ID: #${user.id || 1}</span>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-3 pt-3 border-t border-slate-100 text-xs">
                            <div class="flex items-center justify-between">
                                <span class="text-slate-500">Service:</span>
                                <span class="font-semibold text-slate-800">User Service (:8081)</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-slate-500">JWT Token Status:</span>
                                <span class="font-bold ${user.token ? 'text-emerald-600' : 'text-amber-500'}">
                                    ${user.token ? 'Authenticated' : 'No Token (Guest)'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Quick User ID Switcher for Multi-Tenant Testing -->
                    <div class="mt-6 pt-4 border-t border-slate-100">
                        <label class="block text-xs font-bold text-slate-700 mb-2">Switch Active User ID (Testing)</label>
                        <div class="flex items-center gap-2">
                            <input id="quick-user-id" type="number" min="1" value="${user.id || 1}" 
                                class="w-20 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                            <button onclick="AuthView.switchUserId()" class="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition">
                                Set User
                            </button>
                            <button onclick="AuthView.logout()" class="px-3 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition">
                                Reset
                            </button>
                        </div>
                        <p class="text-[11px] text-slate-400 mt-1.5">Changes the User ID attached to new orders and notifications.</p>
                    </div>
                </div>

                <!-- Login & Register Tabs Card -->
                <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm lg:col-span-2">
                    <div class="flex items-center gap-4 border-b border-slate-100 pb-4 mb-5">
                        <button id="auth-tab-login" onclick="AuthView.setAuthTab('login')" class="text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 pb-2 -mb-4 transition">
                            Login Account
                        </button>
                        <button id="auth-tab-register" onclick="AuthView.setAuthTab('register')" class="text-sm font-semibold text-slate-500 hover:text-slate-800 pb-2 -mb-4 transition">
                            Register New User
                        </button>
                    </div>

                    <!-- Login Form -->
                    <form id="login-form" onsubmit="AuthView.handleLogin(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Username</label>
                            <input id="login-username" type="text" required placeholder="demo_user" value="demo_user"
                                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Password</label>
                            <input id="login-password" type="password" required placeholder="••••••••" value="password123"
                                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                        <button type="submit" id="login-btn" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-right-to-bracket"></i> Login & Retrieve JWT
                        </button>
                    </form>

                    <!-- Register Form (Initially Hidden) -->
                    <form id="register-form" onsubmit="AuthView.handleRegister(event)" class="space-y-4 hidden">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Username</label>
                            <input id="reg-username" type="text" required placeholder="john_doe"
                                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                            <input id="reg-email" type="email" required placeholder="john@example.com"
                                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Password</label>
                            <input id="reg-password" type="password" required placeholder="Min 6 characters"
                                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                        </div>
                        <button type="submit" id="reg-btn" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-user-plus"></i> Create Account
                        </button>
                    </form>
                </div>
            </div>

            <!-- JWT Token Inspector -->
            <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <i class="fa-solid fa-key text-amber-500"></i> JWT Bearer Token Inspector
                    </h4>
                    <button onclick="AuthView.copyToken()" class="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5">
                        <i class="fa-solid fa-copy"></i> Copy Token
                    </button>
                </div>
                <div class="bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 break-all leading-relaxed" id="jwt-token-display">
                    ${user.token || 'No active JWT token found. Log in above to obtain one.'}
                </div>
            </div>
        `;
    },

    setAuthTab(tab) {
        const loginForm = document.getElementById('login-form');
        const regForm = document.getElementById('register-form');
        const loginTab = document.getElementById('auth-tab-login');
        const regTab = document.getElementById('auth-tab-register');

        if (tab === 'login') {
            loginForm.classList.remove('hidden');
            regForm.classList.add('hidden');
            loginTab.className = 'text-sm font-bold text-indigo-600 border-b-2 border-indigo-600 pb-2 -mb-4 transition';
            regTab.className = 'text-sm font-semibold text-slate-500 hover:text-slate-800 pb-2 -mb-4 transition';
        } else {
            loginForm.classList.add('hidden');
            regForm.classList.remove('hidden');
            loginTab.className = 'text-sm font-semibold text-slate-500 hover:text-slate-800 pb-2 -mb-4 transition';
            regTab.className = 'text-sm font-bold text-emerald-600 border-b-2 border-emerald-600 pb-2 -mb-4 transition';
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');

        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;

        try {
            const res = await Api.auth.login(username, password);
            const user = {
                id: AppConfig.session.user.id || 1,
                username: res.username || username,
                role: res.role || 'USER',
                token: res.token || ''
            };
            AppConfig.session.setUser(user);
            App.showToast(`Welcome back, ${user.username}!`, 'success');
            await this.render(document.getElementById('view-container'));
        } catch (err) {
            App.showToast('Login failed: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login & Retrieve JWT`;
        }
    },

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const btn = document.getElementById('reg-btn');

        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating...`;

        try {
            const res = await Api.auth.register(username, email, password);
            App.showToast('Registration successful! Please login.', 'success');
            this.setAuthTab('login');
            document.getElementById('login-username').value = username;
            document.getElementById('login-password').value = password;
        } catch (err) {
            App.showToast('Registration failed: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Create Account`;
        }
    },

    switchUserId() {
        const id = parseInt(document.getElementById('quick-user-id').value, 10);
        if (!id || id < 1) {
            App.showToast('Invalid User ID', 'warning');
            return;
        }
        const user = AppConfig.session.user;
        user.id = id;
        AppConfig.session.setUser(user);
        App.showToast(`Active User ID switched to #${id}`, 'success');
        this.render(document.getElementById('view-container'));
    },

    logout() {
        AppConfig.session.clearUser();
        App.showToast('Session reset', 'info');
        this.render(document.getElementById('view-container'));
    },

    copyToken() {
        const token = AppConfig.session.user.token;
        if (!token) {
            App.showToast('No token to copy', 'warning');
            return;
        }
        navigator.clipboard.writeText(token);
        App.showToast('Token copied to clipboard', 'info');
    }
};

window.AuthView = AuthView;
