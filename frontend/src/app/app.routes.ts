import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

// Définition des Routes de l'application
// C'est ici qu'on associe une URL (ex: /hotels) à un Composant (ex: HotelListComponent)

export const routes: Routes = [
  // Page d'accueil (Route par défaut)
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },

  // Routes d'Authentification (Login / Register)
  {
    path: 'auth/login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Routes Hôtels (Public - Tout le monde peut voir)
  {
    path: 'hotels',
    loadComponent: () => import('./components/hotel/hotel-list/hotel-list.component').then(m => m.HotelListComponent)
  },
  {
    path: 'hotels/:id', // :id est un paramètre dynamique
    loadComponent: () => import('./components/hotel/hotel-detail/hotel-detail.component').then(m => m.HotelDetailComponent)
  },

  // Recherche Amadeus (Vols/Hôtels API Externe)
  {
    path: 'explore',
    loadComponent: () => import('./components/amadeus/amadeus-search.component').then(m => m.AmadeusSearchComponent)
  },

  // Routes Réservations (Booking) - Protégées par AuthGuard (Il faut être connecté)
  {
    path: 'bookings',
    loadComponent: () => import('./components/booking/booking-list/booking-list.component').then(m => m.BookingListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'bookings/:id',
    loadComponent: () => import('./components/booking/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'book/:roomId',
    loadComponent: () => import('./components/booking/booking-form/booking-form.component').then(m => m.BookingFormComponent),
    canActivate: [AuthGuard]
  },

  // Tableau de Bord Client (Protégé + Rôle Client)
  {
    path: 'dashboard/client',
    loadComponent: () => import('./components/dashboard/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
    canActivate: [RoleGuard],
    data: { roles: ['client'] }
  },

  // Tableau de Bord Hôtelier (Protégé + Rôle Hotelier)
  {
    path: 'dashboard/hotelier',
    loadComponent: () => import('./components/dashboard/hotelier-dashboard/hotelier-dashboard.component').then(m => m.HotelierDashboardComponent),
    canActivate: [RoleGuard],
    data: { roles: ['hotelier'] }
  },
  // Sous-pages Hôtelier (Création/Édition d'hôtels et chambres)
  {
    path: 'dashboard/hotelier/hotels/new',
    loadComponent: () => import('./components/dashboard/hotelier-dashboard/hotel-form/hotel-form.component').then(m => m.HotelFormComponent),
    canActivate: [RoleGuard],
    data: { roles: ['hotelier'] }
  },
  {
    path: 'dashboard/hotelier/hotels/:id/edit',
    loadComponent: () => import('./components/dashboard/hotelier-dashboard/hotel-form/hotel-form.component').then(m => m.HotelFormComponent),
    canActivate: [RoleGuard],
    data: { roles: ['hotelier'] }
  },
  {
    path: 'dashboard/hotelier/hotels/:hotelId/rooms/new',
    loadComponent: () => import('./components/dashboard/hotelier-dashboard/room-form/room-form.component').then(m => m.RoomFormComponent),
    canActivate: [RoleGuard],
    data: { roles: ['hotelier'] }
  },
  {
    path: 'dashboard/hotelier/rooms/:roomId/edit',
    loadComponent: () => import('./components/dashboard/hotelier-dashboard/room-form/room-form.component').then(m => m.RoomFormComponent),
    canActivate: [RoleGuard],
    data: { roles: ['hotelier'] }
  },

  // Tableau de Bord Admin (Protégé + Rôle Admin)
  {
    path: 'dashboard/admin',
    loadComponent: () => import('./components/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [RoleGuard],
    data: { roles: ['admin'] }
  },

  // Profil Utilisateur
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },

  // Page 404 (Route "Wildcard") - Doit toujours être en dernier !
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
