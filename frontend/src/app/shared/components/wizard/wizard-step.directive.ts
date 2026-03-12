import { Directive, Input, TemplateRef } from '@angular/core';

type WizardStepOptions = {
  fullWidth?: boolean;
};

@Directive({
  selector: '[wizardStep]',
  standalone: true,
})
export class WizardStepDirective {
  @Input('wizardStep') stepId = '';
  @Input() wizardStepOptions?: WizardStepOptions;

  constructor(readonly templateRef: TemplateRef<unknown>) {}
}

@Directive({
  selector: '[wizardStepSummary]',
  standalone: true,
})
export class WizardStepSummaryDirective {
  @Input('wizardStepSummary') stepId = '';

  constructor(readonly templateRef: TemplateRef<unknown>) {}
}
