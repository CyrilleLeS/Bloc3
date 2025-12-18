import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { HotelService } from '../../../services/hotel.service';
import { User, Hotel, DashboardStats } from '../../../models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  users: User[] = [];
  hotels: Hotel[] = [];
  
  loading = true;
  activeTab = 'overview';
  
  // Filtres utilisateurs
  userRoleFilter = '';
  userSearchTerm = '';

  constructor(
    private userService: UserService,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadUsers();
    this.loadHotels();
  }

  loadDashboardStats(): void {
    this.userService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.stats;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    const filters: any = { limit: 20 };
    if (this.userRoleFilter) filters.role = this.userRoleFilter;
    if (this.userSearchTerm) filters.search = this.userSearchTerm;

    this.userService.getUsers(filters).subscribe({
      next: (res) => {
        this.users = res.users;
      }
    });
  }

  loadHotels(): void {
    this.hotelService.getHotels({ limit: 20 }).subscribe({
      next: (res) => {
        this.hotels = res.hotels;
      }
    });
  }

  onUserFilterChange(): void {
    this.loadUsers();
  }

  updateUserRole(user: User, newRole: string): void {
    this.userService.updateUser(user._id, { role: newRole } as any).subscribe({
      next: (res) => {
        user.role = newRole as 'client' | 'hotelier' | 'admin';
      }
    });
  }

  toggleUserStatus(user: User): void {
    this.userService.updateUser(user._id, { isActive: !user.isActive } as any).subscribe({
      next: (res) => {
        user.isActive = !user.isActive;
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
      return;
    }

    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u._id !== user._id);
      }
    });
  }

  deleteHotel(hotel: Hotel): void {
    if (!confirm(`Supprimer l'hôtel "${hotel.name}" ?`)) {
      return;
    }

    this.hotelService.deleteHotel(hotel._id).subscribe({
      next: () => {
        this.hotels = this.hotels.filter(h => h._id !== hotel._id);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  getRoleLabel(role: string): string {
    const labels: { [key: string]: string } = {
      client: 'Client',
      hotelier: 'Hôtelier',
      admin: 'Admin'
    };
    return labels[role] || role;
  }

  getRoleClass(role: string): string {
    const classes: { [key: string]: string } = {
      client: 'badge-info',
      hotelier: 'badge-warning',
      admin: 'badge-danger'
    };
    return classes[role] || 'badge-secondary';
  }
}