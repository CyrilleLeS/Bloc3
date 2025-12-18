import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UsersResponse, DashboardStats } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Dashboard stats
  getDashboardStats(): Observable<{ success: boolean; stats: DashboardStats }> {
    return this.http.get<{ success: boolean; stats: DashboardStats }>(`${this.apiUrl}/stats/dashboard`);
  }

  // Liste des utilisateurs
  getUsers(filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<UsersResponse> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<UsersResponse>(this.apiUrl, { params });
  }

  // Récupérer un utilisateur
  getUser(id: string): Observable<{ success: boolean; user: User; stats: any }> {
    return this.http.get<{ success: boolean; user: User; stats: any }>(`${this.apiUrl}/${id}`);
  }

  // Créer un utilisateur
  createUser(user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }): Observable<{ success: boolean; message: string; user: User }> {
    return this.http.post<{ success: boolean; message: string; user: User }>(this.apiUrl, user);
  }

  // Mettre à jour un utilisateur
  updateUser(id: string, data: Partial<User>): Observable<{ success: boolean; message: string; user: User }> {
    return this.http.put<{ success: boolean; message: string; user: User }>(`${this.apiUrl}/${id}`, data);
  }

  // Supprimer un utilisateur
  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}