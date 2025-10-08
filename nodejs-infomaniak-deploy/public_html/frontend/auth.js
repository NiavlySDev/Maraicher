// Système d'authentification pour le site Theronis Harvest
// Intégration avec le bot Discord

class AuthSystem {
    constructor() {
        this.apiUrl = 'http://localhost:3001/api';
        this.currentUser = null;
        this.init();
    }

    init() {
        // Vérifier si l'utilisateur est déjà connecté
        const savedUser = localStorage.getItem('theronis_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUI();
        }

        // Ajouter les écouteurs d'événements
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Modal de connexion
        const loginModal = this.createLoginModal();
        document.body.appendChild(loginModal);

        // Bouton de connexion dans le header
        this.addLoginButton();
    }

    createLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'login-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Connexion Theronis Harvest</h2>
                    <span class="close" onclick="authSystem.closeLoginModal()">&times;</span>
                </div>
                <div class="login-form-container">
                    <div class="discord-info">
                        <h3>🤖 Nouveau sur Theronis Harvest ?</h3>
                        <p>Créez votre compte directement sur Discord !</p>
                        <div class="discord-steps">
                            <div class="step">
                                <strong>1.</strong> Rejoignez notre serveur Discord
                            </div>
                            <div class="step">
                                <strong>2.</strong> Utilisez la commande <code>/creer-compte</code>
                            </div>
                            <div class="step">
                                <strong>3.</strong> Connectez-vous ici avec vos identifiants
                            </div>
                        </div>
                    </div>
                    <div class="login-form">
                        <h3>Connexion</h3>
                        <form id="login-form">
                            <input type="email" id="login-email" placeholder="Email" required>
                            <input type="password" id="login-password" placeholder="Mot de passe" required>
                            <button type="submit">Se connecter</button>
                        </form>
                        <div id="login-error" class="error-message" style="display: none;"></div>
                    </div>
                </div>
            </div>
        `;

        // Gestionnaire de soumission du formulaire
        modal.addEventListener('submit', (e) => {
            if (e.target.id === 'login-form') {
                e.preventDefault();
                this.handleLogin();
            }
        });

        return modal;
    }

    addLoginButton() {
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            const loginButton = document.createElement('div');
            loginButton.className = 'login-button';
            loginButton.innerHTML = `
                <i class="fas fa-user"></i>
                <span class="login-text">Connexion</span>
            `;
            loginButton.onclick = () => this.openLoginModal();
            cartIcon.parentNode.insertBefore(loginButton, cartIcon);
        }
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                localStorage.setItem('theronis_user', JSON.stringify(data.user));
                this.updateUI();
                this.closeLoginModal();
                showNotification('Connexion réussie !', 'success');
            } else {
                errorDiv.textContent = data.message;
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            errorDiv.textContent = 'Erreur de connexion au serveur';
            errorDiv.style.display = 'block';
        }
    }

    openLoginModal() {
        const modal = document.getElementById('login-modal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeLoginModal() {
        const modal = document.getElementById('login-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Réinitialiser le formulaire
        document.getElementById('login-form').reset();
        document.getElementById('login-error').style.display = 'none';
    }

    updateUI() {
        const loginButton = document.querySelector('.login-button');
        if (this.currentUser && loginButton) {
            loginButton.innerHTML = `
                <i class="fas fa-user-check"></i>
                <span class="login-text">${this.currentUser.fullName || this.currentUser.username}</span>
                <div class="user-dropdown">
                    <a href="#" onclick="authSystem.showProfile()">Mon Profil</a>
                    <a href="#" onclick="authSystem.showOrders()">Mes Commandes</a>
                    <a href="#" onclick="authSystem.logout()">Déconnexion</a>
                </div>
            `;
            loginButton.onclick = () => this.toggleUserDropdown();
        }
    }

    toggleUserDropdown() {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    }

    async showProfile() {
        if (!this.currentUser) return;

        const profileModal = document.createElement('div');
        profileModal.className = 'modal';
        profileModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Mon Profil</h2>
                    <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="profile-info">
                    <div class="profile-field">
                        <strong>Nom:</strong> ${this.currentUser.fullName || 'Non renseigné'}
                    </div>
                    <div class="profile-field">
                        <strong>Email:</strong> ${this.currentUser.email}
                    </div>
                    <div class="profile-field">
                        <strong>Téléphone:</strong> ${this.currentUser.phone || 'Non renseigné'}
                    </div>
                    <div class="profile-field">
                        <strong>Nom d'utilisateur Discord:</strong> ${this.currentUser.username}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(profileModal);
        profileModal.style.display = 'block';
    }

    async showOrders() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`${this.apiUrl}/orders/${this.currentUser.id}`);
            const data = await response.json();

            const ordersModal = document.createElement('div');
            ordersModal.className = 'modal';
            
            let ordersHTML = '<div class="orders-list">';
            if (data.success && data.orders.length > 0) {
                data.orders.forEach(order => {
                    const date = new Date(order.created_at).toLocaleDateString('fr-FR');
                    ordersHTML += `
                        <div class="order-item">
                            <div class="order-header">
                                <strong>Commande #${order.id}</strong>
                                <span class="order-date">${date}</span>
                            </div>
                            <div class="order-details">
                                <p><strong>Produits:</strong> ${order.products}</p>
                                <p><strong>Zone:</strong> ${order.delivery_zone}</p>
                                <p><strong>Total:</strong> $${order.total_amount}</p>
                                <p><strong>Statut:</strong> ${order.status}</p>
                            </div>
                        </div>
                    `;
                });
            } else {
                ordersHTML += '<p>Aucune commande trouvée.</p>';
            }
            ordersHTML += '</div>';

            ordersModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Mes Commandes</h2>
                        <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                    </div>
                    ${ordersHTML}
                </div>
            `;
            document.body.appendChild(ordersModal);
            ordersModal.style.display = 'block';
        } catch (error) {
            console.error('Erreur lors du chargement des commandes:', error);
            showNotification('Erreur lors du chargement des commandes', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('theronis_user');
        
        // Réinitialiser l'interface
        const loginButton = document.querySelector('.login-button');
        if (loginButton) {
            loginButton.innerHTML = `
                <i class="fas fa-user"></i>
                <span class="login-text">Connexion</span>
            `;
            loginButton.onclick = () => this.openLoginModal();
        }
        
        showNotification('Déconnexion réussie', 'info');
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialiser le système d'authentification
const authSystem = new AuthSystem();