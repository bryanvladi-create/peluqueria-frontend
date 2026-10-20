import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { whatsappUrl } from '../../../../core/utils';
import { IconComponent } from '../../../../shared/icon';

/** Botón flotante de WhatsApp. El número viene de la configuración del backend. */
@Component({
  selector: 'app-whatsapp-fab',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { position: fixed; right: 20px; bottom: 20px; z-index: 900; }
    a { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .label { background: #1E1E1E; color: #F8F9FA; font-size: .85rem; padding: 8px 14px; border-radius: 999px;
      border: 1px solid #333; opacity: 0; transform: translateX(8px); transition: opacity .2s, transform .2s; pointer-events: none; white-space: nowrap; }
    a:hover .label, a:focus-visible .label { opacity: 1; transform: none; }
    .circle { width: 58px; height: 58px; border-radius: 50%; background: #25D366; color: #fff; display: grid; place-items: center;
      font-size: 1.9rem; box-shadow: 0 8px 22px rgba(37, 211, 102, .35); transition: transform .2s; }
    a:hover .circle { transform: scale(1.06); }
    a:focus-visible { outline: none; }
    a:focus-visible .circle { outline: 3px solid #fff; outline-offset: 2px; }
    @media (max-width: 600px) { :host { right: 14px; bottom: 14px; } .label { display: none; } }
    @media (prefers-reduced-motion: reduce) { .label, .circle { transition: none; } }
  `],
  template: `
    @if (url(); as href) {
      <a [href]="href" target="_blank" rel="noopener noreferrer" aria-label="Chatear por WhatsApp (se abre en una pestaña nueva)">
        <span class="label">Chatea con nosotros</span>
        <span class="circle"><app-icon name="whatsapp" /></span>
      </a>
    }`
})
export class WhatsappFab {
  number = input<string | null>(null);
  url = computed(() => whatsappUrl(this.number()));
}
