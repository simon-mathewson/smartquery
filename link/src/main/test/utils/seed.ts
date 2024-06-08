import { execSync } from 'child_process';

export const seed = () => {
  console.info('Seeding database...');
  execSync('pnpm run test:seed');
};
