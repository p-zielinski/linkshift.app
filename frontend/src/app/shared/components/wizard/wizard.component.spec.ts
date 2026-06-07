import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { WizardComponent, type WizardStep } from './wizard.component';

describe('WizardComponent', () => {
  let fixture: ComponentFixture<WizardComponent>;
  let component: WizardComponent;

  const steps: WizardStep[] = [
    { id: 'first', label: 'First', complete: false },
    { id: 'second', label: 'Second', complete: false },
    { id: 'third', label: 'Third', complete: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    component.steps = steps.map((step) => ({ ...step }));
    fixture.detectChanges();
  });

  it('allows backward navigation to any prior step', () => {
    component.steps = [
      { id: 'first', label: 'First', complete: false },
      { id: 'second', label: 'Second', complete: false },
      { id: 'third', label: 'Third', complete: true },
    ];
    component.activeIndex = 2;

    component.setActiveStep(0);

    expect(component.activeIndex).toBe(0);
    expect(component.activeStep()?.id).toBe('first');
  });

  it('blocks forward navigation when a prior step is incomplete', () => {
    component.setActiveStep(2);

    expect(component.activeIndex).toBe(0);
    expect(component.activeStep()?.id).toBe('first');
  });

  it('allows forward navigation when all prior steps are complete', () => {
    component.steps = [
      { id: 'first', label: 'First', complete: true },
      { id: 'second', label: 'Second', complete: true },
      { id: 'third', label: 'Third', complete: false },
    ];

    component.setActiveStep(2);

    expect(component.activeIndex).toBe(2);
    expect(component.activeStep()?.id).toBe('third');
  });

  it('treats undefined complete as navigable for forward steps', () => {
    component.steps = [
      { id: 'first', label: 'First' },
      { id: 'second', label: 'Second', complete: false },
    ];

    component.setActiveStep(1);

    expect(component.activeIndex).toBe(1);
    expect(component.activeStep()?.id).toBe('second');
  });

  it('still blocks navigation to disabled steps', () => {
    component.steps = [
      { id: 'first', label: 'First', complete: true },
      { id: 'second', label: 'Second', complete: true, disabled: true },
      { id: 'third', label: 'Third', complete: true },
    ];
    component.activeIndex = 0;

    component.setActiveStep(1);

    expect(component.activeIndex).toBe(0);
  });

  it('disables sidebar step buttons when a step is disabled', () => {
    component.steps = [
      { id: 'first', label: 'First', complete: true },
      { id: 'second', label: 'Second', complete: false, disabled: true },
    ];
    fixture.detectChanges();

    const sidebarSteps = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('aside .wizard-sidebar-step'),
    );

    expect(sidebarSteps[1]?.disabled).toBe(true);
    expect(sidebarSteps[1]?.getAttribute('aria-disabled')).toBe('true');
  });

  it('emits stepChange when navigation succeeds', () => {
    const emitted: string[] = [];
    component.stepChange.subscribe((stepId) => emitted.push(stepId));
    component.steps = [
      { id: 'first', label: 'First', complete: true },
      { id: 'second', label: 'Second', complete: false },
    ];

    component.setActiveStep(1);

    expect(emitted).toEqual(['second']);
  });

  it('does not emit stepChange when forward navigation is blocked', () => {
    const emitted: string[] = [];
    component.stepChange.subscribe((stepId) => emitted.push(stepId));

    component.setActiveStep(1);

    expect(component.activeIndex).toBe(0);
    expect(emitted).toEqual([]);
  });

  it('renders compact mobile stepper with step labels below the header', () => {
    fixture.detectChanges();

    const mobileStepper = fixture.nativeElement.querySelector('.wizard-mobile-stepper');
    expect(mobileStepper).toBeTruthy();

    const labels = Array.from<HTMLElement>(
      mobileStepper.querySelectorAll('.wizard-mobile-step .truncate'),
    ).map((element) => element.textContent?.trim());
    expect(labels).toEqual(['First', 'Second', 'Third']);
  });

  it('shows action required hint on mobile when next is blocked', () => {
    const mobileFixture = TestBed.createComponent(WizardComponent);
    mobileFixture.componentInstance.steps = [
      { id: 'first', label: 'First', complete: false },
      { id: 'second', label: 'Second', complete: false },
    ];
    mobileFixture.detectChanges();

    const hints = Array.from<HTMLElement>(
      mobileFixture.nativeElement.querySelectorAll('.wizard-mobile-stepper ~ .text-amber-700'),
    );
    expect(hints.some((element) => element.textContent?.trim() === 'Action required')).toBe(true);
  });

  it('hides action required hint on mobile when on the last step', () => {
    const mobileFixture = TestBed.createComponent(WizardComponent);
    const mobileComponent = mobileFixture.componentInstance;
    mobileComponent.steps = [
      { id: 'first', label: 'First', complete: true },
      { id: 'second', label: 'Second', complete: false },
    ];
    mobileComponent.activeIndex = 1;
    mobileFixture.detectChanges();

    const hints = Array.from<HTMLElement>(
      mobileFixture.nativeElement.querySelectorAll('.wizard-mobile-stepper ~ .text-amber-700'),
    );
    expect(hints.some((element) => element.textContent?.trim() === 'Action required')).toBe(false);
  });

  it('marks mobile stepper buttons with aria-current on the active step', () => {
    const mobileFixture = TestBed.createComponent(WizardComponent);
    const mobileComponent = mobileFixture.componentInstance;
    mobileComponent.steps = [
      { id: 'first', label: 'First', complete: true },
      { id: 'second', label: 'Second', complete: false },
      { id: 'third', label: 'Third', complete: false },
    ];
    mobileComponent.activeIndex = 1;
    mobileFixture.detectChanges();

    const mobileSteps = Array.from<HTMLButtonElement>(
      mobileFixture.nativeElement.querySelectorAll('.wizard-mobile-stepper .wizard-mobile-step'),
    );

    expect(mobileSteps).toHaveLength(3);
    expect(mobileSteps[0]?.getAttribute('aria-current')).toBeNull();
    expect(mobileSteps[1]?.getAttribute('aria-current')).toBe('step');
    expect(mobileSteps[2]?.getAttribute('aria-current')).toBeNull();
  });

  it('marks desktop sidebar steps as buttons with aria-current on the active step', () => {
    const sidebarFixture = TestBed.createComponent(WizardComponent);
    const sidebarComponent = sidebarFixture.componentInstance;
    sidebarComponent.steps = [
      { id: 'first', label: 'First', complete: true },
      { id: 'second', label: 'Second', complete: false },
      { id: 'third', label: 'Third', complete: false },
    ];
    sidebarComponent.activeIndex = 1;
    sidebarFixture.detectChanges();

    const sidebarSteps = Array.from<HTMLButtonElement>(
      sidebarFixture.nativeElement.querySelectorAll('aside .wizard-sidebar-step'),
    );

    expect(sidebarSteps).toHaveLength(3);
    sidebarSteps.forEach((button) => {
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
    });
    expect(sidebarSteps[0]?.getAttribute('aria-current')).toBeNull();
    expect(sidebarSteps[1]?.getAttribute('aria-current')).toBe('step');
    expect(sidebarSteps[2]?.getAttribute('aria-current')).toBeNull();
  });

  it('labels desktop sidebar steps with aria-label for screen readers', () => {
    fixture.detectChanges();

    const sidebarSteps = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('aside .wizard-sidebar-step'),
    );

    expect(sidebarSteps[0]?.getAttribute('aria-label')).toBe('Go to step 1: First');
    expect(sidebarSteps[1]?.getAttribute('aria-label')).toBe('Go to step 2: Second');
    expect(sidebarSteps[2]?.getAttribute('aria-label')).toBe('Go to step 3: Third');
  });

  it('exposes cancelLabel on the close button for icon-only mobile layout', () => {
    const closeFixture = TestBed.createComponent(WizardComponent);
    closeFixture.componentInstance.steps = steps.map((step) => ({ ...step }));
    closeFixture.componentInstance.cancelLabel = 'Skip for now';
    closeFixture.detectChanges();

    const closeButton = closeFixture.nativeElement.querySelector(
      'button[aria-label="Skip for now"]',
    ) as HTMLButtonElement | null;

    expect(closeButton).toBeTruthy();
  });

  it('binds nextTooltip to the Next button wrapper', () => {
    const tooltipFixture = TestBed.createComponent(WizardComponent);
    const tooltipComponent = tooltipFixture.componentInstance;
    tooltipComponent.steps = steps.map((step) => ({ ...step }));
    tooltipComponent.nextTooltip = 'Complete this step first';
    tooltipComponent.nextTooltipDisabled = false;
    tooltipFixture.detectChanges();

    const tooltips = tooltipFixture.debugElement.queryAll(By.directive(MatTooltip));
    const nextTooltip = tooltips.find((element) =>
      element.nativeElement.textContent?.includes('Next'),
    );

    expect(nextTooltip).toBeTruthy();
    expect(nextTooltip?.injector.get(MatTooltip).message).toBe('Complete this step first');
    expect(nextTooltip?.injector.get(MatTooltip).disabled).toBe(false);
  });
});
