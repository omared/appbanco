import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ProductsService } from '../../core/products/products.service';
import { SessionService } from '../../core/session/session.service';
import { AuthService } from '../../core/auth/auth.service';
import { ProductoCliente } from '../../shared/models/producto.model';
import { ProductCard } from './components/product-card/product-card';
import { RetryBanner } from '../../shared/components/retry-banner/retry-banner';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

type EstadoCarga = 'cargando' | 'lista' | 'vacio' | 'error';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, ProductCard, RetryBanner],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly productsService = inject(ProductsService);
  private readonly session = inject(SessionService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  protected readonly router = inject(Router);

  readonly estado = signal<EstadoCarga>('cargando');
  readonly productos = signal<ProductoCliente[]>([]);

  constructor() {
    this.cargarProductos();
  }

  cargarProductos(): void {
    const clienteId = this.session.session().clienteId;
    if (!clienteId) {
      return;
    }
    this.estado.set('cargando');
    this.productsService.getProductosDelCliente(clienteId).subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.estado.set(productos.length === 0 ? 'vacio' : 'lista');
      },
      error: () => this.estado.set('error'),
    });
  }

  cerrarSesion(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { mensaje: '¿Seguro que deseas cerrar sesión?' },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.authService.logout('manual');
      }
    });
  }
}
