import React, { useContext } from 'react';
import { ResultContext } from '../Context';
import type { InputMode } from '../types';
import { Filters } from './filters/Filters';
import { Search } from './search/Search';
import { Sql } from './sql/Sql';

export type InputModesProps = {
  inputMode: InputMode | undefined;
};

export const InputModes: React.FC<InputModesProps> = (props) => {
  const { inputMode } = props;

  const result = useContext(ResultContext);

  if (!inputMode) return null;

  if (inputMode === 'editor') {
    return <Sql />;
  }

  if (!result?.columns) return null;

  if (inputMode === 'search') {
    return <Search />;
  }

  return <Filters />;
};
