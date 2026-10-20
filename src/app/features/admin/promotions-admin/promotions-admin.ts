import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/api.service';
import { Promotion } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { errorMessage, formatShortDate, todayIso } from '../../../core/utils';
import { IconComponent } from '../../../shared/icon';
import { ToggleComponent } from '../../../shared/toggle';
import { ImageUrlPipe } from '../../../shared/image-url.pipe';

const MAX_BYTES = 8 * 1024 * 1024;

@Component({
  selector: 'app-promotions-admin',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, ToggleComponent, ImageUrlPipe],
  templateUrl: './promotions-admin.html',
  styleUrl: './promotions-admin.scss'
})
export class PromotionsAdmin implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(NonNullableFormBuilder);

  promotions = signal<Promotion[]>([]);
  loading = signal(true);
  saving = signal(false);
  busyId = signal<string | null>(null);

  modalOpen = signal(false);
  editing = signal<Promotion | null>(null);
  imageFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    subtitle: [''],
    description: [''],
    start_date: [''],
    end_date: [''],
    is_active: [true]
  });

  ngOnInit(): void { this.reload(); }
  ngOnDestroy(): void { this.revokePreview(); }

  reload(): void {
    this.api.getAdminPromotions().subscribe({
      next: (list) => { this.promotions.set(list); this.loading.set(false); },
      error: (err) => { this.loading.set(false); this.toast.error(errorMessage(err, 'No se pudieron cargar las promociones.')); }
    });
  }

  vigencia(promo: Promotion): string {
    if (promo.end_date) return `Hasta ${formatShortDate(promo.end_date)}`;
    return promo.start_date ? `Desde ${formatShortDate(promo.start_date)}` : 'Sin fecha de fin';
  }
  isExpired(promo: Promotion): boolean { return !!promo.end_date && promo.end_date < todayIso(); }

  // ---------- Modal ----------
  openNew(): void {
    this.editing.set(null);
    this.form.reset({ title: '', subtitle: '', description: '', start_date: '', end_date: '', is_active: true });
    this.resetImage(null);
    this.modalOpen.set(true);
  }

  openEdit(promo: Promotion): void {
    this.editing.set(promo);
    this.form.reset({
      title: promo.title,
      subtitle: promo.subtitle ?? '',
      description: promo.description ?? '',
      start_date: promo.start_date?.slice(0, 10) ?? '',
      end_date: promo.end_date?.slice(0, 10) ?? '',
      is_active: promo.is_active
    });
    this.resetImage(promo.image_url);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.revokePreview();
  }

  onImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { this.toast.error('El archivo debe ser una imagen.'); return; }
    if (file.size > MAX_BYTES) { this.toast.error('La imagen supera el máximo de 8 MB.'); return; }
    this.revokePreview();
    this.imageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
  }

  private resetImage(currentUrl: string | null): void {
    this.revokePreview();
    this.imageFile.set(null);
    this.imagePreview.set(currentUrl);
  }

  private revokePreview(): void {
    const url = this.imagePreview();
    if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    this.imagePreview.set(null);
    this.imageFile.set(null);
  }

  // ---------- Guardar ----------
  save(): void {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    if (value.start_date && value.end_date && value.end_date < value.start_date) {
      this.toast.error('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }

    const data = new FormData();
    data.append('title', value.title.trim());
    data.append('subtitle', value.subtitle.trim());
    data.append('description', value.description.trim());
    data.append('start_date', value.start_date);
    data.append('end_date', value.end_date);
    data.append('is_active', String(value.is_active));
    const file = this.imageFile();
    if (file) data.append('image', file);

    const current = this.editing();
    this.saving.set(true);
    const request$ = current ? this.api.updatePromotion(current.id, data) : this.api.createPromotion(data);
    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(current ? 'Promoción actualizada.' : 'Promoción creada.');
        this.closeModal();
        this.reload();
      },
      error: (err) => { this.saving.set(false); this.toast.error(errorMessage(err)); }
    });
  }

  // ---------- Tabla ----------
  setActive(promo: Promotion, is_active: boolean): void {
    this.busyId.set(promo.id);
    this.api.updatePromotion(promo.id, { is_active }).subscribe({
      next: (updated) => {
        this.promotions.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
        this.busyId.set(null);
        this.toast.success(is_active ? 'Promoción visible en la web.' : 'Promoción oculta (no se borró).');
      },
      error: (err) => { this.busyId.set(null); this.toast.error(errorMessage(err)); }
    });
  }

  remove(promo: Promotion): void {
    if (!confirm(`¿Eliminar la promoción "${promo.title}"? Si solo quieres ocultarla, usa el interruptor de estado.`)) return;
    this.api.deletePromotion(promo.id).subscribe({
      next: () => {
        this.promotions.update((list) => list.filter((p) => p.id !== promo.id));
        this.toast.success('Promoción eliminada.');
      },
      error: (err) => this.toast.error(errorMessage(err))
    });
  }
}
