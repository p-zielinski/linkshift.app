import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SITE_CONFIG } from '../../core/config/site-config';

@Component({
  selector: 'app-cookies-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookies-page.component.html',
  styleUrl: './legal-page.component.css',
})
export class CookiesPageComponent {
  readonly siteConfig = inject(SITE_CONFIG);
  readonly updatedAt = '2026-02-05';
}
