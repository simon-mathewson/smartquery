import React, { useState } from 'react';
import { Card } from '~/shared/components/card/Card';
import { ConnectionList } from '../connections/list/List';
import { Logo } from '~/shared/components/logo/Logo';

export const Home: React.FC = () => {
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 pt-6">
      <Logo className="w-16" />
      <Card className="w-max">
        <ConnectionList
          hideDatabases
          isAddingOrEditing={isAddingOrEditing}
          setIsAddingOrEditing={setIsAddingOrEditing}
        />
      </Card>
    </div>
  );
};
