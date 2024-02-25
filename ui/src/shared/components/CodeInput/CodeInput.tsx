import classNames from 'classnames';
import { CodeEditor } from '../CodeEditor/CodeEditor';

type CodeInputProps = {
  autoFocus?: boolean;
  language: 'sql' | 'json';
  onChange?: (value: string) => void;
  onClick?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  value: string | undefined;
};

export const CodeInput: React.FC<CodeInputProps> = (props) => {
  const { autoFocus, language, onChange, onClick, placeholder, readOnly, value } = props;

  return (
    <div
      className={classNames(
        'border-border bg-background focus:border-primary min-h-[36px] w-full overflow-hidden rounded-lg border-[1.5px] pt-[3px]',
        {
          'cursor-pointer opacity-50': readOnly,
        },
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
