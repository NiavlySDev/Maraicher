// Variables globales
let products = [];
let cart = [];
let currentFilter = 'tous';

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    updateCartDisplay();
});

// Chargement des produits depuis le fichier JSON
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        
        // Combiner tous les produits et calculer la disponibilité basée sur le stock
        products = [...data.fruits, ...data.legumes, ...data.herbes].map(product => ({
            ...product,
            availability: getAvailabilityFromStock(product.stock)
        }));
        displayProducts(products);
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        showNotification('Erreur lors du chargement des produits', 'error');
    }
}

// Déterminer la disponibilité basée sur le stock
function getAvailabilityFromStock(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock < 500) return 'limited';
    return 'available';
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Filtres de produits
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterProducts(e.target.dataset.category);
            
            // Mise à jour de l'état actif
            filterButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    // Modal du panier
    const cartIcon = document.querySelector('.cart-icon');
    const modal = document.getElementById('cart-modal');
    const closeBtn = document.querySelector('.close');

    cartIcon.addEventListener('click', openCart);
    closeBtn.addEventListener('click', closeCart);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCart();
        }
    });

    // Navigation smooth
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Formulaire de contact
    const contactForm = document.querySelector('.contact-form');
    contactForm.addEventListener('submit', handleContactForm);
}

// Affichage des produits
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });

    // Animation d'apparition
    const cards = productsGrid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
}

// Création d'une carte produit
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image">
            <span style="font-size: 4rem;">${product.icon}</span>
            <div class="availability ${product.availability}">
                ${getAvailabilityText(product.availability)}
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <div class="product-actions">
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="changeQuantity(${product.id}, -1)">-</button>
                    <input type="number" class="quantity-input" id="qty-${product.id}" value="1" min="1" max="${product.stock}">
                    <button class="quantity-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id})" 
                        ${product.availability === 'out-of-stock' ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i> Ajouter
                </button>
            </div>
        </div>
    `;
    return card;
}

// Texte de disponibilité
function getAvailabilityText(availability) {
    switch(availability) {
        case 'available': return 'Disponible';
        case 'limited': return 'Stock limité';
        case 'out-of-stock': return 'Sur commande';
        default: return 'Disponible';
    }
}

// Filtrage des produits
function filterProducts(category) {
    currentFilter = category;
    let filteredProducts = products;
    
    if (category !== 'tous') {
        filteredProducts = products.filter(product => product.category === category);
    }
    
    displayProducts(filteredProducts);
}

// Gestion des quantités
function changeQuantity(productId, change) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    const currentQty = parseInt(quantityInput.value);
    const product = products.find(p => p.id === productId);
    
    const newQty = Math.max(1, Math.min(product.stock, currentQty + change));
    quantityInput.value = newQty;
}

// Ajout au panier
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(quantityInput.value);
    
    if (!product || quantity <= 0) return;
    
    // Vérifier si le produit est déjà dans le panier
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }
    
    updateCartDisplay();
    showNotification(`${product.name} ajouté au panier !`, 'success');
    
    // Animation du bouton
    const button = event.target;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

// Mise à jour de l'affichage du panier
function updateCartDisplay() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Animation du compteur
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
        cartCount.classList.add('fade-in');
    } else {
        cartCount.style.display = 'none';
    }
}

// Ouverture du panier
function openCart() {
    const modal = document.getElementById('cart-modal');
    updateCartModal();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Fermeture du panier
function closeCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Mise à jour du contenu du modal panier
function updateCartModal() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Votre panier est vide</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateCartQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity(${index}, 1)">+</button>
            </div>
            <div class="cart-item-total">$${itemTotal.toFixed(2)}</div>
            <button onclick="removeFromCart(${index})" style="background: #ff6b6b; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; margin-left: 1rem; cursor: pointer;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = '$' + total.toFixed(2);
}

// Mise à jour de la quantité dans le panier
function updateCartQuantity(index, change) {
    const item = cart[index];
    const product = products.find(p => p.id === item.id);
    
    item.quantity = Math.max(1, Math.min(product.stock, item.quantity + change));
    updateCartModal();
    updateCartDisplay();
}

// Suppression d'un article du panier
function removeFromCart(index) {
    const item = cart[index];
    cart.splice(index, 1);
    updateCartModal();
    updateCartDisplay();
    showNotification(`${item.name} retiré du panier`, 'info');
}

// Vider le panier
function clearCart() {
    cart = [];
    updateCartModal();
    updateCartDisplay();
    showNotification('Panier vidé', 'info');
}

// Commande
function checkout() {
    if (cart.length === 0) {
        showNotification('Votre panier est vide', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Simulation de la commande
    const orderSummary = cart.map(item => 
        `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const message = `Récapitulatif de votre commande:\n\n${orderSummary}\n\nTotal: $${total.toFixed(2)}\n\nMerci pour votre commande ! Nous vous contacterons pour la livraison.`;
    
    alert(message);
    
    // Vider le panier après commande
    clearCart();
    closeCart();
    
    showNotification('Commande envoyée avec succès !', 'success');
}

// Gestion du formulaire de contact
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = formData.get('name') || e.target.querySelector('input[type="text"]').value;
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;
    const message = formData.get('message') || e.target.querySelector('textarea').value;
    
    // Simulation d'envoi
    setTimeout(() => {
        showNotification('Message envoyé avec succès !', 'success');
        e.target.reset();
    }, 1000);
    
    showNotification('Envoi en cours...', 'info');
}

// Système de notifications
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Styles de la notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 3000;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Suppression automatique après 4 secondes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Navigation smooth vers les produits
function scrollToProducts() {
    const productsSection = document.getElementById('produits');
    productsSection.scrollIntoView({ behavior: 'smooth' });
}

// Recherche de produits (fonctionnalité bonus)
function searchProducts(query) {
    if (!query.trim()) {
        displayProducts(products);
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );
    
    displayProducts(filteredProducts);
}

// Animation au scroll (intersection observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observer les sections au chargement
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.about-section, .contact-section');
    sections.forEach(section => {
        observer.observe(section);
    });
});

// Ajout des styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-content button {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    .notification-content button:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);