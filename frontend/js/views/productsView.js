/**
 * Products Catalog View
 * Displays products, handles filtering, search, adding new products,
 * live inventory stock tracking, and out-of-stock item messaging.
 */
const ProductsView = {
    products: [],
    stockMap: {},
    selectedCategory: 'ALL',
    searchQuery: '',

    async render(container) {
        container.innerHTML = `
            <!-- Top Controls Bar -->
            <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div class="relative flex-1">
                        <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                        <input id="product-search-input" type="text" placeholder="Search by product name, category, or description..." 
                            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm" />
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <button onclick="ProductsView.loadProducts()" class="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-sm transition flex items-center gap-2">
                        <i class="fa-solid fa-arrows-rotate"></i> Refresh
                    </button>
                    <button onclick="ProductsView.openAddModal()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-sm transition flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> Add Product
                    </button>
                </div>
            </div>

            <!-- Category Pills Bar -->
            <div id="category-pills" class="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
                <button onclick="ProductsView.filterCategory('ALL')" class="category-pill active px-4 py-2 rounded-xl text-xs font-bold transition bg-indigo-600 text-white shadow-sm">
                    All Products
                </button>
            </div>

            <!-- Products Grid Container -->
            <div id="products-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div class="col-span-full py-16 text-center text-slate-400">
                    <i class="fa-solid fa-spinner fa-spin text-3xl mb-3 text-indigo-500"></i>
                    <p>Loading products catalog & inventory levels...</p>
                </div>
            </div>

            <!-- Out of Stock Message Modal -->
            <div id="out-of-stock-modal" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-4">
                <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 text-center animate-in fade-in zoom-in-95 duration-200">
                    <div class="w-16 h-16 rounded-3xl bg-red-50 text-red-500 mx-auto flex items-center justify-center text-2xl mb-4 shadow-inner">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 uppercase tracking-wider">Out of Stock</span>
                    <h3 id="oos-modal-title" class="text-lg font-extrabold text-slate-900 mt-2">Item Unavailable</h3>
                    <p id="oos-modal-message" class="text-xs text-slate-500 mt-2 leading-relaxed">
                        This item currently has 0 units available in the warehouse. You cannot create an order until additional inventory is restocked.
                    </p>
                    <div class="mt-6 flex items-center justify-center gap-3">
                        <button onclick="document.getElementById('out-of-stock-modal').classList.add('hidden')" class="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition">
                            Close
                        </button>
                        <button id="oos-restock-btn" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5">
                            <i class="fa-solid fa-warehouse"></i> Restock in Inventory
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
        await this.loadProducts();
    },

    bindEvents() {
        const searchInput = document.getElementById('product-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderGrid();
            });
        }
    },

    async loadProducts() {
        try {
            const data = await Api.products.getAll(0, 100);
            this.products = data?.content || (Array.isArray(data) ? data : []);
            
            // Concurrently fetch stock for all products to know what's out of stock
            await this.loadInventoryStock();

            this.updateCategoryPills();
            this.renderGrid();
        } catch (err) {
            const grid = document.getElementById('products-grid');
            if (grid) {
                grid.innerHTML = `
                    <div class="col-span-full bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                        <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center text-xl mb-3">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <h4 class="text-base font-bold text-red-900">Failed to load products</h4>
                        <p class="text-xs text-red-600 mt-1">${err.message}</p>
                        <button onclick="ProductsView.loadProducts()" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition">
                            Retry Connection
                        </button>
                    </div>
                `;
            }
        }
    },

    async loadInventoryStock() {
        const promises = this.products.map(async (p) => {
            try {
                const inv = await Api.inventory.getByProductId(p.id);
                this.stockMap[p.id] = (inv && inv.availableQuantity !== undefined) ? inv.availableQuantity : 0;
            } catch {
                this.stockMap[p.id] = 0;
            }
        });
        await Promise.all(promises);
    },

    updateCategoryPills() {
        const container = document.getElementById('category-pills');
        if (!container) return;

        const categories = Array.from(new Set(this.products.map(p => p.category).filter(Boolean)));
        
        container.innerHTML = `
            <button onclick="ProductsView.filterCategory('ALL')" class="category-pill ${this.selectedCategory === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'} px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap">
                All Products (${this.products.length})
            </button>
            ${categories.map(cat => `
                <button onclick="ProductsView.filterCategory('${cat}')" class="category-pill ${this.selectedCategory === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'} px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap">
                    ${cat} (${this.products.filter(p => p.category === cat).length})
                </button>
            `).join('')}
        `;
    },

    filterCategory(cat) {
        this.selectedCategory = cat;
        this.updateCategoryPills();
        this.renderGrid();
    },

    renderGrid() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        let filtered = this.products;

        if (this.selectedCategory !== 'ALL') {
            filtered = filtered.filter(p => p.category === this.selectedCategory);
        }

        if (this.searchQuery) {
            filtered = filtered.filter(p => 
                (p.name && p.name.toLowerCase().includes(this.searchQuery)) ||
                (p.category && p.category.toLowerCase().includes(this.searchQuery)) ||
                (p.description && p.description.toLowerCase().includes(this.searchQuery))
            );
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                    <i class="fa-solid fa-box-open text-4xl mb-3 text-slate-300"></i>
                    <p class="font-semibold text-slate-600">No products found matching criteria</p>
                    <p class="text-xs text-slate-400 mt-1">Try clearing your search query or selecting a different category.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(product => {
            const fallbackImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
            const imgUrl = product.imageUrl || fallbackImage;
            const stock = this.stockMap[product.id] ?? 0;
            const isOutOfStock = stock <= 0;

            return `
                <div class="product-card bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col justify-between ${isOutOfStock ? 'ring-1 ring-red-200' : ''}">
                    <div>
                        <div class="relative h-48 w-full bg-slate-100 overflow-hidden group">
                            <img src="${imgUrl}" alt="${product.name}" 
                                onerror="this.src='${fallbackImage}'"
                                class="w-full h-full object-cover group-hover:scale-105 transition duration-500 ${isOutOfStock ? 'grayscale opacity-75' : ''}" />
                            
                            <span class="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
                                ${product.category || 'General'}
                            </span>
                            
                            <span class="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur-md">
                                ID: #${product.id}
                            </span>

                            <!-- Out of Stock Overlay Pill -->
                            ${isOutOfStock ? `
                                <div class="absolute inset-x-3 bottom-3 py-1.5 px-3 rounded-xl bg-red-600/90 backdrop-blur-md text-white text-xs font-black text-center shadow-lg flex items-center justify-center gap-1.5">
                                    <i class="fa-solid fa-triangle-exclamation"></i> OUT OF STOCK
                                </div>
                            ` : `
                                <span class="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg text-[10px] font-bold ${stock > 10 ? 'bg-emerald-600/90 text-white' : 'bg-amber-500/90 text-white'} backdrop-blur-md">
                                    ${stock} in stock
                                </span>
                            `}
                        </div>

                        <div class="p-4">
                            <h4 class="font-bold text-slate-900 text-sm line-clamp-1" title="${product.name}">${product.name}</h4>
                            <p class="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">${product.description || 'No description provided.'}</p>
                            
                            <div class="mt-4 flex items-baseline justify-between">
                                <div>
                                    <span class="text-xs text-slate-400 font-medium">Price</span>
                                    <p class="text-lg font-extrabold text-slate-900">₹${Number(product.price).toFixed(2)}</p>
                                </div>
                                <button onclick="ProductsView.checkInventory(${product.id})" class="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
                                    <i class="fa-solid fa-warehouse"></i> Stock Check
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center gap-2">
                        ${isOutOfStock ? `
                            <button onclick="ProductsView.showOutOfStockMessage('${product.name.replace(/'/g, "\\'")}', ${product.id})" 
                                class="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
                                <i class="fa-solid fa-circle-exclamation text-red-500"></i> Out of Stock
                            </button>
                        ` : `
                            <button onclick="ProductsView.quickOrder(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price})" 
                                class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5">
                                <i class="fa-solid fa-cart-shopping"></i> Order Now
                            </button>
                        `}
                        
                        <button onclick="ProductsView.openEditModal(${product.id})" title="Edit Product"
                            class="w-9 h-9 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center text-xs transition">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button onclick="ProductsView.deleteProduct(${product.id})" title="Delete Product"
                            class="w-9 h-9 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-xs transition">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    showOutOfStockMessage(productName, productId) {
        // Show prominent toast warning
        App.showToast(`⚠️ Out of Stock: "${productName}" currently has 0 units available!`, 'error');

        // Open out-of-stock modal with restock button
        const modal = document.getElementById('out-of-stock-modal');
        const titleEl = document.getElementById('oos-modal-title');
        const msgEl = document.getElementById('oos-modal-message');
        const restockBtn = document.getElementById('oos-restock-btn');

        if (titleEl) titleEl.textContent = `"${productName}" is Out of Stock`;
        if (msgEl) msgEl.textContent = `Product #${productId} has 0 units in the inventory warehouse. You can add stock in the Inventory menu to enable orders.`;
        if (restockBtn) {
            restockBtn.onclick = () => {
                modal.classList.add('hidden');
                App.navigateTo('inventory');
                setTimeout(() => {
                    const input = document.getElementById('inv-product-id');
                    if (input) input.value = productId;
                    InventoryView.lookupSingleStock();
                }, 150);
            };
        }

        if (modal) modal.classList.remove('hidden');
    },

    openAddModal() {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        document.getElementById('product-modal-title').textContent = 'Add New Product';
        document.getElementById('prod-edit-id').value = '';
        form.reset();
        modal.classList.remove('hidden');
    },

    async openEditModal(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        const modal = document.getElementById('product-modal');
        document.getElementById('product-modal-title').textContent = 'Edit Product #' + id;
        document.getElementById('prod-edit-id').value = product.id;
        document.getElementById('prod-name').value = product.name || '';
        document.getElementById('prod-desc').value = product.description || '';
        document.getElementById('prod-price').value = product.price || '';
        document.getElementById('prod-category').value = product.category || '';
        document.getElementById('prod-image').value = product.imageUrl || '';
        modal.classList.remove('hidden');
    },

    closeModal() {
        document.getElementById('product-modal').classList.add('hidden');
    },

    async saveProduct(e) {
        e.preventDefault();
        const id = document.getElementById('prod-edit-id').value;
        const payload = {
            name: document.getElementById('prod-name').value.trim(),
            description: document.getElementById('prod-desc').value.trim(),
            price: parseFloat(document.getElementById('prod-price').value),
            category: document.getElementById('prod-category').value.trim(),
            imageUrl: document.getElementById('prod-image').value.trim()
        };

        try {
            if (id) {
                await Api.products.update(id, payload);
                App.showToast('Product updated successfully!', 'success');
            } else {
                await Api.products.create(payload);
                App.showToast('Product created successfully!', 'success');
            }
            this.closeModal();
            await this.loadProducts();
        } catch (err) {
            App.showToast('Failed to save product: ' + err.message, 'error');
        }
    },

    async deleteProduct(id) {
        if (!confirm(`Are you sure you want to delete product #${id}?`)) return;

        try {
            await Api.products.delete(id);
            App.showToast(`Product #${id} deleted`, 'info');
            await this.loadProducts();
        } catch (err) {
            App.showToast('Delete failed: ' + err.message, 'error');
        }
    },

    async checkInventory(productId) {
        try {
            const inv = await Api.inventory.getByProductId(productId);
            if (inv && inv.availableQuantity !== undefined) {
                if (inv.availableQuantity === 0) {
                    App.showToast(`⚠️ Product #${productId} is OUT OF STOCK (0 units available)!`, 'error');
                } else {
                    App.showToast(`Product #${productId} Stock: ${inv.availableQuantity} units available`, 'info');
                }
            } else {
                App.showToast(`No inventory record found for Product #${productId}. Please add stock in Inventory menu.`, 'warning');
            }
        } catch (err) {
            App.showToast('Inventory check failed: ' + err.message, 'error');
        }
    },

    quickOrder(productId, name, price) {
        const stock = this.stockMap[productId] ?? 0;
        if (stock <= 0) {
            this.showOutOfStockMessage(name, productId);
            return;
        }

        App.navigateTo('orders');
        setTimeout(() => {
            OrdersView.openCreateModal({ productId, name, price, stock });
        }, 150);
    }
};

window.ProductsView = ProductsView;
