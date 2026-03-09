import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import type { ComponentType } from '@angular/cdk/portal';

@Injectable({ providedIn: 'root' })
export class WizardDialogService {
  private readonly dialog = inject(MatDialog);

  openWizard<TComponent = unknown, TData = unknown, TResult = unknown>(
    component: ComponentType<TComponent>,
    data?: TData,
    dependentLevel = 0,
  ) {
    const inset = (dependentLevel + 1) * 48;
    return this.dialog.open<TComponent, TData, TResult>(component, {
      restoreFocus: true,
      disableClose: true,
      width: `calc(100vw - ${inset}px)`,
      height: `calc(100vh - ${inset}px)`,
      maxWidth: `calc(100vw - ${inset}px)`,
      maxHeight: `calc(100vh - ${inset}px)`,
      data,
    });
  }
}
