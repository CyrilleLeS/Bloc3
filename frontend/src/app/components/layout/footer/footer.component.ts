import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3>🏨 HotelBooking</h3>
          <p>Trouvez et réservez les meilleurs hôtels au meilleur prix.</p>
        </div>
        
        <div class="footer-section">
          <h4>Navigation</h4>
          <a routerLink="/">Accueil</a>
          <a routerLink="/hotels">Hôtels</a>
          <a routerLink="/auth/login">Connexion</a>
          <a routerLink="/auth/register">Inscription</a>
        </div>
        
        <div class="footer-section">
          <h4>Contact</h4>
          <p>📧 contact&#64;hotelbooking.com</p>
          <p>📞 +33 1 23 45 67 89</p>
          <p>📍 Paris, France</p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} HotelBooking. Tous droits réservés.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #2c3e50;
      color: #fff;
      padding: 3rem 1rem 1rem;
      margin-top: auto;

      .footer-container {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
      }

      .footer-section {
        h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        h4 {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: #3498db;
        }

        p {
          color: #bdc3c7;
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        a {
          display: block;
          color: #bdc3c7;
          text-decoration: none;
          margin-bottom: 0.5rem;
          transition: color 0.3s;

          &:hover {
            color: #3498db;
          }
        }
      }

      .footer-bottom {
        max-width: 1200px;
        margin: 2rem auto 0;
        padding-top: 1rem;
        border-top: 1px solid #34495e;
        text-align: center;

        p {
          color: #7f8c8d;
          font-size: 0.9rem;
        }
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}