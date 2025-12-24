import { EnhancedEncryptionOutlined } from '@mui/icons-material';
import { useCallback, useRef } from 'react';
import { assert } from 'ts-essentials';
import { NativeContext } from '~/content/native/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { Button } from '../button/Button';
import { Input } from '../input/Input';
import { replaceLineBreaksWithPlaceholders, replacePlaceholdersWithLineBreaks } from './utils';

export type CredentialInputProps = {
  htmlProps?: React.HTMLProps<HTMLInputElement>;
  isExistingCredential?: boolean;
  onChange?: (newValue: string) => void;
  showAddToKeychain?: boolean;
  username: string;
};

export const CredentialInput: React.FC<CredentialInputProps> = (props) => {
  const { htmlProps, isExistingCredential, onChange, showAddToKeychain, username } = props;

  const native = useDefinedContext(NativeContext);

  const ref = useRef<HTMLInputElement>(null);

  const canAddToKeychain = 'credentials' in navigator || native.isReactNative;

  const addToKeychain = useCallback(() => {
    const password = ref.current?.value;
    assert(password !== undefined);

    if (native.isReactNative) {
      void native.addToKeychain(username, password).then(console.log);
      return;
    }

    void navigator.credentials.store(
      new PasswordCredential({
        id: username,
        password: password,
      }),
    );
  }, [username, native]);

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
        {canAddToKeychain && showAddToKeychain && (
          <Button
            htmlProps={{ onClick: addToKeychain }}
            icon={<EnhancedEncryptionOutlined />}
            tooltip="Add to keychain"
          />
        )}
      </div>
    </>
  );
};
