import { spy } from 'tinyspy';
import type { SshFormSectionProps } from './SshFormSection';

export const getProps = () =>
  ({
    setFormValue: spy(),
    formValues: {
      credentialStorage: 'plain',
      ssh: {
        credentialType: 'password',
        host: 'localhost',
        password: 'password',
        port: 22,
        privateKey: '',
        user: 'root',
      },
    },
  }) satisfies SshFormSectionProps;
