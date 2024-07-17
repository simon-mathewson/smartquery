import { animationOptions } from './constants';

export const animate = async (
  el: HTMLElement,
  fromStyles: Record<string, string | number>,
  toStyles: Record<string, string | number>,
) => {
  await el.animate([fromStyles, toStyles], animationOptions).finished;

  // Apply styles explicitly in addition to `fill: forward` to make element visible in Playwright
  Object.assign(el.style, toStyles);
};
