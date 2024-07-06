import classNames from 'classnames';
import { CodeEditor } from '../codeEditor/CodeEditor';

type CodeInputProps = {
  autoFocus?: boolean;
  className?: string;
  language: 'sql' | 'json';
  onChange?: (value: string) => void;
  onClick?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  value: string | undefined;
};

export const CodeInput: React.FC<CodeInputProps> = (props) => {
  const { autoFocus, className, language, onChange, onClick, placeholder, readOnly, value } = props;

  return (
    <div
      className={classNames(
        'min-h-[36px] w-full overflow-hidden rounded-lg border-[1.5px] border-border bg-background pt-[3px] focus-within:overflow-auto focus:border-primary',
        {
          'cursor-pointer opacity-50': readOnly,
        },
        className,
      )}
      onClick={onClick}
    >
      <CodeEditor
        autoFocus={autoFocus}
        hideLineNumbers
        language={language}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
};
