import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { LinkMapEntriesApiService } from '../../core/api/link-map-entries-api.service';
import { EditLinkDialogComponent } from './edit-link-dialog.component';

describe('EditLinkDialogComponent', () => {
  let closePayload: unknown;
  let confirmDialogResult: boolean | undefined;
  let openDialog: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    closePayload = undefined;
    confirmDialogResult = true;
    openDialog = vi.fn(() => ({
      afterClosed: () => of(confirmDialogResult),
    }));
    update = vi.fn(() =>
      of({
        id: 'entry-1',
        key: 'updated',
        destination: 'https://example.com',
      }),
    );

    TestBed.configureTestingModule({
      imports: [EditLinkDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            entryId: 'entry-1',
            key: 'promo',
            destination: 'https://old.example.com',
            shortPath: '/go/promo',
            shortUrls: ['https://go.example.com/go/promo', 'https://links.example.com/go/promo'],
            caseSensitive: false,
          },
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: (payload: unknown) => {
              closePayload = payload;
            },
          },
        },
        {
          provide: LinkMapEntriesApiService,
          useValue: { update },
        },
        {
          provide: MatDialog,
          useValue: { open: openDialog },
        },
      ],
    });
  });

  it('shows Saving… on save label while pending', () => {
    const fixture = TestBed.createComponent(EditLinkDialogComponent);
    const component = fixture.componentInstance;

    component.pending.set(true);

    expect(component.saveLabel()).toBe('Saving…');
  });

  it('saves with sanitized key and https destination', async () => {
    const fixture = TestBed.createComponent(EditLinkDialogComponent);
    const component = fixture.componentInstance;

    component.model.set({
      key: '  Summer-Sale ',
      destination: 'example.com/new',
    });

    await component.onSave();

    expect(update).toHaveBeenCalledWith('entry-1', {
      key: 'summer-sale',
      destination: 'https://example.com/new',
    });
    expect(closePayload).toEqual({ saved: true });
  });

  it('openAdvancedOptions closes with openAdvanced after confirmation', () => {
    const fixture = TestBed.createComponent(EditLinkDialogComponent);
    const component = fixture.componentInstance;

    component.openAdvancedOptions();

    expect(openDialog).toHaveBeenCalledTimes(1);
    expect(closePayload).toEqual({
      saved: false,
      openAdvanced: true,
    });
  });

  it('openAdvancedOptions does nothing when confirmation is cancelled', () => {
    confirmDialogResult = false;

    const fixture = TestBed.createComponent(EditLinkDialogComponent);
    const component = fixture.componentInstance;

    component.openAdvancedOptions();

    expect(openDialog).toHaveBeenCalledTimes(1);
    expect(closePayload).toBeUndefined();
  });
});
