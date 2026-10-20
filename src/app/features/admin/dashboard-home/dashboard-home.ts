import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/api.service';
import { AuthService } from '../../../core/auth.service';
import { Stats } from '../../../core/models';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss'
})
export class DashboardHome implements OnInit {
  private api = inject(ApiService);
  adminName = inject(AuthService).adminName;

  stats = signal<Stats | null>(null);
  failed = signal(false);

  ngOnInit(): void {
    this.api.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => this.failed.set(true)
    });
  }
}
