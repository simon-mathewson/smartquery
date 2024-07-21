import React from 'react';

export type LogoProps = {
  htmlProps?: React.HTMLProps<HTMLImageElement>;
};

export const Logo: React.FC<LogoProps> = (props) => {
  const { htmlProps } = props;

  return <img {...htmlProps} role="presentation" src="/logo.svg" />;
};
