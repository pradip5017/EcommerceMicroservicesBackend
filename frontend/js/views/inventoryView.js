/**
 * Inventory Warehouse View
 * Connects to inventory-service (:8083) to check and update stock levels
 */
const InventoryView = {
    async render(container) {
        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <!-- Stock Update Form -->
                <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm lg:col-span-1">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                            <i class="fa-solid fa-boxes-stacked"></i>
                        </div>
                        <div>
                            <h4 class="text-base font-bold text-slate-900">Manage Stock</h4>
                            <p class="text-xs text-slate-500">Connects to Inventory Service (:8083)</p>
                        </div>
                    </div>

                    <form onsubmit="InventoryView.updateStock(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Product ID</label>
                            <input id="inv-product-id" type="number" required placeholder="e.g. 19"
                                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono" />
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Available Quantity to Set/Add</label>
                            <input id="inv-quantity" type="number" min="0" required placeholder="e.g. 50"
                                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono font-bold" />
                        </div>

                        <div class="pt-2 flex items-center gap-2">
                            <button type="submit" class="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2">
                                <i class="fa-solid fa-floppy-disk"></i> Save Stock
                            </button>
                            <button type="button" onclick="InventoryView.lookupSingleStock()" class="px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition">
                                <i class="fa-solid fa-magnifying-glass"></i> Check
                            </button>
                        </div>
                    </form>

                    <div id="inv-single-result" class="mt-4 hidden p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <!-- Populated by lookup -->
                    </div>
                </div>

                <!-- Product Catalog Stock Overview -->
                <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden lg:col-span-2 flex flex-col">
                    <div class="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h4 class="font-bold text-slate-900 text-base">Catalog Inventory Overview</h4>
                            <p class="text-xs text-slate-500">Live stock checks for products registered in Product Service</p>
                        </div>
                        <button onclick="InventoryView.loadStockOverview()" class="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-xs transition flex items-center gap-1.5">
                            <i class="fa-solid fa-arrows-rotate"></i> Refresh All
                        </button>
                    </div>

                    <div class="overflow-x-auto flex-1">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th class="py-3 px-4">Prod ID</th>
                                    <th class="py-3 px-4">Product Name</th>
                                    <th class="py-3 px-4">Category</th>
                                    <th class="py-3 px-4">Available Stock</th>
                                    <th class="py-3 px-4 text-right">Quick Restock</th>
                                </tr>
                            </thead>
                            <tbody id="inventory-table-body" class="divide-y divide-slate-100 text-xs">
                                <tr>
                                    <td colspan="5" class="py-12 text-center text-slate-400">
                                        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 text-amber-500"></i>
                                        <p>Scanning inventory levels...</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        await this.loadStockOverview();
    },

    async lookupSingleStock() {
        const prodId = document.getElementById('inv-product-id').value;
        const resBox = document.getElementById('inv-single-result');
        if (!prodId) {
            App.showToast('Please enter a Product ID first', 'warning');
            return;
        }

        try {
            const data = await Api.inventory.getByProductId(prodId);
            resBox.classList.remove('hidden');
            if (data && data.availableQuantity !== undefined) {
                resBox.innerHTML = `
                    <div class="flex items-center justify-between">
                        <span class="font-bold text-slate-800">Product #${prodId}</span>
                        <span class="px-2 py-0.5 rounded-full font-bold ${data.availableQuantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">
                            ${data.availableQuantity} in stock
                        </span>
                    </div>
                `;
            } else {
                resBox.innerHTML = `<span class="text-amber-600 font-semibold">No stock record found for Product #${prodId}. You can create one using the form above.</span>`;
            }
        } catch (err) {
            resBox.classList.remove('hidden');
            resBox.innerHTML = `<span class="text-red-500">Error: ${err.message}</span>`;
        }
    },

    async updateStock(e) {
        e.preventDefault();
        const productId = document.getElementById('inv-product-id').value;
        const quantity = document.getElementById('inv-quantity').value;

        try {
            const record = await Api.inventory.create(productId, quantity);
            App.showToast(`Inventory updated: Product #${productId} has ${record.availableQuantity} units!`, 'success');
            document.getElementById('inv-single-result').classList.add('hidden');
            await this.loadStockOverview();
        } catch (err) {
            App.showToast('Failed to update inventory: ' + err.message, 'error');
        }
    },

    async quickAdd(productId, amountToAdd) {
        try {
            // First check current
            const cur = await Api.inventory.getByProductId(productId);
            const currentQty = (cur && cur.availableQuantity !== undefined) ? cur.availableQuantity : 0;
            const newQty = currentQty + amountToAdd;

            await Api.inventory.create(productId, newQty);
            App.showToast(`Restocked Product #${productId} to ${newQty} units!`, 'success');
            await this.loadStockOverview();
        } catch (err) {
            App.showToast('Quick restock failed: ' + err.message, 'error');
        }
    },

    async loadStockOverview() {
        const tbody = document.getElementById('inventory-table-body');
        if (!tbody) return;

        try {
            const data = await Api.products.getAll(0, 50);
            const products = data?.content || (Array.isArray(data) ? data : []);

            if (products.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400">No products found.</td></tr>`;
                return;
            }

            tbody.innerHTML = products.map(p => `
                <tr id="inv-row-${p.id}" class="hover:bg-slate-50/70 transition">
                    <td class="py-3 px-4 font-mono font-bold text-slate-900">#${p.id}</td>
                    <td class="py-3 px-4 font-semibold text-slate-800">${p.name}</td>
                    <td class="py-3 px-4 text-slate-500">${p.category || 'General'}</td>
                    <td class="py-3 px-4 font-bold" id="inv-qty-${p.id}">
                        <span class="text-slate-400 font-normal">checking...</span>
                    </td>
                    <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-1">
                            <button onclick="InventoryView.quickAdd(${p.id}, 10)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition">
                                +10
                            </button>
                            <button onclick="InventoryView.quickAdd(${p.id}, 50)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition">
                                +50
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            // Asynchronously fetch stock for each product
            products.forEach(async (p) => {
                const cell = document.getElementById(`inv-qty-${p.id}`);
                if (!cell) return;
                try {
                    const inv = await Api.inventory.getByProductId(p.id);
                    if (inv && inv.availableQuantity !== undefined) {
                        const qty = inv.availableQuantity;
                        const colorClass = qty > 20 
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                            : qty > 0 
                                ? 'text-amber-700 bg-amber-50 border-amber-200' 
                                : 'text-red-700 bg-red-50 border-red-200';
                        cell.innerHTML = `
                            <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorClass}">
                                ${qty} units
                            </span>
                        `;
                    } else {
                        cell.innerHTML = `<span class="text-slate-400 italic">Not set</span>`;
                    }
                } catch {
                    cell.innerHTML = `<span class="text-red-400">Error</span>`;
                }
            });

        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-red-500">Failed to load catalog: ${err.message}</td></tr>`;
        }
    }
};

window.InventoryView = InventoryView;
