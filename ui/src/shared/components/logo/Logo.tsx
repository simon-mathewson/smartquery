import React from 'react';
import LogoSvg from './logo.svg?react';
import classNames from 'classnames';

export type LogoProps = {
  htmlProps?: React.SVGProps<SVGSVGElement>;
};

export const Logo: React.FC<LogoProps> = (props) => {
  const { htmlProps } = props;

  return (
    <LogoSvg
      {...htmlProps}
      className={classNames('h-12 w-12 [&>path]:fill-primary', htmlProps?.className)}
    />
  );
};
