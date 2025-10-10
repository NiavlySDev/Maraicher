// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation du thème
    initializeTheme();
    
    // Navigation mobile
    initializeMobileNav();
    
    // Initialisation du panier
    initializeCart();
    
    // Chargement des produits
    loadProducts();
    
    // Gestion du formulaire de contact
    initializeContactForm();
    
    // Smooth scrolling
    initializeSmoothScrolling();
    
    // Animation au scroll
    observeElements();
});

// Gestion du thème (Dark/Light mode)
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    // Récupérer le thème sauvegardé ou utiliser le thème système
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    // Appliquer le thème initial
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme, themeIcon);
    
    // Gestionnaire du bouton de thème
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);
    });
}

function updateThemeIcon(theme, iconElement) {
    iconElement.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Navigation mobile
function initializeMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Fermer le menu mobile quand on clique sur un lien
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Chargement des produits depuis le fichier JSON
async function loadProducts() {
    try {
        const response = await fetch('./produits.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayProducts(data.produits);
        updateDeliveryInfo(data.informations);
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        displayErrorMessage();
    }
}

// Mettre à jour les informations de livraison dynamiquement
function updateDeliveryInfo(informations) {
    if (informations && informations.livraison && informations.livraison.zones) {
        const deliveryZones = document.querySelector('.delivery-zones');
        if (deliveryZones) {
            const zones = informations.livraison.zones;
            deliveryZones.innerHTML = `
                <p><strong>Paleto Bay :</strong> ${zones.Paleto.frais}$</p>
                <p><strong>Sandy Shores :</strong> ${zones.Sandy.frais.toLocaleString()}$</p>
                <p><strong>San Andreas (autres zones) :</strong> ${zones.San_Andreas.frais.toLocaleString()}$</p>
            `;
        }
    }
}

// Affichage des produits
function displayProducts(produits) {
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) {
        console.error('Element products-grid non trouvé');
        return;
    }
    
    // Vider le conteneur
    productsGrid.innerHTML = '';
    
    // Créer les sections pour légumes, fruits et plantes
    if (produits.legumes) {
        const legumesSection = createProductSection('🥬 Légumes', produits.legumes);
        productsGrid.appendChild(legumesSection);
    }
    
    if (produits.fruits) {
        const fruitsSection = createProductSection('🍎 Fruits', produits.fruits);
        productsGrid.appendChild(fruitsSection);
    }
    
    if (produits.plantes) {
        const plantesSection = createProductSection('🌿 Plantes', produits.plantes);
        productsGrid.appendChild(plantesSection);
    }
}

// Créer une section de produits
function createProductSection(title, products) {
    const section = document.createElement('div');
    section.className = 'product-section';
    
    // Titre de section
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = `
        grid-column: 1 / -1;
        text-align: center;
        color: var(--green-dark);
        font-size: 2rem;
        margin: 2rem 0 1rem 0;
        font-weight: 600;
    `;
    
    section.appendChild(titleElement);
    
    // Créer les cartes produits
    products.forEach(product => {
        if (product.disponible) {
            const productCard = createProductCard(product);
            section.appendChild(productCard);
        }
    });
    
    return section;
}

// Créer une carte produit avec le nouveau système de stock
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-product-id', product.id);
    
    // Déterminer le statut du stock
    const stockStatus = getStockStatus(product.stock);
    const isOutOfStock = product.stock === 0;
    
    card.innerHTML = `
        <div class="product-emoji">${product.emoji}</div>
        <h3>${product.nom}</h3>
        <div class="product-price">${product.prix}$</div>
        <div class="product-stock">
            <span class="product-stock-number">Stock: ${product.stock}</span>
            <span class="product-status ${stockStatus.class}">${stockStatus.text}</span>
        </div>
        <div class="product-actions">
            <div class="quantity-selector">
                <button class="quantity-btn quantity-minus" ${isOutOfStock ? 'disabled' : ''}>-</button>
                <input type="number" class="quantity-input" value="1" min="1" max="${Math.max(1, product.stock)}" ${isOutOfStock ? 'disabled' : ''}>
                <button class="quantity-btn quantity-plus" ${isOutOfStock ? 'disabled' : ''}>+</button>
            </div>
            <button class="add-to-cart-btn" data-product-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                ${isOutOfStock ? '📋 Sur Commande' : '🛒 Ajouter'}
            </button>
        </div>
    `;
    
    // Ajouter les événements
    setupProductCardEvents(card, product);
    
    return card;
}

// Configuration des événements pour une carte produit
function setupProductCardEvents(card, product) {
    const quantityInput = card.querySelector('.quantity-input');
    const quantityMinus = card.querySelector('.quantity-minus');
    const quantityPlus = card.querySelector('.quantity-plus');
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    
    // Gestion des boutons de quantité
    quantityMinus.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });
    
    quantityPlus.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        const maxValue = Math.max(1, product.stock);
        if (currentValue < maxValue) {
            quantityInput.value = currentValue + 1;
        }
    });
    
    // Validation de l'input de quantité
    quantityInput.addEventListener('input', () => {
        let value = parseInt(quantityInput.value);
        const maxValue = Math.max(1, product.stock);
        
        if (isNaN(value) || value < 1) {
            quantityInput.value = 1;
        } else if (value > maxValue) {
            quantityInput.value = maxValue;
        }
    });
    
    // Ajout au panier
    addToCartBtn.addEventListener('click', () => {
        const quantity = parseInt(quantityInput.value);
        addToCart(product, quantity);
    });
}

// Déterminer le statut du stock selon les règles
function getStockStatus(stock) {
    if (stock === 0) {
        return {
            class: 'commande',
            text: '📋 Récolte sur Commande'
        };
    } else if (stock < 500) {
        return {
            class: 'limite',
            text: '⚠️ Stock Limité'
        };
    } else {
        return {
            class: 'disponible',
            text: '✅ Disponible'
        };
    }
}

// Affichage d'un message d'erreur
function displayErrorMessage() {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: #fff3cd; border-radius: 10px; color: #856404;">
            <h3>Oops! 🌱</h3>
            <p>Impossible de charger nos produits pour le moment. Veuillez réessayer plus tard ou nous contacter directement.</p>
        </div>
    `;
}

// Initialisation du formulaire de contact
function initializeContactForm() {
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

// Gestion du formulaire de contact
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Validation basique
    if (!name || !email || !message) {
        showNotification('error', 'Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    // Simulation d'envoi de message
    showNotification('success', 'Merci pour votre message! Nous vous répondrons dans les plus brefs délais.');
    e.target.reset();
}

// Initialisation du smooth scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Système de notification amélioré
function showNotification(type, message) {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Styles adaptatifs pour le thème
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const colors = getNotificationColors(type, currentTheme);
    
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${colors.bg};
        color: ${colors.text};
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
        border-left: 4px solid ${colors.border};
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression automatique
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function getNotificationColors(type, theme) {
    const colors = {
        success: {
            light: { bg: '#d4edda', text: '#155724', border: '#28a745' },
            dark: { bg: '#1e4620', text: '#66cc66', border: '#66cc66' }
        },
        error: {
            light: { bg: '#f8d7da', text: '#721c24', border: '#dc3545' },
            dark: { bg: '#4a1e1e', text: '#ff6b6b', border: '#ff6b6b' }
        }
    };
    
    return colors[type][theme] || colors[type].light;
}

// Observer pour les animations au scroll
function observeElements() {
    if (!window.IntersectionObserver) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = '0.2s';
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    // Observer tous les éléments avec data-aos après un court délai
    setTimeout(() => {
        document.querySelectorAll('[data-aos]').forEach(el => {
            observer.observe(el);
        });
    }, 100);
}

// Affichage d'un message d'erreur pour les produits
function displayErrorMessage() {
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div style="
                grid-column: 1 / -1; 
                text-align: center; 
                padding: 3rem 2rem; 
                background: var(--bg-secondary); 
                border-radius: 15px; 
                color: var(--text-primary);
                box-shadow: 0 4px 15px var(--shadow);
            ">
                <h3 style="color: var(--green-medium); margin-bottom: 1rem;">🌱 Oops!</h3>
                <p>Impossible de charger nos produits pour le moment.</p>
                <p style="margin-top: 0.5rem; color: var(--text-secondary);">
                    Veuillez réessayer plus tard ou nous contacter directement.
                </p>
                <button onclick="loadProducts()" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: var(--green-medium);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Réessayer</button>
            </div>
        `;
    }
}

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur détectée:', e.error);
});

// Gestion du panier
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let deliveryCost = 0;

// Initialisation du panier
function initializeCart() {
    const cartToggle = document.getElementById('cart-toggle');
    const cartModal = document.getElementById('cart-modal');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout');
    const deliveryZoneSelect = document.getElementById('delivery-zone');
    
    if (cartToggle) {
        cartToggle.addEventListener('click', () => {
            openCart();
        });
    }
    
    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
    
    if (deliveryZoneSelect) {
        deliveryZoneSelect.addEventListener('change', updateDeliveryZone);
    }
    
    updateCartDisplay();
    updateCartCount();
}

// Ajouter un produit au panier
function addToCart(product, quantity) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            nom: product.nom,
            emoji: product.emoji,
            prix: product.prix,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartDisplay();
    updateCartCount();
    
    showNotification('success', `${product.emoji} ${product.nom} ajouté au panier !`);
}

// Supprimer un produit du panier
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    updateCartCount();
}

// Mettre à jour la quantité d'un produit
function updateCartItemQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartDisplay();
            updateCartCount();
        }
    }
}

// Vider le panier
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
        cart = [];
        deliveryCost = 0;
        document.getElementById('delivery-zone').value = '';
        saveCart();
        updateCartDisplay();
        updateCartCount();
        showNotification('success', 'Panier vidé !');
    }
}

// Sauvegarder le panier
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Ouvrir le modal du panier
function openCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Fermer le modal du panier
function closeCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Mettre à jour l'affichage du panier
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const cartFooter = document.getElementById('cart-footer');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>Votre panier est vide</p>
                <p class="empty-cart-subtitle">Découvrez nos produits frais !</p>
            </div>
        `;
        cartSummary.style.display = 'none';
        cartFooter.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.emoji} ${item.nom}</div>
                    <div class="cart-item-price">${item.prix}$ × ${item.quantity} = ${item.prix * item.quantity}$</div>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" value="${item.quantity}" min="1" onchange="updateCartItemQuantity(${item.id}, parseInt(this.value))" class="quantity-input">
                        <button class="quantity-btn" onclick="updateCartItemQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="cart-remove" onclick="removeFromCart(${item.id})" title="Supprimer">✕</button>
                </div>
            </div>
        `).join('');
        
        cartSummary.style.display = 'block';
        cartFooter.style.display = 'flex';
        updateCartSummary();
    }
}

// Mettre à jour le résumé du panier
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);
    const total = subtotal + deliveryCost;
    
    document.getElementById('cart-subtotal').textContent = `${subtotal}$`;
    document.getElementById('delivery-cost').textContent = `${deliveryCost}$`;
    document.getElementById('cart-total').textContent = `${total}$`;
}

// Mettre à jour la zone de livraison
function updateDeliveryZone(event) {
    const selectedOption = event.target.selectedOptions[0];
    deliveryCost = selectedOption ? parseInt(selectedOption.dataset.price || 0) : 0;
    updateCartSummary();
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Passer commande
function checkout() {
    if (cart.length === 0) return;
    
    const deliveryZone = document.getElementById('delivery-zone').value;
    if (!deliveryZone) {
        showNotification('error', 'Veuillez sélectionner une zone de livraison');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);
    const total = subtotal + deliveryCost;
    
    // Simulation de commande
    const orderSummary = cart.map(item => 
        `${item.emoji} ${item.nom} x${item.quantity} = ${item.prix * item.quantity}$`
    ).join('\n');
    
    const zoneName = document.getElementById('delivery-zone').selectedOptions[0].textContent.split(' - ')[0];
    
    alert(`🛒 Commande confirmée !\n\n${orderSummary}\n\nSous-total: ${subtotal}$\nLivraison ${zoneName}: ${deliveryCost}$\nTotal: ${total}$\n\nMerci pour votre commande !`);
    
    // Vider le panier après commande
    cart = [];
    deliveryCost = 0;
    document.getElementById('delivery-zone').value = '';
    saveCart();
    updateCartDisplay();
    updateCartCount();
    closeCart();
    
    showNotification('success', 'Commande passée avec succès !');
}

// Écouter les changements de préférence de thème système
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            updateThemeIcon(newTheme, themeIcon);
        }
    }
});
