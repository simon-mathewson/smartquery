import type { editor as editorType } from 'monaco-editor';
import type * as monacoType from 'monaco-editor';
import { assert } from 'ts-essentials';
import type { useAi } from '~/content/ai/useAi';
import developerPrompt from './developerPrompt.txt?raw';
import type { AnalyticsContextType } from '~/content/analytics/Context';

export class AiSuggestionWidget implements editorType.IContentWidget {
  private static readonly ID = 'editor.widget.aiSuggestion';

  private domNode: HTMLElement | undefined;

  private suggestion: string | undefined;

  private disposeKeyDownListener: monacoType.IDisposable | undefined;

  private getSuggestionAbortController = new AbortController();

  private timeout: number | undefined;

  constructor(
    private readonly editor: editorType.ICodeEditor,
    private readonly monaco: typeof monacoType,
    private readonly ai: ReturnType<typeof useAi>,
    private readonly track: AnalyticsContextType['track'],
  ) {
    const update = async (positionProp?: editorType.ICursorPositionChangedEvent['position']) => {
      const position = positionProp ?? editor.getPosition();
      const model = this.editor.getModel();

      if (!position || !model) {
        return;
      }

      this.editor.removeContentWidget(this);
      this.disposeKeyDownListener?.dispose();

      const { lineNumber, column } = position;
      const lines = model.getLinesContent();
      const textAfterCursor = lines
        .slice(lineNumber - 1)
        .map((line, index) => {
          if (index === 0) {
            return line.substring(column);
          }

          return line;
        })
        .join('\n');

      if (textAfterCursor.trim().length === 0) {
        const textBeforeCursor = lines.slice(0, lineNumber).join('\n');

        if (textBeforeCursor.trim().length === 0) {
          return;
        }

        this.suggestion = await this.getSuggestion(textBeforeCursor);

        if (!this.suggestion) {
          return;
        }

        this.editor.addContentWidget(this);
        this.track('code_editor_ai_suggestion_show');

        this.disposeKeyDownListener?.dispose();
        this.disposeKeyDownListener = this.editor.onKeyDown((event) => {
          if (
            event.browserEvent.key === 'Tab' &&
            !event.shiftKey &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey
          ) {
            event.preventDefault();
            event.stopPropagation();

            const model = this.editor.getModel();
            assert(model, 'Model is required');

            const position = this.editor.getPosition();
            assert(position, 'Position is required');

            model.pushEditOperations(
              [],
              [
                {
                  range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column,
                  },
                  text: this.suggestion ?? '',
                },
              ],
              () => null,
            );

            this.track('code_editor_ai_suggestion_accept');

            this.editor.removeContentWidget(this);
            this.disposeKeyDownListener?.dispose();
          }
        });
      }
    };

    void update();

    editor.onDidChangeCursorPosition((event) => {
      void update(event.position);
    });
  }

  async getSuggestion(codeBeforeCursor: string): Promise<string | undefined> {
    clearTimeout(this.timeout);

    await new Promise<void>((resolve) => {
      this.timeout = setTimeout(resolve, 1000) as unknown as number;
    });

    this.getSuggestionAbortController.abort();
    this.getSuggestionAbortController = new AbortController();

    if (!this.ai.googleAi) {
      return undefined;
    }

    const response = await this.ai.googleAi.models.generateContent({
      model: 'gemini-2.0-flash',
      config: {
        abortSignal: this.getSuggestionAbortController.signal,
        systemInstruction: developerPrompt,
        temperature: 0,
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: codeBeforeCursor }],
        },
      ],
    });

    if (response.text?.trim() === ';') {
      return undefined;
    }

    return response.text ?? undefined;
  }

  getId(): string {
    return AiSuggestionWidget.ID;
  }

  getDomNode(): HTMLElement {
    this.domNode?.remove();

    const cursorPosition = this.editor.getPosition();
    const cursorColumn = cursorPosition ? cursorPosition.column - 1 : 0;
    const leftPadding = Array(cursorColumn).fill(' ').join('');

    this.domNode = document.createElement('div');
    this.domNode.textContent = leftPadding + (this.suggestion ?? '');
    this.domNode.classList.add(
      'w-max',
      'pointer-events-none',
      'font-italic',
      'opacity-50',
      'whitespace-pre-wrap',
    );

    this.editor.applyFontInfo(this.domNode);

    return this.domNode;
  }

  getPosition(): editorType.IContentWidgetPosition | null {
    const cursorPosition = this.editor.getPosition();

    if (!cursorPosition) {
      return null;
    }

    return {
      position: { lineNumber: cursorPosition.lineNumber, column: 0 },
      preference: [this.monaco.editor.ContentWidgetPositionPreference.EXACT],
    };
  }

  dispose(): void {
    this.editor.removeContentWidget(this);
  }
}
