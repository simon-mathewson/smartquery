import React from 'react';
import { TabsContext } from '~/content/tabs/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import type { InputMode } from '../types';
import type { Query } from '~/shared/types';
import type { ButtonSelectProps } from '~/shared/components/ButtonSelect/ButtonSelect';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import { Code, Search } from '@mui/icons-material';

export type InputModesSelectProps = {
  inputMode: InputMode | undefined;
  query: Query;
  setInputMode: React.Dispatch<React.SetStateAction<InputMode | undefined>>;
};

export const InputModesSelect: React.FC<InputModesSelectProps> = (props) => {
  const { inputMode, query, setInputMode } = props;

  const { queryResults } = useDefinedContext(TabsContext);

  const queryResult = query.id in queryResults ? queryResults[query.id] : null;

  if (!queryResult) return null;

  const options: ButtonSelectProps<'editor' | 'search'>['options'] = [
    {
      button: {
        color: 'primary',
        icon: <Code />,
        variant: 'default',
      },
      value: 'editor',
    },
  ];

  if (queryResult.columns) {
    options.push({
      button: {
        color: 'primary',
        icon: <Search />,
        variant: 'default',
      },
      value: 'search',
    });
  }

  return (
    <ButtonSelect<'editor' | 'search'>
      onChange={(newValue) => setInputMode(newValue)}
      options={options}
      selectedButton={{ variant: 'highlighted' }}
      value={inputMode}
    />
  );
};
