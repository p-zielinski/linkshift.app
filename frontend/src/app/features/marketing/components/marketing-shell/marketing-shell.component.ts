import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { LogoComponent } from '../../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-marketing-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    LogoComponent,
  ],
  templateUrl: './marketing-shell.component.html',
  styleUrl: './marketing-shell.component.css',
})
export class MarketingShellComponent {
  readonly siteConfig = inject(SITE_CONFIG);
}
