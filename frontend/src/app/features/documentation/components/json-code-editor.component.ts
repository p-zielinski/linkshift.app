import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { history, historyKeymap, defaultKeymap } from '@codemirror/commands';
import {
  autocompletion,
  Completion,
  completeFromList,
  completionKeymap,
  startCompletion,
} from '@codemirror/autocomplete';
import { json } from '@codemirror/lang-json';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

@Component({
  selector: 'app-json-code-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './json-code-editor.component.html',
  styleUrl: './json-code-editor.component.css',
})
export class JsonCodeEditorComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly label = input('');
  readonly value = input('');
  readonly placeholder = input('');
  readonly suggestions = input<Array<string | { label: string; detail?: string }>>([]);
  readonly readOnly = input(false);
  readonly minHeight = input(180);
  readonly valueChange = output<string>();

  private readonly editorHost = viewChild<ElementRef<HTMLElement>>('editorHost');

  private readonly readOnlyCompartment = new Compartment();
  private readonly completionCompartment = new Compartment();

  private view: EditorView | null = null;

  constructor() {
    effect(() => {
      const host = this.editorHost();
      if (!host || !isPlatformBrowser(this.platformId)) {
        return;
      }

      if (this.view) {
        return;
      }

      this.view = this.createEditor(host.nativeElement);
    });

    effect(() => {
      const nextValue = this.value();
      if (!this.view) {
        return;
      }

      const currentValue = this.view.state.doc.toString();
      if (nextValue === currentValue) {
        return;
      }

      this.view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: nextValue,
        },
      });
    });

    effect(() => {
      const readOnly = this.readOnly();
      if (!this.view) {
        return;
      }

      this.view.dispatch({
        effects: this.readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly)),
      });
    });

    effect(() => {
      const suggestions = this.suggestions();
      if (!this.view) {
        return;
      }

      this.view.dispatch({
        effects: this.completionCompartment.reconfigure(
          autocompletion({
            activateOnTyping: true,
            override: [
              completeFromList(this.toCompletions(suggestions)),
            ],
          }),
        ),
      });
    });
  }

  ngOnDestroy(): void {
    this.view?.destroy();
    this.view = null;
  }

  private createEditor(hostElement: HTMLElement): EditorView {
    const placeholder = this.placeholder();
    const suggestions = this.suggestions();

    const state = EditorState.create({
      doc: this.value(),
      extensions: [
        lineNumbers(),
        history(),
        json(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        this.readOnlyCompartment.of(EditorState.readOnly.of(this.readOnly())),
        this.completionCompartment.of(
          autocompletion({
            activateOnTyping: true,
            override: [
              completeFromList(this.toCompletions(suggestions)),
            ],
          }),
        ),
        keymap.of([...defaultKeymap, ...historyKeymap, ...completionKeymap]),
        EditorView.lineWrapping,
        EditorView.theme({
          '&': {
            fontSize: '13px',
            minHeight: `${this.minHeight()}px`,
            borderRadius: '10px',
            border: '1px solid rgba(31, 24, 28, 0.18)',
            backgroundColor: '#fff',
          },
          '.cm-content': {
            minHeight: `${this.minHeight()}px`,
            padding: '12px 10px',
            fontFamily: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace`,
          },
          '.cm-gutters': {
            borderRight: '1px solid rgba(31, 24, 28, 0.12)',
            backgroundColor: 'rgba(31, 24, 28, 0.03)',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'rgba(192, 55, 98, 0.08)',
          },
          '.cm-placeholder': {
            color: 'rgba(31, 24, 28, 0.45)',
          },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            this.valueChange.emit(update.state.doc.toString());

            let insertedQuote = false;
            update.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
              if (inserted.toString().includes('"')) {
                insertedQuote = true;
              }
            });

            if (insertedQuote) {
              startCompletion(update.view);
            }
          }
        }),
      ],
    });

    const editorView = new EditorView({
      state,
      parent: hostElement,
    });

    if (placeholder) {
      editorView.contentDOM.setAttribute('aria-label', placeholder);
    }

    return editorView;
  }

  private toCompletions(
    suggestions: Array<string | { label: string; detail?: string }>,
  ): Completion[] {
    return suggestions.map((suggestion) => {
      if (typeof suggestion === 'string') {
        return {
          label: suggestion,
          type: 'property',
        };
      }

      return {
        label: suggestion.label,
        type: 'property',
        detail: suggestion.detail,
      };
    });
  }
}
