import { AutoAwesomeOutlined } from '@mui/icons-material';
import React, { useCallback } from 'react';
import { Button } from '~/shared/components/button/Button';
import { ErrorMessage } from '~/shared/components/errorMessage/ErrorMessage';
import { useDefinedContext } from '~/shared/hooks/useDefinedContext/useDefinedContext';
import { CopilotContext } from '../ai/copilot/Context';
import { QueryContext } from '../tabs/queries/query/Context';

export const QueryError: React.FC<{
  error: string;
  htmlProps?: React.HTMLProps<HTMLDivElement>;
}> = ({ error, htmlProps }) => {
  const { query } = useDefinedContext(QueryContext);
  const { sendMessage } = useDefinedContext(CopilotContext);

  const fix = useCallback(async () => {
    await sendMessage(`Fix query:\n\`\`\`sql\n${query.sql}\n\`\`\`\n\`\`\`\n${error}\n\`\`\``);
  }, [error, query.sql, sendMessage]);

  return (
    <ErrorMessage htmlProps={htmlProps}>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between">{error}</div>
        <Button
          color="danger"
          icon={<AutoAwesomeOutlined />}
          htmlProps={{ onClick: fix }}
          label="Fix"
        />
      </div>
    </ErrorMessage>
  );
};
