import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SITE_CONFIG } from '../../../../core/config/site-config';
import { SeoService } from '../../../../core/seo/seo.service';
import { MarketingSectionComponent } from '../../components/marketing-section/marketing-section.component';

type ContactTopic = 'Bug report' | 'Feature request' | 'Higher limits';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MarketingSectionComponent],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.css',
})
export class ContactPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly siteConfig = inject(SITE_CONFIG);
  readonly supportEmail = this.siteConfig.supportEmail ?? 'support@redirectcontrol.app';

  readonly topics: Array<{
    title: ContactTopic;
    description: string;
    icon: string;
    subject: string;
  }> = [
    {
      title: 'Bug report',
      description: 'Share steps, expected behavior, and the impact so we can reproduce it fast.',
      icon: 'bug_report',
      subject: 'Bug report',
    },
    {
      title: 'Feature request',
      description: 'Tell us the workflow you want to unlock and how you measure success.',
      icon: 'lightbulb',
      subject: 'Feature request',
    },
    {
      title: 'Higher limits',
      description: 'Share the limits you need so we can add a new public plan tier.',
      icon: 'tune',
      subject: 'Higher limits request',
    },
  ];

  ngOnInit(): void {
    this.seo.updateTags({
      title: `${this.siteConfig.name} | Contact`,
      description: 'Report bugs, suggest features, or request higher limits for LinkShift.',
      canonicalPath: '/contact',
      keywords: 'contact, bug report, feature request, higher limits',
    });
  }

  mailtoLink(subject: string): string {
    const body =
      'Tell us about your request:\n\n' +
      '- Organization name:\n' +
      '- Current plan:\n' +
      '- Details:\n';
    const params = new URLSearchParams({
      subject,
      body,
    });
    return `mailto:${this.supportEmail}?${params.toString()}`;
  }
}
