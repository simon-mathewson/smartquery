import { useRef } from 'react';

export const useCheckRerender = () => {
  const lastValuesRef = useRef<Record<string, unknown>>({});

  return (props: Record<string, unknown>) => {
    Object.entries(props).forEach(([key, value]) => {
      const oldValue = lastValuesRef.current[key];
      if (oldValue !== value) {
        console.log(`Prop \`${key}\` changed`, oldValue, value);
      }
    });

    lastValuesRef.current = props;
  };
};
