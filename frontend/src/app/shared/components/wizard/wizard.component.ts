import { CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WizardStepDirective, WizardStepSummaryDirective } from './wizard-step.directive';

export type WizardStep = {
  id: string;
  label: string;
  title?: string;
  description?: string;
  complete?: boolean;
  disabled?: boolean;
};

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    NgTemplateOutlet,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './wizard.component.html',
  styleUrl: './wizard.component.css',
})
export class WizardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() saveLabel = 'Save';
  @Input() cancelLabel = 'Cancel';
  @Input() saveDisabled = false;
  @Input() saveTooltip = '';
  @Input() saveTooltipDisabled = true;
  @Input() saveTooltipClass = 'wizard-tooltip';
  @Input() hideSave = false;
  @Input() steps: WizardStep[] = [];

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() stepChange = new EventEmitter<string>();

  @ContentChildren(WizardStepDirective, { descendants: true })
  private readonly stepTemplates?: QueryList<WizardStepDirective>;

  @ContentChildren(WizardStepSummaryDirective, { descendants: true })
  private readonly stepSummaries?: QueryList<WizardStepSummaryDirective>;

  activeIndex = 0;

  get activeStep(): WizardStep | undefined {
    return this.steps[this.activeIndex];
  }

  get canGoBack(): boolean {
    return this.activeIndex > 0;
  }

  get canGoNext(): boolean {
    return this.activeIndex < this.steps.length - 1;
  }

  get nextDisabled(): boolean {
    const step = this.activeStep;
    if (!step) {
      return true;
    }
    if (step.disabled) {
      return true;
    }
    return step.complete === false;
  }

  setActiveStep(index: number): void {
    if (index < 0 || index >= this.steps.length) {
      return;
    }
    const step = this.steps[index];
    if (step?.disabled) {
      return;
    }
    this.activeIndex = index;
    if (step) {
      this.stepChange.emit(step.id);
    }
  }

  previous(): void {
    if (!this.canGoBack) {
      return;
    }
    this.setActiveStep(this.activeIndex - 1);
  }

  next(): void {
    if (!this.canGoNext || this.nextDisabled) {
      return;
    }
    this.setActiveStep(this.activeIndex + 1);
  }

  templateFor(stepId: string): WizardStepDirective | undefined {
    return this.stepTemplates?.find((template) => template.stepId === stepId);
  }

  summaryFor(stepId: string): WizardStepSummaryDirective | undefined {
    return this.stepSummaries?.find((summary) => summary.stepId === stepId);
  }
}
