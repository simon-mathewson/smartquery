import type { MockProviderProps } from '~/providers/MockProviderProps';
import type { UpdateAvailableContextType } from './Context';
import { UpdateAvailableContext } from './Context';

export const UpdateAvailableMockProvider: React.FC<
  MockProviderProps<UpdateAvailableContextType>
> = (props) => {
  const { children, overrides } = props;

  return (
    <UpdateAvailableContext.Provider value={overrides}>{children}</UpdateAvailableContext.Provider>
  );
};
