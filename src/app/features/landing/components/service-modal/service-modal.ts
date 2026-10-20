import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { Service } from '../../../../core/models';
import { lockScroll, trapTab, whatsappUrl } from '../../../../core/utils';
import { IconComponent } from '../../../../shared/icon';
import { ImageUrlPipe } from '../../../../shared/image-url.pipe';

/** Ventana flotante con el detalle, beneficios y fotos de un servicio. */
@Component({
  selector: 'app-service-modal',
  standalone: true,
  imports: [IconComponent, ImageUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './service-modal.html',
  styleUrl: './service-modal.scss'
})
export class ServiceModal implements OnInit, OnDestroy {
  service = input.required<Service>();
  whatsapp = input<string | null>(null);
  closed = output<void>();

  activeIndex = signal(0);
  activeImage = computed(() => this.service().images[this.activeIndex()]?.image_url ?? null);
  bookingUrl = computed(() => whatsappUrl(this.whatsapp(), `Hola, quiero agendar una cita para: ${this.service().name}`));

  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private unlock?: () => void;
  private previousFocus: HTMLElement | null = null;

  ngOnInit(): void {
    this.previousFocus = document.activeElement as HTMLElement | null;
    this.unlock = lockScroll();
    setTimeout(() => this.host.querySelector<HTMLElement>('.close')?.focus());
  }

  ngOnDestroy(): void {
    this.unlock?.();
    this.previousFocus?.focus?.();
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.closed.emit();
    else trapTab(event, this.host);
  }
}