import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-request-confirmation-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './product-request-confirmation.page.html',
  styleUrl: './product-request-confirmation.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductRequestConfirmationPage {
  private readonly route = inject(ActivatedRoute);

  readonly radicado = this.route.snapshot.queryParamMap.get('radicado') ?? '';
}
