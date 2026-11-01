/**
 * Amazon Clone - Interactive Application Logic
 * Implements Cart State, Navigation Drawers, Carousel, and Notifications
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Application State & Storage
    // -------------------------------------------------------------
    let cart = [];
    try {
        const savedCart = localStorage.getItem('amazon_clone_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (e) {
        cart = [];
    }

    // -------------------------------------------------------------
    // 2. DOM Elements Selection
    // -------------------------------------------------------------
    const backdrop = document.getElementById('backdrop');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // Drawer Elements
    const sideDrawer = document.getElementById('side-drawer');
    const openDrawerBtn = document.getElementById('open-drawer-btn');
    const closeDrawerBtn = document.getElementById('close-drawer');

    // Cart Elements
    const cartDrawer = document.getElementById('cart-drawer');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const navCartBadge = document.getElementById('nav-cart-badge');
    const cartItemsCount = document.getElementById('cart-items-count');
    const cartSubtotalAmount = document.getElementById('cart-subtotal-amount');
    const checkoutCount = document.getElementById('checkout-count');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Carousel Elements
    const slides = document.querySelectorAll('.carousel-slide');
    const prevHeroBtn = document.getElementById('hero-prev');
    const nextHeroBtn = document.getElementById('hero-next');
    let currentSlide = 0;
    let carouselTimer = null;

    // Horizontal Deals Scroll
    const dealsTrack = document.getElementById('deals-track');
    const scrollLeftBtn = document.getElementById('scroll-deals-left');
    const scrollRightBtn = document.getElementById('scroll-deals-right');

    // Search & Misc
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const backToTopBtn = document.getElementById('back-to-top');
    const locationBtn = document.getElementById('location-btn');
    const accountBtn = document.getElementById('account-btn');

    // -------------------------------------------------------------
    // 3. Toast Notification Helper
    // -------------------------------------------------------------
    let toastTimeout = null;
    function showToast(message, icon = 'fa-circle-check') {
        if (!toast || !toastMessage) return;
        toastMessage.textContent = message;
        toast.className = 'toast show';
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.className = 'toast';
        }, 3200);
    }

    // -------------------------------------------------------------
    // 4. Cart Logic
    // -------------------------------------------------------------
    function saveCart() {
        try {
            localStorage.setItem('amazon_clone_cart', JSON.stringify(cart));
        } catch (e) {}
    }

    function renderCart() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Update badge counts
        if (navCartBadge) navCartBadge.textContent = totalItems;
        if (cartItemsCount) cartItemsCount.textContent = totalItems;
        if (checkoutCount) checkoutCount.textContent = totalItems;
        if (cartSubtotalAmount) cartSubtotalAmount.textContent = `$${subtotal.toFixed(2)}`;

        // Render Cart Items
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-state">
                    <i class="fa-solid fa-basket-shopping fa-3x"></i>
                    <p>Your Amazon Cart is empty</p>
                    <small>Explore today's featured deals and add products to get started.</small>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item-row" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateItemQuantity(${index}, -1)" aria-label="Decrease quantity">−</button>
                            <span class="qty-number">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateItemQuantity(${index}, 1)" aria-label="Increase quantity">+</button>
                        </div>
                        <button class="remove-item-btn" onclick="removeItemFromCart(${index})">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Expose cart actions globally
    window.addToCart = function(name, price, image) {
        const existingIndex = cart.findIndex(item => item.name === name);
        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                id: Date.now() + Math.random(),
                name,
                price: parseFloat(price),
                image,
                quantity: 1
            });
        }
        saveCart();
        renderCart();
        showToast(`Added to Cart: ${name}`);
    };

    window.buyNow = function(name, price, image) {
        window.addToCart(name, price, image);
        openCart();
    };

    window.updateItemQuantity = function(index, delta) {
        if (!cart[index]) return;
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
            showToast('Item removed from cart');
        }
        saveCart();
        renderCart();
    };

    window.removeItemFromCart = function(index) {
        if (!cart[index]) return;
        const removedName = cart[index].name;
        cart.splice(index, 1);
        saveCart();
        renderCart();
        showToast(`Removed from cart: ${removedName}`);
    };

    function openCart() {
        if (cartDrawer && backdrop) {
            cartDrawer.classList.add('open');
            backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeCart() {
        if (cartDrawer && backdrop) {
            cartDrawer.classList.remove('open');
            if (!sideDrawer.classList.contains('open')) {
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    if (openCartBtn) openCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty! Add products to proceed.');
                return;
            }
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            alert(`🎉 Thank you for testing the Amazon Clone!\n\nOrder summary: ${cart.length} unique products\nTotal: $${total.toFixed(2)}\n\n(This is a demonstration checkout.)`);
            cart = [];
            saveCart();
            renderCart();
            closeCart();
            showToast('Order placed successfully! Delivery scheduled.');
        });
    }

    // -------------------------------------------------------------
    // 5. Side Drawer (Hamburger Menu)
    // -------------------------------------------------------------
    function openSideDrawer() {
        if (sideDrawer && backdrop) {
            sideDrawer.classList.add('open');
            backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSideDrawer() {
        if (sideDrawer && backdrop) {
            sideDrawer.classList.remove('open');
            if (!cartDrawer.classList.contains('open')) {
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    if (openDrawerBtn) openDrawerBtn.addEventListener('click', openSideDrawer);
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeSideDrawer);

    // Backdrop click closes all drawers
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            closeSideDrawer();
            closeCart();
        });
    }

    // -------------------------------------------------------------
    // 6. Hero Banner Carousel
    // -------------------------------------------------------------
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function startCarousel() {
        stopCarousel();
        carouselTimer = setInterval(nextSlide, 5000);
    }

    function stopCarousel() {
        if (carouselTimer) clearInterval(carouselTimer);
    }

    if (nextHeroBtn) {
        nextHeroBtn.addEventListener('click', () => {
            nextSlide();
            startCarousel();
        });
    }

    if (prevHeroBtn) {
        prevHeroBtn.addEventListener('click', () => {
            prevSlide();
            startCarousel();
        });
    }

    startCarousel();

    // -------------------------------------------------------------
    // 7. Horizontal Deals Scroller
    // -------------------------------------------------------------
    if (scrollLeftBtn && dealsTrack) {
        scrollLeftBtn.addEventListener('click', () => {
            dealsTrack.scrollBy({ left: -320, behavior: 'smooth' });
        });
    }

    if (scrollRightBtn && dealsTrack) {
        scrollRightBtn.addEventListener('click', () => {
            dealsTrack.scrollBy({ left: 320, behavior: 'smooth' });
        });
    }

    // -------------------------------------------------------------
    // 8. Search Functionality
    // -------------------------------------------------------------
    function performSearch() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!query) {
            showToast('Please type a search keyword');
            return;
        }

        // Search through deals or scroll to spotlight
        if (query.includes('headphone') || query.includes('audio') || query.includes('aether')) {
            const target = document.getElementById('featured-deal');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                showToast(`Found 1 top match for "${query}"`);
                return;
            }
        }

        const cards = document.querySelectorAll('.deal-product-card');
        let matched = false;
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (text.includes(query)) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                card.style.outline = '3px solid #ff9900';
                setTimeout(() => { card.style.outline = 'none'; }, 3000);
                matched = true;
            }
        });

        if (matched) {
            showToast(`Found products matching "${query}"`);
        } else {
            showToast(`No exact match for "${query}". Showing best deals.`);
            const target = document.getElementById('carousel-section');
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    }

    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    // -------------------------------------------------------------
    // 9. Back to Top Button
    // -------------------------------------------------------------
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // -------------------------------------------------------------
    // 10. Interactive Prompts (Location, Sign in, Category Filters)
    // -------------------------------------------------------------
    if (locationBtn) {
        locationBtn.addEventListener('click', () => {
            const zip = prompt('Enter your delivery PIN / Zip code:', '10001');
            if (zip) {
                const line1 = locationBtn.querySelector('.nav-line-1');
                if (line1) line1.textContent = `Delivering to ${zip}`;
                showToast(`Delivery location updated to ${zip}`);
            }
        });
    }

    window.openLoginPrompt = function() {
        showToast('Redirecting to Amazon Secure Sign-in...');
    };

    if (accountBtn) {
        accountBtn.addEventListener('click', () => {
            window.openLoginPrompt();
        });
    }

    window.filterCategory = function(category) {
        showToast(`Filtering by: ${category.toUpperCase()}`);
        const dealSection = document.getElementById('carousel-section');
        if (dealSection) dealSection.scrollIntoView({ behavior: 'smooth' });
    };

    // Initialize cart on page load
    renderCart();
});
