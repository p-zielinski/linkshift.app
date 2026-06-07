import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { WizardDialogService } from './wizard-dialog.service';

describe('WizardDialogService', () => {
  let service: WizardDialogService;
  let dialogOpen: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dialogOpen = vi.fn().mockReturnValue({ afterClosed: () => ({ subscribe: vi.fn() }) });

    TestBed.configureTestingModule({
      providers: [WizardDialogService, { provide: MatDialog, useValue: { open: dialogOpen } }],
    });

    service = TestBed.inject(WizardDialogService);
  });

  it('opens wizards with disableClose false by default', () => {
    service.openWizard(class {});

    expect(dialogOpen).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ disableClose: false }),
    );
  });

  it('allows disableClose true for non-dismissible wizards', () => {
    service.openWizard(class {}, undefined, 0, { disableClose: true });

    expect(dialogOpen).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ disableClose: true }),
    );
  });

  it('uses dynamic viewport height for full-size wizard dialog sizing', () => {
    service.openWizard(class {}, undefined, 1);

    expect(dialogOpen).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        height: 'calc(100dvh - 96px)',
        maxHeight: 'calc(100dvh - 96px)',
      }),
    );
  });

  it('uses compact dimensions for single-step wizard dialogs', () => {
    service.openWizard(class {}, undefined, 0, { size: 'compact' });

    expect(dialogOpen).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        width: 'min(560px, 92vw)',
        height: 'auto',
        maxWidth: 'min(560px, 92vw)',
        maxHeight: 'min(90dvh, 720px)',
        panelClass: 'wizard-dialog-compact',
      }),
    );
  });

  it('defaults to full viewport sizing when size is omitted', () => {
    service.openWizard(class {}, undefined, 0);

    expect(dialogOpen).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        width: 'calc(100vw - 48px)',
        height: 'calc(100dvh - 48px)',
      }),
    );
  });
});
