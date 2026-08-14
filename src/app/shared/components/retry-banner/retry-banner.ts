import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-retry-banner',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './retry-banner.html',
  styleUrl: './retry-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetryBanner {
  readonly mensaje = input.required<string>();
  readonly retry = output<void>();
}
