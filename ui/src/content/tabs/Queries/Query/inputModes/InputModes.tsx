import React, { useContext } from 'react';
import { TabsContext } from '~/content/tabs/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import type { InputMode } from '../types';
import { SqlEditor } from '~/shared/components/SqlEditor/SqlEditor';
import { Search } from './search/Search';
import { QueryContext, ResultContext } from '../Context';

export type InputModesProps = {
  inputMode: InputMode | undefined;
};

export const InputModes: React.FC<InputModesProps> = (props) => {
  const { inputMode } = props;

  const { runQuery, updateQuery } = useDefinedContext(TabsContext);

  const { query } = useDefinedContext(QueryContext);

  const result = useContext(ResultContext);

  if (inputMode === 'editor') {
    return (
      <div className="px-2 pb-2">
        <SqlEditor
          onChange={(sql) => updateQuery({ id: query.id, sql })}
          onSubmit={() => runQuery(query.id)}
          value={query.sql ?? ''}
        />
      </div>
    );
  }

  if (inputMode === 'search' && result) {
    return <Search />;
  }

  return null;
};
