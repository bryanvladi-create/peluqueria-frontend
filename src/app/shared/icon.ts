import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'x' | 'chevron-left' | 'chevron-right' | 'check'
  | 'arrow-right' | 'zoom-in' | 'expand' | 'pin' | 'clock' | 'star' | 'edit' | 'trash' | 'plus' | 'upload' | 'menu';

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  styles: [`:host { display: inline-flex; width: 1.25em; height: 1.25em; flex: none; } svg { width: 100%; height: 100%; }`],
  template: `
    <svg viewBox="0 0 24 24" [attr.fill]="name() === 'star' ? 'currentColor' : 'none'" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      @switch (name()) {
        @case ('whatsapp') { <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/> }
        @case ('instagram') { <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/> }
        @case ('facebook') { <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/> }
        @case ('tiktok') { <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/> }
        @case ('x') { <path d="M18 6 6 18"/><path d="m6 6 12 12"/> }
        @case ('chevron-left') { <path d="m15 18-6-6 6-6"/> }
        @case ('chevron-right') { <path d="m9 18 6-6-6-6"/> }
        @case ('check') { <path d="M20 6 9 17l-5-5"/> }
        @case ('arrow-right') { <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/> }
        @case ('zoom-in') { <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/> }
        @case ('expand') { <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/> }
        @case ('pin') { <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/> }
        @case ('clock') { <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/> }
        @case ('star') { <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/> }
        @case ('edit') { <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/> }
        @case ('trash') { <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/> }
        @case ('plus') { <path d="M5 12h14"/><path d="M12 5v14"/> }
        @case ('upload') { <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/> }
        @case ('menu') { <path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/> }
      }
    </svg>`
})
export class IconComponent {
  name = input.required<IconName>();
}
