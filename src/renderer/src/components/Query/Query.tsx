import React, { useState } from 'react';
import { Query as QueryType } from '../../types';
import { Table } from './Table/Table';
import { Editor } from './Editor/Editor';
import { Button } from '../shared/Button/Button';
import { Code } from '@mui/icons-material';
import { Header } from '../shared/Header/Header';
import classNames from 'classnames';

export type QueryProps = {
  query: QueryType;
};

export const Query: React.FC<QueryProps> = (props) => {
  const { query } = props;

  const [showEditor, setShowEditor] = useState(query.showEditor);
  const [hasResults, setHasResults] = useState(false);

  return (
    <div
      className={classNames(
        'relative flex w-full flex-grow flex-col gap-2 overflow-hidden bg-gray-50 p-2',
      )}
    >
      <Header
        left={
          hasResults ? (
            <Button
              icon={<Code />}
              onClick={() => setShowEditor((current) => !current)}
              selected={showEditor}
            />
          ) : null
        }
        title=""
      />
      {showEditor && <Editor query={query} />}
      <Table hasResults={hasResults} query={query} setHasResults={setHasResults} />
    </div>
  );
};
