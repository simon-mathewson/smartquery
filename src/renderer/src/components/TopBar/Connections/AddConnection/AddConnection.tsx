import { Add, ArrowBackIos } from '@mui/icons-material';
import { Button } from '@renderer/components/shared/Button/Button';
import { Input } from '@renderer/components/shared/Input/Input';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React, { useState } from 'react';

export type AddConnectionProps = {
  setIsAdding: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AddConnection: React.FC<AddConnectionProps> = (props) => {
  const { setIsAdding } = props;

  const { setConnections } = useDefinedContext(GlobalContext);

  const [name, setName] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  return (
    <>
      <form
        className="mx-auto grid w-full max-w-sm gap-3"
        onSubmit={(event) => {
          event.preventDefault();

          if (!name || !url) return;

          const [host, portAndDatabase] = url.split(':');
          const [port, database] = portAndDatabase.split('/');
          setConnections((connections) => [
            ...connections,
            { database, host, name, port: Number(port) },
          ]);
          setIsAdding(false);
        }}
      >
        <div className="text-md mt-1 text-center font-medium text-gray-700">Add Connection</div>
        <Input label="Name" onChange={setName} value={name} />
        <Input label="Connection URL" onChange={setUrl} value={url} />
        <div className="mt-2 flex items-center gap-2">
          <Button icon={<ArrowBackIos />} label="Back" onClick={() => setIsAdding(false)} />
          <Button icon={<Add />} label="Add" primary type="submit" />
        </div>
      </form>
    </>
  );
};
