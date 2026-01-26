import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';

// Composant Racine (Root Component)
// C'est la "coquille" vide qui contient toute l'application.
// Il affiche la Navbar en haut, le Footer en bas, et le contenu change au milieu.

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="app-container">
      <!-- Barre de navigation (Menu) -->
      <app-navbar></app-navbar>
      
      <!-- Contenu dynamique (la page changera ici selon l'URL) -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      
      <!-- Pied de page -->
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    /* Structure Flexbox pour que le footer reste toujours en bas */
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh; /* Prend toute la hauteur de l'écran */
    }

    .main-content {
      flex: 1; /* Prend tout l'espace disponible */
    }
  `]
})
export class AppComponent {
  title = 'HotelBooking';
}
