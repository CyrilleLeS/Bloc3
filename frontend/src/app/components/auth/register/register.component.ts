import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

// Composant d'Inscription (Register)
// Permet de créer un nouveau compte utilisateur

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Redirection si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    // Création du formulaire complet
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['client'], // Par défaut, on crée un compte client
      phone: ['']
    }, {
      // Validateur personnalisé pour vérifier que les deux mots de passe sont identiques
      validators: this.passwordMatchValidator
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  // Fonction pour vérifier la correspondance des mots de passe
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    // Si les valeurs sont différentes, on met une erreur sur le champ confirmPassword
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { firstName, lastName, email, password, role, phone } = this.registerForm.value;

    // Appel au service d'inscription
    this.authService.register({ firstName, lastName, email, password, role, phone }).subscribe({
      next: (res) => {
        this.loading = false;
        // Redirection intelligente selon le rôle choisi
        switch (res.user.role) {
          case 'hotelier':
            // Si c'est un hôtelier, on l'envoie direct sur son tableau de bord
            this.router.navigate(['/dashboard/hotelier']);
            break;
          default:
            // Pour un client classique, retour à l'accueil
            this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de l\'inscription';
      }
    });
  }
}
