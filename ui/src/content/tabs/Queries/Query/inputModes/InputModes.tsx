import React from 'react';
import { TabsContext } from '~/content/tabs/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import type { Query } from '~/shared/types';
import type { InputMode } from '../types';
import { SqlEditor } from '~/shared/components/SqlEditor/SqlEditor';
import { Search } from './search/Search';

export type InputModesProps = {
  inputMode: InputMode | undefined;
  query: Query;
};

export const InputModes: React.FC<InputModesProps> = (props) => {
  const { inputMode, query } = props;

  const { updateQuery } = useDefinedContext(TabsContext);

  if (inputMode === 'editor') {
    return (
      <div className="px-2 pb-2">
        <SqlEditor initialValue={query.sql ?? ''} onSubmit={(sql) => updateQuery(query.id, sql)} />
      </div>
    );
  }

  if (inputMode === 'search') {
    return <Search query={query} />;
  }

  return null;
};
