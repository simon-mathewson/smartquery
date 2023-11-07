import { ArrowBackIos } from '@mui/icons-material';
import { Button } from '@renderer/components/shared/Button/Button';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React, { useState } from 'react';

export type AddConnectionProps = {
  setIsAdding: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AddConnection: React.FC<AddConnectionProps> = (props) => {
  const { setIsAdding } = props;

  const { setConnections } = useDefinedContext(GlobalContext);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  return (
    <>
      <form
        className="mx-auto grid w-full max-w-sm gap-2"
        onSubmit={() => {
          const [host, portAndDatabase] = url.split(':');
          const [port, database] = portAndDatabase.split('/');
          setConnections((connections) => [
            ...connections,
            { database, host, name, port: Number(port) },
          ]);
          setIsAdding(false);
        }}
      >
        <Button icon={<ArrowBackIos />} label="Back" onClick={() => setIsAdding(false)} />
        <div className="text-md mt-1 text-center font-medium text-gray-700">Add Connection</div>
        <label className="grid gap-1 text-gray-500 focus-within:text-blue-600">
          <div className="pl-1 text-sm font-medium">Name</div>
          <input
            onChange={(event) => setName(event.target.value)}
            value={name}
            className="block w-full rounded-lg border-2 border-gray-300 p-2 text-gray-700 outline-none focus:border-blue-600"
          />
        </label>
        <label className="grid gap-1 text-gray-500 focus-within:text-blue-600">
          <div className="pl-1 text-sm font-medium">Connection URL</div>
          <input
            onChange={(event) => setUrl(event.target.value)}
            value={url}
            className="block w-full rounded-lg border-2 border-gray-300 p-2 text-gray-700 outline-none focus:border-blue-600"
          />
        </label>
        <Button className="mt-2" label="Add" primary type="submit" />
      </form>
    </>
  );
};
