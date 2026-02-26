import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SITE_CONFIG } from '../../core/config/site-config';

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-page.component.html',
  styleUrl: './legal-page.component.css',
})
export class TermsPageComponent {
  readonly siteConfig = inject(SITE_CONFIG);
  readonly updatedAt = '2026-02-26';
}
