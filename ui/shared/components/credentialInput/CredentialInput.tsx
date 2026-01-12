import { Input } from '../input/Input';
import { replaceLineBreaksWithPlaceholders, replacePlaceholdersWithLineBreaks } from './utils';

export type CredentialInputProps = {
  htmlProps?: React.HTMLProps<HTMLInputElement>;
  isExistingCredential?: boolean;
  onChange?: (newValue: string) => void;
  username: string;
};

export const CredentialInput: React.FC<CredentialInputProps> = (props) => {
  const { htmlProps, isExistingCredential, onChange, username } = props;

  return (
    <>
      <Input
        htmlProps={{
          autoComplete: 'username',
          readOnly: true,
          tabIndex: -1,
          value: username,
        }}
        wrapperProps={{ className: 'absolute h-0 w-0 overflow-hidden' }}
      />
      <Input
        htmlProps={{
          ...htmlProps,
          autoComplete: isExistingCredential ? 'current-password' : 'new-password',
          onPaste: (event) => {
            // Listen to paste event to preserve line breaks
            event.preventDefault();
            const newValue = event.clipboardData.getData('text/plain');
            onChange?.(replacePlaceholdersWithLineBreaks(newValue));
          },
          type: 'password',
          value:
            typeof htmlProps?.value === 'string'
              ? replaceLineBreaksWithPlaceholders(htmlProps.value)
              : undefined,
        }}
        onChange={(newValue) => onChange?.(replacePlaceholdersWithLineBreaks(newValue))}
      />
    </>
  );
};
