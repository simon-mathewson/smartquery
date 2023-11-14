export const TopBar: React.FC = () => {
  return (
    <div
      className="fixed left-0 top-0 h-7 w-full"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={{ WebkitAppRegion: 'drag' } as any}
    />
  );
};
