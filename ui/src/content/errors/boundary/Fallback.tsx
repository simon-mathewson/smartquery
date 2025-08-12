import { Button } from '~/shared/components/button/Button';

export type ErrorBoundaryFallbackProps = {
  error: Error;
};

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = (props) => {
  const { error } = props;

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-2 p-4">
      <div className="text-2xl font-medium text-textPrimary">An error occurred</div>
      <div className="text-center text-textSecondary">
        Reloading might help.
        <br />
        Please consider reporting this error.
      </div>
      <div className="flex items-center gap-2">
        <Button
          color="primary"
          htmlProps={{ className: 'my-2 w-[96px]', onClick: () => window.location.reload() }}
          label="Reload"
          variant="filled"
        />
        <Button
          element="a"
          htmlProps={{
            className: 'w-[96px]',
            href: import.meta.env.VITE_GITHUB_DISCUSSIONS_URL,
            target: '_blank',
          }}
          label="Report"
        />
      </div>
      <code className="max-w-xl rounded-xl border border-border bg-card p-3 text-sm">
        {error.stack || ''}
      </code>
    </div>
  );
};
