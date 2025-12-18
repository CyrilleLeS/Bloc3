import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';

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
  loading = true;
  saving = false;
  message = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      phone: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.currentUser = res.user;
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

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.saving = true;
    this.message = '';
    this.error = '';

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.saving = false;
        this.message = 'Profil mis à jour avec succès';
        this.currentUser = res.user;
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Erreur lors de la mise à jour';
      }
    });
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      client: 'Client',
      hotelier: 'Hôtelier',
      admin: 'Administrateur'
    };
    return labels[role] || role;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get f() { return this.profileForm.controls; }
}