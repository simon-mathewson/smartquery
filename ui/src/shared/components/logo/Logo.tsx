import React from 'react';

export type LogoProps = {
  htmlProps?: React.ImgHTMLAttributes<HTMLImageElement>;
};

export const Logo: React.FC<LogoProps> = (props) => {
  const { htmlProps } = props;

  return <img {...htmlProps} src="/logo.svg" />;
};
