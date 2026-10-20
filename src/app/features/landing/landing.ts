import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { GalleryImage, Promotion, Service, Testimonial } from '../../core/models';
import { SettingsStore } from '../../core/settings.store';
import { formatLongDate, isAllowedMapUrl, whatsappUrl } from '../../core/utils';
import { IconComponent, IconName } from '../../shared/icon';
import { ImageUrlPipe } from '../../shared/image-url.pipe';
import { RevealDirective } from '../../shared/reveal.directive';
import { Lightbox } from './components/lightbox/lightbox';
import { ServiceModal } from './components/service-modal/service-modal';
import { WhatsappFab } from './components/whatsapp-fab/whatsapp-fab';
import { Title, Meta } from '@angular/platform-browser';
import { AppointmentModal } from './components/appointment-modal/appointment-modal';

const GALLERY_PAGE = 8;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, IconComponent, RevealDirective, ServiceModal, Lightbox, WhatsappFab, ImageUrlPipe, AppointmentModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing implements OnInit {
  // … sin cambios (igual que tu archivo original)
  private api = inject(ApiService);
  private store = inject(SettingsStore);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  private metaService = inject(Meta);


  settings = this.store.settings;
  services = signal<Service[]>([]);
  gallery = signal<GalleryImage[]>([]);
  promotions = signal<Promotion[]>([]);
  testimonials = signal<Testimonial[]>([]);

  status = signal<'loading' | 'ready' | 'error'>('loading');
  menuOpen = signal(false);
  selectedService = signal<Service | null>(null);
  lightboxIndex = signal<number | null>(null);
  galleryVisible = signal(GALLERY_PAGE);
  appointmentModalOpen = signal(false);

  readonly year = new Date().getFullYear();
  readonly starList = [1, 2, 3, 4, 5];

  heroEyebrow = computed(() => this.settings()?.hero_eyebrow || 'Tu estilo, nuestra pasión');
  heroSubtitle = computed(() => this.settings()?.hero_subtitle
    || 'Cuidamos de tu cabello con técnicas modernas, productos de alta calidad y un trato personalizado.');
  heroTitle = computed(() => {
    const title = this.settings()?.hero_title || 'Realza tu belleza, confía en expertos';
    const comma = title.indexOf(',');
    return comma > 0
      ? { first: title.slice(0, comma + 1), second: title.slice(comma + 1).trim() }
      : { first: title, second: '' };
  });

  galleryShown = computed(() => this.gallery().slice(0, this.galleryVisible()));
  hasMoreGallery = computed(() => this.gallery().length > this.galleryVisible());

  shownTestimonials = computed(() => this.testimonials().slice(0, 6));
  showTestimonials = computed(() => !!this.settings()?.show_testimonials && this.testimonials().length > 0);
  showLocation = computed(() => !!(this.settings()?.address_text || this.mapSrc() || this.settings()?.opening_hours));
  mapSrc = computed(() => {
    const url = this.settings()?.map_embed_url;
    return url && isAllowedMapUrl(url) ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  directionsUrl = computed(() => {
    const s = this.settings();
    if (s?.google_maps_url) return s.google_maps_url;
    return s?.address_text
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address_text)}`
      : null;
  });

  whatsappHref = computed(() => whatsappUrl(this.settings()?.whatsapp_number));
  socials = computed(() => {
    const s = this.settings();
    const all: { name: string; icon: IconName; url: string | null | undefined }[] = [
      { name: 'Instagram', icon: 'instagram', url: s?.instagram_url },
      { name: 'Facebook', icon: 'facebook', url: s?.facebook_url },
      { name: 'TikTok', icon: 'tiktok', url: s?.tiktok_url }
    ];
    return all.filter((item): item is { name: string; icon: IconName; url: string } => !!item.url);
  });
  navLinks = computed(() => {
    const links = [{ label: 'Inicio', fragment: 'inicio' }];
    if (this.services().length) links.push({ label: 'Servicios', fragment: 'servicios' });
    if (this.gallery().length) links.push({ label: 'Galería', fragment: 'galeria' });
    if (this.promotions().length) links.push({ label: 'Promociones', fragment: 'promociones' });
    if (this.showLocation()) links.push({ label: 'Ubicación', fragment: 'ubicacion' });
    return links;
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.status.set('loading');
    forkJoin({
      settings: this.store.load(),
      services: this.api.getPublicServices().pipe(catchError(() => of([] as Service[]))),
      gallery: this.api.getGallery().pipe(catchError(() => of([] as GalleryImage[]))),
      promotions: this.api.getPublicPromotions().pipe(catchError(() => of([] as Promotion[]))),
      testimonials: this.api.getPublicTestimonials().pipe(catchError(() => of([] as Testimonial[])))
    }).subscribe({
      next: (data) => {
        this.services.set(data.services);
        this.gallery.set(data.gallery);
        this.promotions.set(data.promotions);
        this.testimonials.set(data.testimonials);
        this.status.set('ready');

        // 👇 NUEVO: Actualizar Meta Tags para SEO 👇
        const s = data.settings;
        if (s) {
          const pageTitle = `${s.business_name} - Peluquería y Spa`;
          const pageDesc = s.hero_subtitle || 'Descubre nuestros servicios de belleza y cuidado personal.';

          this.titleService.setTitle(pageTitle);
          this.metaService.updateTag({ name: 'description', content: pageDesc });

          // Open Graph (Para WhatsApp, Facebook, Instagram)
          this.metaService.updateTag({ property: 'og:title', content: pageTitle });
          this.metaService.updateTag({ property: 'og:description', content: pageDesc });
          this.metaService.updateTag({ property: 'og:type', content: 'website' });

          // Si hay foto de portada, la ponemos como imagen de previsualización
          if (s.hero_image_url) {
            this.metaService.updateTag({ property: 'og:image', content: s.hero_image_url });
          }
        }
      },
      error: () => this.status.set('error')
    });
  }

  openService(service: Service): void { this.selectedService.set(service); }
  openLightbox(index: number): void { this.lightboxIndex.set(index); }
  showAllGallery(): void { this.galleryVisible.set(this.gallery().length); }

  promoUntil(promo: Promotion): string | null {
    return promo.end_date ? `Válida hasta el ${formatLongDate(promo.end_date)}` : null;
  }
  promoHref(promo: Promotion): string | null {
    return whatsappUrl(this.settings()?.whatsapp_number, `Hola, me interesa la promoción: ${promo.title}`);
  }
  isStarOn(star: number, rating: number): boolean { return star <= Math.round(rating); }
  initial(name: string): string { return (name.trim()[0] ?? '?').toUpperCase(); }
}