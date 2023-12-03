import { Add, Close } from '@mui/icons-material';
import { Button } from '../../shared/Button/Button';
import { useDefinedContext } from '@renderer/hooks/useDefinedContext';
import { GlobalContext } from '@renderer/contexts/GlobalContext';
import { uniqueId } from 'lodash';
import classNames from 'classnames';
import { Query } from '@renderer/types';
import { Corner } from './Corner/Corner';

export type TabsProps = {
  activeQueryIndex: number | null;
  columnIndex: number;
  queries: Query[];
  rowIndex: number;
  setActiveQueryIndex: React.Dispatch<React.SetStateAction<number | null>>;
};

export const Tabs: React.FC<TabsProps> = (props) => {
  const { activeQueryIndex, columnIndex, queries, rowIndex, setActiveQueryIndex } = props;

  const { setQueryGroups } = useDefinedContext(GlobalContext);

  const getNewQuery = () => ({ id: uniqueId(), showEditor: true });

  return (
    <div className="window-drag-area flex h-10 w-full items-center bg-gray-200 px-3 pt-1">
      {queries.map((query, index) => {
        const active = index === activeQueryIndex;

        return (
          <div
            className={classNames(
              'relative flex h-9 w-48 items-center gap-1 rounded-t-lg pl-3 pr-1 ',
              {
                'bg-gray-50': active,
                'cursor-pointer hover:bg-gray-100/50': !active,
              },
            )}
            key={index}
            onClick={() => setActiveQueryIndex(index)}
          >
            {active && (
              <>
                <Corner />
                <Corner right />
              </>
            )}
            <div className="flex-grow truncate text-xs font-medium text-gray-800">
              {query.label ?? query.sql?.replaceAll('\n', ' ') ?? 'New Query'}
            </div>
            <Button
              icon={<Close />}
              onClick={() => {
                setQueryGroups((queryGroupColumn) =>
                  [
                    ...queryGroupColumn
                      .map((queryGroupRow) =>
                        queryGroupRow
                          .map((queryGroup) => queryGroup.filter((q) => q.id !== query.id))
                          .filter((queryGroup) => queryGroup.length),
                      )
                      .filter((queryGroupRow) => queryGroupRow.length),
                  ].filter((queryGroupColumn) => queryGroupColumn.length),
                );
              }}
              size="small"
              variant="tertiary"
            />
          </div>
        );
      })}
      <Button
        align="left"
        className="ml-1"
        icon={<Add />}
        onClick={() => {
          setQueryGroups((queryGroupColumn) =>
            queryGroupColumn.map((queryGroupRows, queryGroupColumnIndex) => {
              if (queryGroupColumnIndex !== columnIndex) return queryGroupRows;

              return queryGroupRows.map((queryGroupRow, queryGroupRowIndex) => {
                if (queryGroupRowIndex !== rowIndex) return queryGroupRow;

                return [...queryGroupRow, getNewQuery()];
              });
            }),
          );
          setActiveQueryIndex(queries.length);
        }}
        size="small"
      />
    </div>
  );
};
