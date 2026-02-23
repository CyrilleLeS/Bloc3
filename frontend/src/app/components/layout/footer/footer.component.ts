import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Composant Pied de Page (Footer)
// Affiche les liens utiles, les infos de contact et le copyright
// Présent sur toutes les pages en bas

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer-travel">
      <div class="container footer-grid">
        <!-- Colonne 1: À propos -->
        <div class="footer-col">
          <h2 class="footer-logo">Resa<span>Hotel</span></h2>
          <p class="about-text">
            Votre partenaire de confiance pour des réservations hôtelières simplifiées. 
            Découvrez le monde avec nos offres exclusives et notre service client dédié.
          </p>
          <div class="social-links">
            <span>🔵 FB</span> <span>📸 IG</span> <span>🐦 TW</span>
          </div>
        </div>
        
        <!-- Colonne 2: Navigation Rapide -->
        <div class="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><a routerLink="/">Accueil</a></li>
            <li><a routerLink="/hotels">Nos Hôtels</a></li>
            <li><a routerLink="/explore">Destinations</a></li>
            <li><a routerLink="/auth/register">Devenir partenaire</a></li>
          </ul>
        </div>
        
        <!-- Colonne 3: Support -->
        <div class="footer-col">
          <h4>Aide & Support</h4>
          <ul>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Conditions Générales</a></li>
            <li><a href="#">Politique de Confidentialité</a></li>
            <li><a href="#">Contactez-nous</a></li>
          </ul>
        </div>
        
        <!-- Colonne 4: Contact -->
        <div class="footer-col">
          <h4>Nous Contacter</h4>
          <p class="contact-item">📧 support&#64;resahotel.com</p>
          <p class="contact-item">📞 +33 1 23 45 67 89</p>
          <p class="contact-item">📍 123 Avenue du Voyage, Paris</p>
        </div>
      </div>
      
      <!-- Copyright et bas de page -->
      <div class="footer-bottom-travel">
        <div class="container d-flex justify-between align-center">
          <p>&copy; {{ currentYear }} ResaHotel. Tous droits réservés.</p>
          <div class="payment-methods">
            💳 🏦 🅿️
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-travel {
      background: var(--primary-color, #2f435e);
      color: #fff;
      padding: 5rem 0 0;
      margin-top: 0;

      .footer-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
        gap: 3rem;
        padding-bottom: 4rem;
        
        @media (max-width: 900px) { grid-template-columns: 1fr 1fr; }
        @media (max-width: 600px) { grid-template-columns: 1fr; }
      }

      .footer-logo {
        font-size: 1.8rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 1.5rem;
        span { color: var(--secondary-color, #4dc1e8); }
      }

      .about-text { font-size: 0.9rem; opacity: 0.7; line-height: 1.8; margin-bottom: 1.5rem; }

      h4 {
        font-size: 1rem; font-weight: 700; text-transform: uppercase; margin-bottom: 1.5rem;
        letter-spacing: 1px; color: #fff; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; display: inline-block;
      }

      ul {
        list-style: none; padding: 0;
        li { margin-bottom: 0.8rem; }
        a { color: rgba(255,255,255,0.7); font-size: 0.9rem; transition: all 0.3s;
          &:hover { color: var(--secondary-color, #4dc1e8); padding-left: 5px; }
        }
      }

      .contact-item { font-size: 0.85rem; color: rgba(255,255,255,0.7); margin-bottom: 1rem; }

      .footer-bottom-travel {
        background: rgba(0,0,0,0.2); padding: 1.5rem 0; font-size: 0.85rem; color: rgba(255,255,255,0.5);
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear(); // Année dynamique
}
