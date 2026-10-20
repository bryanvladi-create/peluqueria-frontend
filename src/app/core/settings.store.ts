import { Injectable, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { SiteSettings } from './models';

/** Configuración del sitio compartida entre la landing, el sidebar y el panel. */
@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private api = inject(ApiService);
  private title = inject(Title);

  readonly settings = signal<SiteSettings | null>(null);

  load() {
    return this.api.getSettings().pipe(tap((settings) => this.set(settings)));
  }

  set(settings: SiteSettings) {
    this.settings.set(settings);
    if (settings.business_name) this.title.setTitle(settings.business_name);
  }
}
