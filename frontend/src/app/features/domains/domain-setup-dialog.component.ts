import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DOMAIN_SETUP_CONFIG } from '../../core/config/domain-setup-config';

@Component({
  selector: 'app-domain-setup-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './domain-setup-dialog.component.html',
})
export class DomainSetupDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DomainSetupDialogComponent>);
  private readonly config = inject(DOMAIN_SETUP_CONFIG);

  readonly targetIp = computed(() => this.config.targetIp?.trim() ?? '');
  readonly hasTargetIp = computed(() => this.targetIp().length > 0);

  close(): void {
    console.log('Closing domain setup dialog', this.config);

    this.dialogRef.close();
  }
}
