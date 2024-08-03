import React from 'react';
import { TabsContext } from '~/content/tabs/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { getTabTitle } from './utils';
import { Button } from '~/shared/components/button/Button';
import { Close } from '@mui/icons-material';
import { QueriesContext } from '~/content/tabs/queries/Context';

export const Tabs: React.FC = () => {
  const { activeTab, removeTab, setActiveTabId, tabs } = useDefinedContext(TabsContext);
  const { queryResults } = useDefinedContext(QueriesContext);

  if (!tabs.length) {
    return null;
  }

  return (
    <div className="no-scrollbar grid grid-flow-col items-center gap-2 overflow-auto">
      {tabs.map((tab) => {
        return (
          <Button
            color={activeTab?.id === tab.id ? 'primary' : 'secondary'}
            htmlProps={{
              className: 'w-[180px]',
              onClick: () => setActiveTabId(tab.id),
            }}
            key={tab.id}
            label={getTabTitle(tab, queryResults)}
            suffix={
              <Button
                color={activeTab?.id === tab.id ? 'primary' : 'secondary'}
                element="div"
                htmlProps={{
                  className: 'ml-auto',
                  onClickCapture: (event) => {
                    removeTab(tab.id);
                    event.preventDefault();
                  },
                }}
                icon={<Close />}
                size="small"
              />
            }
            textSuffix={tab.queries.length > 1 ? `+${tab.queries.flat(2).length - 1}` : undefined}
            variant="highlighted"
          />
        );
      })}
    </div>
  );
};
