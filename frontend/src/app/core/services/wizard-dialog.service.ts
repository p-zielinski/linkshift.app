import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import type { ComponentType } from '@angular/cdk/portal';

export type WizardDialogSize = 'full' | 'compact';

export type WizardDialogConfig = {
  disableClose?: boolean;
  size?: WizardDialogSize;
};

const COMPACT_WIZARD_PANEL_CLASS = 'wizard-dialog-compact';

@Injectable({ providedIn: 'root' })
export class WizardDialogService {
  private readonly dialog = inject(MatDialog);

  openWizard<TComponent = unknown, TData = unknown, TResult = unknown>(
    component: ComponentType<TComponent>,
    data?: TData,
    dependentLevel = 0,
    config: WizardDialogConfig = {},
  ) {
    const disableClose = config.disableClose ?? false;
    const size = config.size ?? 'full';

    if (size === 'compact') {
      return this.dialog.open<TComponent, TData, TResult>(component, {
        restoreFocus: true,
        disableClose,
        width: 'min(560px, 92vw)',
        height: 'auto',
        maxWidth: 'min(560px, 92vw)',
        maxHeight: 'min(90dvh, 720px)',
        panelClass: COMPACT_WIZARD_PANEL_CLASS,
        data,
      });
    }

    const inset = (dependentLevel + 1) * 48;
    const viewportHeight = `calc(100dvh - ${inset}px)`;
    const viewportWidth = `calc(100vw - ${inset}px)`;
    return this.dialog.open<TComponent, TData, TResult>(component, {
      restoreFocus: true,
      disableClose,
      width: viewportWidth,
      height: viewportHeight,
      maxWidth: viewportWidth,
      maxHeight: viewportHeight,
      data,
    });
  }
}
