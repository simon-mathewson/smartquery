import React from 'react';
import { Card } from '../card/Card';
import { Overlay, OverlayChildrenControlProps, OverlayProps } from '../overlay/Overlay';

export type OverlayCardProps = Omit<OverlayProps, 'children'> & {
  children: (props: OverlayChildrenControlProps) => React.ReactNode;
};

export const OverlayCard: React.FC<OverlayCardProps> = (props) => {
  const { children, ...otherProps } = props;

  return (
    <Overlay {...otherProps}>
      {({ control, root }) => <Card htmlProps={root.htmlProps}>{children(control)}</Card>}
    </Overlay>
  );
};
