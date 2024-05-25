import { Button } from '~/shared/components/Button/Button';
import { CodeEditor } from '~/shared/components/CodeEditor/CodeEditor';

export type ErrorBoundaryFallbackProps = {
  error: Error;
};

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = (props) => {
  const { error } = props;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <div className="text-2xl font-medium text-textPrimary">An error occurred</div>
      <div className="text-textSecondary">Sorry about that. Reloading might help.</div>
      <Button
        className="my-2 min-w-[96px]"
        color="primary"
        label="Reload"
        onClick={() => window.location.reload()}
        variant="filled"
      />
      <CodeEditor value={error.stack || ''} readOnly />
    </div>
  );
};
