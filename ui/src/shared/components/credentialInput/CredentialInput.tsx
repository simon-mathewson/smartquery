import { EnhancedEncryptionOutlined } from '@mui/icons-material';
import { Button } from '../button/Button';
import { Input } from '../input/Input';
import { useCallback, useRef } from 'react';
import {
  getIsCredentialsApiAvailable,
  replaceLineBreaksWithPlaceholders,
  replacePlaceholdersWithLineBreaks,
} from './utils';
import { assert } from 'ts-essentials';

export type CredentialInputProps = {
  htmlProps?: React.HTMLProps<HTMLInputElement>;
  isExistingCredential?: boolean;
  onChange?: (newValue: string) => void;
  showAddToKeychain?: boolean;
  username: string;
};

export const CredentialInput: React.FC<CredentialInputProps> = (props) => {
  const { htmlProps, isExistingCredential, onChange, showAddToKeychain, username } = props;

  const ref = useRef<HTMLInputElement>(null);

  const storeInKeyChain = useCallback(() => {
    const password = ref.current?.value;
    assert(password !== undefined);

    void navigator.credentials.store(
      new PasswordCredential({
        id: username,
        password: password,
      }),
    );
  }, [username]);

  return (
    <>
      <Input
        hidden
        htmlProps={{
          autoComplete: 'username',
          readOnly: true,
          value: username,
        }}
      />
      <div className="flex w-full items-center gap-2">
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
            ref,
            type: 'password',
            value:
              typeof htmlProps?.value === 'string'
                ? replaceLineBreaksWithPlaceholders(htmlProps.value)
                : undefined,
          }}
          onChange={(newValue) => onChange?.(replacePlaceholdersWithLineBreaks(newValue))}
        />
        {getIsCredentialsApiAvailable() && showAddToKeychain && (
          <Button htmlProps={{ onClick: storeInKeyChain }} icon={<EnhancedEncryptionOutlined />} />
        )}
      </div>
    </>
  );
};
