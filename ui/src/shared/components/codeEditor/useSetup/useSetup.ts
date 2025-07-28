import * as monaco from 'monaco-editor';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { setUpThemes } from './setUpThemes';
import type { editor } from 'monaco-editor';
import type { CodeEditorProps } from '../CodeEditor';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ThemeContext } from '~/content/theme/Context';
import { useAutocomplete } from '../useAutocomplete/useAutocomplete';
import { getIsWindows } from '~/shared/utils/getIsWindows/getIsWindows';
import { AiSuggestionWidget } from '../aiSuggestion/widget';
import { AnalyticsContext } from '~/content/analytics/Context';
import { AiContext } from '~/content/ai/Context';
import { assert } from 'ts-essentials';
import { getMonacoLanguage } from '../getMonacoLanguage';

export const useSetup = (props: {
  editorProps: CodeEditorProps;
  editorRef: React.MutableRefObject<editor.IStandaloneCodeEditor | null>;
  hasActions: boolean;
  hasBottomToolbar: boolean;
  overrideOptions?: editor.IEditorOptions;
}) => {
  const {
    editorProps: {
      autoFocus,
      getAdditionalSystemInstructions,
      height,
      hideLineNumbers,
      large,
      language,
      maxHeight,
      onBlur,
      onChange,
      onFocus,
      readOnly,
      submit,
      value,
    },
    editorRef,
    hasActions,
    hasBottomToolbar,
    overrideOptions,
  } = props;

  const { mode } = useDefinedContext(ThemeContext);
  const { track } = useDefinedContext(AnalyticsContext);
  const ai = useDefinedContext(AiContext);

  const containerRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const disposablesRef = useRef<monaco.IDisposable[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const defaultPaddingTop = large ? 12 : 6;
  const [paddingTop, setPaddingTop] = useState(defaultPaddingTop);

  const defaultPaddingBottom = large ? 12 : 6;
  const [paddingBottom, setPaddingBottom] = useState(defaultPaddingBottom);

  const monacoLanguage = getMonacoLanguage(language);

  const options = useMemo<editor.IEditorOptions & editor.IGlobalEditorOptions>(
    () => ({
      theme: mode === 'light' ? 'vs-custom' : 'vs-dark-custom',
      folding: false,
      fontSize: 12,
      glyphMargin: true,
      lineDecorationsWidth: hideLineNumbers ? 0 : 16,
      lineHeight: 18,
      lineNumbers: hideLineNumbers ? 'off' : undefined,
      lineNumbersMinChars: 2,
      minimap: { enabled: false },
      overviewRulerLanes: 0,
      renderLineHighlight: readOnly ? 'none' : 'line',
      renderLineHighlightOnlyWhenFocus: true,
      padding: { top: paddingTop, bottom: paddingBottom },
      readOnly,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
      },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      ...(overrideOptions ?? {}),
    }),
    [hideLineNumbers, mode, overrideOptions, paddingBottom, paddingTop, readOnly],
  );

  const { setUpAutocomplete } = useAutocomplete();

  const setUpLanguage = useCallback(
    (monacoLanguage: string) => {
      const disposables = setUpAutocomplete({ language, monacoLanguage });
      disposablesRef.current.push(...disposables);
    },
    [language, setUpAutocomplete],
  );

  const setHeight = useCallback(() => {
    assert(editorRef.current);

    const initialHeight = height ?? (large ? 80 : 30);

    const contentHeight = Math.min(
      maxHeight ?? Infinity,
      Math.max(initialHeight, editorRef.current.getContentHeight()),
    );

    // Update the container height
    if (containerRef.current) {
      containerRef.current.style.height = `${contentHeight}px`;
    }

    // Update the host div height
    if (hostRef.current) {
      hostRef.current.style.height = `${contentHeight}px`;
    }

    editorRef.current.layout({
      width: editorRef.current.getContainerDomNode().clientWidth,
      height: contentHeight,
    });
  }, [editorRef, height, large, maxHeight]);

  // Initialize editor
  useEffect(() => {
    if (!hostRef.current || editorRef.current) return;

    setUpThemes();

    editorRef.current = monaco.editor.create(hostRef.current, {
      value: value || '',
      language: monacoLanguage,
      ...options,
    });

    setIsLoading(false);

    disposablesRef.current.push(...setUpAutocomplete({ language, monacoLanguage }));

    editorRef.current.onDidChangeModelContent(() => {
      const currentValue = editorRef.current?.getValue() || '';
      onChange?.(currentValue);
    });

    if (submit) {
      disposablesRef.current.push(
        editorRef.current.onKeyDown((event) => {
          const isWindows = getIsWindows();
          const { browserEvent } = event;

          if (
            browserEvent.key === 'Enter' &&
            !browserEvent.shiftKey &&
            !browserEvent.altKey &&
            !browserEvent.repeat &&
            ((isWindows && browserEvent.ctrlKey && !browserEvent.metaKey) ||
              (!isWindows && !browserEvent.ctrlKey && browserEvent.metaKey))
          ) {
            browserEvent.stopPropagation();

            if (editorRef.current?.getValue()) {
              submit?.();
            }
          }
        }),
      );
    }

    editorRef.current.getModel()?.setEOL(monaco.editor.EndOfLineSequence.LF);

    if (autoFocus) {
      setTimeout(() => {
        editorRef.current?.focus();
        onFocus?.();
      }, 100);
    }
    if (onFocus) {
      disposablesRef.current.push(editorRef.current.onDidFocusEditorText(onFocus));
    }
    if (onBlur) {
      disposablesRef.current.push(editorRef.current.onDidBlurEditorText(onBlur));
    }

    if (!readOnly) {
      new AiSuggestionWidget(
        editorRef.current,
        monaco,
        ai,
        track,
        hostRef,
        options,
        getAdditionalSystemInstructions,
        language,
      );
    }

    setIsInitialized(true);

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      disposablesRef.current.forEach((disposable) => disposable.dispose());
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update language
  useEffect(() => {
    if (!isInitialized) return;
    assert(editorRef.current);

    const model = editorRef.current.getModel();

    if (model && model.getLanguageId() !== monacoLanguage) {
      monaco.editor.setModelLanguage(model, monacoLanguage);

      setUpLanguage(monacoLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, monacoLanguage]);

  // Update value
  useEffect(() => {
    if (!isInitialized) return;
    assert(editorRef.current);

    if (value !== undefined) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        editorRef.current.setValue(value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, value]);

  // Update theme
  useEffect(() => {
    if (!isInitialized) return;
    assert(editorRef.current);

    if (editorRef.current) {
      monaco.editor.setTheme(mode === 'light' ? 'vs-custom' : 'vs-dark-custom');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, mode]);

  // Update height
  useEffect(() => {
    if (!isInitialized) return;
    assert(editorRef.current);

    const dispose = editorRef.current.onDidContentSizeChange(setHeight);

    setHeight();

    return () => {
      dispose.dispose();
    };
  }, [editorRef, isInitialized, setHeight]);

  // Update options
  useEffect(() => {
    if (!isInitialized) return;
    assert(editorRef.current);

    if (options) {
      editorRef.current.updateOptions(options);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, options]);

  useEffect(() => {
    if (hasActions) {
      setPaddingTop(36);
    } else {
      setPaddingTop(defaultPaddingTop);
    }
  }, [defaultPaddingTop, hasActions]);

  useEffect(() => {
    if (hasBottomToolbar) {
      setPaddingBottom(56);
    } else {
      setPaddingBottom(defaultPaddingBottom);
    }
  }, [defaultPaddingBottom, hasBottomToolbar]);

  return useMemo(
    () => ({ containerRef, hostRef, isInitialized, isLoading }),
    [containerRef, hostRef, isInitialized, isLoading],
  );
};
