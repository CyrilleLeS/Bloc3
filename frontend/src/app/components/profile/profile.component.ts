import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';

// Composant Profil Utilisateur
// Permet de voir et modifier ses informations personnelles

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  
  loading = true; // Chargement des infos
  saving = false; // Sauvegarde en cours
  message = '';   // Message de succès
  error = '';     // Message d'erreur

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    // Initialisation du formulaire
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  // Charge les données actuelles de l'utilisateur
  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.currentUser = res.user;
        // On pré-remplit le formulaire
        this.profileForm.patchValue({
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          phone: res.user.phone || ''
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du profil';
        this.loading = false;
      }
    });
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.saving = true;
    this.message = '';
    this.error = '';

    // Appel API de mise à jour
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.saving = false;
        this.message = 'Profil mis à jour avec succès';
        this.currentUser = res.user; // Mise à jour locale
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Erreur lors de la mise à jour';
      }
    });
  }

  // Traduction des rôles pour l'affichage
  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      client: 'Client',
      hotelier: 'Hôtelier',
      admin: 'Administrateur'
    };
    return labels[role] || role;
  }

  // Formatage de la date d'inscription
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Raccourci pour le HTML
  get f() { return this.profileForm.controls; }
}
