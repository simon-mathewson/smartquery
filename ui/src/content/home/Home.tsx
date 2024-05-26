import React from 'react';
import { Card } from '~/shared/components/card/Card';
import { ConnectionList } from '../connections/list/List';
import { Logo } from '~/shared/components/logo/Logo';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-2 pt-6">
      <Logo className="mb-4 w-16" />
      <Card className="w-max">
        <ConnectionList hideDatabases />
      </Card>
    </div>
  );
};
