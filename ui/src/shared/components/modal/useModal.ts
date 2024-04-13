import { useCallback, useRef, useState } from 'react';

export const useModal = <Input = void, Result = void>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState<Input>();

  const resolveRef = useRef<(value?: Result) => void>();

  const open = useCallback((newInput: Input) => {
    setIsOpen(true);
    setInput(newInput);

    return new Promise<Result | undefined>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = useCallback((value?: Result) => {
    setIsOpen(false);
    resolveRef.current?.(value);
  }, []);

  return { close, input, isOpen, open };
};
