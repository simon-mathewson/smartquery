import type { MockProviderProps } from '~/providers/MockProviderProps';
import type { ActiveConnectionContextType } from './Context';
import { ActiveConnectionContext } from './Context';
import { getActiveConnectionMock } from './mocks';

export const ActiveConnectionMockProvider: React.FC<
  MockProviderProps<ActiveConnectionContextType>
> = (props) => {
  const { children, overrides } = props;

  return (
    <>
      <ActiveConnectionContext.Provider value={Object.assign(getActiveConnectionMock(), overrides)}>
        {children}
      </ActiveConnectionContext.Provider>
    </>
  );
};
