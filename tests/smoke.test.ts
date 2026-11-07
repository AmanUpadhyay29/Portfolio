import { nextConfig as config } from '../next.config';

test('static export is configured for Next 16.4', () => {
  const c = config as { cacheComponents?: boolean; experimental?: { cacheComponents?: boolean; partialPrefetching?: boolean }; partialPrefetching?: boolean };
  expect(config.output).toBe('export');
  expect(c.cacheComponents ?? c.experimental?.cacheComponents).toBe(false);
  expect(c.partialPrefetching ?? c.experimental?.partialPrefetching).toBe(false);
});
