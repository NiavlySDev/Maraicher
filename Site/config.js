// Configuration du site
const CONFIG = {
    API_BASE_URL: 'http://localhost:3001/api',
    FALLBACK_TO_LOCAL: true, // Utiliser le fichier JSON local si l'API n'est pas disponible
    
    // Configuration des notifications
    NOTIFICATION_DURATION: 5000,
    
    // Configuration du panier
    CART_STORAGE_KEY: 'theronis_harvest_cart',
    
    // Configuration de l'authentification
    AUTH_TOKEN_KEY: 'theronis_harvest_token',
    AUTH_USER_KEY: 'theronis_harvest_user',
    
    // Configuration des commandes
    MIN_ORDER_AMOUNT: 20.00,
    DELIVERY_FEE: 5.00,
    FREE_DELIVERY_THRESHOLD: 50.00,
    
    // Messages
    MESSAGES: {
        LOADING: 'Chargement...',
        ERROR_NETWORK: 'Erreur de connexion au serveur',
        ERROR_AUTH: 'Erreur d\'authentification',
        SUCCESS_ORDER: 'Commande passée avec succès !',
        SUCCESS_PROFILE_UPDATE: 'Profil mis à jour avec succès',
        CART_ITEM_ADDED: 'Produit ajouté au panier',
        CART_ITEM_REMOVED: 'Produit retiré du panier',
        CART_CLEARED: 'Panier vidé',
        STOCK_INSUFFICIENT: 'Stock insuffisant',
        LOGIN_REQUIRED: 'Connexion requise pour cette action'
    }
};

// Fonctions utilitaires pour l'API
const API = {
    // Méthode générique pour les requêtes API
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const token = localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Erreur API ${endpoint}:`, error);
            throw error;
        }
    },

    // Produits
    async getProducts(category = null) {
        const endpoint = category ? `/products/category/${category}` : '/products';
        return this.request(endpoint);
    },

    async getProduct(id) {
        return this.request(`/products/${id}`);
    },

    // Authentification
    async login(email, password) {
        return this.request('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async register(userData) {
        return this.request('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async getProfile() {
        return this.request('/users/profile');
    },

    async updateProfile(userData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    async changePassword(currentPassword, newPassword) {
        return this.request('/users/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    },

    // Commandes
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    async getOrders() {
        return this.request('/orders');
    },

    async getOrder(id) {
        return this.request(`/orders/${id}`);
    },

    async cancelOrder(id) {
        return this.request(`/orders/${id}/cancel`, {
            method: 'PATCH'
        });
    }
};

// Gestionnaire d'authentification
const Auth = {
    isLoggedIn() {
        return !!localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
    },

    getUser() {
        const userStr = localStorage.getItem(CONFIG.AUTH_USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    setAuth(token, user) {
        localStorage.setItem(CONFIG.AUTH_TOKEN_KEY, token);
        localStorage.setItem(CONFIG.AUTH_USER_KEY, JSON.stringify(user));
    },

    clearAuth() {
        localStorage.removeItem(CONFIG.AUTH_TOKEN_KEY);
        localStorage.removeItem(CONFIG.AUTH_USER_KEY);
    },

    async login(email, password) {
        try {
            const response = await API.login(email, password);
            this.setAuth(response.token, response.user);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await API.register(userData);
            this.setAuth(response.token, response.user);
            return response;
        } catch (error) {
            throw error;
        }
    },

    logout() {
        this.clearAuth();
        window.location.reload();
    }
};
