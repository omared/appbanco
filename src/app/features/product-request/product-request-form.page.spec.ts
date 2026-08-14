import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';
import { ProductRequestFormPage } from './product-request-form.page';
import { ProductsService } from '../../core/products/products.service';
import { EnvioResult, RequestsService } from '../../core/requests/requests.service';
import { SessionService } from '../../core/session/session.service';
import { ProductoCatalogo } from '../../shared/models/producto.model';

const PRODUCTO: ProductoCatalogo = {
  id: 'credito-rotativo',
  nombre: 'Crédito Rotativo',
  descripcion: 'desc',
  icono: 'account_balance_wallet',
  montoMinimo: 500_000,
  montoMaximo: 20_000_000,
  estadoParaCliente: 'disponible',
};

const DATOS_PERSONALES = {
  nombre: 'Ana María Gómez',
  documento: '1000000001',
  celular: '3001234567',
  correo: 'ana.gomez@example.com',
};

function setup() {
  const sessionStub = { session: () => ({ token: 't', clienteId: 'cli-001', estado: 'activa' as const }) };
  TestBed.configureTestingModule({
    imports: [ProductRequestFormPage],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { paramMap: convertToParamMap({ productoId: 'credito-rotativo' }) } },
      },
      { provide: ProductsService, useValue: { getCatalogo: () => of([PRODUCTO]) } },
      { provide: RequestsService, useValue: { getDatosPrecargados: () => of(DATOS_PERSONALES) } },
      { provide: SessionService, useValue: sessionStub },
    ],
  });
  const fixture = TestBed.createComponent(ProductRequestFormPage);
  fixture.detectChanges();
  return fixture;
}

describe('HU-03b · ProductRequestFormPage', () => {
  it('escenario 1: precarga los datos personales de solo lectura', () => {
    const fixture = setup();

    expect(fixture.componentInstance.datosPersonales.getRawValue()).toEqual(DATOS_PERSONALES);
    expect(fixture.componentInstance.datosPersonales.disabled).toBe(true);
  });

  it('escenario 2: rechaza un monto fuera del rango permitido por el producto', () => {
    const fixture = setup();
    const { datosSocioeconomicos } = fixture.componentInstance;

    datosSocioeconomicos.controls.montoSolicitado.setValue(999_999_999);

    expect(datosSocioeconomicos.controls.montoSolicitado.invalid).toBe(true);
  });

  it('escenario 3: resalta como inválido un campo obligatorio vacío al tocarlo', () => {
    const fixture = setup();
    const { ocupacion } = fixture.componentInstance.datosSocioeconomicos.controls;

    ocupacion.markAsTouched();

    expect(ocupacion.invalid).toBe(true);
  });

  it('escenario 4: bloquea el envío si faltan los checkboxes obligatorios', () => {
    const fixture = setup();
    const { datosSocioeconomicos } = fixture.componentInstance;
    datosSocioeconomicos.setValue({
      ingresos: 2_000_000,
      ocupacion: 'Empleado',
      egresos: 500_000,
      montoSolicitado: 1_000_000,
      aceptaTerminos: false,
      aceptaAutorizacionCentralRiesgo: false,
    });

    expect(datosSocioeconomicos.invalid).toBe(true);
  });

  it('escenario 5: habilita el envío cuando todo es válido', () => {
    const fixture = setup();
    const { datosSocioeconomicos } = fixture.componentInstance;
    datosSocioeconomicos.setValue({
      ingresos: 2_000_000,
      ocupacion: 'Empleado',
      egresos: 500_000,
      montoSolicitado: 1_000_000,
      aceptaTerminos: true,
      aceptaAutorizacionCentralRiesgo: true,
    });

    expect(datosSocioeconomicos.valid).toBe(true);
  });
});

describe('HU-03c · ProductRequestFormPage (envío)', () => {
  function setupEnvio(enviarSolicitud: () => Observable<EnvioResult>) {
    const sessionStub = { session: () => ({ token: 't', clienteId: 'cli-001', estado: 'activa' as const }) };
    TestBed.configureTestingModule({
      imports: [ProductRequestFormPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ productoId: 'credito-rotativo' }) } },
        },
        { provide: ProductsService, useValue: { getCatalogo: () => of([PRODUCTO]) } },
        {
          provide: RequestsService,
          useValue: { getDatosPrecargados: () => of(DATOS_PERSONALES), enviarSolicitud },
        },
        { provide: SessionService, useValue: sessionStub },
      ],
    });
    const fixture = TestBed.createComponent(ProductRequestFormPage);
    fixture.detectChanges();
    fixture.componentInstance.datosSocioeconomicos.setValue({
      ingresos: 2_000_000,
      ocupacion: 'Empleado',
      egresos: 500_000,
      montoSolicitado: 1_000_000,
      aceptaTerminos: true,
      aceptaAutorizacionCentralRiesgo: true,
    });
    return fixture;
  }

  it('escenario 1: envío exitoso navega a la confirmación con el radicado', () => {
    const fixture = setupEnvio(() => of({ ok: true, radicado: 'RAD-2026-0002' }));
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.enviar();

    expect(navigateSpy).toHaveBeenCalledWith(['/solicitudes/confirmacion'], {
      queryParams: { radicado: 'RAD-2026-0002' },
    });
  });

  it('escenario 2: error de envío muestra mensaje y conserva los datos diligenciados', () => {
    const fixture = setupEnvio(() => of({ ok: false, error: 'error_comunicacion' }));
    const valoresAntes = fixture.componentInstance.datosSocioeconomicos.getRawValue();

    fixture.componentInstance.enviar();

    expect(fixture.componentInstance.errorEnvio()).toBe('No pudimos procesar tu solicitud, intenta nuevamente');
    expect(fixture.componentInstance.datosSocioeconomicos.getRawValue()).toEqual(valoresAntes);
  });
});
