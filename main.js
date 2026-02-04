
const Auth = {
    // Initialize users array in LocalStorage if not exists
    init() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
    },

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate password strength
    validatePassword(password) {
        // At least 6 characters, one letter and one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
        return passwordRegex.test(password);
    },

    // Validate name
    validateName(name) {
        return name.trim().length >= 2;
    },

    // Get all users from LocalStorage
    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    },

    // Check if user exists
    userExists(email) {
        const users = this.getUsers();
        return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    },

    // Register new user
    register(name, email, password) {
        // Validate inputs
        if (!this.validateName(name)) {
            return { success: false, message: 'Name must be at least 2 characters long' };
        }

        if (!this.validateEmail(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        if (!this.validatePassword(password)) {
            return { success: false, message: 'Password must be at least 6 characters with letters and numbers' };
        }

        // Check if user already exists
        if (this.userExists(email)) {
            return { success: false, message: 'An account with this email already exists' };
        }

        // Create new user
        const users = this.getUsers();
        const newUser = {
            id: Date.now(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password, // In production, this should be hashed
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        return { success: true, message: 'Account created successfully!' };
    },

    // Login user
    login(email, password) {
        // Validate inputs
        if (!this.validateEmail(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        if (!password) {
            return { success: false, message: 'Please enter your password' };
        }

        // Find user
        const users = this.getUsers();
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase().trim() && 
            u.password === password
        );

        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }

        // Create session
        const session = {
            userId: user.id,
            name: user.name,
            email: user.email,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('currentUser', JSON.stringify(session));

        return { success: true, message: 'Login successful!', user: session };
    },

    // Logout user
    logout() {
        localStorage.removeItem('currentUser');
        return { success: true, message: 'Logged out successfully' };
    },

    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }
};

// Initialize Auth module
Auth.init();

// ============================================================================
// PRODUCT SEARCH MODULE
// Handles product loading, filtering, searching, and sorting
// ============================================================================

const ProductSearch = {
    products: [],
    filteredProducts: [],

    // Load products from JSON file
    async loadProducts() {
        try {
            const response = await fetch('products.json');
            if (!response.ok) {
                throw new Error('Failed to load products');
            }
            this.products = await response.json();
            this.filteredProducts = [...this.products];
            this.displayProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNoResults('Failed to load products. Please refresh the page.');
        }
    },

    // Display products in the list
    displayProducts() {
        const productsList = document.getElementById('products-list');
        const noResults = document.getElementById('no-results');

        if (this.filteredProducts.length === 0) {
            productsList.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        productsList.style.display = 'block';
        noResults.style.display = 'none';

        productsList.innerHTML = this.filteredProducts.map(product => `
            <div class="product-row">
                <div class="product-icon">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-details">
                    <div class="product-header">
                        <h3 class="product-name">${product.name}</h3>
                        <span class="product-category">${product.category}</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <span class="product-stock">${product.stock} in stock</span>
                </div>
                <div class="product-actions">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `).join('');
    },

    // Display products in the list
    displayProducts() {
        const productsList = document.getElementById('products-list');
        const noResults = document.getElementById('no-results');

        if (this.filteredProducts.length === 0) {
            productsList.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        productsList.style.display = 'block';
        noResults.style.display = 'none';

        productsList.innerHTML = this.filteredProducts.map(product => `
            <div class="product-row">
                <div class="product-icon">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-details">
                    <div class="product-header">
                        <h3 class="product-name">${product.name}</h3>
                        <span class="product-category">${product.category}</span>
                    </div>
                    <p class="product-description">${product.description}</p>
                    <span class="product-stock">${product.stock} in stock</span>
                </div>
                <div class="product-actions">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `).join('');
    },

    // Get icon emoji based on category
    getProductIcon(category) {
        const icons = {
            'Action': '💥',
            'Shooter': '🎯',
            'Sports': '⚽',
            'RPG': '🗡️',
            'Horror': '👻',
            'Adventure': '🗺️',
            'Sci-fi': '🚀'
        };
        return icons[category] || '🎮';
    },

    // Show no results message
    showNoResults(message = 'No products found matching your criteria.') {
        const productsGrid = document.getElementById('products-grid');
        const noResults = document.getElementById('no-results');
        
        productsGrid.style.display = 'none';
        noResults.style.display = 'block';
        noResults.querySelector('p').textContent = message;
    },

    // Filter products by search term
    searchProducts(searchTerm) {
        searchTerm = searchTerm.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
        }
        
        this.applyFilters();
    },

    // Filter products by category
    filterByCategory(category) {
        if (category === 'all') {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product => 
                product.category === category
            );
        }
        
        this.applySearchTerm();
    },

    // Apply search term to current filtered products
    applySearchTerm() {
        const searchInput = document.getElementById('search-input');
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm !== '') {
            this.filteredProducts = this.filteredProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
        }
        
        this.applySorting();
    },

    // Apply category filter to current search results
    applyFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const category = categoryFilter.value;
        
        if (category !== 'all') {
            this.filteredProducts = this.filteredProducts.filter(product => 
                product.category === category
            );
        }
        
        this.applySorting();
    },

    // Sort products
    sortProducts(sortType) {
        switch (sortType) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Default order (by ID)
                this.filteredProducts.sort((a, b) => a.id - b.id);
        }
        
        this.displayProducts();
    },

    // Apply sorting to current filtered products
    applySorting() {
        const sortFilter = document.getElementById('sort-filter');
        const sortType = sortFilter.value;
        this.sortProducts(sortType);
    },

    // Initialize search functionality
    init() {
        this.loadProducts();

        // Search input event listener
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }

        // Category filter event listener
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }

        // Sort filter event listener
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.sortProducts(e.target.value);
            });
        }
    }
};

// ============================================================================
// SHOPPING CART MODULE
// Handles cart operations: add, remove, update, display
// ============================================================================

const Cart = {
    // Initialize cart in LocalStorage if not exists
    init() {
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
    },

    // Get cart items from LocalStorage
    getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    },

    // Save cart to LocalStorage
    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
    },

    // Add item to cart
    addItem(product) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                quantity: 1
            });
        }

        this.saveCart(cart);
        this.showNotification(`${product.name} added to cart!`);
    },

    // Remove item from cart
    removeItem(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== productId);
        this.saveCart(cart);
    },

    // Update item quantity
    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart(cart);
            }
        }
    },

    // Calculate cart total
    calculateTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Update cart count in navbar
    updateCartCount() {
        const cart = this.getCart();
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const total = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = total;
            cartCount.style.display = total > 0 ? 'inline' : 'none';
        }
    },

    // Show notification
    showNotification(message) {
        // Create a simple alert or toast notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #a4d007;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 9999;
            font-weight: bold;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
};

// Initialize Cart module
Cart.init();

// ============================================================================
// MAIN MODULE - DOM READY AND GENERAL FUNCTIONALITY
// Handles mobile menu toggle, animations, and scroll effects
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // ========================================================================
    // MOBILE MENU TOGGLE
    // ========================================================================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger icon
            const spans = hamburger.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            });
        });
    }

    // ========================================================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================================================
    // SCROLL EFFECT FOR NAVBAR
    // ========================================================================
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
        
        lastScroll = currentScroll;
    });

    // ========================================================================
    // INTERSECTION OBSERVER FOR ANIMATIONS ON SCROLL
    // ========================================================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(card);
    });

    // Observe product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(card);
    });

    // ========================================================================
    // AUTHENTICATION FORM HANDLERS
    // ========================================================================

    // Handle signup form submission
    if (document.getElementById('signup-form')) {
        const signupForm = document.getElementById('signup-form');
        
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => {
                el.classList.remove('show');
                el.textContent = '';
            });
            document.querySelectorAll('input').forEach(el => el.classList.remove('error'));
            
            // Get form values
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            
            // Validate name
            if (!Auth.validateName(name)) {
                showSignupError('name', 'Name must be at least 2 characters long');
                return;
            }
            
            // Validate email
            if (!Auth.validateEmail(email)) {
                showSignupError('email', 'Please enter a valid email address');
                return;
            }
            
            // Validate password
            if (!Auth.validatePassword(password)) {
                showSignupError('password', 'Password must be at least 6 characters with letters and numbers');
                return;
            }
            
            // Check password match
            if (password !== confirmPassword) {
                showSignupError('confirm-password', 'Passwords do not match');
                return;
            }
            
            // Register user
            const result = Auth.register(name, email, password);
            
            const messageEl = document.getElementById('signup-message');
            messageEl.textContent = result.message;
            messageEl.classList.add('show');
            
            if (result.success) {
                messageEl.classList.remove('error');
                messageEl.classList.add('success');
                signupForm.reset();
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                messageEl.classList.remove('success');
                messageEl.classList.add('error');
            }
        });
        
        function showSignupError(fieldName, message) {
            const input = document.getElementById(`signup-${fieldName}`);
            const errorEl = document.getElementById(`${fieldName}-error`);
            
            input.classList.add('error');
            errorEl.textContent = message;
            errorEl.classList.add('show');
        }
    }

    // Handle login form submission
    if (document.getElementById('login-form')) {
        const loginForm = document.getElementById('login-form');
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => {
                el.classList.remove('show');
                el.textContent = '';
            });
            document.querySelectorAll('input').forEach(el => el.classList.remove('error'));
            
            // Get form values
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Login user
            const result = Auth.login(email, password);
            
            const messageEl = document.getElementById('login-message');
            messageEl.textContent = result.message;
            messageEl.classList.add('show');
            
            if (result.success) {
                messageEl.classList.remove('error');
                messageEl.classList.add('success');
                
                // Redirect to products page after 1 second
                setTimeout(() => {
                    window.location.href = 'products.html';
                }, 1000);
            } else {
                messageEl.classList.remove('success');
                messageEl.classList.add('error');
            }
        });
    }

    // ========================================================================
    // UPDATE AUTH LINK IN NAVBAR
    // ========================================================================
    const authLink = document.getElementById('auth-link');
    
    if (authLink) {
        if (Auth.isLoggedIn()) {
            const user = Auth.getCurrentUser();
            authLink.textContent = `Logout (${user.name})`;
            authLink.href = '#';
            
            authLink.addEventListener('click', function(e) {
                e.preventDefault();
                Auth.logout();
                window.location.href = 'index.html';
            });
        } else {
            authLink.textContent = 'Login';
            authLink.href = 'login.html';
        }
    }

    // ========================================================================
    // INITIALIZE PRODUCT SEARCH
    // ========================================================================
    if (document.getElementById('products-list')) {
        ProductSearch.init();
    }

    // ========================================================================
    // ADD TO CART EVENT LISTENERS
    // ========================================================================
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = parseInt(e.target.getAttribute('data-product-id'));
            const product = ProductSearch.products.find(p => p.id === productId);
            
            if (product) {
                Cart.addItem(product);
            }
        }
    });

    // ========================================================================
    // DISPLAY CART ITEMS
    // ========================================================================
    if (document.getElementById('cart-items')) {
        displayCartItems();
    }

    function displayCartItems() {
        const cartItems = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const cartContent = document.getElementById('cart-content');
        const cart = Cart.getCart();

        if (cart.length === 0) {
            cartContent.style.display = 'none';
            emptyCart.style.display = 'block';
            return;
        }

        cartContent.style.display = 'grid';
        emptyCart.style.display = 'none';

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-category">${item.category}</p>
                    <p class="item-price">$${item.price.toFixed(2)}</p>
                </div>
                <div class="item-controls">
                    <button class="qty-btn" onclick="updateQty(${item.id}, ${item.quantity - 1})">−</button>
                    <input type="number" class="qty-input" value="${item.quantity}" onchange="updateQty(${item.id}, this.value)">
                    <button class="qty-btn" onclick="updateQty(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="item-total">
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
            </div>
        `).join('');

        updateCartSummary();
    }

    // Make functions global so they can be called from HTML
    window.updateQty = function(productId, quantity) {
        Cart.updateQuantity(productId, parseInt(quantity));
        displayCartItems();
    };

    window.removeFromCart = function(productId) {
        Cart.removeItem(productId);
        displayCartItems();
    };

    // Update cart summary
    function updateCartSummary() {
        const cart = Cart.getCart();
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.1;
        const shipping = 5;
        const total = subtotal + tax + shipping;

        const subtotalEl = document.getElementById('cart-subtotal');
        const taxEl = document.getElementById('cart-tax');
        const totalEl = document.getElementById('cart-total');
        const checkoutTotalEl = document.getElementById('checkout-total');

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
        if (checkoutTotalEl) checkoutTotalEl.textContent = `$${total.toFixed(2)}`;
    }

    // Update cart count on page load
    Cart.updateCartCount();

    // ========================================================================
    // CHECKOUT MODAL HANDLER
    // ========================================================================
    const buyNowBtn = document.getElementById('buy-now-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModal = document.querySelector('.close-modal');
    const checkoutForm = document.getElementById('checkout-form');

    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function() {
            const cart = Cart.getCart();
            
            if (cart.length === 0) {
                alert('Your cart is empty. Please add games before purchasing.');
                return;
            }

            // Clear the cart
            localStorage.setItem('cart', JSON.stringify([]));
            Cart.updateCartCount();

            // Show success message
            Cart.showNotification('✓ Successfully Bought!');

            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 2000);
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            if (checkoutModal) {
                checkoutModal.style.display = 'none';
            }
        });
    }

    // Close modal when clicking outside of it
    if (checkoutModal) {
        window.addEventListener('click', function(e) {
            if (e.target === checkoutModal) {
                checkoutModal.style.display = 'none';
            }
        });
    }

    // Handle checkout form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('checkout-name').value;
            const email = document.getElementById('checkout-email').value;
            const address = document.getElementById('checkout-address').value;
            const phone = document.getElementById('checkout-phone').value;
            const card = document.getElementById('checkout-card').value;
            
            // Simple validation
            if (!name || !email || !address || !phone || !card) {
                showCheckoutMessage('Please fill in all fields', 'error');
                return;
            }

            // Validate card number (simple check - 16 digits)
            const cardDigits = card.replace(/\s/g, '');
            if (cardDigits.length < 13) {
                showCheckoutMessage('Please enter a valid card number', 'error');
                return;
            }

            // Process order
            const cart = Cart.getCart();
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const tax = total * 0.1;
            const finalTotal = total + tax + 5; // 5 is shipping

            // Create order object
            const order = {
                orderId: 'ORD-' + Date.now(),
                customer: {
                    name: name,
                    email: email,
                    address: address,
                    phone: phone
                },
                items: cart,
                subtotal: total,
                tax: tax,
                shipping: 5,
                total: finalTotal,
                orderDate: new Date().toISOString(),
                status: 'Confirmed'
            };

            // Save order to localStorage
            let orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(order);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Clear the cart
            localStorage.setItem('cart', JSON.stringify([]));
            Cart.updateCartCount();

            // Show success message
            showCheckoutMessage(`Order placed successfully! Order ID: ${order.orderId}`, 'success');

            // Reset form
            checkoutForm.reset();

            // Redirect after 2 seconds
            setTimeout(() => {
                if (checkoutModal) {
                    checkoutModal.style.display = 'none';
                }
                window.location.href = 'products.html';
            }, 2000);
        });
    }

    // Update cart count on page load
    Cart.updateCartCount();

    // ========================================================================
    // CONSOLE WELCOME MESSAGE
    // ========================================================================
    console.log('%cWelcome to PhumGame! 🎮', 'color: #2563eb; font-size: 20px; font-weight: bold;');
    console.log('%cYour ultimate gaming destination powered by vanilla JavaScript', 'color: #6b7280; font-size: 14px;');
});

// ============================================================================
// BANNER SLIDER & TRENDING GAMES MODULE
// ============================================================================

let currentSlideIndex = 0;
let slideInterval;

function showSlides(n) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const wrapper = document.querySelector('.slider-wrapper');
    
    if (!wrapper || slides.length === 0) return;
    
    if (n >= slides.length) currentSlideIndex = 0;
    if (n < 0) currentSlideIndex = slides.length - 1;
    
    wrapper.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    
    dots.forEach(dot => dot.classList.remove('active'));
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add('active');
    }
}

function nextSlide() {
    currentSlideIndex++;
    showSlides(currentSlideIndex);
    resetInterval();
}

function currentSlide(n) {
    currentSlideIndex = n;
    showSlides(currentSlideIndex);
    resetInterval();
}

function startInterval() {
    slideInterval = setInterval(() => {
        currentSlideIndex++;
        showSlides(currentSlideIndex);
    }, 5000);
}

function resetInterval() {
    clearInterval(slideInterval);
    startInterval();
}

async function loadTrendingGames() {
    const trendingGrid = document.getElementById('trending-grid');
    if (!trendingGrid) return;
    
    try {
        const response = await fetch('products.json');
        const products = await response.json();
        
        // Pick some games to be "trending" (e.g., first 3 or specific IDs)
        const trendingIds = [1, 9, 10]; // CS2, Baldur's Gate 3, Elden Ring
        const trendingProducts = products.filter(p => trendingIds.includes(p.id));
        
        // Define posters for trending games
        const posters = {
            1: 'image/banners/cs2_poster.jpg',
            9: 'image/banners/bg3_poster.jpg',
            10: 'image/banners/elden_ring_poster.jpg'
        };
        
        trendingGrid.innerHTML = trendingProducts.map(product => `
            <div class="trending-card">
                <img src="${posters[product.id] || product.image}" alt="${product.name} Poster" class="trending-poster">
                <div class="trending-info">
                    <img src="${product.image}" alt="${product.name} Logo" class="trending-logo">
                    <div class="trending-text">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading trending games:', error);
    }
}

// Initialize banner and trending games when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.banner-slider')) {
        showSlides(currentSlideIndex);
        startInterval();
    }
    loadTrendingGames();
});
