import { Code, Search, Tune } from '@mui/icons-material';
import React from 'react';
import type { ButtonSelectProps } from '~/shared/components/ButtonSelect/ButtonSelect';
import { ButtonSelect } from '~/shared/components/ButtonSelect/ButtonSelect';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { ResultContext } from '../Context';
import type { InputMode } from '../types';

export type InputModesSelectProps = {
  inputMode: InputMode | undefined;
  setInputMode: React.Dispatch<React.SetStateAction<InputMode | undefined>>;
};

export const InputModesSelect: React.FC<InputModesSelectProps> = (props) => {
  const { inputMode, setInputMode } = props;

  const { columns } = useDefinedContext(ResultContext);

  const options: ButtonSelectProps<InputMode>['options'] = [
    {
      button: {
        color: 'primary',
        icon: <Code />,
        variant: 'default',
      },
      value: 'editor',
    },
  ];

  if (columns) {
    options.push(
      {
        button: {
          color: 'primary',
          icon: <Search />,
          variant: 'default',
        },
        value: 'search',
      },
      {
        button: {
          color: 'primary',
          icon: <Tune />,
          variant: 'default',
        },
        value: 'filters',
      },
    );
  }

  return (
    <ButtonSelect<InputMode>
      onChange={(newValue) => setInputMode(newValue)}
      options={options}
      selectedButton={{ variant: 'highlighted' }}
      value={inputMode}
    />
  );
};
