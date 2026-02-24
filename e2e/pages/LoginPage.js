// Page Object Model pour la page de connexion
// Cela permet de centraliser les sélecteurs et les actions réutilisables
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input#email');
    this.passwordInput = page.locator('input#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.alert-error');
  }

  // Action pour naviguer vers la page de login
  async goto() {
    await this.page.goto('http://localhost:4200/auth/login');
  }

  // Action pour remplir le formulaire et valider
  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

module.exports = { LoginPage };
