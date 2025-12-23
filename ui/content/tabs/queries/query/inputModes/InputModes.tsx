import React from 'react';
import type { InputMode } from '../types';
import { Filters } from './filters/Filters';
import { Search } from './search/Search';
import { Sql } from './sql/Sql';

export type InputModesProps = {
  inputMode: InputMode | undefined;
};

export const InputModes: React.FC<InputModesProps> = (props) => {
  const { inputMode } = props;

  if (!inputMode) return null;

  if (inputMode === 'editor') {
    return <Sql />;
  }

  if (inputMode === 'search') {
    return <Search />;
  }

  return <Filters />;
};
