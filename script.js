document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Dynamic Product Loading ---
    const productGrid = document.getElementById('product-grid');
    
    // Exact products from screenshot
    const defaultProducts = [
        {
            id: '1',
            title: 'Spice Containers',
            desc: 'Compact containers for keeping everyday spices close to hand.',
            price: 100,
            image: 'bowl_spoon_1790782256949.jpg'
        },
        {
            id: '2',
            title: 'Snack Containers',
            desc: 'An easy, natural-feeling home for small snacks and bites.',
            price: 50,
            image: 'shell_necklace_1790782270867.jpg'
        },
        {
            id: '3',
            title: 'Dry Fruit Containers',
            desc: 'A thoughtful way to serve or store dry fruits and nuts.',
            price: 60,
            image: 'shell_charcoal_1790782285869.jpg'
        },
        {
            id: '4',
            title: 'Plates',
            desc: 'Small serving plates that bring texture to casual meals.',
            price: 50,
            image: 'hero_banner_1790782244955.jpg'
        },
        {
            id: '5',
            title: 'Cups & Mugs',
            desc: 'Tactile vessels for relaxed pours and slow kitchen moments.',
            price: 80,
            image: 'bowl_spoon_1790782256949.jpg',
            highlight: true
        }
    ];

    const storedProducts = JSON.parse(localStorage.getItem('customProducts')) || [];
    const priceOverrides = JSON.parse(localStorage.getItem('priceOverrides')) || {};
    const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts')) || [];
    let allProducts = [...defaultProducts, ...storedProducts];
    allProducts = allProducts.filter(p => !deletedProducts.includes(p.id));

    if (productGrid) {
        allProducts.forEach(product => {
            // Apply price override if exists
            if (priceOverrides[product.id]) {
                product.price = priceOverrides[product.id];
            }
            
            const card = document.createElement('div');
            const highlightClass = product.highlight ? 'highlight' : '';
            card.className = `product-card ${highlightClass}`;
            
            card.innerHTML = `
                <img src="${product.image}" alt="${product.title}" class="product-img">
                <div class="product-content">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.desc}</p>
                    <div class="product-price">₹${product.price}</div>
                    
                    <div class="qty-selector">
                        <button class="qty-btn dec-btn" data-target="qty-${product.id}">-</button>
                        <span class="qty-val" id="qty-${product.id}">1</span>
                        <button class="qty-btn inc-btn" data-target="qty-${product.id}">+</button>
                    </div>
                    
                    <button class="btn-add-cart add-to-cart-btn" 
                        data-id="${product.id}" 
                        data-title="${product.title}" 
                        data-price="${product.price}"
                        data-image="${product.image}">
                        Add to Cart
                    </button>
                    
                    <button class="btn-buy-now buy-now-btn" 
                        data-id="${product.id}" 
                        data-title="${product.title}" 
                        data-price="${product.price}">
                        Buy Now
                    </button>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    // --- 2. Quantity Selectors Logic ---
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('inc-btn')) {
            const targetId = e.target.getAttribute('data-target');
            const span = document.getElementById(targetId);
            span.innerText = parseInt(span.innerText) + 1;
        } else if (e.target.classList.contains('dec-btn')) {
            const targetId = e.target.getAttribute('data-target');
            const span = document.getElementById(targetId);
            let val = parseInt(span.innerText);
            if(val > 1) span.innerText = val - 1;
        }
    });

    // --- 3. Cart Logic ---
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const continueShoppingBtn = document.getElementById('continue-shopping');
    const cartBadgeCount = document.getElementById('cart-badge-count');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn');
    
    let cart = JSON.parse(localStorage.getItem('cartData')) || [];
    updateCartBadge();

    const openCart = () => {
        cartOverlay.classList.add('active');
        cartDrawer.classList.add('active');
        document.body.style.overflow = 'hidden';
        renderCart();
    };

    const closeCart = () => {
        cartOverlay.classList.remove('active');
        cartDrawer.classList.remove('active');
        document.body.style.overflow = '';
    };

    if(openCartBtn) openCartBtn.addEventListener('click', openCart);
    if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if(cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if(continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCart);

    // Add to Cart
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const btn = e.target;
            const id = btn.getAttribute('data-id');
            const qty = parseInt(document.getElementById(`qty-${id}`).innerText);
            
            const item = {
                id: id,
                title: btn.getAttribute('data-title'),
                price: parseInt(btn.getAttribute('data-price'), 10),
                image: btn.getAttribute('data-image'),
                quantity: qty
            };
            addToCart(item);
            openCart();
        }
    });

    // Buy Now (Direct WhatsApp)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('buy-now-btn')) {
            const btn = e.target;
            const id = btn.getAttribute('data-id');
            const title = btn.getAttribute('data-title');
            const price = parseInt(btn.getAttribute('data-price'), 10);
            const qty = parseInt(document.getElementById(`qty-${id}`).innerText);
            
            let text = `Hello ECO-SHELL, I want to Buy Now:%0A%0A`;
            text += `- ${title} (Qty: ${qty}) - ₹${price * qty}%0A`;
            text += `%0APlease confirm my order.`;

            const phoneNumber = "919344992969"; 
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${text}`;
            window.open(whatsappUrl, '_blank');
        }
    });

    function addToCart(item) {
        const existing = cart.find(i => i.id === item.id);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            cart.push(item);
        }
        localStorage.setItem('cartData', JSON.stringify(cart));
        updateCartBadge();
    }

    function updateCartBadge() {
        if(!cartBadgeCount) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadgeCount.innerText = totalItems;
    }

    function renderCart() {
        if (!cartItemsContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <p>Your cart is empty. Explore the collection to find a useful new favourite.</p>
                </div>
            `;
            return;
        }

        let html = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            html += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <div class="cart-item-price">₹${item.price} x ${item.quantity}</div>
                        <button class="remove-item-btn" data-index="${index}" style="background:none;border:none;color:red;cursor:pointer;font-size:0.8rem;margin-top:5px;text-decoration:underline;">Remove</button>
                    </div>
                </div>
            `;
        });

        html += `
            <div style="display:flex; justify-content:space-between; margin-top:20px; font-weight:bold; font-size: 1.2rem; color: var(--text-dark);">
                <span>Total:</span>
                <span>₹${total}</span>
            </div>
        `;

        cartItemsContainer.innerHTML = html;

        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                cart.splice(idx, 1);
                localStorage.setItem('cartData', JSON.stringify(cart));
                updateCartBadge();
                renderCart();
            });
        });
    }

    // Checkout all cart items
    if (whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener('click', () => {
            if(cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            let text = "Hello ECO-SHELL, I would like to place an order:%0A%0A";
            let total = 0;
            
            cart.forEach(item => {
                text += `- ${item.title} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}%0A`;
                total += item.price * item.quantity;
            });
            
            text += `%0ATotal Amount: ₹${total}%0A%0APlease confirm my order.`;

            const phoneNumber = "919344992969"; 
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${text}`;
            
            window.open(whatsappUrl, '_blank');
            
            cart = [];
            localStorage.setItem('cartData', JSON.stringify(cart));
            updateCartBadge();
            closeCart();
        });
    }

    // --- 4. FAQ Accordion ---
    const faqBtns = document.querySelectorAll('.faq-btn');
    faqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const content = btn.nextElementSibling;
            if (btn.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }
        });
    });

    // --- 5. Mobile Navigation Menu Toggle ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mainHeader = document.getElementById('main-header');
    const mainNav = document.getElementById('main-nav');
    const menuToggleIcon = document.getElementById('menu-toggle-icon');

    function toggleMobileNav(forceClose = false) {
        if (!mainNav) return;
        const isOpen = forceClose ? false : !mainNav.classList.contains('mobile-active');
        
        if (isOpen) {
            mainNav.classList.add('mobile-active');
            if (mobileNavOverlay) mobileNavOverlay.classList.add('active');
            if (mainHeader) mainHeader.classList.add('nav-open');
            if (menuToggleIcon) {
                menuToggleIcon.classList.remove('ph-list');
                menuToggleIcon.classList.add('ph-x');
            }
            document.body.style.overflow = 'hidden';
        } else {
            mainNav.classList.remove('mobile-active');
            if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
            if (mainHeader) mainHeader.classList.remove('nav-open');
            if (menuToggleIcon) {
                menuToggleIcon.classList.remove('ph-x');
                menuToggleIcon.classList.add('ph-list');
            }
            document.body.style.overflow = '';
        }
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileNav();
        });
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', () => {
            toggleMobileNav(true);
        });
    }

    if (mainNav) {
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleMobileNav(true);
            });
        });
    }
});
