import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/api.service';
import { Testimonial } from '../../../core/models';
import { SettingsStore } from '../../../core/settings.store';
import { ToastService } from '../../../core/toast.service';
import { errorMessage } from '../../../core/utils';
import { IconComponent } from '../../../shared/icon';
import { ToggleComponent } from '../../../shared/toggle';

@Component({
  selector: 'app-testimonials-admin',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, ToggleComponent],
  templateUrl: './testimonials-admin.html',
  styleUrl: './testimonials-admin.scss'
})
export class TestimonialsAdmin implements OnInit {
  private api = inject(ApiService);
  private store = inject(SettingsStore);
  private toast = inject(ToastService);
  private fb = inject(NonNullableFormBuilder);

  settings = this.store.settings;
  sectionOn = computed(() => this.settings()?.show_testimonials ?? true);
  items = signal<Testimonial[]>([]);
  loading = signal(true);
  savingSection = signal(false);
  savingGoogle = signal(false);
  adding = signal(false);
  busyId = signal<string | null>(null);
  readonly ratings = [5, 4, 3, 2, 1];
  readonly starList = [1, 2, 3, 4, 5];

  google = this.fb.group({
    rating: new FormControl<number | null>(null, [Validators.min(0), Validators.max(5)]),
    count: new FormControl<number | null>(null, [Validators.min(0)])
  });

  newForm = this.fb.group({
    client_name: ['', [Validators.required, Validators.maxLength(120)]],
    rating: [5],
    review_text: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const fill = () => {
      const s = this.settings();
      if (s) this.google.reset({ rating: s.google_rating, count: s.google_reviews_count });
    };
    if (this.settings()) fill();
    else this.store.load().subscribe({ next: fill, error: (err) => this.toast.error(errorMessage(err, 'No se pudo cargar la configuración.')) });

    this.api.getAdminTestimonials().subscribe({
      next: (list) => { this.items.set(list); this.loading.set(false); },
      error: (err) => { this.loading.set(false); this.toast.error(errorMessage(err, 'No se pudieron cargar los testimonios.')); }
    });
  }

  // ---------- Interruptor de toda la sección ----------
  setSection(on: boolean): void {
    const s = this.settings();
    if (!s || this.savingSection()) return;
    this.savingSection.set(true);
    this.api.updateSettings(s.id, { show_testimonials: on }).subscribe({
      next: (res) => {
        this.store.set(res.settings);
        this.savingSection.set(false);
        this.toast.success(on ? 'Sección de testimonios visible.' : 'Sección de testimonios oculta.');
      },
      error: (err) => { this.savingSection.set(false); this.toast.error(errorMessage(err)); }
    });
  }

  // ---------- Resumen de Google ----------
  saveGoogle(): void {
    const s = this.settings();
    if (!s || this.google.invalid || this.savingGoogle()) { this.google.markAllAsTouched(); return; }
    const { rating, count } = this.google.getRawValue();
    this.savingGoogle.set(true);
    this.api.updateSettings(s.id, {
      google_rating: rating === null || (rating as unknown) === '' ? null : Number(rating),
      google_reviews_count: count === null || (count as unknown) === '' ? null : Math.trunc(Number(count))
    }).subscribe({
      next: (res) => {
        this.store.set(res.settings);
        this.savingGoogle.set(false);
        this.toast.success('Resumen de Google guardado.');
      },
      error: (err) => { this.savingGoogle.set(false); this.toast.error(errorMessage(err)); }
    });
  }

  // ---------- Reseñas ----------
  add(): void {
    if (this.newForm.invalid || this.adding()) { this.newForm.markAllAsTouched(); return; }
    const value = this.newForm.getRawValue();
    this.adding.set(true);
    this.api.createTestimonial({
      client_name: value.client_name.trim(),
      review_text: value.review_text.trim(),
      rating: Number(value.rating)
    }).subscribe({
      next: (created) => {
        this.items.update((list) => [created, ...list]);
        this.newForm.reset({ client_name: '', rating: 5, review_text: '' });
        this.adding.set(false);
        this.toast.success('Testimonio agregado.');
      },
      error: (err) => { this.adding.set(false); this.toast.error(errorMessage(err)); }
    });
  }

  setActive(item: Testimonial, is_active: boolean): void {
    this.busyId.set(item.id);
    this.api.toggleTestimonial(item.id, is_active).subscribe({
      next: (updated) => {
        this.items.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.busyId.set(null);
      },
      error: (err) => { this.busyId.set(null); this.toast.error(errorMessage(err)); }
    });
  }

  remove(item: Testimonial): void {
    if (!confirm(`¿Eliminar el testimonio de ${item.client_name}?`)) return;
    this.api.deleteTestimonial(item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((t) => t.id !== item.id));
        this.toast.success('Testimonio eliminado.');
      },
      error: (err) => this.toast.error(errorMessage(err))
    });
  }
}
