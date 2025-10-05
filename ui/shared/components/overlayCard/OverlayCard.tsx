import React from 'react';
import { Card } from '../card/Card';
import type { OverlayChildrenControlProps, OverlayProps } from '../overlay/Overlay';
import { Overlay } from '../overlay/Overlay';
import classNames from 'classnames';

export type OverlayCardProps = Omit<OverlayProps, 'children'> & {
  children: (props: OverlayChildrenControlProps) => React.ReactNode;
};

export const OverlayCard: React.FC<OverlayCardProps> = (props) => {
  const { children, ...otherProps } = props;

  return (
    <Overlay {...otherProps}>
      {({ control, root }) => (
        <Card
          htmlProps={{
            ...root.htmlProps,
            className: classNames(root.htmlProps?.className, 'overflow-auto'),
          }}
        >
          {children(control)}
        </Card>
      )}
    </Overlay>
  );
};
