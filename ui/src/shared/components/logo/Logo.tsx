import React from 'react';

export type LogoProps = {
  className?: string;
};

export const Logo: React.FC<LogoProps> = (props) => {
  const { className } = props;

  return <img className={className} src="/logo.svg" />;
};
