import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../components/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { SettingsStore } from '../../../core/settings.store';
import { ToastComponent } from '../../../shared/toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [Sidebar, RouterOutlet, CommonModule, ToastComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout implements OnInit {
  private store = inject(SettingsStore);
  isSidebarOpen = false;

  ngOnInit(): void {
    // Nombre del negocio para el menú lateral y datos que usan las pantallas de configuración
    if (!this.store.settings()) this.store.load().subscribe({ error: () => { /* el panel sigue funcionando */ } });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
