import React from 'react';
import { Card } from '~/shared/components/card/Card';
import { Connections } from '../connections/Connections';
import { Logo } from '~/shared/components/logo/Logo';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-2 pt-6">
      <Logo htmlProps={{ className: 'mb-4 w-16' }} />
      <Card htmlProps={{ className: 'w-max' }}>
        <Connections hideDatabases />
      </Card>
    </div>
  );
};
