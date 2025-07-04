import { Button } from '~/shared/components/button/Button';
import { CodeEditor } from '~/shared/components/codeEditor/CodeEditor';

export type ErrorBoundaryFallbackProps = {
  error: Error;
};

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = (props) => {
  const { error } = props;

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-2 p-4">
      <div className="text-2xl font-medium text-textPrimary">An error occurred</div>
      <div className="text-textSecondary">Sorry about that. Reloading might help.</div>
      <Button
        color="primary"
        htmlProps={{ className: 'my-2 min-w-[96px]', onClick: () => window.location.reload() }}
        label="Reload"
        variant="filled"
      />
      <CodeEditor hideLineNumbers readOnly value={error.stack || ''} />
    </div>
  );
};
