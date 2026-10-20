import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { Login } from './features/auth/login/login';
import { Layout } from './features/admin/layout/layout';
import { DashboardHome } from './features/admin/dashboard-home/dashboard-home';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: Landing, pathMatch: 'full' },
  { path: 'gestion', component: Login },
  {
    path: 'admin',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardHome },
      { path: 'servicios', loadComponent: () => import('./features/admin/services-admin/services-admin').then((m) => m.ServicesAdmin) },
      { path: 'galeria', loadComponent: () => import('./features/admin/gallery-admin/gallery-admin').then((m) => m.GalleryAdmin) },
      { path: 'promociones', loadComponent: () => import('./features/admin/promotions-admin/promotions-admin').then((m) => m.PromotionsAdmin) },
      { path: 'citas', loadComponent: () => import('./features/admin/appointments-admin/appointments-admin').then((m) => m.AppointmentsAdmin) }, // 👈 NUEVA RUTA
      { path: 'testimonios', loadComponent: () => import('./features/admin/testimonials-admin/testimonials-admin').then((m) => m.TestimonialsAdmin) },
      { path: 'configuracion', loadComponent: () => import('./features/admin/settings-admin/settings-admin').then((m) => m.SettingsAdmin) }
    ]
  },
  { path: '**', redirectTo: '' }
];