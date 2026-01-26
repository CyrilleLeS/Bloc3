import { ApplicationConfig, provideZoneChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthService } from './services/auth.service';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Configuration Globale de l'Application (Angular 17+ Standalone)
// Remplace l'ancien "app.module.ts". C'est ici qu'on configure les outils globaux.

export const appConfig: ApplicationConfig = {
  providers: [
    // Optimisation des performances Angular
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Configuration du Routeur (URLs)
    provideRouter(routes),
    
    // Configuration HTTP pour faire des appels API
    provideHttpClient(withInterceptorsFromDi()),
    
    // Initialiseur d'Application : Se lance AVANT que l'app ne s'affiche
    // Ici, on tente de reconnecter l'utilisateur s'il a un token sauvegardé
    provideAppInitializer(() => {
        const authService = inject(AuthService);
        return authService.loadUserFromToken();
    }),
    
    // Animations (pour Material Design ou autre)
    provideAnimationsAsync(),
    
    // Enregistrement de l'intercepteur HTTP (ajoute le token partout)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true // Permet d'avoir plusieurs intercepteurs si besoin
    }
  ]
};
