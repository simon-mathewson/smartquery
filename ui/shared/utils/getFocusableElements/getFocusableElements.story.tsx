import { getFocusableElements } from './getFocusableElements';

export const GetFocusableElementsStory = () => {
  const ref = (el: HTMLDivElement | null) => {
    if (!el) return;

    getFocusableElements(el).forEach((el) => {
      el.dataset.focusable = 'true';
    });
  };

  return (
    <div ref={ref}>
      {/* Elements considered focusable */}
      <a>Link</a>
      <button>Button</button>
      <input />
      <textarea />
      <select>
        <option>Option</option>
      </select>
      <details>
        <summary>Details</summary>
        Details content
      </details>
      <div tabIndex={0}>Tabindex</div>

      {/* Elements not considered focusable */}

      {/* Disabled */}
      <a aria-disabled="true">Link (aria-disabled)</a>
      <button disabled>Button (disabled)</button>
      <input disabled />
      <textarea disabled />
      <select disabled>
        <option>Option</option>
      </select>
      <details aria-disabled="true">
        <summary>Details (aria-disabled)</summary>
        Details content
      </details>
      <div tabIndex={0} aria-disabled="true">
        Tabindex -1 (aria-disabled)
      </div>

      {/* Hidden */}
      <a className="hidden">Link (hidden)</a>
      <button className="hidden">Button (hidden)</button>
      <input className="hidden" />
      <textarea className="hidden" />
      <select className="hidden">
        <option>Option</option>
      </select>
      <details className="hidden">
        <summary>Details (hidden)</summary>
        Details content
      </details>
      <div tabIndex={0} className="hidden">
        Tabindex -1 (hidden)
      </div>

      {/* Other */}
      <div tabIndex={-1}>Tabindex -1</div>
      <input readOnly />
      <textarea readOnly />
    </div>
  );
};
