import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocsAssistantSessionService } from '../../services/docs-assistant-session.service';
import { DocsAssistantDrawerService } from '../../services/docs-assistant-drawer.service';
import { parseDocsAssistantSource } from '../../utils/docs-assistant-source.util';
import type { DocsAssistantMessage } from '../../services/docs-assistant-history.storage';

export type DocsAssistantLayout = 'standalone' | 'embedded';

const STARTER_PROMPTS = [
  'How do I create a redirect rule for one path?',
  'What is a link map and when should I use it?',
  'How do I create and use an API key?',
  'How do domain groups relate to domains?',
] as const;

@Component({
  selector: 'app-docs-assistant',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './docs-assistant.component.html',
  styleUrl: './docs-assistant.component.css',
})
export class DocsAssistantComponent {
  readonly pageContext = input<string | null>(null);
  readonly layout = input<DocsAssistantLayout>('standalone');

  readonly closeRequested = output<void>();

  readonly session = inject(DocsAssistantSessionService);
  private readonly drawer = inject(DocsAssistantDrawerService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly starterPrompts = STARTER_PROMPTS;

  readonly questionControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(4_000)],
  });

  readonly showHistory = signal(false);
  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly activeMessages = computed(() => this.session.activeThread()?.messages ?? []);
  readonly hasMessages = computed(() => this.activeMessages().length > 0);

  @ViewChild('messagesEnd') private messagesEndRef?: ElementRef<HTMLDivElement>;
  @ViewChild('questionInput') private questionInputRef?: ElementRef<HTMLTextAreaElement>;

  constructor() {
    effect(() => {
      this.activeMessages();
      this.session.isSearching();
      this.queueScrollToBottom();
    });

    effect(() => {
      if (this.layout() !== 'embedded' || !this.drawer.open() || !this.isBrowser) {
        return;
      }

      this.focusComposer();
    });
  }

  parseSource(source: string) {
    return parseDocsAssistantSource(source);
  }

  onClose(): void {
    this.closeRequested.emit();
  }

  onOpenFullPage(): void {
    this.drawer.closeDrawer();
  }

  onToggleHistory(): void {
    this.showHistory.update((value) => !value);
  }

  onNewChat(): void {
    this.session.startNewThread(this.pageContext());
    this.showHistory.set(false);
    this.questionControl.reset('');
  }

  onSelectThread(threadId: string): void {
    this.session.selectThread(threadId);
    this.showHistory.set(false);
  }

  onDeleteThread(threadId: string, event: Event): void {
    event.stopPropagation();
    this.session.deleteThread(threadId);
  }

  onClearHistory(): void {
    this.session.clearAllHistory();
    this.showHistory.set(false);
  }

  async onSubmit(): Promise<void> {
    if (this.questionControl.invalid || this.session.isSearching()) {
      return;
    }

    const question = this.questionControl.value;
    this.questionControl.reset('');
    await this.session.submitQuestion(question, this.pageContext());
  }

  onStarterPrompt(prompt: string): void {
    this.showHistory.set(false);
    this.questionControl.setValue(prompt);
    this.focusComposer();
  }

  onUsePageContext(): void {
    const context = this.pageContext()?.trim();
    if (!context) {
      return;
    }

    const prefix = `About ${context}: `;
    const current = this.questionControl.value.trim();
    if (current.startsWith(prefix)) {
      return;
    }

    this.questionControl.setValue(current ? `${prefix}${current}` : `${prefix}`);
  }

  async onRate(message: DocsAssistantMessage, rating: 1 | -1): Promise<void> {
    if (!message.logId || message.rating === rating) {
      return;
    }

    await this.session.rateMessage(message.logId, rating);
  }

  private focusComposer(): void {
    queueMicrotask(() => {
      const element = this.questionInputRef?.nativeElement;
      if (!element) {
        return;
      }

      element.focus();
      const length = element.value.length;
      element.setSelectionRange(length, length);
    });
  }

  private queueScrollToBottom(): void {
    if (!this.isBrowser) {
      return;
    }

    queueMicrotask(() => {
      this.messagesEndRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }
}
