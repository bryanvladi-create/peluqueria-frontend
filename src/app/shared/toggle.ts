import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Interruptor accesible (role="switch"). Emite el nuevo valor; el padre decide si lo aplica. */
@Component({
  selector: 'app-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: inline-flex; }
    .switch { position: relative; width: 44px; height: 24px; border: 0; border-radius: 999px; background: #D5D8DD;
      cursor: pointer; transition: background .2s; padding: 0; flex: none; }
    .switch span { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: transform .2s; }
    .switch.on { background: #22B07D; }
    .switch.on span { transform: translateX(20px); }
    .switch:disabled { opacity: .5; cursor: not-allowed; }
    .switch:focus-visible { outline: 2px solid #E8A2B6; outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { .switch, .switch span { transition: none; } }
  `],
  template: `
    <button type="button" class="switch" role="switch" [class.on]="checked()" [disabled]="disabled()"
            [attr.aria-checked]="checked()" [attr.aria-label]="label()" (click)="changed.emit(!checked())">
      <span></span>
    </button>`
})
export class ToggleComponent {
  checked = input(false);
  label = input('Activar');
  disabled = input(false);
  changed = output<boolean>();
}
