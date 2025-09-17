import { Routes } from '@angular/router';
import { AuthGuard } from './app/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./app/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./app/components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./app/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];