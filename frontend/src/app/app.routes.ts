import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  // Page d'accueil
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },

  // Auth routes
  {
    path: 'auth/login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Hotels routes (public)
  {
    path: 'hotels',
    loadComponent: () => import('./components/hotel/hotel-list/hotel-list.component').then(m => m.HotelListComponent)
  },
  {
    path: 'hotels/:id',
    loadComponent: () => import('./components/hotel/hotel-detail/hotel-detail.component').then(m => m.HotelDetailComponent)
  },

  // Amadeus search (public)
  {
    path: 'explore',
    loadComponent: () => import('./components/amadeus/amadeus-search.component').then(m => m.AmadeusSearchComponent)
  },

  // Booking routes (client)
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

  // Dashboard Client
  {
    path: 'dashboard/client',
    loadComponent: () => import('./components/dashboard/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent),
    canActivate: [RoleGuard],
    data: { roles: ['client'] }
  },

  // Dashboard Hotelier
  {
    path: 'dashboard/hotelier',
    loadComponent: () => import('./components/dashboard/hotelier-dashboard/hotelier-dashboard.component').then(m => m.HotelierDashboardComponent),
    canActivate: [RoleGuard],
    data: { roles: ['hotelier'] }
  },
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

  // Dashboard Admin
  {
    path: 'dashboard/admin',
    loadComponent: () => import('./components/dashboard/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [RoleGuard],
    data: { roles: ['admin'] }
  },

  // Profile
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },

  // 404
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];