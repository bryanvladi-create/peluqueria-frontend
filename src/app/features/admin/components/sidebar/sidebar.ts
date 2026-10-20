import { Component, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth.service';
import { SettingsStore } from '../../../../core/settings.store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  @Input() isOpen = false; // Recibe el estado desde el Layout
  @Output() closeMenu = new EventEmitter<void>(); // Avisa al Layout cuando se hace clic en un enlace

  private auth = inject(AuthService);
  private store = inject(SettingsStore);

  businessName = computed(() => this.store.settings()?.business_name || 'Mi Peluquería');

  onLinkClick() {
    // Si estamos en móvil, cerramos el menú al hacer clic en un enlace
    if (window.innerWidth <= 768) {
      this.closeMenu.emit();
    }
  }

  logout(event: Event) {
    event.preventDefault();
    this.auth.logout();
  }
}
