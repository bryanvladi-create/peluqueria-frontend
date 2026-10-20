import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';
import { GalleryImage } from '../../../../core/models';
import { lockScroll, trapTab } from '../../../../core/utils';
import { IconComponent } from '../../../../shared/icon';
import { ImageUrlPipe } from '../../../../shared/image-url.pipe';

/** Visor a pantalla completa de la galería: flechas, teclado, deslizar y contador. */
@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [IconComponent, ImageUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.scss'
})
export class Lightbox implements OnInit, OnDestroy {
  images = input.required<GalleryImage[]>();
  startIndex = input(0);
  closed = output<void>();

  index = signal(0);
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private unlock?: () => void;
  private previousFocus: HTMLElement | null = null;
  private touchX = 0;

  ngOnInit(): void {
    this.index.set(Math.min(Math.max(this.startIndex(), 0), this.images().length - 1));
    this.previousFocus = document.activeElement as HTMLElement | null;
    this.unlock = lockScroll();
    setTimeout(() => this.host.querySelector<HTMLElement>('.close')?.focus());
  }

  ngOnDestroy(): void {
    this.unlock?.();
    this.previousFocus?.focus?.();
  }

  go(step: number): void {
    const total = this.images().length;
    this.index.set((this.index() + step + total) % total);
  }

  onTouchStart(event: TouchEvent): void { this.touchX = event.changedTouches[0].clientX; }
  onTouchEnd(event: TouchEvent): void {
    const dx = event.changedTouches[0].clientX - this.touchX;
    if (Math.abs(dx) > 50) this.go(dx < 0 ? 1 : -1);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closed.emit();
    else if (event.key === 'ArrowRight') this.go(1);
    else if (event.key === 'ArrowLeft') this.go(-1);
    else trapTab(event, this.host);
  }
}
