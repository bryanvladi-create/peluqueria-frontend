import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../../core/api.service';
import { GalleryImage } from '../../../core/models';
import { ToastService } from '../../../core/toast.service';
import { errorMessage } from '../../../core/utils';
import { IconComponent } from '../../../shared/icon';
import { ImageUrlPipe } from '../../../shared/image-url.pipe';

const MAX_BYTES = 8 * 1024 * 1024;

@Component({
  selector: 'app-gallery-admin',
  standalone: true,
  imports: [IconComponent, ImageUrlPipe],
  templateUrl: './gallery-admin.html',
  styleUrl: './gallery-admin.scss'
})
export class GalleryAdmin implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  images = signal<GalleryImage[]>([]);
  loading = signal(true);
  uploading = signal(false);

  ngOnInit(): void {
    this.api.getGallery().subscribe({
      next: (list) => { this.images.set(list); this.loading.set(false); },
      error: (err) => { this.loading.set(false); this.toast.error(errorMessage(err, 'No se pudo cargar la galería.')); }
    });
  }

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const picked = Array.from(input.files ?? []);
    input.value = '';

    const files = picked.filter((file) => {
      if (!file.type.startsWith('image/')) { this.toast.error(`"${file.name}" no es una imagen.`); return false; }
      if (file.size > MAX_BYTES) { this.toast.error(`"${file.name}" supera el máximo de 8 MB.`); return false; }
      return true;
    });
    if (files.length === 0 || this.uploading()) return;

    this.uploading.set(true);
    this.api.uploadGalleryImages(files).subscribe({
      next: (created) => {
        this.images.update((list) => [...created.slice().reverse(), ...list]);
        this.uploading.set(false);
        this.toast.success(created.length === 1 ? 'Imagen subida.' : `${created.length} imágenes subidas.`);
      },
      error: (err) => { this.uploading.set(false); this.toast.error(errorMessage(err, 'No se pudieron subir las imágenes.')); }
    });
  }

  remove(image: GalleryImage): void {
    if (!confirm('¿Eliminar esta imagen de la galería? Esta acción no se puede deshacer.')) return;
    this.api.deleteGalleryImage(image.id).subscribe({
      next: () => {
        this.images.update((list) => list.filter((item) => item.id !== image.id));
        this.toast.success('Imagen eliminada.');
      },
      error: (err) => this.toast.error(errorMessage(err))
    });
  }
}
