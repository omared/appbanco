import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SessionService } from './core/session/session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  constructor() {
    this.session.onExpiracionPorInactividad.subscribe(() => {
      this.router.navigate(['/login'], { queryParams: { motivo: 'inactividad' } });
    });
  }
}
