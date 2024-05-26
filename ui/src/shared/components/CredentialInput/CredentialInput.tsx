import { EnhancedEncryptionOutlined } from '@mui/icons-material';
import { Button } from '../Button/Button';
import type { InputProps } from '../Input/Input';
import { Input } from '../Input/Input';
import { useCallback } from 'react';
import {
  getIsCredentialsApiAvailable,
  replaceLineBreaksWithPlaceholders,
  replacePlaceholdersWithLineBreaks,
} from './utils';

export type CredentialInputProps = InputProps & {
  isExistingCredential?: boolean;
  showAddToKeychain?: boolean;
  username: string;
  value: string;
};

export const CredentialInput: React.FC<CredentialInputProps> = (props) => {
  const { isExistingCredential, showAddToKeychain, username, ...inputProps } = props;

  const storeInKeyChain = useCallback(() => {
    void navigator.credentials.store(
      new PasswordCredential({
        id: username,
        password: replaceLineBreaksWithPlaceholders(inputProps.value),
      }),
    );
  }, [inputProps.value, username]);

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
