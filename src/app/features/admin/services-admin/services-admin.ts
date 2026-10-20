import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../../../core/api.service';
import { Service, ServicePayload } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { errorMessage } from '../../../core/utils';
import { IconComponent } from '../../../shared/icon';
import { ToggleComponent } from '../../../shared/toggle';
import { ImageUrlPipe } from '../../../shared/image-url.pipe';

interface PendingFile { file: File; url: string; }
const MAX_BYTES = 8 * 1024 * 1024;

@Component({
  selector: 'app-services-admin',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, ToggleComponent, ImageUrlPipe],
  templateUrl: './services-admin.html',
  styleUrl: './services-admin.scss'
})
export class ServicesAdmin implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private fb = inject(NonNullableFormBuilder);

  services = signal<Service[]>([]);
  loading = signal(true);
  saving = signal(false);
  busyId = signal<string | null>(null);

  modalOpen = signal(false);
  editing = signal<Service | null>(null);
  pending = signal<PendingFile[]>([]);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
    short_description: [''],
    detailed_description: [''],
    benefits: [''],
    is_active: [true]
  });

  ngOnInit(): void { this.reload(); }
  ngOnDestroy(): void { this.clearPending(); }

  reload(): void {
    this.api.getAdminServices().subscribe({
      next: (list) => { this.services.set(list); this.loading.set(false); },
      error: (err) => { this.loading.set(false); this.toast.error(errorMessage(err, 'No se pudieron cargar los servicios.')); }
    });
  }

  // ---------- Modal ----------
  openNew(): void {
    this.editing.set(null);
    this.form.reset({ name: '', short_description: '', detailed_description: '', benefits: '', is_active: true });
    this.clearPending();
    this.modalOpen.set(true);
  }

  openEdit(service: Service): void {
    this.editing.set(service);
    this.form.reset({
      name: service.name,
      short_description: service.short_description ?? '',
      detailed_description: service.detailed_description ?? '',
      benefits: (service.benefits ?? []).join('\n'),
      is_active: service.is_active
    });
    this.clearPending();
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.clearPending();
  }

  // ---------- Fotos ----------
  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    const accepted: PendingFile[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) { this.toast.error(`"${file.name}" no es una imagen.`); continue; }
      if (file.size > MAX_BYTES) { this.toast.error(`"${file.name}" supera el máximo de 8 MB.`); continue; }
      accepted.push({ file, url: URL.createObjectURL(file) });
    }
    this.pending.update((list) => [...list, ...accepted]);
  }

  removePending(index: number): void {
    const item = this.pending()[index];
    if (item) URL.revokeObjectURL(item.url);
    this.pending.update((list) => list.filter((_, i) => i !== index));
  }

  removeExistingImage(imageId: string): void {
    if (!confirm('¿Eliminar esta foto del servicio?')) return;
    this.api.deleteServiceImage(imageId).subscribe({
      next: (updated) => {
        this.editing.set(updated);
        this.services.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        this.toast.success('Foto eliminada.');
      },
      error: (err) => this.toast.error(errorMessage(err))
    });
  }

  private clearPending(): void {
    this.pending().forEach((item) => URL.revokeObjectURL(item.url));
    this.pending.set([]);
  }

  // ---------- Guardar ----------
  save(): void {
    if (this.form.invalid || this.saving()) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const payload: ServicePayload = {
      name: value.name.trim(),
      short_description: value.short_description.trim(),
      detailed_description: value.detailed_description.trim(),
      benefits: value.benefits.split('\n').map((line) => line.trim()).filter(Boolean),
      is_active: value.is_active
    };
    const files = this.pending().map((item) => item.file);
    const current = this.editing();

    this.saving.set(true);
    const saved$ = current ? this.api.updateService(current.id, payload) : this.api.createService(payload);
    saved$.pipe(
      switchMap((saved) => files.length
        ? this.api.addServiceImages(saved.id, files).pipe(
            catchError((err) => {
              this.toast.error(`El servicio se guardó, pero las fotos no se subieron: ${errorMessage(err)}`);
              return of(saved);
            }))
        : of(saved))
    ).subscribe({
      next: () => {
        this.toast.success(current ? 'Servicio actualizado.' : 'Servicio creado.');
        this.saving.set(false);
        this.closeModal();
        this.reload();
      },
      error: (err) => { this.saving.set(false); this.toast.error(errorMessage(err)); }
    });
  }

  // ---------- Tabla ----------
  setActive(service: Service, is_active: boolean): void {
    this.busyId.set(service.id);
    this.api.updateService(service.id, { is_active }).subscribe({
      next: (updated) => {
        this.services.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        this.busyId.set(null);
        this.toast.success(is_active ? 'Servicio visible en la web.' : 'Servicio oculto de la web.');
      },
      error: (err) => { this.busyId.set(null); this.toast.error(errorMessage(err)); }
    });
  }

  remove(service: Service): void {
    if (!confirm(`¿Eliminar "${service.name}" y todas sus fotos? Esta acción no se puede deshacer.`)) return;
    this.api.deleteService(service.id).subscribe({
      next: () => {
        this.services.update((list) => list.filter((s) => s.id !== service.id));
        this.toast.success('Servicio eliminado.');
      },
      error: (err) => this.toast.error(errorMessage(err))
    });
  }
}
