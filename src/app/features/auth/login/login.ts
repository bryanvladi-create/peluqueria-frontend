import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { DEMO_MODE } from '../../../core/config';
import { errorMessage } from '../../../core/utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  demo = DEMO_MODE;
  loginData = DEMO_MODE ? { email: 'admin@demo.com', password: 'demo1234' } : { email: '', password: '' };
  loading = signal(false);
  error = signal('');

  constructor() {
    if (this.auth.isLoggedIn()) this.router.navigate(['/admin']);
  }

  onSubmit(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.loginData.email.trim(), this.loginData.password).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: (err) => {
        this.error.set(err?.status === 401 ? 'Correo o contraseña incorrectos.' : errorMessage(err));
        this.loading.set(false);
      }
    });
  }
}
