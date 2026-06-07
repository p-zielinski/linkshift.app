import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablePaginatorComponent } from './table-paginator.component';

describe('TablePaginatorComponent', () => {
  let fixture: ComponentFixture<TablePaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablePaginatorComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    }).compileComponents();

    fixture = TestBed.createComponent(TablePaginatorComponent);
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('hasNextPage', true);
    fixture.detectChanges();
  });

  it('exposes accessible labels on previous and next page buttons', () => {
    const root = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(root.querySelectorAll('button[aria-label]'));

    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.getAttribute('aria-label')).toBe('Previous page');
    expect(buttons[1]?.getAttribute('aria-label')).toBe('Next page');
  });
});
