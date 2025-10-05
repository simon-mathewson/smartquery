import React from 'react';
import { focusFirstControl } from './focusFirstControl';

export type FocusFirstControlStoryProps = {
  controls: Array<{
    autoFocus?: boolean;
    className?: string;
    disabled?: boolean;
    isFocused?: boolean;
  }>;
};

export const FocusFirstControlStory: React.FC<FocusFirstControlStoryProps> = (props) => {
  const { controls } = props;

  const ref = (el: HTMLDivElement | null) => {
    if (!el) return;

    const controlToFocusIndex = controls.findIndex((control) => control.isFocused);
    if (controlToFocusIndex >= 0) {
      el.querySelectorAll('button')[controlToFocusIndex].focus();
    }

    focusFirstControl(el);
  };

  return (
    <div ref={ref}>
      {controls.map((control, index) => (
        <button
          autoFocus={control.autoFocus}
          className={control.className}
          disabled={control.disabled}
          key={index}
        />
      ))}
    </div>
  );
};
