import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '~/test/render';
import { CodeEditor } from './CodeEditor';

describe('CodeEditor', () => {
  test('renders code editor with value and allows editing', async () => {
    const value = 'a';
    const onChange = vi.fn();

    const { container } = render(<CodeEditor onChange={onChange} value={value} />);

    const editor = screen.getByRole('textbox');

    expect(editor).toHaveTextContent(value);

    await userEvent.click(editor);

    const newValue = 'SELECT column FROM table;\nSELECT 1;';
    await userEvent.keyboard(`{Delete}${newValue}`);

    expect(onChange).toHaveBeenCalledWith(newValue);

    const lineNumbers = container.querySelectorAll('.cm-gutterElement');
    expect(lineNumbers).toHaveLength(3);
    expect(lineNumbers[1]).toHaveTextContent('1');
    expect(lineNumbers[2]).toHaveTextContent('2');
  });

  test('renders code editor with placeholder', async () => {
    const placeholder = 'Type your query here';
    const onChange = vi.fn();

    render(<CodeEditor onChange={onChange} placeholder={placeholder} value="" />);

    const editor = screen.getByRole('textbox');

    expect(editor).toHaveTextContent(placeholder);
  });

  test('renders code editor with line numbers hidden', async () => {
    const { container } = render(<CodeEditor hideLineNumbers value="test" />);

    const lineNumbers = container.querySelectorAll('.cm-gutterElement');

    expect(lineNumbers).toHaveLength(0);
  });
});
