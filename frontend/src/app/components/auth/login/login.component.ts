import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

// Composant de Connexion (Login)
// Affiche un formulaire pour que l'utilisateur puisse s'identifier

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Le formulaire réactif (Reactive Form)
  loginForm: FormGroup;
  // État de chargement (pour afficher un spinner)
  loading = false;
  // Message d'erreur éventuel
  error = '';
  // URL où rediriger après connexion (par défaut l'accueil)
  returnUrl = '/';

  constructor(
    private fb: FormBuilder, // Pour construire le formulaire facilement
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // Pour lire l'URL actuelle
  ) {
    // Si l'utilisateur est déjà connecté, on le renvoie à l'accueil
    // Pas besoin de se connecter deux fois !
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    // Création du formulaire avec validations
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Email obligatoire et format valide
      password: ['', [Validators.required, Validators.minLength(6)]] // Mdp obligatoire, min 6 car
    });

    // On regarde si une URL de retour était prévue (ex: l'utilisateur voulait aller sur /admin)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Raccourci pour accéder aux champs du formulaire dans le HTML (ex: f.email.errors)
  get f() {
    return this.loginForm.controls;
  }

  // Fonction appelée quand on clique sur "Se connecter"
  onSubmit(): void {
    // Si le formulaire est invalide (champs vides...), on arrête
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true; // On affiche le chargement
    this.error = '';     // On efface les erreurs précédentes

    const { email, password } = this.loginForm.value;

    // Appel au service d'authentification
    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.loading = false;
        
        // Connexion réussie ! On redirige.
        if (this.returnUrl !== '/') {
          // Si une page précise était demandée, on y va
          this.router.navigate([this.returnUrl]);
        } else {
          // Sinon, on redirige vers le dashboard approprié selon le rôle
          switch (res.user.role) {
            case 'admin':
              this.router.navigate(['/dashboard/admin']);
              break;
            case 'hotelier':
              this.router.navigate(['/dashboard/hotelier']);
              break;
            default: // Client
              this.router.navigate(['/']); // Retour à l'accueil pour les clients
          }
        }
      },
      error: (err) => {
        this.loading = false;
        // On affiche le message d'erreur envoyé par le serveur
        this.error = err.error?.message || 'Erreur lors de la connexion';
      }
    });
  }
}
