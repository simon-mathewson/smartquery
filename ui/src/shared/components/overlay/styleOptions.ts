export const defaultStyleOptions = {
  overlayMargin: 8,
  animationVerticalOffset: 16,
  animationOptions: {
    duration: 200,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    fill: 'forwards',
  } satisfies KeyframeAnimationOptions,
};

export type StyleOptions = typeof defaultStyleOptions;
