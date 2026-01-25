import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Composant Page Non Trouvée (404)
// S'affiche quand l'utilisateur tente d'accéder à une URL qui n'existe pas.

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="not-found">
      <div class="content">
        <h1>404</h1>
        <h2>Page non trouvée</h2>
        <p>Désolé, la page que vous recherchez n'existe pas ou a été déplacée.</p>
        <a routerLink="/" class="btn btn-primary">Retour à l'accueil</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      min-height: calc(100vh - 70px);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

      .content {
        h1 {
          font-size: 8rem;
          color: #667eea;
          margin: 0;
          line-height: 1;
        }

        h2 {
          font-size: 2rem;
          color: #333;
          margin: 1rem 0;
        }

        p {
          color: #666;
          margin-bottom: 2rem;
        }

        .btn {
          display: inline-block;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #fff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: transform 0.3s;

          &:hover {
            transform: translateY(-2px);
          }
        }
      }
    }
  `]
})
export class NotFoundComponent {}
