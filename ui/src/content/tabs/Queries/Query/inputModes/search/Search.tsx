import { Send } from '@mui/icons-material';
import React, { useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import { Input } from '~/shared/components/input/Input';
import { useSearch } from './useSearch';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ResultContext } from '../../Context';

export const Search: React.FC = () => {
  const { table } = useDefinedContext(ResultContext);

  const { search, searchValue } = useSearch();

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
        className="!w-56"
        onChange={(newValue) => {
          setValue(newValue);
          setIsChanged(true);
        }}
        placeholder={`Search ${table}`}
        value={value}
      />
      {isChanged && <Button color="primary" icon={<Send />} type="submit" variant="filled" />}
    </form>
  );
};
