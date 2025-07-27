import type { editor as editorType } from 'monaco-editor';
import type * as monacoType from 'monaco-editor';
import { assert } from 'ts-essentials';
import type { useAi } from '~/content/ai/useAi';
import type { AnalyticsContextType } from '~/content/analytics/Context';
import { getSystemInstructions } from './getSystemInstructions';
import type { CodeEditorProps } from '../CodeEditor';

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
    private readonly wrapperRef: React.RefObject<HTMLDivElement>,
    private readonly options: monacoType.editor.IEditorOptions,
    private readonly getAdditionalSystemInstructions?: () => Promise<string | null>,
    private readonly language?: CodeEditorProps['language'],
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

    if (!this.ai.enabled) {
      return undefined;
    }

    const additionalSystemInstructions = this.getAdditionalSystemInstructions
      ? await this.getAdditionalSystemInstructions()
      : null;

    const stream = await this.ai.generateContent({
      abortSignal: this.getSuggestionAbortController.signal,
      contents: [
        {
          role: 'user',
          parts: [{ text: codeBeforeCursor }],
        },
      ],
      systemInstructions: getSystemInstructions(additionalSystemInstructions, this.language),
      temperature: 0,
    });

    let responseText = '';

    for await (const chunk of stream) {
      responseText += chunk ?? '';
    }

    if (responseText.trim() === ';') {
      return undefined;
    }

    return (
      responseText
        // Gemini will return escaped newline characters even when telling it not to. Therefore, we are
        // replacing them here.
        .replace(/\\n/g, '\n')
        // Remove unwanted markdown formatting
        .replace(/(^```sql[\s]*)|(\s*```)/g, '') || undefined
    );
  }

  getId(): string {
    return AiSuggestionWidget.ID;
  }

  getDomNode(): HTMLElement {
    this.domNode?.remove();

    this.domNode = document.createElement('div');
    this.domNode.classList.add(
      'break-all',
      'font-italic',
      'opacity-50',
      'pointer-events-none',
      'w-max',
      'whitespace-break-spaces',
    );

    this.editor.applyFontInfo(this.domNode);

    const wrapper = this.wrapperRef.current;
    assert(wrapper);
    const cursor = wrapper.querySelector<HTMLDivElement>('.cursor');
    assert(cursor);
    const characterWidth = (7.23 / 12) * this.options.fontSize!;

    const code = wrapper.querySelector<HTMLDivElement>('.view-lines');
    assert(code);

    const paddingRight = Math.round(2 * characterWidth);
    const codeWidth = code.offsetWidth - paddingRight;
    const codeWidthWithoutPartialCharacters = codeWidth - (codeWidth % characterWidth);

    const actualColumn = Math.ceil(cursor.offsetLeft / characterWidth);
    const actualLine = Math.ceil(
      (cursor.offsetTop - this.options.padding!.top!) / this.options.lineHeight!,
    );
    const paddingSize =
      actualLine * Math.round(codeWidthWithoutPartialCharacters / characterWidth) + actualColumn;

    this.domNode.textContent = Array(paddingSize).fill(' ').join('') + (this.suggestion ?? '');
    this.domNode.style.paddingRight = `${paddingRight}px`;

    return this.domNode;
  }

  getPosition(): editorType.IContentWidgetPosition | null {
    return {
      position: { lineNumber: 0, column: 0 },
      preference: [this.monaco.editor.ContentWidgetPositionPreference.EXACT],
    };
  }

  dispose(): void {
    this.editor.removeContentWidget(this);
  }
}
