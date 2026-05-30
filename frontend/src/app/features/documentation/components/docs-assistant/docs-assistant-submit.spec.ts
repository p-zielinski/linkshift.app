import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * Regression guard: docs assistant used <form (ngSubmit)> with ReactiveFormsModule only.
 * NgForm (which calls preventDefault on submit) lives in FormsModule, so Ask triggered a
 * full document navigation.
 */
@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form (ngSubmit)="handled = true">
      <button type="submit">Submit</button>
    </form>
  `,
})
class ReactiveOnlyFormComponent {
  handled = false;
}

describe('docs-assistant submit behavior', () => {
  it('native form submit is not prevented when only ReactiveFormsModule is imported', () => {
    const preventDefault = vi.fn();
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });

    TestBed.configureTestingModule({
      imports: [ReactiveOnlyFormComponent],
    });

    const fixture = TestBed.createComponent(ReactiveOnlyFormComponent);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(submitEvent);

    expect(preventDefault).not.toHaveBeenCalled();
  });
});
