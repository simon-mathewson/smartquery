import React from 'react';
import CornerSvg from './Corner.svg?react';
import classNames from 'classnames';

export type CornerProps = {
  right?: boolean;
};

export const Corner: React.FC<CornerProps> = (props) => {
  const { right } = props;

  return (
    <CornerSvg
      className={classNames('absolute -left-2 bottom-0 fill-white', {
        '!left-auto -right-2 -scale-x-100': right,
      })}
    />
  );
};
