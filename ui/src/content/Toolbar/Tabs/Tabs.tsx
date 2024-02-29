import React from 'react';
import { TabsContext } from '~/content/tabs/Context';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext';
import { getTabTitle } from './utils';
import { Button } from '~/shared/components/Button/Button';
import { Close } from '@mui/icons-material';
import classNames from 'classnames';

export const Tabs: React.FC = () => {
  const { activeTab, removeTab, setActiveTabId, tabs } = useDefinedContext(TabsContext);

  if (!tabs.length) return null;

  return (
    <div className="no-scrollbar grid grid-flow-col items-center gap-2 overflow-auto">
      {tabs.map((tab) => {
        return (
          <Button
            className="w-[180px]"
            color="secondary"
            key={tab.id}
            label={getTabTitle(tab)}
            onClick={() => setActiveTabId(tab.id)}
            showSuffixOnHover
            suffix={
              <Button
                className={classNames('ml-auto opacity-0 group-hover:opacity-100', {
                  'opacity-100': activeTab?.id === tab.id,
                })}
                color="secondary"
                icon={<Close />}
                onClickCapture={(event) => {
                  removeTab(tab.id);
                  event.preventDefault();
                }}
                size="small"
              />
            }
            textSuffix={tab.queries.length > 1 ? `+${tab.queries.length - 1}` : undefined}
            variant={activeTab?.id === tab.id ? 'selected' : 'default'}
          />
        );
      })}
    </div>
  );
};
