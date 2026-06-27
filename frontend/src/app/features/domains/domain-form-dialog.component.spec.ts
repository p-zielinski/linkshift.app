import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import type { Domain } from '../../core/models/domain.model';
import { DomainGroupStore } from '../../core/store/domain-group.store';
import { DomainStore } from '../../core/store/domain.store';
import { DomainFormDialogComponent, type DomainDialogData } from './domain-form-dialog.component';

describe('DomainFormDialogComponent', () => {
  const sampleDomain: Domain = {
    id: 'domain-1',
    name: 'go.example.com',
    domainGroupId: 'group-1',
    dnsStatus: 'VERIFIED',
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
  };

  const configure = (data: DomainDialogData | null) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [DomainFormDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        {
          provide: DomainStore,
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
    const fixture = TestBed.createComponent(DomainFormDialogComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.dialogTitle).toBe('Create domain');
    expect(fixture.componentInstance.wizardSubtitle).toContain('Add or update a domain');
    expect(fixture.nativeElement.textContent).not.toContain('TLS certificate');
  });

  it('locks domain name and shows edit copy in edit mode', () => {
    configure({ domain: sampleDomain });
    const fixture = TestBed.createComponent(DomainFormDialogComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    const root = fixture.nativeElement as HTMLElement;
    const nameInput = root.querySelector('input[matinput]') as HTMLInputElement;

    expect(component.dialogTitle).toBe('Change domain group');
    expect(component.wizardSubtitle).toContain('cannot be changed');
    expect(component.steps()[0].description).toContain('cannot be changed');
    expect(root.textContent).toContain('new TLS certificate');
    expect(nameInput.readOnly).toBe(true);
  });
});
