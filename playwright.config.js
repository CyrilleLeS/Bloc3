const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // 1. On limite les tests au dossier 'e2e' uniquement
  testDir: './e2e',
  
  // On ignore les autres dossiers au cas où
  testMatch: '**/*.spec.js',
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    // 2. L'URL de votre frontend Angular
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});
