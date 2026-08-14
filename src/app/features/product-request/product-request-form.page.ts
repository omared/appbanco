import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProductsService } from '../../core/products/products.service';
import { RequestsService } from '../../core/requests/requests.service';
import { SessionService } from '../../core/session/session.service';
import { ProductoCatalogo } from '../../shared/models/producto.model';

@Component({
  selector: 'app-product-request-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './product-request-form.page.html',
  styleUrl: './product-request-form.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductRequestFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productsService = inject(ProductsService);
  private readonly requestsService = inject(RequestsService);
  private readonly session = inject(SessionService);

  private readonly clienteId = this.session.session().clienteId ?? '';
  readonly productoId = this.route.snapshot.paramMap.get('productoId') ?? '';

  readonly producto = signal<ProductoCatalogo | null>(null);
  readonly enviando = signal(false);
  readonly errorEnvio = signal<string | null>(null);

  readonly datosPersonales = this.fb.nonNullable.group({
    nombre: [{ value: '', disabled: true }],
    documento: [{ value: '', disabled: true }],
    celular: [{ value: '', disabled: true }],
    correo: [{ value: '', disabled: true }],
  });

  readonly datosSocioeconomicos = this.fb.nonNullable.group({
    ingresos: [0, [Validators.required, Validators.min(1)]],
    ocupacion: ['', Validators.required],
    egresos: [0, [Validators.required, Validators.min(0)]],
    montoSolicitado: [0, [Validators.required, Validators.min(1)]],
    aceptaTerminos: [false, Validators.requiredTrue],
    aceptaAutorizacionCentralRiesgo: [false, Validators.requiredTrue],
  });

  constructor() {
    this.productsService.getCatalogo(this.clienteId).subscribe((catalogo) => {
      const producto = catalogo.find((p) => p.id === this.productoId) ?? null;
      this.producto.set(producto);
      if (producto) {
        this.datosSocioeconomicos.controls.montoSolicitado.setValidators([
          Validators.required,
          Validators.min(producto.montoMinimo),
          Validators.max(producto.montoMaximo),
        ]);
        this.datosSocioeconomicos.controls.montoSolicitado.updateValueAndValidity();
      }
    });

    this.requestsService.getDatosPrecargados(this.clienteId).subscribe((datos) => {
      this.datosPersonales.patchValue(datos);
    });
  }

  enviar(): void {
    if (this.datosSocioeconomicos.invalid) {
      this.datosSocioeconomicos.markAllAsTouched();
      return;
    }

    this.errorEnvio.set(null);
    this.enviando.set(true);
    const valores = this.datosSocioeconomicos.getRawValue();

    this.requestsService
      .enviarSolicitud({
        clienteId: this.clienteId,
        productoId: this.productoId,
        ingresos: valores.ingresos,
        ocupacion: valores.ocupacion,
        egresos: valores.egresos,
        montoSolicitado: valores.montoSolicitado,
        aceptaTerminos: valores.aceptaTerminos,
        aceptaAutorizacionCentralRiesgo: valores.aceptaAutorizacionCentralRiesgo,
      })
      .subscribe((resultado) => {
        this.enviando.set(false);
        if (resultado.ok) {
          this.router.navigate(['/solicitudes/confirmacion'], {
            queryParams: { radicado: resultado.radicado },
          });
          return;
        }
        this.errorEnvio.set('No pudimos procesar tu solicitud, intenta nuevamente');
      });
  }
}
