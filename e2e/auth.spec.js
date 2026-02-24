const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');

test.describe('Authentification ResaHotel', () => {
  let loginPage;

  test.beforeEach(async ({ page }) => {
    // Initialisation de notre Page Object avant chaque test
    loginPage = new LoginPage(page);
    // Navigation vers la page de login
    await loginPage.goto();
  });

  // --- Test de connexion réussie ---
  test('devrait connecter un utilisateur existant (Succès)', async ({ page }) => {
    // 1. Arrange : On définit les identifiants
    const email = 'jean@example.com';
    const password = 'password123';

    // 2. Act : On utilise notre Page Object pour se connecter
    await loginPage.login(email, password);

    // 3. Assert : On vérifie qu'on est redirigé vers la page d'accueil (/)
    await expect(page).toHaveURL('http://localhost:4200/');
    
    // On vérifie que le message "Bonjour" est visible dans la navbar
    const welcomeUser = page.locator('.user-name');
    await expect(welcomeUser).toContainText('Bonjour');
    
    // On vérifie que le lien "Connexion" n'est plus là
    const loginLink = page.locator('text=Connexion');
    await expect(loginLink).not.toBeVisible();
  });

  // --- Test de connexion échouée (Mauvais identifiants) ---
  test('devrait afficher une erreur avec des identifiants incorrects', async ({ page }) => {
    // 1. Act : On tente de se connecter avec de mauvaises infos
    await loginPage.login('mauvais@email.com', 'mauvaispass');

    // 2. Assert : On vérifie l'affichage du message d'erreur
    // On s'attend à voir une alerte rouge
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('incorrect');
  });

  // --- Test de navigation vers l'inscription ---
  test('devrait permettre de naviguer vers la page d &apos; inscription', async ({ page }) => {
    // 1. Act : On clique sur le lien d'inscription
    await page.click('text=Inscrivez-vous');

    // 2. Assert : On vérifie qu'on est bien sur la page d'inscription
    await expect(page).toHaveURL(/.*register/);
    const registerTitle = page.locator('h1');
    await expect(registerTitle).toHaveText('Inscription');
  });
});
