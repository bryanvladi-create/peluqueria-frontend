import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './config';
import {
  Appointment, GalleryImage, LoginResponse, Promotion, Service, ServicePayload, SiteSettings, Stats, Testimonial
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // ---------- Público (landing) ----------
  getSettings(): Observable<SiteSettings> { return this.http.get<SiteSettings>(`${API_URL}/settings`); }
  getPublicServices(): Observable<Service[]> { return this.http.get<Service[]>(`${API_URL}/services/public`); }
  getGallery(): Observable<GalleryImage[]> { return this.http.get<GalleryImage[]>(`${API_URL}/gallery`); }
  getPublicPromotions(): Observable<Promotion[]> { return this.http.get<Promotion[]>(`${API_URL}/promotions/public`); }
  getPublicTestimonials(): Observable<Testimonial[]> { return this.http.get<Testimonial[]>(`${API_URL}/testimonials/public`); }

  // ---------- Auth ----------
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/auth/login`, { email, password });
  }

  // ---------- Admin ----------
  getStats(): Observable<Stats> { return this.http.get<Stats>(`${API_URL}/stats`); }

  // Servicios
  getAdminServices(): Observable<Service[]> { return this.http.get<Service[]>(`${API_URL}/services/admin`); }
  createService(body: ServicePayload): Observable<Service> { return this.http.post<Service>(`${API_URL}/services`, body); }
  updateService(id: string, body: ServicePayload): Observable<Service> { return this.http.put<Service>(`${API_URL}/services/${id}`, body); }
  deleteService(id: string): Observable<unknown> { return this.http.delete(`${API_URL}/services/${id}`); }
  addServiceImages(id: string, files: File[]): Observable<Service> {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    return this.http.post<Service>(`${API_URL}/services/${id}/images`, form);
  }
  deleteServiceImage(imageId: string): Observable<Service> {
    return this.http.delete<Service>(`${API_URL}/services/images/${imageId}`);
  }

  // Galería
  uploadGalleryImages(files: File[]): Observable<GalleryImage[]> {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    return this.http.post<GalleryImage[]>(`${API_URL}/gallery`, form);
  }
  deleteGalleryImage(id: string): Observable<unknown> { return this.http.delete(`${API_URL}/gallery/${id}`); }

  // Promociones
  getAdminPromotions(): Observable<Promotion[]> { return this.http.get<Promotion[]>(`${API_URL}/promotions/admin`); }
  createPromotion(form: FormData): Observable<Promotion> { return this.http.post<Promotion>(`${API_URL}/promotions`, form); }
  updatePromotion(id: string, body: FormData | { is_active: boolean }): Observable<Promotion> {
    return this.http.put<Promotion>(`${API_URL}/promotions/${id}`, body);
  }
  deletePromotion(id: string): Observable<unknown> { return this.http.delete(`${API_URL}/promotions/${id}`); }

  // Testimonios
  getAdminTestimonials(): Observable<Testimonial[]> { return this.http.get<Testimonial[]>(`${API_URL}/testimonials/admin`); }
  createTestimonial(body: { client_name: string; review_text: string; rating: number }): Observable<Testimonial> {
    return this.http.post<Testimonial>(`${API_URL}/testimonials`, body);
  }
  toggleTestimonial(id: string, is_active: boolean): Observable<Testimonial> {
    return this.http.put<Testimonial>(`${API_URL}/testimonials/${id}/toggle`, { is_active });
  }
  deleteTestimonial(id: string): Observable<unknown> { return this.http.delete(`${API_URL}/testimonials/${id}`); }

  // Configuración
  updateSettings(id: string, body: Partial<SiteSettings>): Observable<{ message: string; settings: SiteSettings }> {
    return this.http.put<{ message: string; settings: SiteSettings }>(`${API_URL}/settings/${id}`, body);
  }
  uploadHeroImage(file: File): Observable<{ message: string; settings: SiteSettings }> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<{ message: string; settings: SiteSettings }>(`${API_URL}/settings/hero-image`, form);
  }

  // ---------- Citas ----------
  createAppointment(body: {
    client_name: string; client_phone: string; client_email?: string; 
    service_id?: string; appointment_date: string; appointment_time: string; notes?: string;
  }): Observable<{ message: string; appointment: Appointment }> {
    return this.http.post<{ message: string; appointment: Appointment }>(`${API_URL}/appointments`, body);
  }

  getAdminAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${API_URL}/appointments`);
  }

  updateAppointmentStatus(id: string, status: Appointment['status']): Observable<{ message: string; appointment: Appointment }> {
    return this.http.put<{ message: string; appointment: Appointment }>(`${API_URL}/appointments/${id}/status`, { status });
  }

  deleteAppointment(id: string): Observable<unknown> {
    return this.http.delete(`${API_URL}/appointments/${id}`);
  }
}