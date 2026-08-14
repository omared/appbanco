import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    documento: ['', Validators.required],
    password: ['', Validators.required],
  });

  readonly passwordVisible = signal(false);
  readonly enviando = signal(false);
  readonly errorMensaje = signal<string | null>(null);
  readonly infoMensaje = signal<string | null>(
    this.route.snapshot.queryParamMap.get('motivo') === 'inactividad'
      ? 'Tu sesión ha expirado por inactividad'
      : null,
  );

  togglePasswordVisible(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMensaje.set(null);
    this.enviando.set(true);
    const { documento, password } = this.form.getRawValue();

    this.authService.login(documento, password).subscribe((result) => {
      this.enviando.set(false);
      if (result.ok) {
        this.router.navigateByUrl('/home');
        return;
      }
      this.errorMensaje.set(
        result.error === 'usuario_bloqueado'
          ? 'Usuario bloqueado, contacte a su banco / recupere su clave'
          : 'Usuario o contraseña incorrectos',
      );
    });
  }
}
