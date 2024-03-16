import { ArrowForward } from '@mui/icons-material';
import React, { useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { Input } from '~/shared/components/Input/Input';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import type { Query } from '~/shared/types';
import { SearchContext } from './Context';

export type SearchProps = {
  query: Query;
};

export const Search: React.FC<SearchProps> = (props) => {
  const { query } = props;

  const { search, searchValue } = useDefinedContext(SearchContext);

  const [value, setValue] = useState<string>(searchValue ?? '');
  const [isChanged, setIsChanged] = useState(false);

  return (
    <form
      className="flex items-center gap-2 px-2 pb-2"
      onSubmit={(event) => {
        event.preventDefault();

        search(value);
        setIsChanged(false);
      }}
    >
      <Input
        autoFocus
        className="w-56"
        onChange={(newValue) => {
          setValue(newValue);
          setIsChanged(true);
        }}
        placeholder={`Search ${query.table ?? 'results'}`}
        value={value}
      />
      {isChanged && (
        <Button
          color="primary"
          icon={<ArrowForward />}
          size="small"
          type="submit"
          variant="filled"
        />
      )}
    </form>
  );
};
