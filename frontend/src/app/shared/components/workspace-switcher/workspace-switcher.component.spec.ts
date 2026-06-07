import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkspaceSwitcherComponent } from './workspace-switcher.component';

describe('WorkspaceSwitcherComponent', () => {
  let fixture: ComponentFixture<WorkspaceSwitcherComponent>;
  let component: WorkspaceSwitcherComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceSwitcherComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspaceSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows "Select workspace" when nothing is selected and all option is off', () => {
    fixture.componentRef.setInput('label', 'Workspace');
    fixture.componentRef.setInput('selectedId', '');
    fixture.componentRef.setInput('includeAllOption', false);
    fixture.detectChanges();

    expect(component.selectedLabel()).toBe('Select workspace');
  });

  it('shows "Select site" when nothing is selected and label is Site', () => {
    fixture.componentRef.setInput('label', 'Site');
    fixture.componentRef.setInput('selectedId', '');
    fixture.componentRef.setInput('includeAllOption', false);
    fixture.detectChanges();

    expect(component.selectedLabel()).toBe('Select site');
  });

  it('shows all option label when nothing is selected and includeAllOption is true', () => {
    fixture.componentRef.setInput('selectedId', '');
    fixture.componentRef.setInput('includeAllOption', true);
    fixture.componentRef.setInput('allOptionLabel', 'All sites');
    fixture.detectChanges();

    expect(component.selectedLabel()).toBe('All sites');
  });

  it('exposes menu semantics on the trigger button', () => {
    const trigger = fixture.nativeElement.querySelector(
      'button.workspace-switcher',
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-label')).toBe('Site: Select site. Open menu to change.');
  });

  it('includes the selected site in the trigger aria-label', () => {
    fixture.componentRef.setInput('groups', [{ id: 'g1', name: 'Marketing site' }]);
    fixture.componentRef.setInput('selectedId', 'g1');
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      'button.workspace-switcher',
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('aria-label')).toBe(
      'Site: Marketing site. Open menu to change.',
    );
  });

  it('shows custom all option label when includeAllOption is true', () => {
    fixture.componentRef.setInput('selectedId', '');
    fixture.componentRef.setInput('includeAllOption', true);
    fixture.componentRef.setInput('allOptionLabel', 'Every workspace');
    fixture.detectChanges();

    expect(component.selectedLabel()).toBe('Every workspace');
  });
});
