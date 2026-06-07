import { CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TemplateRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

type WizardStepSummaryView = {
  stepId: string;
  templateRef: TemplateRef<unknown>;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardComponent implements AfterContentInit {
  private readonly destroyRef = inject(DestroyRef);

  @Input() title = '';
  @Input() subtitle = '';
  @Input() saveLabel = 'Save';
  @Input() cancelLabel = 'Cancel';
  @Input() saveDisabled = false;
  @Input() saveTooltip = '';
  @Input() saveTooltipDisabled = true;
  @Input() saveTooltipClass = 'wizard-tooltip';
  @Input() nextTooltip = '';
  @Input() nextTooltipDisabled = true;
  @Input() nextTooltipClass = 'wizard-tooltip';
  @Input() hideSave = false;
  @Input() backDisabled = false;

  readonly stepsSignal = signal<WizardStep[]>([]);

  @Input() set steps(value: WizardStep[]) {
    this.stepsSignal.set(value ?? []);
    this.rebuildContentChildMaps();
  }

  readonly activeIndexSignal = signal(0);

  get activeIndex(): number {
    return this.activeIndexSignal();
  }

  set activeIndex(value: number) {
    this.activeIndexSignal.set(value);
  }

  readonly stepCount = computed(() => this.stepsSignal().length);

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() stepChange = new EventEmitter<string>();

  @ContentChildren(WizardStepDirective, { descendants: true })
  private stepTemplates?: QueryList<WizardStepDirective>;

  @ContentChildren(WizardStepSummaryDirective, { descendants: true })
  private stepSummaries?: QueryList<WizardStepSummaryDirective>;

  private readonly stepTemplateById = signal(new Map<string, WizardStepDirective>());
  private readonly stepSummaryViews = signal<WizardStepSummaryView[]>([]);

  readonly activeStep = computed(() => this.stepsSignal()[this.activeIndexSignal()]);
  readonly canGoBack = computed(() => this.activeIndexSignal() > 0 && !this.backDisabled);
  readonly canGoNext = computed(() => this.activeIndexSignal() < this.stepsSignal().length - 1);
  readonly nextDisabled = computed(() => {
    const step = this.activeStep();
    if (!step) {
      return true;
    }
    if (step.disabled) {
      return true;
    }
    return step.complete === false;
  });
  readonly activeStepTemplate = computed(() => {
    const step = this.activeStep();
    if (!step) {
      return undefined;
    }
    return this.stepTemplateById().get(step.id);
  });
  readonly sidebarStepViews = computed(() =>
    this.stepsSignal().map((step, index) => ({
      step,
      index,
      summary: this.stepSummaryViews().find((view) => view.stepId === step.id),
    })),
  );

  ngAfterContentInit(): void {
    this.rebuildContentChildMaps();

    this.stepTemplates?.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.rebuildContentChildMaps();
    });
    this.stepSummaries?.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.rebuildContentChildMaps();
    });
  }

  setActiveStep(index: number): void {
    const steps = this.stepsSignal();
    if (index < 0 || index >= steps.length) {
      return;
    }
    const step = steps[index];
    if (step?.disabled) {
      return;
    }
    if (index > this.activeIndexSignal()) {
      for (let i = 0; i < index; i++) {
        if (steps[i]?.complete === false) {
          return;
        }
      }
    }
    this.activeIndexSignal.set(index);
    if (step) {
      this.stepChange.emit(step.id);
    }
  }

  previous(): void {
    if (!this.canGoBack()) {
      return;
    }
    this.setActiveStep(this.activeIndexSignal() - 1);
  }

  next(): void {
    if (!this.canGoNext() || this.nextDisabled()) {
      return;
    }
    this.setActiveStep(this.activeIndexSignal() + 1);
  }

  private rebuildContentChildMaps(): void {
    const templates = this.stepTemplates?.toArray() ?? [];
    this.stepTemplateById.set(new Map(templates.map((template) => [template.stepId, template])));

    const summaries = this.stepSummaries?.toArray() ?? [];
    this.stepSummaryViews.set(
      summaries.map((summary) => ({
        stepId: summary.stepId,
        templateRef: summary.templateRef,
      })),
    );
  }
}
