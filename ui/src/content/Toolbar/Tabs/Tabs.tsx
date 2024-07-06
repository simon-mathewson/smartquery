import React from 'react';
import { TabsContext } from '~/content/tabs/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
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
            className="w-[180px]"
            color={activeTab?.id === tab.id ? 'primary' : 'secondary'}
            key={tab.id}
            label={getTabTitle(tab, queryResults)}
            onClick={() => setActiveTabId(tab.id)}
            suffix={
              <Button
                className="ml-auto"
                color={activeTab?.id === tab.id ? 'primary' : 'secondary'}
                element="div"
                icon={<Close />}
                onClickCapture={(event) => {
                  removeTab(tab.id);
                  event.preventDefault();
                }}
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
