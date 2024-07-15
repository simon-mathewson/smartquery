import { EnhancedEncryptionOutlined } from '@mui/icons-material';
import { Button } from '../button/Button';
import type { InputProps } from '../input/Input';
import { Input } from '../input/Input';
import { useCallback, useRef } from 'react';
import {
  getIsCredentialsApiAvailable,
  replaceLineBreaksWithPlaceholders,
  replacePlaceholdersWithLineBreaks,
} from './utils';
import { assert } from 'ts-essentials';

export type CredentialInputProps = InputProps & {
  isExistingCredential?: boolean;
  showAddToKeychain?: boolean;
  username: string;
  value: string;
};

export const CredentialInput: React.FC<CredentialInputProps> = (props) => {
  const { isExistingCredential, showAddToKeychain, username, ...inputProps } = props;

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
      <Input autoComplete="username" className="hidden" value={username} />
      <div className="flex w-full items-center gap-2">
        <Input
          {...inputProps}
          autoComplete={isExistingCredential ? 'current-password' : 'new-password'}
          onChange={(newValue) =>
            inputProps.onChange?.(replacePlaceholdersWithLineBreaks(newValue))
          }
          onPaste={(event) => {
            // Listen to paste event to preserve line breaks
            event.preventDefault();
            const newValue = event.clipboardData.getData('text/plain');
            inputProps.onChange?.(replacePlaceholdersWithLineBreaks(newValue));
          }}
          ref={ref}
          type="password"
          value={replaceLineBreaksWithPlaceholders(inputProps.value)}
        />
        {getIsCredentialsApiAvailable() && showAddToKeychain && (
          <Button icon={<EnhancedEncryptionOutlined />} onClick={storeInKeyChain} />
        )}
      </div>
    </>
  );
};
