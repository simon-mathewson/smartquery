import { SavedQueryList } from '../../sidebar/savedQueryList/SavedQueryList';
import { TableList } from '../../sidebar/tableList/TableList';

export type QueriesPageProps = {
  onSelect?: () => void;
};

export const QueriesPage: React.FC<QueriesPageProps> = (props) => {
  const { onSelect } = props;

  return (
    <div>
      <SavedQueryList onSelect={onSelect} />
      <TableList onSelect={onSelect} />
    </div>
  );
};
