import classNames from 'classnames';
import { CodeEditor } from '../CodeEditor/CodeEditor';

type CodeInputProps = {
  autoFocus?: boolean;
  language: 'sql' | 'json';
  onChange?: (value: string) => void;
  onClick?: () => void;
  readOnly?: boolean;
  value: string | undefined;
};

export const CodeInput: React.FC<CodeInputProps> = (props) => {
  const { autoFocus, language, onChange, onClick, readOnly, value } = props;

  return (
    <div
      className={classNames(
        'min-h-[36px] w-full overflow-hidden rounded-lg border-[1.5px] border-gray-300 bg-gray-50 pt-[3px] focus:border-blue-600',
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
        value={value}
      />
    </div>
  );
};
