import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { Subdomain } from '../../core/models/subdomain.model';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { SubdomainStore } from '../../core/store/subdomain.store';
import {
  SubdomainFormDialogComponent,
  type SubdomainDialogData,
} from './subdomain-form-dialog.component';

describe('SubdomainFormDialogComponent', () => {
  const sampleSubdomain: Subdomain = {
    id: 'subdomain-1',
    name: 'go',
    domainGroupId: 'group-1',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  const configure = (data: SubdomainDialogData | null) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [SubdomainFormDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: SubdomainStore,
          useValue: {
            isLoading: () => ({}),
            errorSequence: () => 0,
            clearError: vi.fn(),
            upsert: vi.fn(),
          },
        },
        {
          provide: DomainGroupStore,
          useValue: {
            selectList: () => signal([]),
            searchList: vi.fn(),
          },
        },
      ],
    });
  };

  it('uses create copy in create mode', () => {
    configure(null);
    const fixture = TestBed.createComponent(SubdomainFormDialogComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.dialogTitle).toBe('Create subdomain');
    expect(fixture.componentInstance.wizardSubtitle).toContain('Add or update a subdomain');
    expect(fixture.nativeElement.textContent).not.toContain('subdomain name is permanent');
  });

  it('locks subdomain name and shows edit copy in edit mode', () => {
    configure({ subdomain: sampleSubdomain });
    const fixture = TestBed.createComponent(SubdomainFormDialogComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const nameInput = root.querySelector('input[matinput]') as HTMLInputElement;

    expect(component.dialogTitle).toBe('Change subdomain group');
    expect(component.wizardSubtitle).toContain('subdomain name is permanent');
    expect(component.steps()[0].description).toContain('cannot be changed');
    expect(root.textContent).toContain('Changing the domain group moves routing');
    expect(nameInput.readOnly).toBe(true);
  });
});
