import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from './confirm-dialog';

describe('HU-04 · ConfirmDialog', () => {
  function setup() {
    const dialogRefStub = { close: vi.fn() };
    TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: MAT_DIALOG_DATA, useValue: { mensaje: '¿Seguro que deseas cerrar sesión?' } },
      ],
    });
    const fixture = TestBed.createComponent(ConfirmDialog);
    fixture.detectChanges();
    return { fixture, dialogRefStub };
  }

  it('escenario 2: cierra con true al confirmar (Sí)', () => {
    const { fixture, dialogRefStub } = setup();

    fixture.componentInstance.cerrar(true);

    expect(dialogRefStub.close).toHaveBeenCalledWith(true);
  });

  it('escenario 2: cierra con false al cancelar (No)', () => {
    const { fixture, dialogRefStub } = setup();

    fixture.componentInstance.cerrar(false);

    expect(dialogRefStub.close).toHaveBeenCalledWith(false);
  });
});
