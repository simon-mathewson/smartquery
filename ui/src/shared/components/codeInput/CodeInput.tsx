import classNames from 'classnames';
import type { CodeEditorProps } from '../codeEditor/CodeEditor';
import { CodeEditor } from '../codeEditor/CodeEditor';

export type CodeInputProps = {
  editorProps?: CodeEditorProps;
  htmlProps?: React.HTMLProps<HTMLDivElement>;
  language: 'sql' | 'json';
  onChange?: (value: string) => void;
};

export const CodeInput: React.FC<CodeInputProps> = (props) => {
  const { editorProps, htmlProps, language, onChange } = props;

  return (
    <div
      {...htmlProps}
      className={classNames(
        'min-h-[36px] w-full overflow-hidden rounded-lg border-[1.5px] border-border bg-background focus-within:overflow-auto focus:border-primary',
        {
          'cursor-pointer opacity-50': editorProps?.readOnly,
        },
        htmlProps?.className,
      )}
    >
      <CodeEditor {...editorProps} hideLineNumbers language={language} onChange={onChange} />
    </div>
  );
};
