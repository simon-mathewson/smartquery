import { DeleteOutlined } from '@mui/icons-material';
import { useCallback, useState } from 'react';
import { AuthContext } from '~/content/auth/Context';
import { CloudApiContext } from '~/content/cloud/api/Context';
import { ToastContext } from '~/content/toast/Context';
import { Button } from '~/shared/components/button/Button';
import { Field } from '~/shared/components/field/Field';
import { Input } from '~/shared/components/input/Input';
import { Modal } from '~/shared/components/modal/Modal';
import { useModal } from '~/shared/components/modal/useModal';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';

export const DeleteAccount: React.FC = () => {
  const modal = useModal();
  const { user, logOut } = useDefinedContext(AuthContext);

  const toast = useDefinedContext(ToastContext);
  const { cloudApi } = useDefinedContext(CloudApiContext);

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState<string | undefined>(undefined);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsDeleting(true);

      try {
        await cloudApi.auth.deleteAccount.mutate();
        await logOut({ silent: true });
        modal.close();
        toast.add({
          title: 'Account deleted',
          description: 'Your account has been deleted successfully',
          color: 'success',
        });
      } catch (error) {
        toast.add({
          title: 'Failed to delete account',
          description: error instanceof Error ? error.message : undefined,
          color: 'danger',
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [cloudApi.auth.deleteAccount, logOut, modal, toast],
  );

  if (!user) {
    return null;
  }

  return (
    <>
      <Modal {...modal} htmlProps={{ className: 'w-[320px]' }} title="Delete Account">
        <div className="flex flex-col gap-4">
          <div className="text-sm text-textSecondary">
            Are you sure you want to delete your account? All of your data will be deleted
            permanently. Please enter your email address to confirm.
          </div>
          <form onSubmit={onSubmit} className="flex flex-col gap-2">
            <Field label="Email">
              <Input
                htmlProps={{
                  autoFocus: true,
                  disabled: isDeleting,
                  placeholder: user.email,
                  type: 'email',
                }}
                onChange={setConfirmedEmail}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Button
                htmlProps={{
                  disabled: isDeleting,
                  onClick: () => modal.close(),
                }}
                label="Cancel"
              />
              <Button
                color="danger"
                htmlProps={{
                  disabled: isDeleting || confirmedEmail !== user?.email,
                  type: 'submit',
                }}
                label="Delete"
                icon={<DeleteOutlined />}
                variant="filled"
              />
            </div>
          </form>
        </div>
      </Modal>
      <Button
        align="left"
        color="danger"
        htmlProps={{
          onClick: () => modal.open(),
        }}
        icon={<DeleteOutlined />}
        label="Delete Account"
      />
    </>
  );
};
