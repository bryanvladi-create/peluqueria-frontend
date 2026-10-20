import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // IMPORTANTE

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // IMPORTANTE
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'peluqueria-frontend';
}