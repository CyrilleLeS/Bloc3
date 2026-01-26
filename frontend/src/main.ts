import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // Correction: App -> AppComponent (Standard Angular)

// Point d'entrée principal de l'application Angular
// C'est ici que tout commence ! On "démarre" (bootstrap) le composant racine (AppComponent)
// avec la configuration globale (appConfig).

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));