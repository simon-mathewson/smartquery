import classNames from 'classnames';
import { CodeEditor } from '../codeEditor/CodeEditor';
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror';

export type CodeInputProps = {
  editorProps?: ReactCodeMirrorProps;
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
        'min-h-[36px] w-full overflow-hidden rounded-lg border-[1.5px] border-border bg-background pt-[3px] focus-within:overflow-auto focus:border-primary',
        {
          'cursor-pointer opacity-50': editorProps?.readOnly,
        },
        htmlProps?.className,
      )}
    >
      <CodeEditor
        editorProps={editorProps}
        hideLineNumbers
        language={language}
        onChange={onChange}
      />
    </div>
  );
};
