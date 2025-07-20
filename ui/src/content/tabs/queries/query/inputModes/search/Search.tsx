import { Send } from '@mui/icons-material';
import React, { useState } from 'react';
import { Button } from '~/shared/components/button/Button';
import { Input } from '~/shared/components/input/Input';
import { useSearch } from './useSearch';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { ResultContext } from '../../Context';
import { AnalyticsContext } from '~/content/analytics/Context';

export const Search: React.FC = () => {
  const { track } = useDefinedContext(AnalyticsContext);
  const { table } = useDefinedContext(ResultContext);

  const { search, searchValue } = useSearch();

  const [value, setValue] = useState<string>(searchValue ?? '');
  const [isChanged, setIsChanged] = useState(false);

  return (
    <form
      className="flex items-center gap-2 px-2 pb-2"
      onSubmit={(event) => {
        event.preventDefault();

        void search(value);
        setIsChanged(false);

        track('query_search_submit');
      }}
    >
      <Input
        htmlProps={{
          autoFocus: true,
          className: '!w-56',
          placeholder: `Search ${table}`,
          value,
        }}
        onChange={(newValue) => {
          setValue(newValue);
          setIsChanged(true);
        }}
      />
      {isChanged && (
        <Button color="primary" icon={<Send />} htmlProps={{ type: 'submit' }} variant="filled" />
      )}
    </form>
  );
};
