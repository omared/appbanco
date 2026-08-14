import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi } from 'vitest';
import { RetryBanner } from './retry-banner';

describe('HU-02/HU-03a · RetryBanner', () => {
  function setup(mensaje = 'No pudimos cargar los productos disponibles') {
    TestBed.configureTestingModule({ imports: [RetryBanner] });
    const fixture = TestBed.createComponent(RetryBanner);
    fixture.componentRef.setInput('mensaje', mensaje);
    fixture.detectChanges();
    return { fixture };
  }

  it('FR-018: muestra el mensaje de error recibido por input', () => {
    const { fixture } = setup('No pudimos cargar los productos disponibles');

    const texto = fixture.nativeElement.querySelector('p').textContent;

    expect(texto).toContain('No pudimos cargar los productos disponibles');
  });

  it('emite retry al pulsar el botón "Reintentar"', () => {
    const { fixture } = setup();
    const emitidos: void[] = [];
    fixture.componentInstance.retry.subscribe(() => emitidos.push(undefined));

    fixture.nativeElement.querySelector('button').click();

    expect(emitidos.length).toBe(1);
  });
});
