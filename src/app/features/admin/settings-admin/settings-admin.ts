import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { timeout } from 'rxjs'; // 👈 IMPORTAMOS TIMEOUT
import { ApiService } from '../../../core/api.service';
import { SiteSettings } from '../../../core/models';
import { SettingsStore } from '../../../core/settings.store';
import { ToastService } from '../../../core/toast.service';
import { errorMessage, extractMapSrc, isAllowedMapUrl, validateHeroImage } from '../../../core/utils';
import { IconComponent } from '../../../shared/icon';
import { ImageUrlPipe } from '../../../shared/image-url.pipe';

const URL_PATTERN = /^https?:\/\/\S+$/i;
const MAX_BYTES = 8 * 1024 * 1024;

@Component({
  selector: 'app-settings-admin',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, ImageUrlPipe],
  templateUrl: './settings-admin.html',
  styleUrl: './settings-admin.scss'
})
export class SettingsAdmin implements OnInit {
  private api = inject(ApiService);
  private store = inject(SettingsStore);
  private toast = inject(ToastService);
  private fb = inject(NonNullableFormBuilder);
  private sanitizer = inject(DomSanitizer);

  settings = this.store.settings;
  loading = signal(true);
  saving = signal(false);
  uploadingHero = signal(false);

  form = this.fb.group({
    // Redes sociales y contacto
    whatsapp_number: ['', [Validators.pattern(/^\+?[0-9\s-]{8,20}$/)]],
    facebook_url: ['', [Validators.pattern(URL_PATTERN)]],
    instagram_url: ['', [Validators.pattern(URL_PATTERN)]],
    tiktok_url: ['', [Validators.pattern(URL_PATTERN)]],
    // Negocio y portada
    business_name: ['', [Validators.required, Validators.maxLength(160)]],
    hero_eyebrow: [''],
    hero_title: [''],
    hero_subtitle: [''],
    hero_image_position: ['center'], // 👈 Selector de encuadre
    // Ubicación
    city: [''],
    address_text: [''],
    opening_hours: [''],
    map_embed_url: [''],
    google_maps_url: ['', [Validators.pattern(URL_PATTERN)]]
  });

  private mapInput = toSignal(this.form.controls.map_embed_url.valueChanges, { initialValue: '' });
  mapUrl = computed(() => extractMapSrc(this.mapInput()));
  mapValid = computed(() => isAllowedMapUrl(this.mapUrl()));
  mapPreview = computed(() => this.mapValid() ? this.sanitizer.bypassSecurityTrustResourceUrl(this.mapUrl()) : null);

  ngOnInit(): void {
    const current = this.settings();
    if (current) { this.fill(current); this.loading.set(false); return; }
    this.store.load().subscribe({
      next: (s) => { this.fill(s); this.loading.set(false); },
      error: (err) => { this.loading.set(false); this.toast.error(errorMessage(err, 'No se pudo cargar la configuración.')); }
    });
  }

  private fill(s: SiteSettings): void {
    this.form.reset({
      whatsapp_number: s.whatsapp_number ?? '',
      facebook_url: s.facebook_url ?? '',
      instagram_url: s.instagram_url ?? '',
      tiktok_url: s.tiktok_url ?? '',
      business_name: s.business_name ?? '',
      hero_eyebrow: s.hero_eyebrow ?? '',
      hero_title: s.hero_title ?? '',
      hero_subtitle: s.hero_subtitle ?? '',
      hero_image_position: s.hero_image_position ?? 'center',
      city: s.city ?? '',
      address_text: s.address_text ?? '',
      opening_hours: s.opening_hours ?? '',
      map_embed_url: s.map_embed_url ?? '',
      google_maps_url: s.google_maps_url ?? ''
    });
  }

  save(): void {
    const s = this.settings();
    if (!s || this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Revisa los campos marcados en rojo.');
      return;
    }
    const value = this.form.getRawValue();
    const map = extractMapSrc(value.map_embed_url);
    if (map && !isAllowedMapUrl(map)) {
      this.toast.error('El mapa debe ser el código "Incrustar un mapa" de Google Maps (empieza con https://www.google.com/maps/embed).');
      return;
    }

    this.saving.set(true);
    this.api.updateSettings(s.id, { ...value, map_embed_url: map }).subscribe({
      next: (res) => {
        this.store.set(res.settings);
        this.fill(res.settings);
        this.saving.set(false);
        this.toast.success('Cambios guardados. Ya se ven en la web.');
      },
      error: (err) => { this.saving.set(false); this.toast.error(errorMessage(err)); }
    });
  }

  async onHeroImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.uploadingHero()) return;
    
    if (!file.type.startsWith('image/')) { this.toast.error('El archivo debe ser una imagen.'); return; }
    if (file.size > MAX_BYTES) { this.toast.error('La imagen supera el máximo de 8 MB.'); return; }

    // Validación de dimensiones (Frontend)
    const validation = await validateHeroImage(file);
    if (!validation.isValid) { 
      this.toast.error(validation.message || 'Imagen no válida'); 
      return; 
    }

    this.uploadingHero.set(true);
    
    // Petición con Timeout de 15 segundos para evitar que se congele
    this.api.uploadHeroImage(file).pipe(
      timeout(15000)
    ).subscribe({
      next: (res) => {
        this.store.set(res.settings);
        this.uploadingHero.set(false);
        this.toast.success('Imagen de portada actualizada.');
      },
      error: (err) => { 
        this.uploadingHero.set(false); 
        if (err.name === 'TimeoutError') {
          this.toast.error('El servidor tardó demasiado en responder. Revisa que el backend esté encendido.');
        } else {
          this.toast.error(errorMessage(err)); 
        }
      }
    });
  }
}