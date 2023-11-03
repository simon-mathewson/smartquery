import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import React, { useState } from 'react';

export const AddConnection: React.FC = () => {
  const { setConnections } = useDefinedContext(GlobalContext);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  return (
    <>
      <form
        className="mx-auto grid w-full max-w-sm gap-4 p-8 pt-16"
        onSubmit={() => {
          const [host, portAndDatabase] = url.split(':');
          const [port, database] = portAndDatabase.split('/');
          setConnections((connections) => [
            ...connections,
            { database, host, name, port: Number(port) },
          ]);
        }}
      >
        <div className="mb-2 text-center text-3xl font-medium text-gray-700">Add Connection</div>
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
        <button className="mt-2 rounded-lg bg-blue-600 p-2 font-medium text-white" type="submit">
          Add
        </button>
      </form>
    </>
  );
};
